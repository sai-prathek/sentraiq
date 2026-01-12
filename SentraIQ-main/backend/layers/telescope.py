"""
Layer 3: The Telescope - Evidence Retrieval Layer
Natural language interface for evidence navigation and assurance pack generation
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
import re
import zipfile
import json
import os
from pathlib import Path
import shutil

from backend.database import RawLog, RawDocument, EvidenceObject, TelescopeQuery, AssurancePack
from backend.config import settings
from backend.utils.hashing import calculate_content_hash

# OpenAI integration for natural language understanding
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class Telescope:
    """
    Layer 3: Telescope for evidence retrieval and assurance pack generation
    """

    @staticmethod
    def _parse_natural_language_query_with_ai(query: str) -> Dict[str, Any]:
        """
        Parse natural language query using OpenAI to extract intent and parameters
        """
        if not OPENAI_AVAILABLE or not settings.OPENAI_API_KEY:
            # Fallback to keyword-based parsing
            return Telescope._parse_natural_language_query_fallback(query)

        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            system_prompt = """You are an expert at parsing compliance and security evidence queries.
Extract structured intent from user queries for an evidence management system.

Available compliance frameworks: PCI-DSS, SOC 2, ISO 27001, NIST, SWIFT
Available sources: SWIFT, CHAPS, FPS, Firewall
Available control types: mfa, access, encryption, audit, logging, monitoring, backup, incident-response, authentication, authorization

Return a JSON object with:
- control_keywords: array of relevant control types (e.g., ["mfa", "access", "encryption"])
- time_keywords: array of time indicators (last_90_days, last_quarter, q3, last_month, last_year, all_time)
- source_keywords: array of sources mentioned (e.g., ["SWIFT", "CHAPS"])
- action: "search" or "generate_pack"
- search_terms: array of key search terms extracted from the query (important keywords, not just control types)
- summary: brief summary of what user wants

IMPORTANT: Extract ALL meaningful search terms from the query, not just control keywords.
For example, if query is "show me failed login attempts", search_terms should include ["failed", "login", "attempts"].
If query is "give me some data" or vague, set search_terms to empty array [] to return all evidence.

