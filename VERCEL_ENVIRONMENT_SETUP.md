# Vercel Environment Variables Setup Guide

## 🔐 Security-First Configuration

This guide explains how to properly configure environment variables in Vercel without exposing secrets in your codebase.

## 📋 Required Environment Variables

### Supabase Configuration
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### VAPI Configuration  
```bash
VITE_VAPI_API_KEY=your_vapi_api_key
VITE_VAPI_ASSISTANT_ID=your_vapi_assistant_id
VITE_VAPI_WEBHOOK_URL=your_webhook_url
```

### Twilio Configuration
```bash
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_PHONE_NUMBER=your_twilio_phone_number
VITE_TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number
```

### Email Configuration (Gmail OAuth)
```bash
VITE_GMAIL_CLIENT_ID=your_gmail_client_id
VITE_GMAIL_CLIENT_SECRET=your_gmail_client_secret
VITE_GMAIL_REDIRECT_URI=your_redirect_uri
VITE_GMAIL_REFRESH_TOKEN=your_refresh_token
VITE_GMAIL_EMAIL=your_gmail_email
```

### n8n Configuration
```bash
VITE_N8N_WEBHOOK_BASE=your_n8n_webhook_base_url
VITE_N8N_WEBHOOK_PATH=your_webhook_path
```

### Application Configuration
```bash
VITE_APP_URL=your_app_url
VITE_APP_NAME=Serenity Dashboard
VITE_APP_ENV=production
VITE_API_URL=your_api_url
VITE_WEBHOOK_URL=your_webhook_url
```

### Security Configuration
```bash
VITE_JWT_SECRET=your_jwt_secret
VITE_ENCRYPTION_KEY=your_encryption_key
```

### Monitoring and Analytics
```bash
VITE_SENTRY_DSN=your_sentry_dsn
VITE_ANALYTICS_ID=your_analytics_id
```

## 🚀 Setting Up Vercel Environment Variables

### Method 1: Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Click on "Settings" tab
   - Go to "Environment Variables"

2. **Add Environment Variables**
   - Click "Add Environment Variable"
   - Enter the variable name and value
   - Select the appropriate environment (Production, Preview, Development)
   - Click "Save"

3. **Deploy with New Variables**
   - Variables are automatically available during build and runtime
   - No need to commit them to your repository

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Add environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
# ... add other variables

# Deploy with new variables
vercel --prod
```

## 🔧 Supabase Edge Functions Environment Variables

For Supabase Edge Functions, you need to configure secrets in the Supabase dashboard:

### Setting Up Edge Function Secrets

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to "Edge Functions"
   - Click on "Settings" or "Secrets"

2. **Add Required Secrets**
   ```bash
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   N8N_WEBHOOK_BASE=your_n8n_webhook_base_url
   WEBHOOK_PUBLIC_URL=your_webhook_public_url
   ```

3. **Deploy Edge Functions**
   ```bash
   supabase functions deploy vapi-webhook
   supabase functions deploy twilio-whatsapp-webhook
   supabase functions deploy business-analytics
   supabase functions deploy business-rules
   supabase functions deploy appointment-management
   ```

## 📝 Best Practices

### ✅ DO:
- Use Vercel Environment Variables for all secrets
- Use different values for production, preview, and development
- Rotate secrets regularly
- Use strong, unique passwords and API keys
- Monitor your environment variables for changes

### ❌ DON'T:
- Commit secrets to your repository
- Share environment variables in documentation
- Use the same secrets across different environments
- Hardcode API keys in your frontend code
- Commit `.env.production` files with real values

## 🔍 Verification

### Test Environment Variables
```bash
# Check if variables are loaded
vercel env pull .env.local

# Test locally
npm run dev
```

### Verify Deployment
```bash
# Check deployment logs
vercel logs

# Test your application
# Verify all integrations work correctly
```

## 🚨 Security Checklist

- [ ] All API keys removed from codebase
- [ ] Environment variables configured in Vercel
- [ ] Edge function secrets configured in Supabase
- [ ] No secrets in committed files
- [ ] Different secrets for different environments
- [ ] Regular secret rotation scheduled
- [ ] Access controls in place for Vercel/Supabase accounts

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variable names match exactly
3. Ensure all required variables are set
4. Test locally first with `.env.local`
5. Contact support if issues persist

## 🔗 Related Documentation

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Security Best Practices](https://vercel.com/docs/concepts/projects/environment-variables#security-considerations)