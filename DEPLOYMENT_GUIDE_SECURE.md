# 🚀 SECURE DEPLOYMENT GUIDE
## Serenity Dashboard - GitHub Push & Vercel Deployment

**Last Updated:** November 14, 2025
**Security Level:** Production-Ready Checklist

---

## ⚠️ CRITICAL: READ FIRST

Before deploying to production, you **MUST** address the **6 Critical Security Issues** identified in [SENIOR_ENGINEER_CODE_REVIEW.md](./SENIOR_ENGINEER_CODE_REVIEW.md):

1. ❌ PHI Data in React State
2. ❌ Tool Execution Without Request Signing
3. ❌ Rate Limiting Resets on Cold Start
4. ❌ Public Tool Access Without Audit Logging
5. ❌ SQL Injection Risk
6. ❌ Unvalidated Tool Arguments

**Status:** ⚠️ **DO NOT DEPLOY TO PRODUCTION YET**

For MVP/Demo purposes only, proceed with caution.

---

## 📋 PRE-DEPLOYMENT CHECKLIST

### Security Review
- [x] ✅ No hardcoded API keys in code (verified 2025-11-14)
- [x] ✅ `.env` files are gitignored
- [x] ✅ `.env.example` has no real secrets
- [ ] ⚠️ Remove all `console.log` with sensitive data
- [ ] ⚠️ Add security headers to `vercel.json`
- [ ] ⚠️ Review and fix Critical Issues #1-6
- [ ] ⚠️ Add Content Security Policy
- [ ] ⚠️ Implement persistent rate limiting

### Code Quality
- [ ] ⚠️ Refactor large files (groqTools.ts, ChatWidget.tsx)
- [ ] ✅ TypeScript compilation passes
- [ ] ⚠️ No linting errors
- [ ] ⚠️ Tests pass (if any exist)

### Documentation
- [x] ✅ README.md exists
- [ ] ⚠️ Add SECURITY.md
- [ ] ⚠️ Add CONTRIBUTING.md
- [x] ✅ Environment variables documented

---

## 🔐 PART 1: SECURE GITHUB PUSH

### Step 1: Final Security Scan

```bash
cd "serenity dasboard"

# 1. Check for accidental secrets in code
echo "Scanning for potential secrets..."
grep -r "gsk_" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules || echo "✅ No Groq keys found"
grep -r "sk-" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules || echo "✅ No OpenAI keys found"
grep -r "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules || echo "✅ No JWT tokens found"

# 2. Verify .env files are ignored
git check-ignore .env .env.local apps/web/.env.local
# Should show: .gitignore:XX:.env (means they're ignored)

# 3. Check what will be committed
git status
git diff --cached

# 4. Verify .gitignore is working
git add . --dry-run
# Review the list - should NOT include .env files
```

### Step 2: Add Security Files

Create `SECURITY.md`:

```bash
cat > SECURITY.md << 'EOF'
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

**DO NOT** open a public GitHub issue for security vulnerabilities.

Instead, email security@yourcompany.com with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours and aim to patch within 7 days.

## Security Best Practices

This application handles Protected Health Information (PHI) and must comply with HIPAA.

### For Contributors:
1. Never commit API keys, passwords, or secrets
2. Always use environment variables for sensitive data
3. Run security scans before submitting PRs
4. Report any suspicious code in code reviews

### For Deployers:
1. Review [DEPLOYMENT_GUIDE_SECURE.md](./DEPLOYMENT_GUIDE_SECURE.md)
2. Set up monitoring and alerting
3. Enable rate limiting on all API endpoints
4. Use HTTPS only (no HTTP)

## Known Issues

See [SENIOR_ENGINEER_CODE_REVIEW.md](./SENIOR_ENGINEER_CODE_REVIEW.md) for current security findings.
EOF
```

Create `.github/dependabot.yml`:

```bash
mkdir -p .github

cat > .github/dependabot.yml << 'EOF'
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "your-github-username"
    labels:
      - "dependencies"
      - "security"

  - package-ecosystem: "npm"
    directory: "/apps/web"
    schedule:
      interval: "weekly"

  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
EOF
```

Create `.github/workflows/security-scan.yml`:

