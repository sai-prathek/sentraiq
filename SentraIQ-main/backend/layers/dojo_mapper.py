"""
Layer 2: The Dojo Mapper - Normalization Engine
Acts as "Universal Translator" linking technical logs to regulatory controls
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from typing import List, Dict, Any, Optional
import re
import json

from backend.database import RawLog, RawDocument, EvidenceObject
from backend.config import settings

# OpenAI integration for intelligent control mapping
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False


class DojoMapper:
    """
    Layer 2: Dojo Mapper for linking logs to regulatory controls
    """

    @staticmethod
    def _extract_keywords_from_log(log_content: str) -> List[str]:
        """Extract relevant keywords from log content"""
        # Convert to lowercase for matching
        content_lower = log_content.lower()

        keywords = []

        # Extract common patterns
        patterns = {
            'event_id': r'event\s*id[:\s]+(\w+)',
            'status': r'status[:\s]+(\w+)',
            'action': r'action[:\s]+(\w+)',
            'user': r'user[:\s]+(\w+)',
            'mfa': r'(mfa|two[\-\s]factor|2fa|authentication)',
            'failed': r'(failed|failure|denied|rejected|error)',
            'success': r'(success|successful|approved|granted)',
            'encryption': r'(encrypt|tls|ssl|cipher)',
            'access': r'(access|login|logon|authentication)',
        }

        for pattern_name, pattern in patterns.items():
            matches = re.findall(pattern, content_lower)
            keywords.extend(matches)

        return list(set(keywords))  # Remove duplicates

    @staticmethod
    def _match_control_with_ai(content: str, keywords: List[str]) -> Optional[Dict[str, Any]]:
        """
        Use OpenAI to intelligently match content to regulatory controls.
        Returns the best matching control with a score and reasoning.
        """
        if not OPENAI_AVAILABLE or not settings.OPENAI_API_KEY:
            return DojoMapper._match_control_fallback(keywords)

        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)

            # Build list of available controls for the model
            available_controls = []
            for control_key, control_info in settings.CONTROL_MAPPINGS.items():
                available_controls.append({
                    "control_id": control_info['control_id'],
                    "name": control_info['name'],
                    "description": control_info['description'],
                    "keywords": control_info['keywords']
                })

            system_prompt = """You are a compliance mapping expert. Given content from a log or document,
determine which regulatory control it best matches.

Available controls:
{controls}

Return a JSON object with:
- control_id: The ID of the best matching control (e.g., "AC-001")
- confidence_score: Float between 0.0 and 1.0 indicating match confidence
- reasoning: Brief explanation of why this control matches

If no control is a good match (confidence < 0.4), return null."""

            system_prompt = system_prompt.format(
                controls=json.dumps(available_controls, indent=2)
            )

            content_preview = content[:1000]  # Limit content size

            user_content = f"""Content to analyze:
{content_preview}

Extracted keywords: {', '.join(keywords[:10])}

