#!/bin/bash

# Secure Deployment Script for Serenity Dashboard
# This script ensures proper environment variable configuration without exposing secrets

set -e

echo "🚀 Starting secure deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI is not installed. Please install it first:"
    echo "npm i -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! vercel whoami &> /dev/null; then
    print_error "You are not logged in to Vercel. Please login first:"
    echo "vercel login"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "vercel.json" ]; then
    print_error "vercel.json not found. Please run this script from the project root."
    exit 1
fi

print_status "✅ Pre-deployment checks passed"

# Check for required environment variables
print_status "Checking Vercel environment variables..."

# List of required environment variables
REQUIRED_VARS=(
    "VITE_SUPABASE_URL"
    "VITE_SUPABASE_ANON_KEY"
    "VITE_VAPI_API_KEY"
    "VITE_VAPI_ASSISTANT_ID"
    "VITE_TWILIO_ACCOUNT_SID"
    "VITE_TWILIO_AUTH_TOKEN"
    "VITE_TWILIO_PHONE_NUMBER"
    "VITE_GMAIL_CLIENT_ID"
    "VITE_GMAIL_CLIENT_SECRET"
    "VITE_N8N_WEBHOOK_BASE"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! vercel env ls production | grep -q "^$var "; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    print_warning "Missing environment variables in Vercel:"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
    print_warning "You can add these variables using:"
    echo "  vercel env add <VARIABLE_NAME> production"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the application
print_status "Building the application..."
cd apps/web
npm install
npm run build

if [ $? -eq 0 ]; then
    print_status "✅ Build completed successfully"
else
    print_error "❌ Build failed"
    exit 1
fi

# Deploy to Vercel
print_status "Deploying to Vercel..."
cd ../..
vercel --prod

if [ $? -eq 0 ]; then
    print_status "✅ Deployment completed successfully"
    print_status "Your application is now live!"
else
    print_error "❌ Deployment failed"
    exit 1
fi

# Verify deployment
print_status "Verifying deployment..."
sleep 5

DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url')
if [ -n "$DEPLOYMENT_URL" ]; then
    print_status "✅ Deployment verified: https://$DEPLOYMENT_URL"
else
    print_warning "Could not verify deployment URL"
fi

print_status "🎉 Secure deployment process completed!"
print_status "Remember to:"
echo "  1. Test all functionality in production"
echo "  2. Monitor error logs"
echo "  3. Set up proper monitoring and alerts"
echo "  4. Regularly rotate your secrets"