```bash
cat > .github/workflows/security-scan.yml << 'EOF'
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 0' # Weekly

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'

      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

      - name: NPM Audit
        run: npm audit --audit-level=moderate

      - name: Check for secrets
        run: |
          ! git grep -E "(gsk_|sk-|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9)" -- '*.ts' '*.tsx' '*.js'
EOF
```

### Step 3: Clean Up Project

```bash
# Remove unnecessary documentation files (too many!)
echo "Cleaning up documentation..."

# Archive old docs
mkdir -p archive/old-docs
mv AI_*.md archive/old-docs/ 2>/dev/null || true
mv APPOINTMENT_*.md archive/old-docs/ 2>/dev/null || true
mv WHATSAPP_*.md archive/old-docs/ 2>/dev/null || true
mv MVP_*.md archive/old-docs/ 2>/dev/null || true
mv DEPLOYMENT_*.md archive/old-docs/ 2>/dev/null || true
mv FINAL_*.md archive/old-docs/ 2>/dev/null || true
mv IMPLEMENTATION_*.md archive/old-docs/ 2>/dev/null || true
mv N8N_*.md archive/old-docs/ 2>/dev/null || true
mv STT_*.md archive/old-docs/ 2>/dev/null || true
mv TEST_*.md archive/old-docs/ 2>/dev/null || true
mv QUICK_*.md archive/old-docs/ 2>/dev/null || true

# Keep only essential docs
# - README.md
# - SECURITY.md
# - SENIOR_ENGINEER_CODE_REVIEW.md
# - DEPLOYMENT_GUIDE_SECURE.md (this file)

# Add archive to gitignore
echo "" >> .gitignore
echo "# Archived documentation" >> .gitignore
echo "archive/" >> .gitignore
```

### Step 4: Add Security Headers to Vercel

Edit `vercel.json`:

```bash
cat > vercel.json << 'EOF'
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "apps/web/dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "microphone=(self), camera=(self), geolocation=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        },
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://esm.sh; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.groq.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
EOF
```

### Step 5: Git Commit and Push

```bash
# Stage all changes
git add .

# Create comprehensive commit message
git commit -m "$(cat <<'EOF'
feat: Add comprehensive security review and deployment guides

SECURITY ENHANCEMENTS:
- Add SECURITY.md with vulnerability reporting process
- Add GitHub Actions security scanning workflow
- Add Dependabot configuration for dependency updates
- Add security headers to vercel.json (CSP, X-Frame-Options, etc.)
- Add .github/workflows/security-scan.yml

DOCUMENTATION:
- Add SENIOR_ENGINEER_CODE_REVIEW.md (comprehensive code review)
- Add DEPLOYMENT_GUIDE_SECURE.md (secure deployment checklist)
- Archive old documentation files to reduce clutter
- Update .gitignore to exclude archived docs

CODE QUALITY:
- Verify no hardcoded secrets in codebase
- Ensure all .env files are properly gitignored
- Add pre-deployment security checklist

KNOWN ISSUES:
See SENIOR_ENGINEER_CODE_REVIEW.md for 6 critical security issues
that must be addressed before production deployment.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"

# Push to GitHub
git push origin main

# If this is your first push:
# git remote add origin https://github.com/yourusername/serenity-dashboard.git
# git branch -M main
# git push -u origin main
```

---

## 🌐 PART 2: VERCEL DEPLOYMENT

### Step 1: Prepare Environment Variables

**DO NOT commit these! Set them in Vercel dashboard.**

Create a file `env-template-for-vercel.txt` (DO NOT commit):

```bash
# Frontend Environment Variables (VITE_ prefix = exposed to browser)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GROQ_MODEL=llama-3.1-8b-instant
VITE_VAPI_PUBLIC_KEY=your-vapi-public-key
VITE_VAPI_ASSISTANT_ID=your-assistant-id

# ⚠️ SECURITY WARNING: DO NOT use VITE_ prefix for these (move to backend)
# These should be in Supabase Edge Function secrets, NOT in frontend
# N8N_WEBHOOK_BASE=https://your-n8n.com/webhook
# N8N_WEBHOOK_SECRET=your-secret
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Option B: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` or `cd apps/web && npm run build`
   - **Output Directory:** `apps/web/dist`
   - **Install Command:** `npm install`