Which control does this content best match?"""

            response = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_content}
                ],
                response_format={"type": "json_object"},
                temperature=0.3
            )

            result = json.loads(response.choices[0].message.content)

            if result is None or result.get("confidence_score", 0) < 0.4:
                return None

            # Find the control info
            control_id = result.get("control_id")
            for control_key, control_info in settings.CONTROL_MAPPINGS.items():
                if control_info['control_id'] == control_id:
                    return {
                        **control_info,
                        'score': float(result.get("confidence_score", 0.5)),
                        'ai_reasoning': result.get("reasoning", "")
                    }

            return None

        except Exception as e:
            print(f"OpenAI control matching failed: {e}, using fallback")
            return DojoMapper._match_control_fallback(keywords)

    @staticmethod
    def _match_control_fallback(keywords: List[str]) -> Optional[Dict[str, Any]]:
        """Fallback keyword-based control matching"""
        best_match = None
        best_score = 0.0

        for control_key, control_info in settings.CONTROL_MAPPINGS.items():
            score = 0.0
            control_keywords = [kw.lower() for kw in control_info['keywords']]

            # Calculate matching score
            for keyword in keywords:
                if any(ck in keyword or keyword in ck for ck in control_keywords):
                    score += 1.0

            # Normalize score
            if len(control_keywords) > 0:
                score = score / len(control_keywords)

            if score > best_score:
                best_score = score
                best_match = control_info

        # Only return if score is above threshold
        if best_score > 0.3:  # 30% match threshold
            return {**best_match, 'score': best_score}

        return None

    @staticmethod
    def _match_control(keywords: List[str], content: str = "") -> Optional[Dict[str, Any]]:
        """
        Match extracted keywords to regulatory controls.
        Uses AI if available, falls back to keyword matching.
        """
        if content:
            return DojoMapper._match_control_with_ai(content, keywords)
        else:
            return DojoMapper._match_control_fallback(keywords)

    @staticmethod
    async def map_log_to_controls(
        session: AsyncSession,
        log_id: int
    ) -> List[EvidenceObject]:
        """
        Map a log to relevant regulatory controls

        Args:
            session: Database session
            log_id: ID of the log to map

        Returns:
            List of created evidence objects
        """
        # Get the log
        stmt = select(RawLog).where(RawLog.id == log_id)
        result = await session.execute(stmt)
        log = result.scalar_one_or_none()

        if not log:
            raise ValueError(f"Log with ID {log_id} not found")

        # Extract keywords
        keywords = DojoMapper._extract_keywords_from_log(log.content)

        # Match to controls using AI if available
        control_match = DojoMapper._match_control(keywords, content=log.content)

        evidence_objects = []

        if control_match:
            # Create evidence object
            # Build linkage reason with AI reasoning if available
            if control_match.get('ai_reasoning'):
                linkage_reason = f"AI Analysis: {control_match['ai_reasoning']}. " \
                               f"Matched keywords: {', '.join(keywords[:5])}."
            else:
                linkage_reason = f"Matched keywords: {', '.join(keywords[:5])}. " \
                               f"Control description: {control_match['description']}"

            evidence_obj = EvidenceObject(
                control_id=control_match['control_id'],
                control_name=control_match['name'],
                log_id=log.id,
                log_hash=log.hash,
                linkage_score=control_match['score'],
                linkage_reason=linkage_reason,
                created_at=datetime.utcnow(),
                meta_data={
                    'keywords': keywords,
                    'source': log.source,
                    'mapping_method': 'ai' if control_match.get('ai_reasoning') else 'keyword'
                }
            )

            session.add(evidence_obj)
            evidence_objects.append(evidence_obj)

        await session.commit()

        return evidence_objects

    @staticmethod
    async def map_document_to_controls(
        session: AsyncSession,
        document_id: int
    ) -> List[EvidenceObject]:
        """
        Map a document to relevant regulatory controls

        Args:
            session: Database session
            document_id: ID of the document to map

        Returns:
            List of created evidence objects
        """
        # Get the document
        stmt = select(RawDocument).where(RawDocument.id == document_id)
        result = await session.execute(stmt)
        document = result.scalar_one_or_none()

        if not document:
            raise ValueError(f"Document with ID {document_id} not found")

        # Extract keywords from document text
        if not document.extracted_text:
            return []

        keywords = DojoMapper._extract_keywords_from_log(document.extracted_text)

        # Match to controls using AI if available
        control_match = DojoMapper._match_control(keywords, content=document.extracted_text)

        evidence_objects = []

        if control_match:
            # Create evidence object
            # Build linkage reason with AI reasoning if available
            if control_match.get('ai_reasoning'):
                linkage_reason = f"AI Analysis: {control_match['ai_reasoning']}. " \
                               f"Document contains relevant policy information."
            else:
                linkage_reason = f"Document contains relevant policy information. " \
                               f"Matched keywords: {', '.join(keywords[:5])}. " \
                               f"Control: {control_match['description']}"

            evidence_obj = EvidenceObject(
                control_id=control_match['control_id'],
                control_name=control_match['name'],
                document_id=document.id,
                document_hash=document.hash,
                linkage_score=control_match['score'],
                linkage_reason=linkage_reason,
                created_at=datetime.utcnow(),
                meta_data={
                    'keywords': keywords,
                    'doc_type': document.doc_type,
                    'mapping_method': 'ai' if control_match.get('ai_reasoning') else 'keyword'
                }
            )

            session.add(evidence_obj)
            evidence_objects.append(evidence_obj)

        await session.commit()

        return evidence_objects

    @staticmethod
    async def create_log_document_linkage(
        session: AsyncSession,
        log_id: int,
        document_id: int,
        control_id: str
    ) -> EvidenceObject:
        """
        Explicitly link a log to a document under a specific control

        Args:
            session: Database session
            log_id: ID of the log
            document_id: ID of the document
            control_id: Control identifier

        Returns:
            Created evidence object
        """
        # Get log and document
        log_stmt = select(RawLog).where(RawLog.id == log_id)
        log_result = await session.execute(log_stmt)
        log = log_result.scalar_one_or_none()

        doc_stmt = select(RawDocument).where(RawDocument.id == document_id)
        doc_result = await session.execute(doc_stmt)
        document = doc_result.scalar_one_or_none()

        if not log or not document:
            raise ValueError("Log or document not found")

        # Find control info
        control_info = None
        for control in settings.CONTROL_MAPPINGS.values():
            if control['control_id'] == control_id:
                control_info = control
                break

        if not control_info:
            raise ValueError(f"Control {control_id} not found")

        # Create evidence object linking both
        evidence_obj = EvidenceObject(
            control_id=control_id,
            control_name=control_info['name'],
            log_id=log.id,
            document_id=document.id,
            log_hash=log.hash,
            document_hash=document.hash,
            linkage_score=1.0,  # Explicit linkage has max score
            linkage_reason=f"Manual linkage: Log from {log.source} linked to "
                          f"{document.doc_type} for control {control_id}",
            created_at=datetime.utcnow(),
            meta_data={
                'linkage_type': 'manual',
                'log_source': log.source,
                'doc_type': document.doc_type,
            }
        )

        session.add(evidence_obj)
        await session.commit()
        await session.refresh(evidence_obj)

        return evidence_obj

    @staticmethod
    async def get_evidence_by_control(
        session: AsyncSession,
        control_id: str
    ) -> List[EvidenceObject]:
        """Get all evidence objects for a specific control"""
        stmt = select(EvidenceObject).where(
            EvidenceObject.control_id == control_id
        ).order_by(EvidenceObject.created_at.desc())

        result = await session.execute(stmt)
        return list(result.scalars().all())
