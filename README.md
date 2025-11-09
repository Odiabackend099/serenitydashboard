# Business Owner Digital AI Assistant

A comprehensive, enterprise-grade digital AI assistant for business owners with enhanced security, compliance, and business intelligence capabilities.

## 🏢 Business Features

### 📊 Business Intelligence & Analytics
- **Real-time Dashboard**: Comprehensive business metrics and KPIs
- **Compliance Monitoring**: HIPAA/GDPR compliance tracking and reporting
- **Operational Analytics**: Appointment trends, patient flow analysis
- **Business Rules Engine**: Automated decision-making with configurable rules
- **Audit Logging**: Complete audit trail for all business operations

### 🔒 Security & Compliance
- **HIPAA Compliance**: Healthcare data protection and privacy
- **GDPR Compliance**: European data protection regulations
- **Audit Logging**: Comprehensive audit trails for all operations
- **Data Encryption**: End-to-end encryption for sensitive data
- **Access Controls**: Role-based access control system
- **Business Rules**: Automated compliance checking and flagging

### 🤖 AI-Powered Features
- **Intelligent Appointment Booking**: Smart scheduling with business rules
- **Automated Decision Making**: Business rule engine for approvals
- **Risk Assessment**: Automated risk factor analysis
- **Patient Data Export**: GDPR-compliant data export capabilities
- **Compliance Dashboard**: Real-time compliance monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase CLI
- Docker (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd business-owner-digital-ai-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Start Supabase locally**
   ```bash
   npm run supabase:start
   ```

5. **Deploy Supabase functions**
   ```bash
   npm run supabase:deploy:functions
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

## 📋 Environment Variables

### Required Variables
```bash
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# API Keys
GROQ_API_KEY=your_groq_api_key
VAPI_API_KEY=your_vapi_api_key
N8N_WEBHOOK_BASE=your_n8n_webhook_base_url

# Business Configuration
BUSINESS_NAME=Your Business Name
BUSINESS_TIMEZONE=America/New_York
BUSINESS_HOURS_START=09:00
BUSINESS_HOURS_END=17:00

# Compliance Configuration
HIPAA_COMPLIANCE_ENABLED=true
GDPR_COMPLIANCE_ENABLED=true
DATA_RETENTION_DAYS=2555  # 7 years for HIPAA
AUDIT_LOG_RETENTION_DAYS=2555

# Security Configuration
ENCRYPTION_KEY=your_encryption_key
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:3000
```

## 🏗️ Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │   Web UI    │ │ Admin Panel  │ │ Compliance Dash   │   │
│  └─────────────┘ └──────────────┘ └───────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                 API Layer (Supabase Functions)             │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │  Business   │ │   Business   │ │   Appointment     │   │
│  │ Analytics   │ │ Rules Engine │ │  Management       │   │
│  └─────────────┘ └──────────────┘ └───────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                 Business Logic Layer                        │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │ Compliance  │ │  Business    │ │   Business        │   │
│  │   Logger    │ │ Rules Engine │ │ Intelligence      │   │
│  └─────────────┘ └──────────────┘ └───────────────────┘   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────┴───────────────────────────────────┐
│                    Data Layer (Supabase)                   │
│  ┌─────────────┐ ┌──────────────┐ ┌───────────────────┐   │
│  │  Patients   │ │ Appointments │ │   Audit Logs      │   │
│  └─────────────┘ └──────────────┘ └───────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Business Rules Engine

The system includes a sophisticated business rules engine that automatically:

- **Validates appointment requests** against business policies
- **Flags high-risk appointments** for manual review
- **Enforces business hours** and scheduling constraints
- **Manages patient eligibility** and insurance requirements
- **Tracks compliance requirements** and generates alerts

### Compliance Features

#### HIPAA Compliance
- **Data Encryption**: All patient data is encrypted at rest and in transit
- **Access Controls**: Role-based access with audit logging
- **Data Retention**: Configurable retention policies (default 7 years)
- **Audit Trails**: Complete audit logs for all data access and modifications
- **Business Associate Agreements**: Built-in BAA compliance tracking

#### GDPR Compliance
- **Data Minimization**: Only collect necessary data
- **Right to Access**: Patient data export capabilities
- **Right to Erasure**: Data deletion with audit logging
- **Consent Management**: Track and manage patient consent
- **Data Portability**: Export data in machine-readable formats

## 🔧 Configuration

### Business Rules Configuration

Create custom business rules through the API or admin panel:

```typescript
// Example business rule
{
  name: "New Patient Appointment Restriction",
  description: "New patients can only book appointments 24 hours in advance",
  conditions: [
    {
      field: "isNewPatient",
      operator: "equals",
      value: true
    },
    {
      field: "appointmentDate",
      operator: "less_than",
      value: "now + 24 hours"
    }
  ],
  actions: [
    {
      type: "block",
      message: "New patients must book appointments at least 24 hours in advance"
    }
  ],
  priority: 1,
  enabled: true
}
```

### Compliance Settings

Configure compliance settings in the admin panel:

- **HIPAA Mode**: Enable/disable HIPAA compliance features
- **GDPR Mode**: Enable/disable GDPR compliance features
- **Data Retention**: Set retention periods for different data types
- **Audit Levels**: Configure logging levels for different operations
- **Business Hours**: Set business operating hours
- **Appointment Rules**: Configure appointment booking constraints

## 📊 Analytics & Reporting

### Business Metrics
- **Appointment Volume**: Daily, weekly, monthly trends
- **Patient Acquisition**: New patient registration metrics
- **Revenue Analytics**: Appointment-based revenue tracking
- **Operational Efficiency**: No-show rates, cancellation metrics
- **Compliance Metrics**: HIPAA/GDPR compliance scores

### Compliance Reports
- **Audit Trail Reports**: Complete audit logs with filtering
- **Data Access Reports**: Who accessed what data and when
- **Consent Management Reports**: Patient consent status tracking
- **Data Retention Reports**: Data lifecycle and deletion tracking
- **Security Incident Reports**: Security events and responses

## 🔐 Security Features

### Authentication & Authorization
- **Multi-factor Authentication**: Optional MFA for admin users
- **Role-based Access Control**: Granular permission system
- **Session Management**: Secure session handling with timeout
- **Password Policies**: Enforce strong password requirements
- **API Key Management**: Secure API key rotation and management

### Data Protection
- **Field-level Encryption**: Encrypt sensitive fields individually
- **Data Masking**: Mask sensitive data in logs and reports
- **Secure Communication**: All data transmission encrypted
- **Backup Encryption**: Encrypted backups with secure key management
- **Incident Response**: Automated incident detection and response

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Compliance Tests
```bash
npm run test:compliance
```

### Load Tests
```bash
npm run test:load
```

## 🚀 Deployment

### Production Deployment

1. **Set up production Supabase project**
2. **Configure environment variables**
3. **Deploy Supabase functions**
   ```bash
   npm run supabase:deploy:functions
   ```
4. **Build and deploy frontend**
   ```bash
   npm run build
   npm run start
   ```

### Docker Deployment

```bash
docker-compose up -d
```

### Monitoring & Alerting

The system includes built-in monitoring for:
- **Business Rule Violations**: Alerts when rules are triggered
- **Compliance Issues**: Real-time compliance monitoring
- **Performance Metrics**: System performance tracking
- **Security Events**: Security incident detection
- **Data Quality**: Data integrity monitoring

## 📚 API Documentation

### Business Analytics API

```http
POST /api/analytics/business
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "metrics": ["appointments", "revenue", "patients"]
}
```

### Business Rules API

```http
POST /api/rules/evaluate-appointment
Content-Type: application/json

{
  "patientEmail": "patient@example.com",
  "appointmentDate": "2024-02-01T10:00:00Z",
  "doctor": "Dr. Smith",
  "reason": "general_checkup"
}
```

### Appointment Management API

```http
POST /api/appointments/book
Content-Type: application/json

{
  "patientEmail": "patient@example.com",
  "patientName": "John Doe",
  "patientPhone": "+1234567890",
  "start": "2024-02-01T10:00:00Z",
  "end": "2024-02-01T11:00:00Z",
  "doctor": "Dr. Smith",
  "reason": "general_checkup",
  "source": "web"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@business-ai-assistant.com
- 💬 Discord: [Join our community](https://discord.gg/business-ai)
- 📖 Documentation: [Full documentation](https://docs.business-ai-assistant.com)

## 🔗 Related Projects

- [Supabase](https://supabase.com) - Backend infrastructure
- [Groq AI](https://groq.com) - AI processing
- [Vapi](https://vapi.ai) - Voice AI integration
- [n8n](https://n8n.io) - Workflow automation