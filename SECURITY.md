# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | ✅ Active support  |
| < 2.0   | ❌ No longer supported |

## Reporting a Vulnerability

**⚠️ DO NOT** open a public GitHub issue for security vulnerabilities.

### How to Report

Email security concerns to: **security@yourcompany.com** (update this email)

Include:
1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** assessment
4. **Suggested fix** (if you have one)
5. **Your contact information** for follow-up

### What to Expect

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Critical issues patched within 7-14 days
- **Disclosure:** Coordinated disclosure after patch is released

### Severity Levels

| Severity | Examples | Response Time |
|----------|----------|---------------|
| 🔴 **Critical** | PHI data leak, SQL injection, RCE | 24-48 hours |
| 🟠 **High** | XSS, authentication bypass, CSRF | 3-7 days |
| 🟡 **Medium** | Rate limiting bypass, info disclosure | 7-14 days |
| 🟢 **Low** | Minor security improvements | 14-30 days |

---

## Security Best Practices

This application handles **Protected Health Information (PHI)** and must comply with **HIPAA** regulations.

### For Contributors

**Before Submitting Code:**
- [ ] No API keys, passwords, or secrets committed
- [ ] All user inputs validated with Zod schemas
- [ ] PHI data sanitized in logs
- [ ] Security headers configured
- [ ] SQL injection protection verified
- [ ] XSS prevention measures in place

**During Code Review:**
- Report any suspicious code patterns
- Flag hardcoded credentials
- Check for SQL injection vulnerabilities
- Verify input validation
- Review error messages for information disclosure

### For Deployers

**Production Deployment Checklist:**
- [ ] Review [DEPLOYMENT_GUIDE_SECURE.md](./DEPLOYMENT_GUIDE_SECURE.md)
- [ ] Set all environment variables in Vercel dashboard
- [ ] Enable HTTPS only (no HTTP)
- [ ] Configure security headers (CSP, X-Frame-Options, etc.)
- [ ] Implement persistent rate limiting
- [ ] Set up monitoring and alerting (Sentry, Datadog)
- [ ] Enable database backups
- [ ] Test disaster recovery plan
- [ ] Review RLS policies in Supabase
- [ ] Configure CORS allowed origins

---

## Known Security Issues

See [SENIOR_ENGINEER_CODE_REVIEW.md](./SENIOR_ENGINEER_CODE_REVIEW.md) for comprehensive security analysis.

### Current Status

**Last Security Audit:** November 14, 2025
**Security Score:** 7/10 (MVP acceptable, production requires fixes)

**Critical Issues (In Progress):**
1. ⚠️ PHI data in React component state → Moving to backend sessions
2. ⚠️ Rate limiting resets on cold start → Implementing Upstash Redis
3. ⚠️ Tool access control → Adding whitelist + audit logging
4. ✅ Input validation → Zod schemas implemented
5. ✅ Security headers → CSP and security headers added
6. ✅ Production logging → Sensitive data redaction implemented

---

## Security Features

### ✅ Implemented

- **HIPAA-Compliant Logging:** PHI redaction in all logs
- **Row-Level Security (RLS):** Database-level authorization
- **Input Validation:** Zod schemas for all user inputs
- **Security Headers:** CSP, X-Frame-Options, HSTS, etc.
- **CORS Protection:** Whitelist-based origin validation
- **Production Logging:** Sensitive data automatically redacted
- **Type Safety:** TypeScript with strict mode
- **Audit Logging:** All sensitive operations logged

### ⚠️ In Progress

- **Persistent Rate Limiting:** Upstash Redis integration
- **Request Signing:** HMAC-SHA256 for tool calls
- **Backend Session Storage:** PHI encryption at rest
- **Webhook Signature Verification:** N8N webhook security

### 🔜 Planned

- **Penetration Testing:** Q1 2026
- **SOC 2 Compliance:** Q2 2026
- **HIPAA Audit:** Q2 2026
- **Automated Security Scanning:** Snyk/Dependabot integration

---

## Compliance

### HIPAA Compliance

This application is designed to be **HIPAA-compliant** but requires proper configuration:

**Technical Safeguards:**
- ✅ Encryption in transit (HTTPS/TLS 1.3)
- ✅ Access controls (RLS policies)
- ✅ Audit logging (all PHI access logged)
- ⚠️ Encryption at rest (Supabase default, verify settings)
- ⚠️ Automatic logoff (implement session timeout)
- ⚠️ Emergency access procedures (document in runbook)

