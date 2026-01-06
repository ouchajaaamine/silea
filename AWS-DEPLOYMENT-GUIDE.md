# AWS Deployment Guide for Silea

## 🚀 Complete AWS Setup (Cost-Effective & Secure)

### **Estimated Monthly Cost: $30-50**

---

## **Prerequisites**

1. **AWS Account** with billing enabled
2. **AWS CLI** installed: `aws configure`
3. **GitHub Repository** with secrets configured

---

## **Step 1: Create AWS Infrastructure**

### **1.1 Create IAM Role for GitHub Actions (OIDC)**

```bash
# Create OIDC provider for GitHub
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1

# Create trust policy
cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::YOUR_ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:ouchajaaamine/silea:*"
        }
      }
    }
  ]
}
EOF

# Create IAM role
aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file://trust-policy.json

# Attach policies
aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser

aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess
```

### **1.2 Create ECR Repositories**

```bash
# Backend repository
aws ecr create-repository \
  --repository-name silea-backend \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

# Frontend repository
aws ecr create-repository \
  --repository-name silea-frontend \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256
```

### **1.3 Create RDS MySQL Database (Optional - Cost-Effective)**

```bash
# Create security group
aws ec2 create-security-group \
  --group-name silea-rds-sg \
  --description "Security group for Silea RDS"

# Allow MySQL access
aws ec2 authorize-security-group-ingress \
  --group-name silea-rds-sg \
  --protocol tcp \
  --port 3306 \
  --cidr 0.0.0.0/0

# Create RDS instance (db.t4g.micro - FREE TIER eligible)
aws rds create-db-instance \
  --db-instance-identifier silea-db \
  --db-instance-class db.t4g.micro \
  --engine mysql \
  --engine-version 8.0 \
  --master-username admin \
  --master-user-password YOUR_SECURE_PASSWORD \
  --allocated-storage 20 \
  --storage-type gp2 \
  --publicly-accessible \
  --backup-retention-period 7 \
  --vpc-security-group-ids sg-xxxxx \
  --db-name silea_db \
  --storage-encrypted
```

**💡 Cost Saving Alternative:** Use MySQL in ECS instead of RDS (~$0/month vs ~$15/month)

### **1.4 Store Secrets in AWS Secrets Manager**

```bash
# Database credentials
aws secretsmanager create-secret \
  --name silea/db/username \
  --secret-string "admin"

aws secretsmanager create-secret \
  --name silea/db/password \
  --secret-string "YOUR_SECURE_PASSWORD"
```

### **1.5 Create ECS Cluster**

```bash
# Create cluster
aws ecs create-cluster --cluster-name silea-cluster

# Create VPC and subnets (if not exists)
# Or use default VPC
```

### **1.6 Create Application Load Balancer**

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name silea-alb \
  --subnets subnet-xxxxx subnet-yyyyy \
  --security-groups sg-xxxxx \
  --scheme internet-facing \
  --type application \
  --ip-address-type ipv4

# Create target groups
aws elbv2 create-target-group \
  --name silea-backend-tg \
  --protocol HTTP \
  --port 8080 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-path /actuator/health

aws elbv2 create-target-group \
  --name silea-frontend-tg \
  --protocol HTTP \
  --port 3000 \
  --vpc-id vpc-xxxxx \
  --target-type ip \
  --health-check-path /

# Create listeners
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:...
```

### **1.7 Create ECS Services**

```bash
# Backend service
aws ecs create-service \
  --cluster silea-cluster \
  --service-name silea-backend-service \
  --task-definition silea-backend-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=silea-backend,containerPort=8080

# Frontend service
aws ecs create-service \
  --cluster silea-cluster \
  --service-name silea-frontend-service \
  --task-definition silea-frontend-task \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxxxx],securityGroups=[sg-xxxxx],assignPublicIp=ENABLED}" \
  --load-balancers targetGroupArn=arn:aws:elasticloadbalancing:...,containerName=silea-frontend,containerPort=3000
