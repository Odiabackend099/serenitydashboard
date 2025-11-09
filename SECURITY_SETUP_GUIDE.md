# Security Setup Guide

This guide provides comprehensive instructions for securely configuring your environment variables and avoiding hardcoded secrets.

## 🔐 Environment Variables Required

### Core Application Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ACCESS_TOKEN=your_supabase_access_token

# API Keys
VITE_VAPI_API_KEY=your_vapi_api_key
VAPI_PRIVATE_KEY=your_vapi_private_key
GROQ_API_KEY=your_groq_api_key

# Authentication
ADMIN_PASSWORD=your_secure_admin_password
TEST_EMAIL=test@example.com
TEST_PASSWORD=your_secure_test_password

# Third-party Services
TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
VERCEL_TOKEN=your_vercel_token
PGPASSWORD=your_database_password
```

## 🚀 Quick Setup

### 1. Create Environment Files

Create `.env` files in the following locations:

```bash
# Root directory
cp .env.example .env

# Web app
cp apps/web/.env.example apps/web/.env.local

# API
cp apps/api/.env.example apps/api/.env.local
```

### 2. Generate Secure Passwords

Use a password manager or generate secure passwords:

```bash
# Generate a secure password
openssl rand -base64 32

# Or use a password manager like Bitwarden, 1Password, etc.
```

### 3. Get Supabase Keys

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy:
   - Project URL (for `VITE_SUPABASE_URL`)
   - Anon Key (for `VITE_SUPABASE_ANON_KEY`)
   - Service Role Key (for `SUPABASE_SERVICE_ROLE_KEY`)

### 4. Configure VAPI

1. Log into your VAPI dashboard
2. Go to API Keys section
3. Copy your Private Key for `VAPI_PRIVATE_KEY`

## 🧪 Testing Configuration

### Validate Environment Variables

Run these commands to verify your setup:

```bash
# Test Supabase connection
node scripts/test/test-supabase-connection.js

# Test VAPI integration
node scripts/test/test-vapi-webhook.js

# Run full integration test
node scripts/test/FINAL_TEST.js
```

### Test Scripts

Most test scripts now support environment variables:

```bash
# Run tests with custom credentials
TEST_EMAIL=your-email@test.com TEST_PASSWORD=your-password node scripts/test/test-header-simple.js

# Or use the default .env file
node scripts/test/test-header-simple.js
```

## 🔒 Security Best Practices

### 1. Never Commit Secrets

Add these to your `.gitignore`:

```
.env
.env.local
.env.production
*.key
*.pem
secrets/
```

### 2. Use Environment-Specific Configs

- **Development**: Use `.env.local` files
- **Staging**: Use staging-specific environment variables
- **Production**: Use secure secret management (Vercel, AWS Secrets Manager, etc.)

### 3. Rotate Keys Regularly

- Change API keys every 90 days
- Update passwords quarterly
- Monitor for unauthorized access

### 4. Monitor Usage

- Set up alerts for unusual API usage
- Review access logs regularly
- Use rate limiting where possible

## 🚨 Common Issues

### "Missing environment variable" errors

Check that all required variables are set:

```bash
# Quick validation script
node -e "console.log('Required vars:', process.env.VITE_SUPABASE_URL ? '✅' : '❌', 'SUPABASE_URL')"
```

### Test failures

Ensure your test environment matches your development environment:

```bash
# Copy production config for testing
cp apps/web/.env.production apps/web/.env.local
```

### Deployment issues

For Vercel deployment:

```bash
# Add environment variables to Vercel
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

## 📚 Additional Resources

- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/security-best-practices)
- [VAPI Documentation](https://docs.vapi.ai/)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Node.js Security Checklist](https://nodejs.org/en/docs/guides/security/)

## 🆘 Support

If you encounter security-related issues:

1. Check this guide first
2. Review the [Security Checklist](#-security-best-practices)
3. Check logs for specific error messages
4. Ensure all environment variables are properly set
5. Verify API keys are valid and not expired

---

**⚠️ Important**: Always keep your secrets secure and never share them in public repositories, forums, or with unauthorized team members.