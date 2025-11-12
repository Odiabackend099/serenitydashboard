#!/bin/bash

# ============================================================================
# SERENITY CARE AI - AUTOMATED SETUP SCRIPT
# ============================================================================
# This script automates the initial project setup
# Usage: bash setup.sh
# ============================================================================

set -e # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

print_header() {
    echo ""
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  $1${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

check_command() {
    if ! command -v $1 &> /dev/null; then
        print_error "$1 is not installed"
        return 1
    else
        print_success "$1 is installed"
        return 0
    fi
}

# ============================================================================
# Welcome Message
# ============================================================================

clear
print_header "SERENITY CARE AI - AUTOMATED SETUP"
echo "This script will set up your development environment."
echo "Please ensure you have the following ready:"
echo ""
echo "  📋 Supabase credentials"
echo "  📋 Groq API key"
echo "  📋 n8n webhook URL"
echo "  📋 VAPI credentials (optional)"
echo "  📋 Twilio credentials (optional)"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# ============================================================================
# Step 1: Check Prerequisites
# ============================================================================

print_header "STEP 1: Checking Prerequisites"

# Check Node.js
if check_command node; then
    NODE_VERSION=$(node --version)
    print_info "Node.js version: $NODE_VERSION"

    # Extract major version
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')

    if [ $NODE_MAJOR -lt 18 ]; then
        print_error "Node.js 18 or higher is required. Current version: $NODE_VERSION"
        exit 1
    fi
else
    print_error "Node.js is required. Please install from https://nodejs.org"
    exit 1
fi

# Check npm
if check_command npm; then
    NPM_VERSION=$(npm --version)
    print_info "npm version: $NPM_VERSION"
else
    print_error "npm is required"
    exit 1
fi

# Check git
if check_command git; then
    GIT_VERSION=$(git --version)
    print_info "$GIT_VERSION"
else
    print_warning "git is not installed (optional but recommended)"
fi

# Check for Supabase CLI (optional)
if check_command supabase; then
    SUPABASE_VERSION=$(supabase --version)
    print_info "Supabase CLI version: $SUPABASE_VERSION"
else
    print_warning "Supabase CLI not installed (optional, for Edge Function deployment)"
    print_info "Install with: npm install -g supabase"
fi

# Check for Vercel CLI (optional)
if check_command vercel; then
    print_success "Vercel CLI is installed"
else
    print_warning "Vercel CLI not installed (optional, for deployment)"
    print_info "Install with: npm install -g vercel"
fi

# ============================================================================
# Step 2: Environment Variables Setup
# ============================================================================

print_header "STEP 2: Environment Variables Setup"

if [ -f ".env" ]; then
    print_warning ".env file already exists"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping .env creation"
    else
        cp .env.example .env
        print_success ".env file created from template"
        print_info "Please edit .env and add your credentials"
    fi
else
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success ".env file created from template"
        print_info "Please edit .env and add your credentials"
    else
        print_error ".env.example not found"
        exit 1
    fi
fi

# Interactive environment variable setup (optional)
read -p "Do you want to configure environment variables now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Let's configure your environment variables..."

    # Supabase URL
    read -p "Enter your Supabase URL: " SUPABASE_URL
    if [ ! -z "$SUPABASE_URL" ]; then
        sed -i.bak "s|VITE_SUPABASE_URL=.*|VITE_SUPABASE_URL=$SUPABASE_URL|" .env
        print_success "Supabase URL configured"
    fi

    # Supabase Anon Key
    read -p "Enter your Supabase Anon Key: " SUPABASE_ANON_KEY
    if [ ! -z "$SUPABASE_ANON_KEY" ]; then
        sed -i.bak "s|VITE_SUPABASE_ANON_KEY=.*|VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY|" .env
        print_success "Supabase Anon Key configured"
    fi

    # Groq API Key
    read -p "Enter your Groq API Key: " GROQ_API_KEY
    if [ ! -z "$GROQ_API_KEY" ]; then
        sed -i.bak "s|GROQ_API_KEY=.*|GROQ_API_KEY=$GROQ_API_KEY|" .env
        print_success "Groq API Key configured"
    fi

    # n8n Webhook Base
    read -p "Enter your n8n Webhook Base URL: " N8N_WEBHOOK_BASE
    if [ ! -z "$N8N_WEBHOOK_BASE" ]; then
        sed -i.bak "s|N8N_WEBHOOK_BASE=.*|N8N_WEBHOOK_BASE=$N8N_WEBHOOK_BASE|" .env
        print_success "n8n Webhook Base configured"
    fi

    # Clean up backup file
    rm -f .env.bak

    print_success "Environment variables configured"
fi

# ============================================================================
# Step 3: Install Dependencies
# ============================================================================

print_header "STEP 3: Installing Dependencies"

print_info "This may take a few minutes..."

if npm install; then
    print_success "Dependencies installed successfully"
else
    print_error "Failed to install dependencies"
    exit 1
fi

# ============================================================================
# Step 4: Verify Installation
# ============================================================================

print_header "STEP 4: Verifying Installation"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    print_success "node_modules directory exists"
else
    print_error "node_modules directory not found"
    exit 1
fi

# Check workspace packages
if [ -d "apps/web/node_modules" ]; then
    print_success "Frontend dependencies installed"
else
    print_warning "Frontend dependencies not found"
fi

if [ -d "apps/api/node_modules" ]; then
    print_success "Backend dependencies installed"
else
    print_warning "Backend dependencies not found"
fi

# ============================================================================
# Step 5: Build Check (Optional)
# ============================================================================

print_header "STEP 5: Build Verification"

read -p "Do you want to run a test build? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Running test build..."

    if npm run build -w apps/web; then
        print_success "Build successful!"
    else
        print_error "Build failed. Please check the errors above."
    fi
fi

# ============================================================================
# Step 6: Database Setup (Optional)
# ============================================================================

print_header "STEP 6: Database Setup"

if check_command supabase; then
    read -p "Do you want to run database migrations? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Running database migrations..."

        # Check if Supabase is linked
        if supabase db push; then
            print_success "Database migrations completed"
        else
            print_error "Database migration failed"
            print_info "You can run migrations manually later with: supabase db push"
        fi
    fi
else
    print_warning "Supabase CLI not installed. Skipping database setup."
    print_info "Install Supabase CLI: npm install -g supabase"
fi

# ============================================================================
# Step 7: Generate Database Types (Optional)
# ============================================================================

print_header "STEP 7: Generate Database Types"

if check_command supabase; then
    read -p "Do you want to generate TypeScript types from database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Generating database types..."

        if supabase gen types typescript --project-id yfrpxqvjshwaaomgcaoq > apps/web/src/lib/database.types.ts; then
            print_success "Database types generated"
        else
            print_error "Failed to generate types"
        fi
    fi
fi

# ============================================================================
# Step 8: Git Setup (Optional)
# ============================================================================

print_header "STEP 8: Git Setup"

if check_command git; then
    if [ -d ".git" ]; then
        print_info "Git repository already initialized"

        # Check git status
        if [ -n "$(git status --porcelain)" ]; then
            print_warning "You have uncommitted changes"
        else
            print_success "Working directory is clean"
        fi
    else
        read -p "Do you want to initialize a Git repository? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git init
            print_success "Git repository initialized"

            # Create .gitignore if it doesn't exist
            if [ ! -f ".gitignore" ]; then
                cat > .gitignore << 'GITIGNORE'
# Dependencies
node_modules/
.pnp
.pnp.js

# Production
dist/
build/

# Environment
.env
.env.local
.env.*.local

# Logs
logs
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Vercel
.vercel

# Supabase
.supabase/
GITIGNORE
                print_success ".gitignore created"
            fi
        fi
    fi
fi

# ============================================================================
# Completion
# ============================================================================

print_header "SETUP COMPLETE! 🎉"

echo ""
echo -e "${GREEN}✅ Your Serenity Care AI project is ready!${NC}"
echo ""
echo "Next steps:"
echo ""
echo "  1. Review and update .env with your credentials"
echo "  2. Import n8n workflow from: n8n/Serenity Workflow - Ready to Import.json"
echo "  3. Start development server:"
echo ""
echo -e "${YELLOW}     npm run dev${NC}"
echo ""
echo "  4. Open your browser to: http://localhost:5173"
echo ""
echo "Useful commands:"
echo ""
echo "  npm run dev        - Start development server"
echo "  npm run build      - Build for production"
echo "  npm run lint       - Run linter"
echo "  npm test           - Run tests"
echo ""
echo "Documentation:"
echo ""
echo "  README.md                 - Getting started"
echo "  PROJECT_OVERVIEW.md       - Project architecture"
echo "  CODE_REVIEW_FINDINGS.md   - Code quality report"
echo "  QUICK_DEPLOYMENT_GUIDE.md - Deployment instructions"
echo ""
echo -e "${BLUE}For help, visit: https://github.com/Odiabackend099/serenitydashboard${NC}"
echo ""

exit 0