**Administrative Safeguards:**
- ⚠️ Security training for staff
- ⚠️ Business Associate Agreement (BAA) with vendors
- ⚠️ Incident response plan (see [DEPLOYMENT_GUIDE_SECURE.md](./DEPLOYMENT_GUIDE_SECURE.md))
- ⚠️ Risk assessment (conduct annually)

**Physical Safeguards:**
- ✅ Cloud infrastructure (Vercel, Supabase)
- ⚠️ Workstation security policies
- ⚠️ Device encryption requirements

### Data Protection

**PHI Handling:**
- All PHI encrypted in transit (TLS 1.3)
- Database encryption at rest (Supabase)
- PHI redacted in application logs
- Access controls via RLS policies
- Audit trail for all PHI access

**Data Retention:**
- Conversation logs: 90 days
- Appointment records: 7 years (HIPAA requirement)
- Audit logs: 6 years (HIPAA requirement)
- Backup retention: 30 days

---

## Security Updates

### Recent Updates

**November 14, 2025:**
- ✅ Added Content Security Policy (CSP)
- ✅ Implemented Zod input validation
- ✅ Created production-safe logger
- ✅ Added security headers to Vercel deployment
- ✅ Comprehensive security review completed

**November 12, 2025:**
- ✅ Fixed Supabase anon key configuration
- ✅ Updated CORS whitelist

---

## Third-Party Security

### Dependencies

We regularly scan dependencies for vulnerabilities using:
- **npm audit:** Weekly automated scans
- **Dependabot:** Automated PR for security updates
- **Snyk:** (Planned) Continuous monitoring

### Third-Party Services

| Service | Purpose | Security Review | BAA Required |
|---------|---------|-----------------|--------------|
| Supabase | Database + Auth | ✅ SOC 2 certified | ✅ Yes |
| Vercel | Hosting | ✅ SOC 2 certified | ✅ Yes |
| Groq | AI API | ⚠️ Review needed | ⚠️ TBD |
| VAPI | Voice AI | ⚠️ Review needed | ⚠️ TBD |
| n8n | Workflow automation | ⚠️ Self-hosted OK | ❌ N/A |

**Action Required:** Sign BAAs with Groq and VAPI before handling real PHI.

---

## Security Testing

### Manual Testing Checklist

Before each release:
- [ ] Test authentication bypass attempts
- [ ] Verify rate limiting works
- [ ] Test SQL injection on all inputs
- [ ] Test XSS on all user-facing fields
- [ ] Verify CORS configuration
- [ ] Test session timeout
- [ ] Verify PHI redaction in logs
- [ ] Test error messages for information disclosure

### Automated Testing

**Current Coverage:**
- ⚠️ Unit tests: 0% (TODO)
- ⚠️ Integration tests: 0% (TODO)
- ⚠️ E2E tests: 0% (TODO)

**Planned:**
- GitHub Actions security scanning
- Automated dependency updates
- OWASP ZAP security scanning
- Lighthouse security audits

---

## Incident Response

### Security Incident Classification

| Type | Examples | Response |
|------|----------|----------|
| **P0 - Critical** | PHI data breach, ransomware | Immediate (< 1 hour) |
| **P1 - High** | System compromise, DDoS | Urgent (< 4 hours) |
| **P2 - Medium** | Suspicious activity, failed login attempts | Normal (< 24 hours) |
| **P3 - Low** | Security misconfiguration | Scheduled (< 7 days) |

### Breach Notification

**HIPAA Requirements:**
- **> 500 individuals:** Notify HHS and media within 60 days
- **< 500 individuals:** Notify HHS annually
- **All breaches:** Notify affected individuals within 60 days

**Contact:**
- **HHS Breach Portal:** https://ocrportal.hhs.gov/ocr/breach/wizard_breach.jsf
- **Legal Counsel:** (Add contact information)
- **Incident Commander:** (Add contact information)

---

## Security Resources

- **OWASP Top 10:** https://owasp.org/www-project-top-ten/
- **HIPAA Security Rule:** https://www.hhs.gov/hipaa/for-professionals/security/
- **Supabase Security:** https://supabase.com/docs/guides/platform/security
- **Vercel Security:** https://vercel.com/docs/security
- **Code Review Guide:** [SENIOR_ENGINEER_CODE_REVIEW.md](./SENIOR_ENGINEER_CODE_REVIEW.md)
- **Deployment Guide:** [DEPLOYMENT_GUIDE_SECURE.md](./DEPLOYMENT_GUIDE_SECURE.md)

---

## Questions?

For security-related questions, contact **security@yourcompany.com** (update this email).

For general questions, see [README.md](./README.md).

---

**Last Updated:** November 14, 2025
**Next Security Review:** December 14, 2025
