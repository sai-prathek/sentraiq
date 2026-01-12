#!/bin/bash

# SentralQ API Test Script

BASE_URL="http://localhost:8000/api/v1"

echo "🧪 Testing SentralQ API..."

# Test health endpoint
echo -e "\n📊 Testing health endpoint..."
curl -X GET "http://localhost:8000/health" | jq '.'

# Test dashboard stats
echo -e "\n📈 Testing dashboard stats..."
curl -X GET "$BASE_URL/dashboard/stats" | jq '.'

# Test log ingestion (requires a sample file)
if [ -f "data/sample_logs/swift_access_q3_2025.log" ]; then
    echo -e "\n📤 Testing log ingestion..."
    curl -X POST "$BASE_URL/ingest/log" \
        -F "file=@data/sample_logs/swift_access_q3_2025.log" \
        -F "source=SWIFT" \
        -F "description=Sample SWIFT logs for Q3 2025" \
        -F "auto_map=true" | jq '.'
fi

# Test evidence query
echo -e "\n🔍 Testing evidence query..."
curl -X POST "$BASE_URL/assurance/query" \
    -H "Content-Type: application/json" \
    -d '{"query": "Show MFA authentication logs"}' | jq '.'

echo -e "\n✅ API tests complete!"
