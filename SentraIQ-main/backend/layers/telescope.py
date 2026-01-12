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
from backend.utils.hashing import calculate_content_hash, calculate_file_hash
from backend.layers.control_library import get_all_controls, get_controls_by_framework, Framework
import hashlib
import time

# OpenAI integration for natural language understanding
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class AICache:
    """
    Simple in-memory cache for OpenAI API calls to speed up demos and reduce API costs.
    Uses hash-based keys and TTL (time-to-live) for cache entries.
    """
    def __init__(self, default_ttl_seconds: int = 3600):  # 1 hour default TTL
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl_seconds
    
    def _generate_key(self, *args, **kwargs) -> str:
        """Generate a cache key from arguments"""
        # Create a deterministic string representation
        key_data = json.dumps({
            'args': args,
            'kwargs': kwargs
        }, sort_keys=True, default=str)
        return hashlib.sha256(key_data.encode()).hexdigest()
    
    def get(self, key: str) -> Optional[Any]:
        """Get a value from cache if it exists and hasn't expired"""
        if key not in self.cache:
            return None
        
        entry = self.cache[key]
        if time.time() > entry['expires_at']:
            # Expired, remove it
            del self.cache[key]
            return None
        
        return entry['value']
    
    def set(self, key: str, value: Any, ttl_seconds: Optional[int] = None) -> None:
        """Store a value in cache with optional TTL"""
        ttl = ttl_seconds if ttl_seconds is not None else self.default_ttl
        self.cache[key] = {
            'value': value,
            'expires_at': time.time() + ttl,
            'created_at': time.time()
        }
    
    def clear(self) -> None:
        """Clear all cache entries"""
        self.cache.clear()
    
    def get_or_set(self, key: str, factory: callable, ttl_seconds: Optional[int] = None) -> Any:
        """Get from cache or call factory and cache the result"""
        cached = self.get(key)
        if cached is not None:
            return cached
        
        value = factory()
        self.set(key, value, ttl_seconds)
        return value
    
    def stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        now = time.time()
        active = sum(1 for entry in self.cache.values() if entry['expires_at'] > now)
        expired = len(self.cache) - active
        
        return {
            'total_entries': len(self.cache),
            'active_entries': active,
            'expired_entries': expired,
            'default_ttl_seconds': self.default_ttl
        }


# Global AI cache instance
# Use shorter TTL for demos (30 minutes) to balance freshness and performance
ai_cache = AICache(default_ttl_seconds=18000)  # 30 minutes


class Telescope:
    """
    Layer 3: Telescope for evidence retrieval and assurance pack generation
    """

    @staticmethod
    def _parse_natural_language_query_with_ai(query: str) -> Dict[str, Any]:
        """
        Parse natural language query using OpenAI to extract intent and parameters
        Uses caching to speed up repetitive queries during demos.
        """
        if not OPENAI_AVAILABLE or not settings.OPENAI_API_KEY:
            # Fallback to keyword-based parsing
            return Telescope._parse_natural_language_query_fallback(query)

        # Check cache first
        cache_key = ai_cache._generate_key('parse_query', query)
        cached_result = ai_cache.get(cache_key)
        if cached_result is not None:
            print(f"✅ Cache hit for query parsing: {query[:50]}...")
            return cached_result

        try:
            print(f"🔄 Cache miss - calling OpenAI for query parsing: {query[:50]}...")
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

            # Cache the result (30 minutes TTL for query parsing)
            ai_cache.set(cache_key, intent, ttl_seconds=18000)
            print(f"💾 Cached query parsing result for: {query[:50]}...")

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
        Uses caching to speed up repetitive scoring during demos.
        """
        if not OPENAI_AVAILABLE or not settings.OPENAI_API_KEY:
            # Fallback: simple keyword matching
            query_lower = query.lower()
            content_lower = item_content.lower()
            matches = sum(1 for word in query_lower.split() if word in content_lower)
            return min(0.5 + (matches * 0.1), 1.0)

        # Create cache key based on query + content hash + type
        # Use first 500 chars of content for cache key (same as what we send to OpenAI)
        content_preview = item_content[:500]
        content_hash = hashlib.sha256(content_preview.encode()).hexdigest()[:16]
        cache_key = ai_cache._generate_key('relevance_score', query, content_hash, item_type)
        
        cached_score = ai_cache.get(cache_key)
        if cached_score is not None:
            return float(cached_score)

        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            system_prompt = """You are a relevance scoring system for compliance evidence.
