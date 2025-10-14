#!/bin/bash

echo "Testing the /api/v1/licenses/new endpoint..."
echo "Note: Make sure the server is running on localhost:8080"
echo "====================================================="

# Test 1: Request without Authorization header (should return 401)
echo "Test 1: Request without Authorization header"
curl -i -X POST http://localhost:8080/api/v1/licenses/new \
  -H "Content-Type: application/json" \
  -d '{
    "licenseType": "ขอรับใบอนุญาต",
    "projectName": "Test Project",
    "projectAddress": "123 Test St",
    "province": "Bangkok",
    "district": "Test District",
    "subdistrict": "Test Subdistrict",
    "postalCode": "12345",
    "energyType": "Solar",
    "capacity": "100",
    "capacityUnit": "kW",
    "expectedStartDate": "2025-11-01",
    "description": "Test description",
    "contactPerson": "Test Person",
    "contactPhone": "1234567890",
    "contactEmail": "test@example.com"
  }'

echo -e "\n\n"

# Test 2: Request with invalid Authorization header (should return 401)
echo "Test 2: Request with invalid Authorization header"
curl -i -X POST http://localhost:8080/api/v1/licenses/new \
  -H "Content-Type: application/json" \
  -H "Authorization: InvalidToken" \
  -d '{
    "licenseType": "ขอรับใบอนุญาต",
    "projectName": "Test Project",
    "projectAddress": "123 Test St",
    "province": "Bangkok",
    "district": "Test District",
    "subdistrict": "Test Subdistrict",
    "postalCode": "12345",
    "energyType": "Solar",
    "capacity": "100",
    "capacityUnit": "kW",
    "expectedStartDate": "2025-11-01",
    "description": "Test description",
    "contactPerson": "Test Person",
    "contactPhone": "1234567890",
    "contactEmail": "test@example.com"
  }'

echo -e "\n\n"

# Test 3: Request with Bearer token format but invalid token (should return 401)
echo "Test 3: Request with Bearer token format but invalid token"
curl -i -X POST http://localhost:8080/api/v1/licenses/new \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer invalid.jwt.token" \
  -d '{
    "licenseType": "ขอรับใบอนุญาต",
    "projectName": "Test Project",
    "projectAddress": "123 Test St",
    "province": "Bangkok",
    "district": "Test District",
    "subdistrict": "Test Subdistrict",
    "postalCode": "12345",
    "energyType": "Solar",
    "capacity": "100",
    "capacityUnit": "kW",
    "expectedStartDate": "2025-11-01",
    "description": "Test description",
    "contactPerson": "Test Person",
    "contactPhone": "1234567890",
    "contactEmail": "test@example.com"
  }'

echo -e "\n\n"