Be specific and extract all relevant details."""

            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Parse this query: {query}"}
                ],
                response_format={"type": "json_object"}
                # Note: GPT-5 only supports temperature=1 (default), so we omit it
            )

            intent = json.loads(response.choices[0].message.content)

            # Ensure required fields exist
            intent.setdefault('control_keywords', [])
            intent.setdefault('time_keywords', [])
            intent.setdefault('source_keywords', [])
            intent.setdefault('action', 'search')
            intent.setdefault('search_terms', [])
            intent.setdefault('summary', query)

            return intent

        except Exception as e:
            print(f"OpenAI parsing failed: {e}, falling back to keyword matching")
            return Telescope._parse_natural_language_query_fallback(query)

    @staticmethod
    def _parse_natural_language_query_fallback(query: str) -> Dict[str, Any]:
        """
        Fallback keyword-based parser when OpenAI is unavailable
        """
        query_lower = query.lower()

        intent = {
            'control_keywords': [],
            'time_keywords': [],
            'source_keywords': [],
            'action': 'search',
            'search_terms': [],
            'summary': query
        }

        # Extract control-related keywords
        control_patterns = {
            'mfa': ['mfa', 'multi-factor', 'two-factor', '2fa', 'authentication'],
            'access': ['access', 'login', 'authorization', 'permission'],
            'encryption': ['encryption', 'tls', 'ssl', 'cipher'],
            'audit': ['audit', 'log', 'record', 'trail'],
            'logging': ['logging', 'logs'],
            'monitoring': ['monitoring', 'monitor', 'surveillance'],
            'backup': ['backup', 'recovery', 'restore'],
            'incident-response': ['incident', 'breach', 'response', 'alert']
        }

        for control_type, keywords in control_patterns.items():
            if any(kw in query_lower for kw in keywords):
                intent['control_keywords'].append(control_type)
                intent['search_terms'].extend([kw for kw in keywords if kw in query_lower])

        # Extract time-related keywords
        time_patterns = {
            'last_90_days': r'(?:last|past)\s+90\s+days',
            'last_quarter': r'(?:last|previous|q3)\s+quarter',
            'q3': r'q3|quarter\s*3',
            'last_month': r'(?:last|past)\s+month',
            'last_year': r'(?:last|past)\s+year'
        }

        for time_label, pattern in time_patterns.items():
            if re.search(pattern, query_lower):
                intent['time_keywords'].append(time_label)

        # Extract source keywords
        if 'swift' in query_lower:
            intent['source_keywords'].append('SWIFT')
        if 'chaps' in query_lower:
            intent['source_keywords'].append('CHAPS')
        if 'fps' in query_lower:
            intent['source_keywords'].append('FPS')

        # Detect if user wants to generate assurance pack
        if any(word in query_lower for word in ['generate', 'create', 'assurance', 'pack', 'report']):
            intent['action'] = 'generate_pack'

        return intent

    @staticmethod
    def _parse_natural_language_query(query: str) -> Dict[str, Any]:
        """
        Parse natural language query to extract intent and parameters
        Uses OpenAI if available, falls back to keyword matching
        """
        return Telescope._parse_natural_language_query_with_ai(query)

    @staticmethod
    def _calculate_time_range(time_keywords: List[str]) -> tuple:
        """Calculate start and end datetime from time keywords"""
        now = datetime.utcnow()

        if 'last_90_days' in time_keywords or 'q3' in time_keywords or 'last_quarter' in time_keywords:
            start = now - timedelta(days=90)
            end = now
        elif 'last_month' in time_keywords:
            start = now - timedelta(days=30)
            end = now
        else:
            # Default to last 30 days
            start = now - timedelta(days=30)
            end = now

        return start, end

    @staticmethod
    async def _calculate_relevance_score_with_ai(
        query: str,
        item_content: str,
        item_type: str,
        item_metadata: Dict[str, Any]
    ) -> float:
        """
        Use OpenAI to calculate relevance score for an evidence item.
        Returns a score between 0.0 and 1.0.
        """
        if not OPENAI_AVAILABLE or not settings.OPENAI_API_KEY:
            # Fallback: simple keyword matching
            query_lower = query.lower()
            content_lower = item_content.lower()
            matches = sum(1 for word in query_lower.split() if word in content_lower)
            return min(0.5 + (matches * 0.1), 1.0)

        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            system_prompt = """You are a relevance scoring system for compliance evidence.
