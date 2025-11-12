#!/bin/bash

# Google Calendar Setup Script for Serenity Dashboard
# This script helps you set up Google Calendar integration

set -e

echo "========================================="
echo "Google Calendar Integration Setup"
echo "========================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "   npm install -g supabase"
    exit 1
fi

echo "Step 1: Google Cloud Console Setup"
echo "-----------------------------------"
echo "1. Go to: https://console.cloud.google.com"
echo "2. Create a new project or select existing: 'Serenity Hospital Calendar'"
echo "3. Enable Google Calendar API:"
echo "   - Go to 'APIs & Services' > 'Library'"
echo "   - Search for 'Google Calendar API'"
echo "   - Click 'Enable'"
echo "4. Create OAuth 2.0 credentials:"
echo "   - Go to 'APIs & Services' > 'Credentials'"
echo "   - Click 'Create Credentials' > 'OAuth client ID'"
echo "   - Application type: 'Web application'"
echo "   - Add authorized redirect URI: http://localhost:8080"
echo "5. Download the credentials JSON file"
echo ""
read -p "Press Enter when you've completed these steps..."

echo ""
echo "Step 2: Enter Your Credentials"
echo "-------------------------------"

read -p "Enter Google Client ID: " GCAL_CLIENT_ID
read -p "Enter Google Client Secret: " GCAL_CLIENT_SECRET

echo ""
echo "Step 3: Get Refresh Token"
echo "-------------------------"
echo "We'll now open a browser to authorize access to your Google Calendar."
echo "This will generate a refresh token that allows the app to access your calendar."
echo ""

# Generate authorization URL
AUTH_URL="https://accounts.google.com/o/oauth2/v2/auth?client_id=${GCAL_CLIENT_ID}&redirect_uri=http://localhost:8080&response_type=code&scope=https://www.googleapis.com/auth/calendar&access_type=offline&prompt=consent"

echo "Opening browser for authorization..."
echo "If the browser doesn't open, visit this URL:"
echo "$AUTH_URL"
echo ""

# Try to open browser (works on macOS, Linux, Windows)
if command -v open &> /dev/null; then
    open "$AUTH_URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$AUTH_URL"
elif command -v start &> /dev/null; then
    start "$AUTH_URL"
else
    echo "Please manually open the URL above in your browser"
fi

echo ""
echo "After authorizing, you'll be redirected to:"
echo "http://localhost:8080/?code=XXXXX..."
echo ""
echo "Copy the entire URL from your browser's address bar."
read -p "Paste the redirect URL here: " REDIRECT_URL

# Extract authorization code from URL
AUTH_CODE=$(echo "$REDIRECT_URL" | sed -n 's/.*code=\([^&]*\).*/\1/p')

if [ -z "$AUTH_CODE" ]; then
    echo "❌ Failed to extract authorization code from URL"
    exit 1
fi

echo "✓ Authorization code extracted"
echo ""
echo "Exchanging authorization code for refresh token..."

# Exchange authorization code for refresh token
TOKEN_RESPONSE=$(curl -s -X POST https://oauth2.googleapis.com/token \
    -d "code=${AUTH_CODE}" \
    -d "client_id=${GCAL_CLIENT_ID}" \
    -d "client_secret=${GCAL_CLIENT_SECRET}" \
    -d "redirect_uri=http://localhost:8080" \
    -d "grant_type=authorization_code")

# Extract refresh token
GCAL_REFRESH_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"refresh_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$GCAL_REFRESH_TOKEN" ]; then
    echo "❌ Failed to get refresh token"
    echo "Response: $TOKEN_RESPONSE"
    exit 1
fi

echo "✓ Refresh token obtained"
echo ""

# Set default values
GCAL_CALENDAR_ID="primary"
GCAL_TIMEZONE="Africa/Lagos"

read -p "Calendar ID (default: primary): " INPUT_CAL_ID
if [ ! -z "$INPUT_CAL_ID" ]; then
    GCAL_CALENDAR_ID="$INPUT_CAL_ID"
fi

read -p "Timezone (default: Africa/Lagos): " INPUT_TIMEZONE
if [ ! -z "$INPUT_TIMEZONE" ]; then
    GCAL_TIMEZONE="$INPUT_TIMEZONE"
fi

echo ""
echo "Step 4: Save to Supabase Secrets"
echo "---------------------------------"

# Check if we're in the right directory
if [ ! -f "supabase/config.toml" ]; then
    echo "⚠️  Warning: Not in project root directory"
    echo "Current directory: $(pwd)"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ]; then
        echo "Please run this script from the project root directory"
        exit 1
    fi
fi

echo "Saving credentials to Supabase..."

supabase secrets set GCAL_CLIENT_ID="$GCAL_CLIENT_ID"
supabase secrets set GCAL_CLIENT_SECRET="$GCAL_CLIENT_SECRET"
supabase secrets set GCAL_REFRESH_TOKEN="$GCAL_REFRESH_TOKEN"
supabase secrets set GCAL_CALENDAR_ID="$GCAL_CALENDAR_ID"
supabase secrets set GCAL_TIMEZONE="$GCAL_TIMEZONE"

echo ""
echo "========================================="
echo "✅ Google Calendar Setup Complete!"
echo "========================================="
echo ""
echo "Credentials saved to Supabase secrets:"
echo "  - GCAL_CLIENT_ID"
echo "  - GCAL_CLIENT_SECRET"
echo "  - GCAL_REFRESH_TOKEN"
echo "  - GCAL_CALENDAR_ID: $GCAL_CALENDAR_ID"
echo "  - GCAL_TIMEZONE: $GCAL_TIMEZONE"
echo ""
echo "Next steps:"
echo "1. Deploy the google-calendar-sync Edge Function"
echo "2. Test calendar integration with:"
echo "   ./scripts/test-calendar.sh"
echo ""