```

---

## **Step 2: Configure GitHub Secrets**

Go to: **GitHub Repository → Settings → Secrets and variables → Actions**

Add these secrets:

```
AWS_ROLE_ARN: arn:aws:iam::YOUR_ACCOUNT_ID:role/GitHubActionsRole
API_URL: https://api.yourdomain.com
```

---

## **Step 3: Setup SSL/TLS (Free with AWS Certificate Manager)**

```bash
# Request certificate
aws acm request-certificate \
  --domain-name yourdomain.com \
  --subject-alternative-names www.yourdomain.com api.yourdomain.com \
  --validation-method DNS

# Add HTTPS listener to ALB
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:... \
  --default-actions Type=forward,TargetGroupArn=...
```

---

## **Step 4: Setup CloudWatch Monitoring & Alarms**

```bash
# Create log groups
aws logs create-log-group --log-group-name /ecs/silea-backend
aws logs create-log-group --log-group-name /ecs/silea-frontend

# Create alarms
aws cloudwatch put-metric-alarm \
  --alarm-name silea-backend-cpu-high \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

---

## **Step 5: Deploy**

```bash
# Push code to trigger deployment
git add .
git commit -m "Deploy to AWS"
git push origin main
```

---

## **📊 Performance Testing with JMeter**

The pipeline now includes automatic performance testing on PRs:
- **50 concurrent users**
- **60-second load test**
- **Tests key API endpoints**
- **Generates HTML report**

View reports in Actions → Artifacts → `performance-report`

---

## **💰 Cost Breakdown (Monthly)**

| Service | Configuration | Cost |
|---------|--------------|------|
| ECS Fargate (Backend) | 0.5 vCPU, 1GB RAM | ~$12 |
| ECS Fargate (Frontend) | 0.25 vCPU, 0.5GB RAM | ~$6 |
| Application Load Balancer | 1 ALB | ~$16 |
| RDS MySQL (Optional) | db.t4g.micro | ~$15 |
| Data Transfer | ~10GB/month | ~$1 |
| **Total** | | **$35-50/month** |

**💡 Save Money:**
- Use MySQL in Docker (saves $15/month)
- Use CloudFlare for CDN (free)
- Enable auto-scaling during off-peak hours

---

## **🔒 Security Features**

✅ **IAM Roles with OIDC** - No long-lived credentials
✅ **Secrets Manager** - Encrypted secrets
✅ **VPC Isolation** - Network security
✅ **Security Groups** - Firewall rules
✅ **SSL/TLS** - Encrypted traffic
✅ **Container Scanning** - Trivy vulnerability scan
✅ **CloudWatch Logs** - Audit trail

---

## **🎯 Post-Deployment**

1. **Get ALB DNS:**
   ```bash
   aws elbv2 describe-load-balancers --names silea-alb
   ```

2. **Setup Domain:**
   - Create Route53 hosted zone
   - Add A record pointing to ALB
   - Update API_URL in GitHub secrets

3. **Monitor:**
   ```bash
   aws ecs describe-services --cluster silea-cluster --services silea-backend-service
   ```

---

## **🔧 Troubleshooting**

```bash
# View logs
aws logs tail /ecs/silea-backend --follow

# Check service status
aws ecs describe-services --cluster silea-cluster --services silea-backend-service

# View task failures
aws ecs describe-tasks --cluster silea-cluster --tasks TASK_ID
```

---

## **📈 Scaling**

```bash
# Auto-scaling (optional)
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/silea-cluster/silea-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 1 \
  --max-capacity 4

aws application-autoscaling put-scaling-policy \
  --policy-name cpu-scaling \
  --service-namespace ecs \
  --resource-id service/silea-cluster/silea-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    }
  }'
```

---

**Need Help?** Check AWS documentation or run `aws ecs help`
