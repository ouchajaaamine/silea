#!/bin/bash
# AWS Infrastructure Setup Script for Silea
# Run this after configuring AWS CLI: aws configure

set -e

echo "🚀 Setting up Silea on AWS..."

# Variables - UPDATE THESE
AWS_ACCOUNT_ID="442147575154"
AWS_REGION="eu-west-3"
GITHUB_REPO="ouchajaaamine/silea"
DB_PASSWORD="SileaDB2026!Secure"

echo "📋 Using Account: $AWS_ACCOUNT_ID"
echo "📍 Region: $AWS_REGION"
echo ""

# 1. Create ECR Repositories
echo "1️⃣ Creating ECR repositories..."
aws ecr create-repository --repository-name silea-backend --region $AWS_REGION || true
aws ecr create-repository --repository-name silea-frontend --region $AWS_REGION || true
echo "✅ ECR repositories created"
echo ""

# 2. Create IAM OIDC Provider
echo "2️⃣ Creating GitHub OIDC provider..."
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com \
  --thumbprint-list 6938fd4d98bab03faadb97b34396831e3780aea1 || true
echo "✅ OIDC provider created"
echo ""

# 3. Create IAM Role
echo "3️⃣ Creating IAM role for GitHub Actions..."
cat > /tmp/trust-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:${GITHUB_REPO}:*"
        }
      }
    }
  ]
}
EOF

aws iam create-role \
  --role-name GitHubActionsRole \
  --assume-role-policy-document file:///tmp/trust-policy.json || true

aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser || true

aws iam attach-role-policy \
  --role-name GitHubActionsRole \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess || true

echo "✅ IAM role created"
echo ""

# 4. Create Secrets Manager secrets
echo "4️⃣ Creating Secrets Manager secrets..."
aws secretsmanager create-secret \
  --name silea/db/username \
  --secret-string "admin" \
  --region $AWS_REGION || true

aws secretsmanager create-secret \
  --name silea/db/password \
  --secret-string "$DB_PASSWORD" \
  --region $AWS_REGION || true
echo "✅ Secrets created"
echo ""

# 5. Create ECS Cluster
echo "5️⃣ Creating ECS cluster..."
aws ecs create-cluster --cluster-name silea-cluster --region $AWS_REGION || true
echo "✅ ECS cluster created"
echo ""

# 6. Create CloudWatch Log Groups
echo "6️⃣ Creating CloudWatch log groups..."
aws logs create-log-group --log-group-name /ecs/silea-backend --region $AWS_REGION || true
aws logs create-log-group --log-group-name /ecs/silea-frontend --region $AWS_REGION || true
echo "✅ Log groups created"
echo ""

echo "🎉 AWS infrastructure setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update .aws/*.json files with your Account ID"
echo "2. Add GitHub secrets:"
echo "   AWS_ROLE_ARN: arn:aws:iam::${AWS_ACCOUNT_ID}:role/GitHubActionsRole"
echo "   API_URL: https://your-alb-dns-name.region.elb.amazonaws.com"
echo "3. Create ALB and ECS services (see AWS-DEPLOYMENT-GUIDE.md)"
echo "4. Push code to trigger deployment!"