4. Add Environment Variables:
   ```
   VITE_SUPABASE_URL = https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGci...
   VITE_GROQ_MODEL = llama-3.1-8b-instant
   VITE_VAPI_PUBLIC_KEY = your-key
   VITE_VAPI_ASSISTANT_ID = your-id
   ```

5. Click **Deploy**

### Step 3: Verify Deployment

```bash
# Test the deployment
curl -I https://your-app.vercel.app

# Should return:
# HTTP/2 200
# x-frame-options: DENY
# x-content-type-options: nosniff
# content-security-policy: default-src 'self'; ...

# Test API connectivity
curl https://your-app.vercel.app/api/health

# Test security headers
curl -H "Origin: https://evil.com" https://your-app.vercel.app
# Should block CORS if not in whitelist
```

### Step 4: Configure Custom Domain (Optional)

```bash
# Add custom domain via Vercel CLI
vercel domains add yourdomain.com

# Or via dashboard:
# Settings → Domains → Add Domain
```

### Step 5: Post-Deployment Security Checks

```bash
# 1. Test rate limiting
for i in {1..20}; do
  curl https://your-app.vercel.app/api/endpoint
done
# Should start returning 429 Too Many Requests

# 2. Test authentication
curl https://your-app.vercel.app/api/admin/stats
# Should return 401 Unauthorized without token

# 3. Test CORS
curl -H "Origin: https://evil.com" \
     -H "Access-Control-Request-Method: POST" \
     -X OPTIONS \
     https://your-app.vercel.app/api/endpoint
# Should NOT return Access-Control-Allow-Origin: evil.com

# 4. Test Content Security Policy
curl -I https://your-app.vercel.app
# Check for CSP header
```

---

## 🔒 PART 3: SUPABASE EDGE FUNCTIONS DEPLOYMENT

### Step 1: Configure Supabase Secrets

```bash
# Navigate to project root
cd "serenity dasboard"

# Set secrets for Edge Functions (not exposed to frontend)
supabase secrets set GROQ_API_KEY=gsk_your_real_groq_key
supabase secrets set N8N_WEBHOOK_BASE=https://your-n8n.com/webhook
supabase secrets set N8N_WEBHOOK_SECRET=your_webhook_secret

# Verify secrets
supabase secrets list
```

### Step 2: Deploy Edge Functions

```bash
# Deploy all Edge Functions
supabase functions deploy groq-chat
supabase functions deploy assistant-call
supabase functions deploy whatsapp-admin
supabase functions deploy vapi-webhook
supabase functions deploy google-calendar-sync

# Or deploy all at once
supabase functions deploy --no-verify-jwt
```

### Step 3: Test Edge Functions

```bash
# Get your Supabase project URL and anon key
SUPABASE_URL="https://your-project.supabase.co"
ANON_KEY="eyJhbGci..."

# Test groq-chat endpoint
curl -X POST \
  "${SUPABASE_URL}/functions/v1/groq-chat" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello"}
    ],
    "mode": "public"
  }'

# Should return AI response

# Test authentication requirement (admin tool)
curl -X POST \
  "${SUPABASE_URL}/functions/v1/groq-chat" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Get stats"}
    ],
    "tools": [{"function": {"name": "get_stats"}}]
  }'

# Should return 401 Unauthorized
```

---

## 📊 PART 4: MONITORING & ALERTING

### Step 1: Set Up Vercel Analytics

```bash
# Enable in Vercel Dashboard:
# Project Settings → Analytics → Enable
```

### Step 2: Set Up Error Tracking (Sentry - Optional)

```bash
# Install Sentry
npm install @sentry/react @sentry/vite-plugin

# Configure in apps/web/src/main.tsx
# See https://docs.sentry.io/platforms/javascript/guides/react/
```

### Step 3: Set Up Uptime Monitoring

Use one of:
- **UptimeRobot** (free): https://uptimerobot.com
- **Pingdom** (paid): https://www.pingdom.com
- **Better Uptime** (free tier): https://betteruptime.com

Monitor:
- `https://your-app.vercel.app` (200 OK)
- `https://your-project.supabase.co/functions/v1/groq-chat` (health check)

### Step 4: Set Up Log Aggregation

