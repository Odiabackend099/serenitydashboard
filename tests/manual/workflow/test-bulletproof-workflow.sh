#!/bin/bash

# BULLETPROOF WORKFLOW TEST SUITE
# Tests all scenarios including validation failures and edge cases

echo "🧪 BULLETPROOF WORKFLOW TEST SUITE"
echo "=================================="
echo ""

WEBHOOK_URL="https://cwai97.app.n8n.cloud/webhook/serenity-webhook-v2"

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local payload="$2"
    local expected_success="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo "📋 Test: $test_name"
    echo "📝 Payload: $payload"
    
    response=$(curl -s -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "$payload" \
        -w "\nHTTP_CODE:%{http_code}")
    
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d: -f2)
    json_response=$(echo "$response" | grep -v "HTTP_CODE:")
    
    echo "📊 HTTP Code: $http_code"
    echo "📤 Response: $json_response"
    
    # Check if response is valid JSON
    if echo "$json_response" | jq . > /dev/null 2>&1; then
        success_value=$(echo "$json_response" | jq -r '.success // false')
        action_value=$(echo "$json_response" | jq -r '.action // "unknown"')
        email_value=$(echo "$json_response" | jq -r '.email // ""')
        
        echo "✅ Valid JSON response"
        echo "   Success: $success_value"
        echo "   Action: $action_value"
        echo "   Email: $email_value"
        
        if [ "$success_value" = "$expected_success" ]; then
            echo "✅ Test PASSED - Expected success: $expected_success, Got: $success_value"
            PASSED_TESTS=$((PASSED_TESTS + 1))
        else
            echo "❌ Test FAILED - Expected success: $expected_success, Got: $success_value"
            FAILED_TESTS=$((FAILED_TESTS + 1))
        fi
    else
        echo "❌ Invalid JSON response"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
    sleep 2
}

echo "🎯 TEST 1: Valid Create Appointment"
echo "====================================="
run_test "Valid Create" '{
    "actionType": "create",
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "patientPhone": "+234-800-1234",
    "appointmentDate": "November 25, 2025",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "General Checkup"
}' "true"

echo "🎯 TEST 2: Valid Reschedule Appointment"
echo "========================================="
run_test "Valid Reschedule" '{
    "actionType": "reschedule",
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "patientPhone": "+234-800-1234",
    "previousDate": "November 25, 2025",
    "previousTime": "10:00 AM",
    "appointmentDate": "November 27, 2025",
    "appointmentTime": "2:00 PM",
    "appointmentReason": "Follow-up Visit"
}' "true"

echo "🎯 TEST 3: Valid Cancel Appointment"
echo "===================================="
run_test "Valid Cancel" '{
    "actionType": "cancel",
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "appointmentDate": "November 27, 2025",
    "appointmentTime": "2:00 PM",
    "appointmentReason": "Follow-up Visit"
}' "true"

echo "🎯 TEST 4: Missing Email (Validation Failure)"
echo "=============================================="
run_test "Missing Email" '{
    "actionType": "create",
    "patientName": "Samuel Eguale",
    "patientPhone": "+234-800-1234",
    "appointmentDate": "November 25, 2025",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "General Checkup"
}' "false"

echo "🎯 TEST 5: Invalid Email Format"
echo "=================================="
run_test "Invalid Email" '{
    "actionType": "create",
    "patientName": "Samuel Eguale",
    "patientEmail": "invalid-email-format",
    "patientPhone": "+234-800-1234",
    "appointmentDate": "November 25, 2025",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "General Checkup"
}' "false"

echo "🎯 TEST 6: Missing Patient Name"
echo "=================================="
run_test "Missing Name" '{
    "actionType": "create",
    "patientEmail": "egualesamuel@gmail.com",
    "patientPhone": "+234-800-1234",
    "appointmentDate": "November 25, 2025",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "General Checkup"
}' "false"

echo "🎯 TEST 7: Case Insensitive Action Type"
echo "========================================="
run_test "Case Insensitive" '{
    "actionType": "CREATE",
    "patientName": "Samuel Eguale",
    "patientEmail": "egualesamuel@gmail.com",
    "patientPhone": "+234-800-1234",
    "appointmentDate": "November 25, 2025",
    "appointmentTime": "10:00 AM",
    "appointmentReason": "General Checkup"
}' "true"

echo "🎯 TEST 8: Alternative Field Names"
echo "===================================="
run_test "Alt Field Names" '{
    "action": "create",
    "patient_name": "Samuel Eguale",
    "patient_email": "egualesamuel@gmail.com",
    "patient_phone": "+234-800-1234",
    "appointment_date": "November 25, 2025",
    "appointment_time": "10:00 AM",
    "appointment_reason": "General Checkup"
}' "true"

echo "🎯 TEST 9: Minimal Valid Payload"
echo "=================================="
run_test "Minimal Payload" '{
    "patientEmail": "egualesamuel@gmail.com",
    "patientName": "Samuel Eguale"
}' "true"

echo "🎯 TEST 10: Empty Payload"
echo "=========================="
run_test "Empty Payload" '{}' "false"

echo ""
echo "=================================="
echo "📊 TEST SUMMARY"
echo "=================================="
echo "Total Tests: $TOTAL_TESTS"
echo "✅ Passed: $PASSED_TESTS"
echo "❌ Failed: $FAILED_TESTS"
echo "Success Rate: $((PASSED_TESTS * 100 / TOTAL_TESTS))%"

if [ $FAILED_TESTS -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! Workflow is bulletproof!"
    exit 0
else
    echo "⚠️  Some tests failed. Check the workflow configuration."
    exit 1
fi