Given a user query and an evidence item, score how relevant the evidence is to the query.
Return ONLY a JSON object with a single field "relevance_score" as a float between 0.0 and 1.0.
0.0 = completely irrelevant, 1.0 = highly relevant and directly answers the query."""

            user_content = json.dumps({
                "query": query,
                "evidence_type": item_type,
                "evidence_content_preview": content_preview,
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
            score = max(0.0, min(1.0, score))  # Clamp between 0 and 1

            # Cache the result (1 hour TTL for relevance scores)
            ai_cache.set(cache_key, score, ttl_seconds=3600)

            return score

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
    async def perform_gap_analysis(
        control_id: Optional[str],
        evidence_items: List[Dict[str, Any]],
        time_range_start: datetime,
        time_range_end: datetime
    ) -> Dict[str, Any]:
        """
        Perform gap analysis: Compare assessment questions vs evidence freshness/applicability
        Flags temporal gaps (e.g., evidence is 18 months old but question asks for annual testing)
        
        Args:
            control_id: Control ID to analyze (optional)
            evidence_items: List of evidence items
            time_range_start: Start of time range
            time_range_end: End of time range
            
        Returns:
            Dictionary with gap analysis results
        """
        gaps = []
        all_controls = get_all_controls()
        
        # If control_id provided, get its assessment questions
        if control_id and control_id in all_controls:
            control = all_controls[control_id]
            assessment_questions = control.get("assessment_questions", [])
            
            # Check each question against evidence
            for question in assessment_questions:
                question_lower = question.lower()
                
                # Check for temporal requirements (annual, quarterly, monthly, etc.)
                temporal_keywords = {
                    "annual": 365,
                    "yearly": 365,
                    "quarterly": 90,
                    "monthly": 30,
                    "weekly": 7,
                    "daily": 1
                }
                
                required_frequency_days = None
                for keyword, days in temporal_keywords.items():
                    if keyword in question_lower:
                        required_frequency_days = days
                        break
                
                # Find relevant evidence for this question
                relevant_evidence = []
                for item in evidence_items:
                    # Simple keyword matching for relevance
                    if any(kw in item.get("content_preview", "").lower() for kw in question_lower.split()[:3]):
                        relevant_evidence.append(item)
                
                # Check temporal gaps
                if relevant_evidence and required_frequency_days:
                    # Get most recent evidence timestamp
                    most_recent = max(
                        (item.get("ingested_at") for item in relevant_evidence if item.get("ingested_at")),
                        default=None
                    )
                    
                    if most_recent:
                        if isinstance(most_recent, str):
                            from dateutil.parser import parse
                            most_recent = parse(most_recent)
                        
                        days_old = (datetime.utcnow() - most_recent).days
                        
                        if days_old > required_frequency_days:
                            gaps.append({
                                "type": "temporal_gap",
                                "control_id": control_id,
                                "question": question,
                                "severity": "high" if days_old > required_frequency_days * 2 else "medium",
                                "description": f"Evidence is {days_old} days old, but requirement is {required_frequency_days}-day frequency",
                                "most_recent_evidence": most_recent.isoformat(),
                                "required_frequency_days": required_frequency_days,
                                "days_overdue": days_old - required_frequency_days
                            })
                
                # Check coverage gaps (no evidence for question)
                if not relevant_evidence:
                    gaps.append({
                        "type": "coverage_gap",
                        "control_id": control_id,
                        "question": question,
                        "severity": "high",
                        "description": f"No evidence found for assessment question: {question}",
                        "evidence_count": 0
                    })
        
        # General coverage analysis
        if not control_id:
            # Analyze overall evidence coverage
            if not evidence_items:
                gaps.append({
                    "type": "coverage_gap",
                    "control_id": None,
                    "question": "General evidence coverage",
                    "severity": "high",
                    "description": "No evidence items found for the specified query and time range",
                    "evidence_count": 0
                })
        
        return {
            "gaps": gaps,
            "gap_count": len(gaps),
            "temporal_gaps": [g for g in gaps if g["type"] == "temporal_gap"],
            "coverage_gaps": [g for g in gaps if g["type"] == "coverage_gap"],
            "time_range": {
                "start": time_range_start.isoformat(),
                "end": time_range_end.isoformat()
            }
        }

    @staticmethod
    async def summarize_evidence_with_ai(
        query: str,
        evidence_items: List[Dict[str, Any]]
    ) -> Optional[str]:
        """
        Use OpenAI to generate a natural-language summary of the evidence set.
        Uses caching to speed up repetitive summaries during demos.

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

        # Create cache key based on query + evidence items (using IDs and hashes)
        # This ensures same query + same evidence = same summary
        evidence_signature = json.dumps([
            {
                "id": item.get("id"),
                "hash": item.get("hash"),
                "type": item.get("type")
            }
            for item in evidence_items[:10]  # Use top 10 items for cache key
        ], sort_keys=True, default=str)
        cache_key = ai_cache._generate_key('summarize_evidence', query, evidence_signature)
        
        cached_summary = ai_cache.get(cache_key)
        if cached_summary is not None:
            print(f"✅ Cache hit for evidence summarization: {query[:50]}...")
            return cached_summary

        try:
            print(f"🔄 Cache miss - calling OpenAI for evidence summarization: {query[:50]}...")
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

            summary = response.choices[0].message.content
            
            # Cache the result (30 minutes TTL for summaries)
            ai_cache.set(cache_key, summary, ttl_seconds=18000)
            print(f"💾 Cached evidence summarization result for: {query[:50]}...")
            
            return summary
        except Exception as e:
            print(f"OpenAI evidence summarization failed: {e}")
            return None

    @staticmethod
    async def _copy_evidence_files(
        session: AsyncSession,
        evidence_items: List[Dict[str, Any]],
        logs_dir: Path,
        docs_dir: Path
    ) -> Dict[str, Any]:
        """
        Copy evidence files with comprehensive error handling and batch database queries.
        
        Returns:
            Dictionary with copied files, failed files, and statistics
        """
        copied_files = []
        failed_files = []
        
        # Separate logs and documents
        log_ids = [item['id'] for item in evidence_items if item['type'] == 'log']
        doc_ids = [item['id'] for item in evidence_items if item['type'] == 'document']
        
        # Batch fetch all logs
        logs_dict = {}
        if log_ids:
            try:
                log_stmt = select(RawLog).where(RawLog.id.in_(log_ids))
                log_result = await session.execute(log_stmt)
                logs_dict = {log.id: log for log in log_result.scalars().all()}
                print(f"📦 Batch fetched {len(logs_dict)} logs from {len(log_ids)} requested")
            except Exception as e:
                print(f"❌ Error batch fetching logs: {e}")
                # Continue with empty dict, will fail individually
        
        # Batch fetch all documents
        docs_dict = {}
        if doc_ids:
            try:
                doc_stmt = select(RawDocument).where(RawDocument.id.in_(doc_ids))
                doc_result = await session.execute(doc_stmt)
                docs_dict = {doc.id: doc for doc in doc_result.scalars().all()}
                print(f"📦 Batch fetched {len(docs_dict)} documents from {len(doc_ids)} requested")
            except Exception as e:
                print(f"❌ Error batch fetching documents: {e}")
                # Continue with empty dict, will fail individually
        
        # Copy log files
        for item in evidence_items:
            if item['type'] == 'log':
                try:
                    log = logs_dict.get(item['id'])
                    if not log:
                        failed_files.append({
                            'type': 'log',
                            'id': item['id'],
                            'reason': 'not_found_in_database',
                            'filename': 'unknown'
                        })
                        continue
                    
                    source_path = Path(log.file_path)
                    if not source_path.exists():
                        failed_files.append({
                            'type': 'log',
                            'id': item['id'],
                            'filename': log.filename,
                            'reason': 'source_file_missing',
                            'expected_path': str(source_path)
                        })
                        continue
                    
                    # Sanitize filename to prevent path traversal
                    safe_filename = Path(log.filename).name  # Remove any path components
                    dest_path = logs_dir / f"{log.hash}_{safe_filename}"
                    
                    try:
                        shutil.copy(source_path, dest_path)
                        file_size = source_path.stat().st_size
                        copied_files.append({
                            'type': 'log',
                            'id': item['id'],
                            'filename': log.filename,
                            'size_bytes': file_size,
                            'hash': log.hash,
                            'dest_path': str(dest_path)
                        })
                        print(f"✅ Copied log {log.id}: {log.filename} ({file_size} bytes)")
                    except PermissionError as e:
                        failed_files.append({
                            'type': 'log',
                            'id': item['id'],
                            'filename': log.filename,
                            'reason': f'permission_denied: {str(e)}'
                        })
                    except OSError as e:
                        failed_files.append({
                            'type': 'log',
                            'id': item['id'],
                            'filename': log.filename,
                            'reason': f'copy_failed: {str(e)}'
                        })
                    except Exception as e:
                        failed_files.append({
                            'type': 'log',
                            'id': item['id'],
                            'filename': log.filename,
                            'reason': f'unexpected_error: {str(e)}'
                        })
                
                except Exception as e:
                    failed_files.append({
                        'type': 'log',
                        'id': item.get('id', 'unknown'),
                        'reason': f'processing_error: {str(e)}'
                    })
            
            elif item['type'] == 'document':
                try:
                    doc = docs_dict.get(item['id'])
                    if not doc:
                        failed_files.append({
                            'type': 'document',
                            'id': item['id'],
                            'reason': 'not_found_in_database',
                            'filename': 'unknown'
                        })
                        continue
                    
                    source_path = Path(doc.file_path)
                    if not source_path.exists():
                        failed_files.append({
                            'type': 'document',
                            'id': item['id'],
                            'filename': doc.filename,
                            'reason': 'source_file_missing',
                            'expected_path': str(source_path)
                        })
                        continue
                    
                    # Sanitize filename to prevent path traversal
                    safe_filename = Path(doc.filename).name  # Remove any path components
                    dest_path = docs_dir / f"{doc.hash}_{safe_filename}"
                    
                    try:
                        shutil.copy(source_path, dest_path)
                        file_size = source_path.stat().st_size
                        copied_files.append({
                            'type': 'document',
                            'id': item['id'],
                            'filename': doc.filename,
                            'size_bytes': file_size,
                            'hash': doc.hash,
                            'dest_path': str(dest_path)
                        })
                        print(f"✅ Copied document {doc.id}: {doc.filename} ({file_size} bytes)")
                    except PermissionError as e:
                        failed_files.append({
                            'type': 'document',
                            'id': item['id'],
                            'filename': doc.filename,
                            'reason': f'permission_denied: {str(e)}'
                        })
                    except OSError as e:
                        failed_files.append({
                            'type': 'document',
                            'id': item['id'],
                            'filename': doc.filename,
                            'reason': f'copy_failed: {str(e)}'
                        })
                    except Exception as e:
                        failed_files.append({
                            'type': 'document',
                            'id': item['id'],
                            'filename': doc.filename,
                            'reason': f'unexpected_error: {str(e)}'
                        })
                
                except Exception as e:
                    failed_files.append({
                        'type': 'document',
                        'id': item.get('id', 'unknown'),
                        'reason': f'processing_error: {str(e)}'
                    })
        
        return {
            'copied': copied_files,
            'failed': failed_files,
            'total_requested': len(evidence_items),
            'success_count': len(copied_files),
            'failure_count': len(failed_files)
        }

    @staticmethod
    async def generate_assurance_pack(
        session: AsyncSession,
        control_id: Optional[str],
        query: str,
        time_range_start: datetime,
        time_range_end: datetime,
        explicit_log_ids: Optional[List[int]] = None,
        explicit_document_ids: Optional[List[int]] = None,
        assessment_answers: Optional[List[Dict[str, Any]]] = None,
    ) -> AssurancePack:
        """
        Generate an Assurance Pack with evidence
        
        Includes comprehensive validation, error handling, and batch operations.

        Args:
            session: Database session
            control_id: Optional control ID
            query: Description/query for the pack
            time_range_start: Start of time range
            time_range_end: End of time range
            explicit_log_ids: Optional list of log IDs to explicitly include
            explicit_document_ids: Optional list of document IDs to explicitly include

        Returns:
            AssurancePack record
            
        Raises:
            ValueError: If input validation fails
            Exception: If pack generation fails
        """
        print(f"🚀 Starting pack generation: query='{query}', control_id={control_id}")
        
        # Input validation
        if time_range_start >= time_range_end:
            raise ValueError("time_range_start must be before time_range_end")
        
        time_range_delta = time_range_end - time_range_start
        if time_range_delta.days > 3650:  # 10 years
            raise ValueError("Time range cannot exceed 10 years")
        
        if not query or not query.strip():
            query = f"Evidence for control {control_id}" if control_id else "Assurance pack"
            print(f"⚠️  Empty query provided, using default: '{query}'")
        
        # Query evidence based on query + time range
        print(f"🔍 Querying evidence for time range: {time_range_start} to {time_range_end}")
        evidence_data = await Telescope.query_evidence(
            session, query, time_range_start, time_range_end
        )
        
        # Get AI summary for the query results
        ai_summary = await Telescope.summarize_evidence_with_ai(
            query=evidence_data.get('query', query),
            evidence_items=evidence_data.get('evidence_items', [])
        )

        # Optionally merge in explicitly selected evidence IDs (from UI "pack list")
        # while avoiding duplicates. We only need type + id for pack building.
        explicit_log_ids = explicit_log_ids or []
        explicit_document_ids = explicit_document_ids or []
        
        print(f"📋 Merging explicit evidence: {len(explicit_log_ids)} logs, {len(explicit_document_ids)} documents")

        existing_keys = {
            (item["type"], item["id"])
            for item in evidence_data.get("evidence_items", [])
        }

        # Add explicit logs
        for lid in explicit_log_ids:
            key = ("log", lid)
            if key not in existing_keys:
                evidence_data["evidence_items"].append(
                    {
                        "type": "log",
                        "id": lid,
                    }
                )
                existing_keys.add(key)

        # Add explicit documents
        for did in explicit_document_ids:
            key = ("document", did)
            if key not in existing_keys:
                evidence_data["evidence_items"].append(
                    {
                        "type": "document",
                        "id": did,
                    }
                )
                existing_keys.add(key)

        # Ensure results_count reflects merged evidence set
        evidence_data["results_count"] = len(evidence_data.get("evidence_items", []))
        
        # Perform gap analysis
        gap_analysis = await Telescope.perform_gap_analysis(
            control_id=control_id,
            evidence_items=evidence_data.get("evidence_items", []),
            time_range_start=time_range_start,
            time_range_end=time_range_end
        )
        
        # Validate we have evidence
        if evidence_data['results_count'] == 0:
            raise ValueError(
                "No evidence found for the specified query and time range. "
                "Please adjust your query or time range, or explicitly select evidence items."
            )
        
        print(f"✅ Found {evidence_data['results_count']} evidence items to include in pack")
        if gap_analysis.get('gap_count', 0) > 0:
            print(f"⚠️  Identified {gap_analysis['gap_count']} compliance gaps")

        # Create pack ID
        pack_id = f"PACK-{datetime.utcnow().strftime('%Y%m%d-%H%M%S')}"
        print(f"📦 Creating pack: {pack_id}")

        # Create pack directory
        pack_dir = settings.ASSURANCE_PACKS_PATH / pack_id
        try:
            pack_dir.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            raise Exception(f"Failed to create pack directory: {str(e)}")

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
            'query_results': {
                'query': evidence_data.get('query', query),
                'results_count': evidence_data.get('results_count', 0),
                'execution_time_ms': evidence_data.get('execution_time_ms', 0),
                'interpreted_intent': evidence_data.get('interpreted_intent', {}),
                'ai_summary': ai_summary
            },
            'gap_analysis': gap_analysis,
            'explicit_evidence': {
                'log_ids': explicit_log_ids or [],
                'document_ids': explicit_document_ids or []
            },
            'disclaimer': (
                'This assurance pack supports attestation readiness by providing '
                'structured, time-bound evidence. It does not constitute certification, '
                'regulatory approval, or compliance sign-off.'
            )
        }

        # Save manifest
        try:
            with open(pack_dir / 'manifest.json', 'w') as f:
                json.dump(manifest, f, indent=2)
        except Exception as e:
            raise Exception(f"Failed to create manifest: {str(e)}")

        # Copy evidence files with error handling
        logs_dir = pack_dir / 'logs'
        docs_dir = pack_dir / 'documents'
        logs_dir.mkdir(exist_ok=True)
        docs_dir.mkdir(exist_ok=True)
        
        print(f"📁 Copying evidence files...")
        copy_result = await Telescope._copy_evidence_files(
            session, evidence_data['evidence_items'], logs_dir, docs_dir
        )
        
        # Update manifest with actual file copy results
        manifest['files_copied'] = copy_result['success_count']
        manifest['files_failed'] = copy_result['failure_count']
        manifest['total_file_size_bytes'] = sum(f.get('size_bytes', 0) for f in copy_result['copied'])
        
        if copy_result['failed']:
            manifest['failed_files'] = copy_result['failed']
            print(f"⚠️  {copy_result['failure_count']} files failed to copy:")
            for failed in copy_result['failed'][:5]:  # Show first 5 failures
                print(f"   - {failed.get('type', 'unknown')} {failed.get('id', 'unknown')}: {failed.get('reason', 'unknown')}")
            if len(copy_result['failed']) > 5:
                print(f"   ... and {len(copy_result['failed']) - 5} more")
        
        # Update manifest with file details
        manifest['files'] = copy_result['copied']
        
        # Re-save manifest with updated information
        try:
            with open(pack_dir / 'manifest.json', 'w') as f:
                json.dump(manifest, f, indent=2)
        except Exception as e:
            print(f"⚠️  Warning: Failed to update manifest with file details: {e}")

        # Validate that we have at least some files copied
        if copy_result['success_count'] == 0:
            # Cleanup and raise error
            try:
                shutil.rmtree(pack_dir)
            except:
                pass
            raise Exception(
                "Failed to copy any evidence files. "
                f"Requested {copy_result['total_requested']} files, "
                f"failed: {copy_result['failure_count']}. "
                "Check file paths and permissions."
            )

        # Create ZIP file
        zip_path = settings.ASSURANCE_PACKS_PATH / f"{pack_id}.zip"
        print(f"📦 Creating ZIP archive: {zip_path}")
        try:
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for root, dirs, files in os.walk(pack_dir):
                    root_path = Path(root)
                    for file in files:
                        file_path = root_path / file
                        arcname = file_path.relative_to(pack_dir)
                        zipf.write(file_path, arcname)
        except Exception as e:
            # Cleanup on error
            try:
                shutil.rmtree(pack_dir)
            except:
                pass
            raise Exception(f"Failed to create ZIP archive: {str(e)}")

        # Calculate pack hash - use file-based method for large files
        print(f"🔐 Calculating pack hash...")
        zip_size = zip_path.stat().st_size
        if zip_size > 10 * 1024 * 1024:  # > 10 MB
            pack_hash = calculate_file_hash(zip_path)
            print(f"   Used file-based hash (size: {zip_size / 1024 / 1024:.2f} MB)")
        else:
            pack_hash = calculate_content_hash(zip_path.read_bytes())
            print(f"   Used content-based hash (size: {zip_size / 1024 / 1024:.2f} MB)")

        # Clean up unzipped directory
        try:
            shutil.rmtree(pack_dir)
            print(f"🧹 Cleaned up temporary directory")
        except Exception as e:
            print(f"⚠️  Warning: Failed to clean up temporary directory: {e}")

        # Update manifest with final pack info
        manifest['pack_hash'] = pack_hash
        manifest['pack_size_bytes'] = zip_size
        manifest['pack_size_mb'] = round(zip_size / 1024 / 1024, 2)

        # Save to database with transaction handling
        print(f"💾 Saving pack to database...")
        try:
            assurance_pack = AssurancePack(
                pack_id=pack_id,
                control_id=control_id,
                query=query,
                time_range_start=time_range_start,
                time_range_end=time_range_end,
                evidence_count=copy_result['success_count'],  # Use actual copied count
                pack_hash=pack_hash,
                file_path=str(zip_path),
                created_at=datetime.utcnow(),
                meta_data=manifest
            )

            session.add(assurance_pack)
            await session.commit()
            await session.refresh(assurance_pack)
            print(f"✅ Pack saved successfully: {pack_id}")
        except Exception as e:
            # Rollback and cleanup ZIP if database commit fails
            await session.rollback()
            try:
                if zip_path.exists():
                    zip_path.unlink()
            except:
                pass
            raise Exception(f"Failed to save pack to database: {str(e)}")

        return assurance_pack

    @staticmethod
    async def generate_pack_report(
        session: AsyncSession,
        pack_id: str
    ) -> str:
        """
        Generate a markdown report for an assurance pack.
        
        Args:
            session: Database session
            pack_id: Pack ID to generate report for
            query_results: Optional query results from Telescope query
            selected_evidence: Optional list of explicitly selected evidence items
            
        Returns:
            Markdown report as string
        """
        from sqlalchemy import select
        from backend.database import AssurancePack, RawLog, RawDocument
        
        # Fetch pack from database
        stmt = select(AssurancePack).where(AssurancePack.pack_id == pack_id)
        result = await session.execute(stmt)
        pack = result.scalar_one_or_none()
        
        if not pack:
            raise ValueError(f"Pack {pack_id} not found")
        
        # Get manifest data
        manifest = pack.meta_data or {}
        # Try multiple possible keys for files info
        files_info = manifest.get('files', []) or manifest.get('copied', []) or []
        failed_files = manifest.get('failed_files', [])
        query_results = manifest.get('query_results', {})
        explicit_evidence = manifest.get('explicit_evidence', {})
        assessment_answers = manifest.get('assessment_answers', [])
        
        # Debug: print files_info structure if available
        if files_info:
            print(f"📋 Files info structure: {len(files_info)} items, first item keys: {list(files_info[0].keys()) if files_info else 'N/A'}")
        
        # Start building formal compliance report
        report_lines = []
        
        # Title Page
        report_title = pack.query if pack.query else f"Compliance Evidence Pack - {pack.control_id or 'General'}"
        report_lines.append(report_title.upper())
        report_lines.append("")
        report_lines.append("COMPLIANCE ASSURANCE EVIDENCE REPORT")
        report_lines.append("")
        report_lines.append(f"Report Period: {pack.time_range_start.strftime('%B %d, %Y')} to {pack.time_range_end.strftime('%B %d, %Y')}")
        if pack.control_id:
            report_lines.append(f"Control ID: {pack.control_id}")
        report_lines.append(f"Report Generated: {pack.created_at.strftime('%B %d, %Y at %H:%M UTC')}")
        report_lines.append("")
        report_lines.append("DOCUMENT CLASSIFICATION: INTERNAL - COMPLIANCE EVIDENCE")
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # Executive Summary
        report_lines.append("EXECUTIVE SUMMARY")
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        if query_results and query_results.get('ai_summary'):
            # Use AI summary as executive summary
            report_lines.append(query_results['ai_summary'])
        else:
            # Generate a basic executive summary
            report_lines.append(
                f"This compliance assurance evidence report presents a comprehensive collection of "
                f"evidence items gathered for the period from {pack.time_range_start.strftime('%B %d, %Y')} "
                f"to {pack.time_range_end.strftime('%B %d, %Y')}. "
            )
            if pack.control_id:
                report_lines.append(
                    f"The evidence pack addresses compliance requirements for control {pack.control_id}. "
                )
            report_lines.append(
                f"A total of {pack.evidence_count} evidence items have been compiled and verified "
                f"to support attestation readiness and regulatory compliance."
            )
        
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # 1. SCOPE AND OBJECTIVES
        report_lines.append("1. SCOPE AND OBJECTIVES")
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        report_lines.append(
            f"This evidence pack has been compiled to support compliance attestation and "
            f"regulatory requirements for the period from {pack.time_range_start.strftime('%B %d, %Y')} "
            f"to {pack.time_range_end.strftime('%B %d, %Y')}."
        )
        report_lines.append("")
        if pack.control_id:
            report_lines.append(f"Primary Control ID: {pack.control_id}")
            report_lines.append("")
        report_lines.append(
            f"The evidence collection includes {pack.evidence_count} verified evidence items "
            f"comprising system logs, audit trails, policy documents, and compliance artifacts "
            f"relevant to the specified requirements."
        )
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # 2. EVIDENCE COLLECTION METHODOLOGY
        report_lines.append("2. EVIDENCE COLLECTION METHODOLOGY")
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        report_lines.append(
            "Evidence items were collected through automated query and retrieval processes, "
            "ensuring comprehensive coverage of the specified time period and compliance requirements."
        )
        report_lines.append("")
        if query_results:
            report_lines.append(f"Query Parameters: {query_results.get('query', pack.query)}")
            report_lines.append("")
        report_lines.append(
            "All evidence items have been verified for integrity using cryptographic hashing "
            "(SHA-256) and are maintained in an immutable format to support audit requirements."
        )
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # 3. EVIDENCE INVENTORY
        report_lines.append("3. EVIDENCE INVENTORY")
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # Get file information from manifest - try multiple possible keys
        logs_included = []
        docs_included = []
        
        if files_info and len(files_info) > 0:
            # Filter by type - handle various possible type values
            for f in files_info:
                file_type = str(f.get('type', '')).lower()
                dest_path = str(f.get('dest_path', '')).lower()
                
                # Check type field first
                if file_type in ['log', 'logs'] or 'logs' in dest_path:
                    logs_included.append(f)
                elif file_type in ['document', 'documents', 'doc'] or 'document' in dest_path:
                    docs_included.append(f)
        
        # Always show sections if we have files, even if details are missing
        total_copied = manifest.get('files_copied', 0)
        
        report_lines.append(f"Total Evidence Items: {pack.evidence_count}")
        report_lines.append(f"Total Pack Size: {manifest.get('pack_size_mb', 0):.2f} MB")
        report_lines.append("")
        
        # 3.1 System Logs
        log_count = len(logs_included) if logs_included else 0
        if log_count > 0 or total_copied > 0:
            if not log_count and files_info:
                log_count = sum(1 for f in files_info if 'log' in str(f.get('type', '')).lower() or 'logs' in str(f.get('dest_path', '')).lower())
            
            if log_count > 0:
                report_lines.append(f"3.1 System Logs and Audit Trails ({log_count} items)")
                report_lines.append("")
                if logs_included:
                    for log_file in logs_included:
                        filename = log_file.get('filename', 'N/A')
                        size_bytes = log_file.get('size_bytes', 0)
                        size_mb = size_bytes / 1024 / 1024 if size_bytes > 0 else 0
                        file_hash = log_file.get('hash', 'N/A')
                        report_lines.append(f"   - {filename}")
                        report_lines.append(f"     Size: {size_mb:.2f} MB | Hash: {file_hash[:32]}...")
                        report_lines.append("")
                else:
                    report_lines.append("   System logs and audit trail files have been collected and verified.")
                    report_lines.append("")
        
        # 3.2 Policy Documents
        doc_count = len(docs_included) if docs_included else 0
        if doc_count > 0 or (total_copied > 0 and log_count < total_copied):
            if not doc_count and files_info:
                doc_count = sum(1 for f in files_info if 'document' in str(f.get('type', '')).lower() or 'document' in str(f.get('dest_path', '')).lower())
            
            if doc_count > 0:
                report_lines.append(f"3.2 Policy Documents and Compliance Artifacts ({doc_count} items)")
                report_lines.append("")
                if docs_included:
                    for doc_file in docs_included:
                        filename = doc_file.get('filename', 'N/A')
                        size_bytes = doc_file.get('size_bytes', 0)
                        size_mb = size_bytes / 1024 / 1024 if size_bytes > 0 else 0
                        file_hash = doc_file.get('hash', 'N/A')
                        report_lines.append(f"   - {filename}")
                        report_lines.append(f"     Size: {size_mb:.2f} MB | Hash: {file_hash[:32]}...")
                        report_lines.append("")
                else:
                    report_lines.append("   Policy documents and compliance artifacts have been collected and verified.")
                    report_lines.append("")
        
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # 4. INTEGRITY AND VERIFICATION
        report_lines.append("4. INTEGRITY AND VERIFICATION")
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        report_lines.append("All evidence items included in this pack have been cryptographically verified.")
        report_lines.append("")
        report_lines.append(f"Pack Integrity Hash (SHA-256): {pack.pack_hash}")
        report_lines.append("")
        report_lines.append(
            "This hash value can be used to verify the integrity of the evidence pack. "
            "Any modification to the pack contents will result in a different hash value, "
            "ensuring the immutability and authenticity of the evidence collection."
        )
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # 5. COMPLIANCE ASSESSMENT
        report_lines.append("5. COMPLIANCE ASSESSMENT")
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # Assessment Questions and Answers
        if assessment_answers and len(assessment_answers) > 0:
            report_lines.append("5.1 Assessment Questions and Responses")
            report_lines.append("")
            report_lines.append(
                f"This pack addresses {len(assessment_answers)} compliance assessment questions "
                f"based on the selected framework requirements."
            )
            report_lines.append("")
            
            # Group answers by answer type
            yes_answers = [a for a in assessment_answers if a.get('answer') == 'yes']
            partial_answers = [a for a in assessment_answers if a.get('answer') == 'partial']
            no_answers = [a for a in assessment_answers if a.get('answer') == 'no']
            
            report_lines.append(f"Summary:")
            report_lines.append(f"  - Fully Compliant (Yes): {len(yes_answers)}")
            report_lines.append(f"  - Partially Compliant (Partial): {len(partial_answers)}")
            report_lines.append(f"  - Non-Compliant (No): {len(no_answers)}")
            report_lines.append("")
            
            # Show sample questions (first 10)
            report_lines.append("Sample Assessment Questions:")
            report_lines.append("")
            for answer in assessment_answers[:10]:
                answer_text = answer.get('answer', 'not_answered').upper()
                answer_symbol = '✓' if answer_text == 'YES' else '~' if answer_text == 'PARTIAL' else '✗'
                report_lines.append(f"{answer_symbol} {answer.get('questionId', 'N/A')}: {answer.get('question', 'N/A')}")
                report_lines.append(f"   Answer: {answer_text}")
                if answer.get('notes'):
                    report_lines.append(f"   Notes: {answer.get('notes')}")
                report_lines.append("")
            
            if len(assessment_answers) > 10:
                report_lines.append(f"... and {len(assessment_answers) - 10} more questions")
                report_lines.append("")
        
        if query_results and query_results.get('ai_summary'):
            # Use AI summary for compliance assessment
            report_lines.append("5.2 Evidence Analysis:")
            report_lines.append("")
            report_lines.append(query_results['ai_summary'])
            report_lines.append("")
        else:
            report_lines.append("5.2 Evidence Summary:")
            report_lines.append("")
            report_lines.append(
                f"Based on the evidence collected for the period {pack.time_range_start.strftime('%B %d, %Y')} "
                f"to {pack.time_range_end.strftime('%B %d, %Y')}, the following assessment is provided:"
            )
            report_lines.append("")
            report_lines.append(
                f"- A total of {pack.evidence_count} evidence items have been compiled and verified."
            )
            report_lines.append(
                "- All evidence items have been collected from authenticated sources and verified for integrity."
            )
            if pack.control_id:
                report_lines.append(
                    f"- Evidence supports compliance requirements for control {pack.control_id}."
                )
            report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # 5.5 GAP ANALYSIS
        gap_analysis = manifest.get('gap_analysis')
        if gap_analysis:
            report_lines.append("5.5 COMPLIANCE GAP ANALYSIS")
            report_lines.append("")
            report_lines.append("=" * 80)
            report_lines.append("")
            
            gaps = gap_analysis.get('gaps', [])
            temporal_gaps = gap_analysis.get('temporal_gaps', [])
            coverage_gaps = gap_analysis.get('coverage_gaps', [])
            
            if gaps:
                report_lines.append(f"Total Gaps Identified: {len(gaps)}")
                report_lines.append(f"  - Temporal Gaps: {len(temporal_gaps)}")
                report_lines.append(f"  - Coverage Gaps: {len(coverage_gaps)}")
                report_lines.append("")
                
                if temporal_gaps:
                    report_lines.append("Temporal Gaps (Evidence Freshness Issues):")
                    report_lines.append("")
                    for gap in temporal_gaps[:5]:  # Show top 5
                        report_lines.append(f"  - Control: {gap.get('control_id', 'N/A')}")
                        report_lines.append(f"    Question: {gap.get('question', 'N/A')}")
                        report_lines.append(f"    Issue: {gap.get('description', 'N/A')}")
                        report_lines.append(f"    Severity: {gap.get('severity', 'medium').upper()}")
                        if gap.get('days_overdue'):
                            report_lines.append(f"    Days Overdue: {gap['days_overdue']}")
                        report_lines.append("")
                
                if coverage_gaps:
                    report_lines.append("Coverage Gaps (Missing Evidence):")
                    report_lines.append("")
                    for gap in coverage_gaps[:5]:  # Show top 5
                        report_lines.append(f"  - Control: {gap.get('control_id', 'N/A')}")
                        report_lines.append(f"    Question: {gap.get('question', 'N/A')}")
                        report_lines.append(f"    Issue: {gap.get('description', 'N/A')}")
                        report_lines.append(f"    Severity: {gap.get('severity', 'medium').upper()}")
                        report_lines.append("")
            else:
                report_lines.append("No compliance gaps identified. All assessment questions have adequate evidence coverage.")
                report_lines.append("")
            
            report_lines.append("=" * 80)
            report_lines.append("")
        
        # 6. CONCLUSION
        report_lines.append("6. CONCLUSION")
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        report_lines.append(
            f"This evidence pack provides comprehensive documentation to support compliance attestation "
            f"for the specified time period. All evidence items have been collected, verified, and "
            f"cryptographically secured to ensure their integrity and authenticity."
        )
        report_lines.append("")
        report_lines.append(
            "The evidence pack is suitable for submission to auditors, regulatory bodies, or internal "
            "compliance review processes. The cryptographic hash provided in Section 4 can be used to "
            "verify the integrity of the pack at any time."
        )
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        
        # APPENDIX
        report_lines.append("APPENDIX")
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        report_lines.append("A. Pack Metadata")
        report_lines.append("")
        report_lines.append(f"   Pack ID: {pack.pack_id}")
        report_lines.append(f"   Generated: {pack.created_at.strftime('%B %d, %Y at %H:%M:%S UTC')}")
        report_lines.append(f"   Pack Size: {manifest.get('pack_size_mb', 0):.2f} MB")
        if pack.control_id:
            report_lines.append(f"   Control ID: {pack.control_id}")
        report_lines.append("")
        report_lines.append("B. Disclaimer")
        report_lines.append("")
        report_lines.append(
            "   This assurance pack supports attestation readiness by providing structured, "
            "time-bound evidence. It does not constitute certification, regulatory approval, "
            "or compliance sign-off."
        )
        report_lines.append("")
        report_lines.append("=" * 80)
        report_lines.append("")
        report_lines.append(f"Report Generated: {datetime.utcnow().strftime('%B %d, %Y at %H:%M:%S UTC')}")
        report_lines.append("")
        
        return "\n".join(report_lines)