```bash
# Vercel → Project Settings → Integrations → Datadog/LogDNA
# Or use Vercel's built-in logs:
# vercel logs --follow
```

---

## 🚨 PART 5: INCIDENT RESPONSE PLAN

### Security Incident Response

If you detect a security breach:

1. **Immediate Actions (within 1 hour):**
   ```bash
   # Rotate all API keys
   supabase secrets set GROQ_API_KEY=new_key
   # Update in Vercel dashboard

   # Revoke compromised sessions
   # Supabase Dashboard → Authentication → Users → Revoke sessions

   # Take site offline if necessary
   vercel --prod --env MAINTENANCE_MODE=true
   ```

2. **Investigation (within 24 hours):**
   - Review Supabase logs for unauthorized access
   - Check Vercel logs for suspicious traffic
   - Review database audit_logs table
   - Identify affected users/data

3. **Notification (within 72 hours for PHI breach):**
   - HIPAA requires notification within 60 days
   - Notify affected users via email
   - File breach report with HHS if >500 individuals affected

4. **Post-Mortem:**
   - Document what happened
   - Implement fixes
   - Update security policies

---

## ✅ DEPLOYMENT SUCCESS CHECKLIST

After deployment, verify:

- [x] Frontend loads at https://your-app.vercel.app
- [ ] Authentication works (login/logout)
- [ ] Chat widget connects to Groq API
- [ ] Appointment booking works
- [ ] Database queries work (Supabase connected)
- [ ] Security headers present (check with curl -I)
- [ ] Rate limiting active (test with multiple requests)
- [ ] CORS configured correctly (test with different origins)
- [ ] Error tracking working (trigger test error)
- [ ] Monitoring/alerting configured
- [ ] Backups enabled (Supabase automatic backups)

---

## 📝 MAINTENANCE TASKS

### Weekly:
- [ ] Review Dependabot PRs
- [ ] Check error logs in Sentry/Vercel
- [ ] Review Supabase analytics for anomalies

### Monthly:
- [ ] Review and rotate API keys
- [ ] Update dependencies (`npm update`)
- [ ] Review security scan results
- [ ] Test disaster recovery process

### Quarterly:
- [ ] Penetration testing
- [ ] Security audit
- [ ] HIPAA compliance review
- [ ] Backup restoration test

---

## 🆘 TROUBLESHOOTING

### Build Fails on Vercel

```bash
# Check build logs
vercel logs

# Common issues:
# 1. Missing dependencies
npm install

# 2. TypeScript errors
npm run type-check

# 3. Environment variables not set
# Add in Vercel Dashboard → Settings → Environment Variables
```

### Edge Functions Not Working

```bash
# Check function logs
supabase functions logs groq-chat

# Common issues:
# 1. Secrets not set
supabase secrets list

# 2. CORS issues
# Update ALLOWED_ORIGINS in supabase/functions/_shared/cors.ts

# 3. Rate limiting
# Check rate limiter in _shared/rate-limiter.ts
```

### Database Connection Issues

```bash
# Test Supabase connection
curl https://your-project.supabase.co/rest/v1/
# Should return 200 OK

# Check RLS policies
# Supabase Dashboard → Authentication → Policies
```

---

## 📚 ADDITIONAL RESOURCES

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **HIPAA Compliance:** https://www.hhs.gov/hipaa/for-professionals/security/
- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **Security Best Practices:** [SENIOR_ENGINEER_CODE_REVIEW.md](./SENIOR_ENGINEER_CODE_REVIEW.md)

---

## 🎯 SUMMARY

This guide provides a **production-ready deployment workflow** with security best practices for:

1. ✅ **Secure GitHub push** (no secrets committed)
2. ✅ **Vercel deployment** (with security headers)
3. ✅ **Supabase Edge Functions** (with secrets management)
4. ✅ **Monitoring & alerting** (uptime + error tracking)
5. ✅ **Incident response** (security breach handling)

**⚠️ REMEMBER:** Address the 6 Critical Security Issues from the code review before production deployment!

**Questions?** See [SECURITY.md](./SECURITY.md) for contact information.

---

**Document Version:** 1.0
**Last Updated:** November 14, 2025
**Next Review:** After critical security fixes implemented
