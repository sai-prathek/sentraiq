#!/usr/bin/env python3
"""
Test OpenAI Integration for Natural Language Query Parsing
"""
import os
import json
import re
from typing import Dict, Any

# Standalone test - no backend imports needed
try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️  OpenAI package not installed. Install with: pip install openai")

def parse_with_openai(query: str, api_key: str) -> Dict[str, Any]:
    """Parse query using OpenAI"""
    client = OpenAI(api_key=api_key)

    system_prompt = """You are an expert at parsing compliance and security evidence queries.
Extract structured intent from user queries for an evidence management system.

Available compliance frameworks: PCI-DSS, SOC 2, ISO 27001, NIST, SWIFT
Available sources: SWIFT, CHAPS, FPS
Available control types: mfa, access, encryption, audit, logging, monitoring, backup, incident-response

Return a JSON object with:
- control_keywords: array of relevant control types
- time_keywords: array of time indicators (last_90_days, last_quarter, q3, last_month, last_year)
- source_keywords: array of sources mentioned
- action: "search" or "generate_pack"
- search_terms: array of key search terms to use
- summary: brief summary of what user wants

Be specific and extract all relevant details."""

    model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Parse this query: {query}"}
        ],
        response_format={"type": "json_object"}
        # Note: GPT-5 only supports temperature=1 (default), so we omit it
    )

    intent = json.loads(response.choices[0].message.content)
    return intent


def parse_with_fallback(query: str) -> Dict[str, Any]:
    """Fallback keyword-based parser"""
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


def test_queries():
    """Test various natural language queries"""

    test_cases = [
        "Show me MFA authentication logs from SWIFT in the last 90 days",
        "Find all encryption evidence from Q3 2025",
        "What backup logs do we have from CHAPS last month?",
        "Generate assurance pack for access control audit",
        "Show incident response logs for PCI-DSS compliance last year",
    ]

    print("=" * 80)
    print("TESTING OPENAI NATURAL LANGUAGE QUERY PARSING")
    print("=" * 80)
    print()

    # Check if OpenAI is configured
    api_key = os.environ.get('OPENAI_API_KEY')
    if api_key:
        print(f"✅ OpenAI API Key Found: {api_key[:8]}...{api_key[-4:]}")
        print(f"   Using Model: gpt-4o (Latest GPT-4 Optimized)")
    else:
        print("⚠️  No OpenAI API Key - Using fallback keyword matching")
    print()

    for i, query in enumerate(test_cases, 1):
        print(f"\n{'─' * 80}")
        print(f"TEST CASE {i}: {query}")
        print('─' * 80)

        try:
            # Parse with OpenAI (or fallback)
            if api_key and OPENAI_AVAILABLE:
                intent = parse_with_openai(query, api_key)
            else:
                intent = parse_with_fallback(query)

            print(f"\n📊 PARSED INTENT:")
            print(f"   Action: {intent.get('action', 'N/A')}")
            print(f"   Control Keywords: {', '.join(intent.get('control_keywords', [])) or 'None'}")
            print(f"   Time Keywords: {', '.join(intent.get('time_keywords', [])) or 'None'}")
            print(f"   Source Keywords: {', '.join(intent.get('source_keywords', [])) or 'None'}")
            print(f"   Search Terms: {', '.join(intent.get('search_terms', [])) or 'None'}")
            if 'summary' in intent:
                print(f"   Summary: {intent['summary']}")

            print(f"\n✅ Success")

        except Exception as e:
            print(f"\n❌ Error: {e}")
            import traceback
            traceback.print_exc()

    print(f"\n{'=' * 80}")
    print("TEST COMPLETED")
    print('=' * 80)

    # Compare fallback vs OpenAI if API key is available
    if api_key:
        print("\n\n" + "=" * 80)
        print("COMPARING FALLBACK vs OPENAI PARSING")
        print("=" * 80)

        sample_query = "Show me MFA logs from SWIFT in last 90 days"
        print(f"\nQuery: {sample_query}\n")

        # Fallback
        print("🔧 FALLBACK (Keyword Matching):")
        fallback_intent = parse_with_fallback(sample_query)
        print(json.dumps(fallback_intent, indent=2))

        # OpenAI
        print("\n🤖 OPENAI (gpt-4o):")
        ai_intent = parse_with_openai(sample_query, api_key)
        print(json.dumps(ai_intent, indent=2))

        print("\n" + "=" * 80)

if __name__ == "__main__":
    test_queries()
