#!/bin/bash

echo "Testing different field formats..."

echo -e "\n🧪 Test 1: camelCase fields"
curl -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "patientEmail": "test1@example.com",
    "patientName": "Test User 1"
  }' -s | jq .

echo -e "\n🧪 Test 2: snake_case fields"
curl -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_email": "test2@example.com",
    "patient_name": "Test User 2"
  }' -s | jq .

echo -e "\n🧪 Test 3: simple fields"
curl -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test3@example.com",
    "name": "Test User 3"
  }' -s | jq .

echo -e "\n🧪 Test 4: Mixed fields (camelCase priority)"
curl -X POST "https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2" \
  -H "Content-Type: application/json" \
  -d '{
    "patientEmail": "test4@example.com",
    "patient_name": "Should be ignored",
    "name": "Should be ignored"
  }' -s | jq .