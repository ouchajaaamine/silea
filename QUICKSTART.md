# 🚀 Quick Start: AWS Deployment

## ✅ What's Been Fixed

1. **Test Error** - Fixed package name mismatch
2. **Maven Cache** - Improved caching configuration  
3. **Pipeline** - Added AWS deployment + JMeter performance testing

## 📋 New Pipeline Features

Your new pipeline (`.github/workflows/ci-cd-aws.yml`) includes:

- ✅ **Smart Change Detection** - Only builds what changed
- ✅ **MySQL Test Service** - Real database for tests
- ✅ **Performance Testing** - JMeter load testing (50 users, 60s)
- ✅ **AWS ECR** - Docker image registry
- ✅ **AWS ECS Fargate** - Serverless containers
- ✅ **Security Scanning** - Trivy vulnerability scan
- ✅ **Automated Deployment** - Push to main = auto-deploy

## 🎯 3-Step AWS Setup

### **Step 1: Run Setup Script**

```bash
# Install AWS CLI first: https://aws.amazon.com/cli/

# Configure AWS
aws configure

# Edit setup-aws.sh with your details
nano setup-aws.sh  # Update AWS_ACCOUNT_ID and DB_PASSWORD

# Run setup
chmod +x setup-aws.sh
./setup-aws.sh
```

### **Step 2: Add GitHub Secrets**

Go to: `https://github.com/ouchajaaamine/silea/settings/secrets/actions`

Add:
```
AWS_ROLE_ARN: arn:aws:iam::YOUR_ACCOUNT_ID:role/GitHubActionsRole
API_URL: https://your-load-balancer.amazonaws.com
```

Get your account ID:
```bash
aws sts get-caller-identity --query Account --output text
```

### **Step 3: Deploy!**

```bash
git push origin main
```

Watch it deploy at: `https://github.com/ouchajaaamine/silea/actions`

## 💰 Cost: $30-50/month

- **ECS Fargate**: $12-18 (2 services)
- **Load Balancer**: $16
- **RDS MySQL** (optional): $15
- **ECR/Logs**: ~$2

**Save Money:** Use MySQL in Docker instead of RDS (saves $15/month)

## 📊 View Performance Tests

After any PR:
1. Go to Actions → Your PR workflow
2. Download `performance-report` artifact
3. Open `index.html` in browser

## 🔒 Security Features

✅ No AWS credentials in code (OIDC)
✅ Secrets in AWS Secrets Manager
✅ Container vulnerability scanning
✅ SSL/TLS ready
✅ VPC network isolation

## 📖 Full Guide

See [AWS-DEPLOYMENT-GUIDE.md](AWS-DEPLOYMENT-GUIDE.md) for:
- Complete AWS setup commands
- Load balancer configuration
- SSL certificate setup
- Auto-scaling
- Monitoring & alarms
- Troubleshooting

## 🛠️ Local Development

```bash
# Backend
cd Backend
mvn spring-boot:run

# Frontend
cd Frontend
pnpm install
pnpm dev

# Full stack with Docker
docker-compose up
```

## ❓ Need Help?

- **Pipeline failing?** Check Actions tab for logs
- **AWS issues?** See troubleshooting in AWS-DEPLOYMENT-GUIDE.md
- **Cost concerns?** Use MySQL in Docker, not RDS

---

**Your pipeline is ready! Push to `main` to see it in action** 🚀