Given a user query and an evidence item, score how relevant the evidence is to the query.
Return ONLY a JSON object with a single field "relevance_score" as a float between 0.0 and 1.0.
0.0 = completely irrelevant, 1.0 = highly relevant and directly answers the query."""

            user_content = json.dumps({
                "query": query,
                "evidence_type": item_type,
                "evidence_content_preview": item_content[:500],  # Limit content size
                "metadata": item_metadata
            }, default=str)

            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format={"type": "json_object"},
                temperature=0.3  # Lower temperature for more consistent scoring
            )

            result = json.loads(response.choices[0].message.content)
            score = float(result.get("relevance_score", 0.5))
            return max(0.0, min(1.0, score))  # Clamp between 0 and 1

        except Exception as e:
            print(f"OpenAI relevance scoring failed: {e}, using fallback")
            # Fallback scoring
            query_lower = query.lower()
            content_lower = item_content.lower()
            matches = sum(1 for word in query_lower.split() if word in content_lower)
            return min(0.5 + (matches * 0.1), 1.0)

    @staticmethod
    async def query_evidence(
        session: AsyncSession,
        query: str,
        time_range_start: Optional[datetime] = None,
        time_range_end: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """
        Query evidence using natural language with enhanced OpenAI integration.

        Args:
            session: Database session
            query: Natural language query
            time_range_start: Optional start time
            time_range_end: Optional end time

        Returns:
            Dictionary with query results and evidence items
        """
        start_time = datetime.utcnow()

        # Parse the query using AI if available
        intent = Telescope._parse_natural_language_query(query)

        # Calculate time range if not provided
        if not time_range_start or not time_range_end:
            time_range_start, time_range_end = Telescope._calculate_time_range(
                intent['time_keywords']
            )

        evidence_items = []

        # Search logs - make query more lenient
        log_conditions = [
            RawLog.ingested_at >= time_range_start,
            RawLog.ingested_at <= time_range_end
        ]

        # Add source filter if specified
        if intent.get('source_keywords'):
            log_conditions.append(RawLog.source.in_(intent['source_keywords']))

        # Add keyword filters ONLY if we have search terms
        # If no keywords, return ALL logs in time range (more lenient)
        search_keywords = intent.get('search_terms', []) or intent.get('control_keywords', [])
        if search_keywords:
            keyword_conditions = []
            for keyword in search_keywords[:5]:  # Limit to top 5 keywords
                keyword_conditions.append(RawLog.content.ilike(f'%{keyword}%'))
            if keyword_conditions:
                log_conditions.append(or_(*keyword_conditions))

        log_stmt = select(RawLog).where(and_(*log_conditions)).limit(100)  # Increased limit
        log_result = await session.execute(log_stmt)
        logs = log_result.scalars().all()

        # Calculate relevance scores for logs using AI
        for log in logs:
            content_preview = log.content[:500] if log.content else ""
            metadata = {
                "source": log.source,
                "filename": log.filename,
                "ingested_at": str(log.ingested_at)
            }

            # Use AI to calculate relevance score
            relevance_score = await Telescope._calculate_relevance_score_with_ai(
                query=query,
                item_content=content_preview,
                item_type="log",
                item_metadata=metadata
            )

            evidence_items.append({
                'type': 'log',
                'id': log.id,
                'hash': log.hash,
                'filename': log.filename,
                'content_preview': log.content[:300] + '...' if len(log.content) > 300 else (log.content or ''),
                'relevance_score': relevance_score,
                'source': log.source,
                'ingested_at': log.ingested_at,
                'control_id': None  # Will be populated if mapped
            })

        # Search documents - make query more lenient
        doc_conditions = [
            RawDocument.ingested_at >= time_range_start,
            RawDocument.ingested_at <= time_range_end
        ]

        # Add keyword filters ONLY if we have search terms
        # If no keywords, return ALL documents in time range
        search_keywords = intent.get('search_terms', []) or intent.get('control_keywords', [])
        if search_keywords:
            keyword_conditions = []
            for keyword in search_keywords[:5]:  # Limit to top 5 keywords
                keyword_conditions.append(RawDocument.extracted_text.ilike(f'%{keyword}%'))
            if keyword_conditions:
                doc_conditions.append(or_(*keyword_conditions))

        doc_stmt = select(RawDocument).where(and_(*doc_conditions)).limit(50)  # Increased limit
        doc_result = await session.execute(doc_stmt)
        documents = doc_result.scalars().all()

        # Calculate relevance scores for documents using AI
        for doc in documents:
            content_preview = doc.extracted_text[:500] if doc.extracted_text else ""
            metadata = {
                "doc_type": doc.doc_type,
                "filename": doc.filename,
                "ingested_at": str(doc.ingested_at)
            }

            # Use AI to calculate relevance score
            relevance_score = await Telescope._calculate_relevance_score_with_ai(
                query=query,
                item_content=content_preview,
                item_type="document",
                item_metadata=metadata
            )

            evidence_items.append({
                'type': 'document',
                'id': doc.id,
                'hash': doc.hash,
                'filename': doc.filename,
                'content_preview': (doc.extracted_text[:300] + '...' if doc.extracted_text and len(doc.extracted_text) > 300 else (doc.extracted_text or '')),
                'relevance_score': relevance_score,
                'doc_type': doc.doc_type,
                'ingested_at': doc.ingested_at,
                'control_id': None  # Will be populated if mapped
            })

        # Also check evidence objects for control-based matches
        if intent.get('control_keywords'):
            from backend.database import EvidenceObject
            control_ids = [kw.upper().replace('-', '_') for kw in intent['control_keywords']]
            evidence_stmt = select(EvidenceObject).where(
                EvidenceObject.control_id.in_(control_ids)
            ).limit(20)
            evidence_result = await session.execute(evidence_stmt)
            evidence_objs = evidence_result.scalars().all()

            for eo in evidence_objs:
                # Get the associated log or document
                if eo.log_id:
                    log_stmt = select(RawLog).where(RawLog.id == eo.log_id)
                    log_result = await session.execute(log_stmt)
                    log = log_result.scalar_one_or_none()
                    if log and time_range_start <= log.ingested_at <= time_range_end:
                        # Check if already added
                        if not any(item['id'] == log.id and item['type'] == 'log' for item in evidence_items):
                            content_preview = log.content[:500] if log.content else ""
                            relevance_score = await Telescope._calculate_relevance_score_with_ai(
                                query=query,
                                item_content=content_preview,
                                item_type="log",
                                item_metadata={"source": log.source, "control_id": eo.control_id}
                            )
                            evidence_items.append({
                                'type': 'log',
                                'id': log.id,
                                'hash': log.hash,
                                'filename': log.filename,
                                'content_preview': log.content[:300] + '...' if len(log.content) > 300 else (log.content or ''),
                                'relevance_score': relevance_score,
                                'source': log.source,
                                'ingested_at': log.ingested_at,
                                'control_id': eo.control_id
                            })

                if eo.document_id:
                    doc_stmt = select(RawDocument).where(RawDocument.id == eo.document_id)
                    doc_result = await session.execute(doc_stmt)
                    doc = doc_result.scalar_one_or_none()
                    if doc and time_range_start <= doc.ingested_at <= time_range_end:
                        # Check if already added
                        if not any(item['id'] == doc.id and item['type'] == 'document' for item in evidence_items):
                            content_preview = doc.extracted_text[:500] if doc.extracted_text else ""
                            relevance_score = await Telescope._calculate_relevance_score_with_ai(
                                query=query,
                                item_content=content_preview,
                                item_type="document",
                                item_metadata={"doc_type": doc.doc_type, "control_id": eo.control_id}
                            )
                            evidence_items.append({
                                'type': 'document',
                                'id': doc.id,
                                'hash': doc.hash,
                                'filename': doc.filename,
                                'content_preview': (doc.extracted_text[:300] + '...' if doc.extracted_text and len(doc.extracted_text) > 300 else (doc.extracted_text or '')),
                                'relevance_score': relevance_score,
                                'doc_type': doc.doc_type,
                                'ingested_at': doc.ingested_at,
                                'control_id': eo.control_id
                            })

        # Sort by relevance score (highest first)
        evidence_items.sort(key=lambda x: x['relevance_score'], reverse=True)

        # Filter out very low relevance items (below 0.3)
        evidence_items = [item for item in evidence_items if item['relevance_score'] >= 0.3]

        execution_time_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)

        # Save query to history
        telescope_query = TelescopeQuery(
            query=query,
            interpreted_intent=json.dumps(intent),
            results_count=len(evidence_items),
            execution_time_ms=execution_time_ms,
            created_at=datetime.utcnow()
        )
        session.add(telescope_query)
        await session.commit()

        return {
            'query': query,
            'interpreted_intent': intent,
            'time_range': {
                'start': time_range_start.isoformat(),
                'end': time_range_end.isoformat()
            },
            'results_count': len(evidence_items),
            'evidence_items': evidence_items,
            'execution_time_ms': execution_time_ms
        }

    @staticmethod
    async def summarize_evidence_with_ai(
        query: str,
        evidence_items: List[Dict[str, Any]]
    ) -> Optional[str]:
        """
        Use OpenAI to generate a natural-language summary of the evidence set.

        Returns:
            A short markdown/text summary, or None if OpenAI is unavailable.
        """
        # Always return at least a basic summary, even if OpenAI is unavailable
        if not evidence_items:
            return "No evidence items were found for this query and time range."

        if not OPENAI_AVAILABLE or not settings.OPENAI_API_KEY:
            return (
                f"Found {len(evidence_items)} evidence items for the query "
                f"'{query}', but OpenAI is not configured; enable OPENAI_API_KEY "
                "to generate a richer natural-language summary."
            )

        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            # Keep the prompt compact: send only the top N items and truncated previews
            top_items = evidence_items[:10]
            compact_items = [
                {
                    "type": item.get("type"),
                    "id": item.get("id"),
                    "hash": item.get("hash"),
                    "filename": item.get("filename"),
                    "relevance_score": item.get("relevance_score"),
                    "control_id": item.get("control_id"),
                    "ingested_at": str(item.get("ingested_at")),
                    "content_preview": (item.get("content_preview") or "")[:400],
                }
                for item in top_items
            ]

            system_prompt = (
                "You are a senior compliance and security assurance analyst. "
                "Given a user's natural language query and a set of evidence items "
                "(logs and documents), write a comprehensive but concise summary that:\n\n"
                "1. Directly answers the user's query based on the evidence\n"
                "2. Identifies key compliance controls, frameworks, or standards mentioned\n"
                "3. Summarizes the evidence coverage (what was found, time ranges, sources)\n"
                "4. Highlights any notable patterns, gaps, or risks if apparent\n"
                "5. Provides actionable insights for compliance/audit purposes\n\n"
                "Format: Use clear paragraphs with bullet points for key findings. "
                "Be specific about evidence types (logs vs documents), time periods, and control IDs if mentioned. "
                "Keep it professional and suitable for auditors, GRC leads, or compliance officers. "
                "Maximum 4-5 paragraphs."
            )

            user_content = json.dumps(
                {
                    "query": query,
                    "evidence_items": compact_items,
                },
                default=str,
            )

            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content},
                ],
            )

            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI evidence summarization failed: {e}")
            return None

    @staticmethod
    async def generate_assurance_pack(
        session: AsyncSession,
        control_id: Optional[str],
        query: str,
        time_range_start: datetime,
        time_range_end: datetime
    ) -> AssurancePack:
        """
        Generate an Assurance Pack with evidence

        Args:
            session: Database session
            control_id: Optional control ID
            query: Description/query for the pack
            time_range_start: Start of time range
            time_range_end: End of time range

        Returns:
            AssurancePack record
        """
        # Query evidence
        evidence_data = await Telescope.query_evidence(
            session, query, time_range_start, time_range_end
        )

        # Create pack ID
        pack_id = f"PACK-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"

        # Create pack directory
        pack_dir = settings.ASSURANCE_PACKS_PATH / pack_id
        pack_dir.mkdir(exist_ok=True)

        # Create manifest
        manifest = {
            'pack_id': pack_id,
            'control_id': control_id,
            'query': query,
            'time_range': {
                'start': time_range_start.isoformat(),
                'end': time_range_end.isoformat()
            },
            'generated_at': datetime.utcnow().isoformat(),
            'evidence_count': evidence_data['results_count'],
            'disclaimer': (
                'This assurance pack supports attestation readiness by providing '
                'structured, time-bound evidence. It does not constitute certification, '
                'regulatory approval, or compliance sign-off.'
            )
        }

        # Save manifest
        with open(pack_dir / 'manifest.json', 'w') as f:
            json.dump(manifest, f, indent=2)

        # Copy evidence files
        logs_dir = pack_dir / 'logs'
        docs_dir = pack_dir / 'documents'
        logs_dir.mkdir(exist_ok=True)
        docs_dir.mkdir(exist_ok=True)

        for item in evidence_data['evidence_items']:
            if item['type'] == 'log':
                log_stmt = select(RawLog).where(RawLog.id == item['id'])
                log_result = await session.execute(log_stmt)
                log = log_result.scalar_one_or_none()
                if log:
                    shutil.copy(log.file_path, logs_dir / f"{log.hash}_{log.filename}")
            elif item['type'] == 'document':
                doc_stmt = select(RawDocument).where(RawDocument.id == item['id'])
                doc_result = await session.execute(doc_stmt)
                doc = doc_result.scalar_one_or_none()
                if doc:
                    shutil.copy(doc.file_path, docs_dir / f"{doc.hash}_{doc.filename}")

        # Create ZIP file
        zip_path = settings.ASSURANCE_PACKS_PATH / f"{pack_id}.zip"
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for root, dirs, files in os.walk(pack_dir):
                root_path = Path(root)
                for file in files:
                    file_path = root_path / file
                    arcname = file_path.relative_to(pack_dir)
                    zipf.write(file_path, arcname)

        # Calculate pack hash
        pack_hash = calculate_content_hash(zip_path.read_bytes())

        # Clean up unzipped directory
        shutil.rmtree(pack_dir)

        # Save to database
        assurance_pack = AssurancePack(
            pack_id=pack_id,
            control_id=control_id,
            query=query,
            time_range_start=time_range_start,
            time_range_end=time_range_end,
            evidence_count=evidence_data['results_count'],
            pack_hash=pack_hash,
            file_path=str(zip_path),
            created_at=datetime.utcnow(),
            meta_data=manifest
        )

        session.add(assurance_pack)
        await session.commit()
        await session.refresh(assurance_pack)

        return assurance_pack
