# BerseMuka Production Deployment Checklist

## Pre-Deployment Checklist

### 1. Security Setup ✅
- [ ] Generate strong JWT secrets (32+ characters)
  ```bash
  openssl rand -hex 32  # For JWT_SECRET
  openssl rand -hex 32  # For JWT_REFRESH_SECRET
  openssl rand -hex 16  # For COOKIE_SECRET
  ```
- [ ] Set up SSL certificates (Let's Encrypt recommended)
- [ ] Configure firewall rules (only allow 80, 443, 22)
- [ ] Enable MFA for production server access
- [ ] Review and update CORS origins
- [ ] Set up Web Application Firewall (WAF)

### 2. Database Setup
- [ ] Provision managed PostgreSQL instance
- [ ] Configure connection pooling (max 20-50 connections)
- [ ] Set up automated backups (daily minimum)
- [ ] Create read replica for analytics (optional)
- [ ] Run initial migrations
  ```bash
  npx prisma migrate deploy
  ```

### 3. Redis Setup
- [ ] Provision Redis instance (managed service recommended)
- [ ] Set strong password
- [ ] Configure maxmemory policy (allkeys-lru)
- [ ] Enable persistence (AOF or RDB)

### 4. Environment Variables
- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill in all required values
- [ ] Store secrets in secure vault (AWS Secrets Manager, etc.)
- [ ] Never commit `.env.production` to git

### 5. Monitoring Setup
- [ ] Configure Sentry for error tracking
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure log aggregation (CloudWatch, Datadog)
- [ ] Set up alerts for critical metrics

### 6. Email Service
- [ ] Set up SMTP service (SendGrid, AWS SES)
- [ ] Verify domain for sending
- [ ] Configure SPF, DKIM, DMARC records
- [ ] Test email delivery

### 7. File Storage
- [ ] Set up Cloudinary account
- [ ] Configure upload presets
- [ ] Set up CDN for static assets

## Deployment Steps

### Option 1: Docker Deployment (Recommended)

1. **Prepare server**
   ```bash
   # Install Docker and Docker Compose
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

2. **Clone repository**
   ```bash
   git clone https://github.com/your-org/bersemuka.git
   cd bersemuka
   ```

3. **Set up environment**
   ```bash
   cp .env.production.example .env.production
   # Edit .env.production with your values
   nano .env.production
   ```

4. **Deploy with Docker Compose**
   ```bash
   docker-compose -f docker-compose.production.yml up -d
   ```

5. **Check health**
   ```bash
   curl http://localhost:3001/health
   docker-compose -f docker-compose.production.yml ps
   ```

### Option 2: PM2 Deployment

1. **Install dependencies**
   ```bash
   npm ci
   cd frontend && npm ci && cd ..
   ```

2. **Build applications**
   ```bash
   npm run build
   cd frontend && npm run build && cd ..
   ```

3. **Run migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start with PM2**
   ```bash
   pm2 start ecosystem.config.js --env production
   pm2 save
   pm2 startup
   ```

### Option 3: Platform Deployment

#### Railway/Render
1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy with automatic builds

#### DigitalOcean App Platform
1. Create new app
2. Connect GitHub
3. Configure build commands
4. Set environment variables
5. Deploy

## Post-Deployment Checklist

### Immediate (First Hour)
- [ ] Verify all health endpoints respond
- [ ] Test user registration flow
- [ ] Test login and JWT refresh
- [ ] Check error tracking (trigger test error)
- [ ] Verify email sending
- [ ] Test file uploads
- [ ] Check SSL certificate

### First Day
- [ ] Monitor error rates
- [ ] Check response times
- [ ] Review server logs
- [ ] Test all API endpoints
- [ ] Verify database connections
- [ ] Check memory usage

### First Week
- [ ] Review performance metrics
- [ ] Optimize slow queries
- [ ] Adjust rate limits if needed
- [ ] Review security logs
- [ ] Test backup restoration
- [ ] Load testing (optional)

## Rollback Plan

If issues occur:

1. **Quick rollback**
   ```bash
   # Docker
   docker-compose -f docker-compose.production.yml down
   git checkout previous-version
   docker-compose -f docker-compose.production.yml up -d
   
   # PM2
   pm2 stop all
   git checkout previous-version
   npm run build
   pm2 restart all
   ```

2. **Database rollback**
   ```bash
   # Restore from backup
   psql -U postgres -d bersemuka < backup.sql
   ```

## Monitoring URLs

- Health: `https://api.yourdomain.com/health`
- Detailed Health: `https://api.yourdomain.com/health/detailed`
- Metrics: `https://api.yourdomain.com/metrics`
- Logs: Check PM2 logs or Docker logs

## Emergency Contacts

- DevOps Lead: [Contact Info]
- Database Admin: [Contact Info]
- Security Team: [Contact Info]
- Hosting Support: [Contact Info]

## Common Issues & Solutions

### Database Connection Issues
- Check DATABASE_URL format
- Verify network connectivity
- Check connection pool limits

### High Memory Usage
- Review PM2 max_memory_restart setting
- Check for memory leaks
- Scale horizontally if needed

### Slow Response Times
- Check database query performance
- Review Redis cache hit rates
- Enable query optimization

### SSL Certificate Issues
- Renew with Let's Encrypt
- Check certificate chain
- Verify domain ownership

## Security Reminders

⚠️ **NEVER**:
- Commit secrets to git
- Use default passwords
- Disable HTTPS in production
- Skip security updates
- Ignore error logs

✅ **ALWAYS**:
- Use strong, unique passwords
- Enable MFA where possible
- Monitor security alerts
- Keep dependencies updated
- Test backups regularly

---

**Last Updated**: [Date]
**Version**: 1.0.0
**Status**: Ready for deployment