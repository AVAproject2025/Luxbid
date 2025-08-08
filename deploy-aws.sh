#!/bin/bash

# 🚀 AWS Performance Max Deployment Script pentru LuxBID
# Acest script configurează și deployează LuxBID pe AWS cu performanță maximă

set -e

# Colors pentru output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funcții pentru logging
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verifică dacă AWS CLI este instalat
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI nu este instalat. Instalează-l cu: brew install awscli"
        exit 1
    fi
    log_success "AWS CLI găsit"
}

# Verifică dacă Docker este instalat
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker nu este instalat. Instalează-l cu: brew install docker"
        exit 1
    fi
    log_success "Docker găsit"
}

# Verifică dacă Terraform este instalat
check_terraform() {
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform nu este instalat. Instalează-l cu: brew install terraform"
        exit 1
    fi
    log_success "Terraform găsit"
}

# Configurează AWS credentials
setup_aws_credentials() {
    log_info "Configurare AWS credentials..."
    
    if ! aws sts get-caller-identity &> /dev/null; then
        log_warning "AWS credentials nu sunt configurate"
        aws configure
    else
        log_success "AWS credentials deja configurate"
    fi
}

# Creează S3 bucket pentru Terraform state
create_terraform_bucket() {
    log_info "Creează S3 bucket pentru Terraform state..."
    
    BUCKET_NAME="luxbid-terraform-state-$(date +%s)"
    
    if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
        aws s3 mb "s3://$BUCKET_NAME" --region us-east-1
        aws s3api put-bucket-versioning --bucket "$BUCKET_NAME" --versioning-configuration Status=Enabled
        log_success "S3 bucket creat: $BUCKET_NAME"
    else
        log_warning "S3 bucket deja există: $BUCKET_NAME"
    fi
}

# Build și push Docker image
build_and_push_image() {
    log_info "Build și push Docker image..."
    
    # Get ECR repository URL
    ECR_REPO=$(aws ecr describe-repositories --repository-names luxbid --query 'repositories[0].repositoryUri' --output text 2>/dev/null || echo "")
    
    if [ -z "$ECR_REPO" ]; then
        log_info "Creează ECR repository..."
        aws ecr create-repository --repository-name luxbid
        ECR_REPO=$(aws ecr describe-repositories --repository-names luxbid --query 'repositories[0].repositoryUri' --output text)
    fi
    
    # Login la ECR
    aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "$ECR_REPO"
    
    # Build image
    docker build -f Dockerfile.aws -t luxbid .
    docker tag luxbid:latest "$ECR_REPO:latest"
    
    # Push image
    docker push "$ECR_REPO:latest"
    log_success "Docker image pushed: $ECR_REPO:latest"
}

# Deploy cu Terraform
deploy_terraform() {
    log_info "Deploy cu Terraform..."
    
    cd terraform
    
    # Initialize Terraform
    terraform init
    
    # Plan deployment
    terraform plan -var="domain_name=$DOMAIN_NAME" -var="db_username=$DB_USERNAME" -var="db_password=$DB_PASSWORD"
    
    # Apply deployment
    terraform apply -var="domain_name=$DOMAIN_NAME" -var="db_username=$DB_USERNAME" -var="db_password=$DB_PASSWORD" -auto-approve
    
    # Get outputs
    ALB_DNS=$(terraform output -raw alb_dns_name)
    RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
    REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)
    ECR_REPO=$(terraform output -raw ecr_repository_url)
    
    cd ..
    
    log_success "Terraform deployment complet"
    log_info "ALB DNS: $ALB_DNS"
    log_info "RDS Endpoint: $RDS_ENDPOINT"
    log_info "Redis Endpoint: $REDIS_ENDPOINT"
    log_info "ECR Repository: $ECR_REPO"
}

# Configurează DNS
setup_dns() {
    log_info "Configurează DNS..."
    
    # Get ALB DNS name
    ALB_DNS=$(cd terraform && terraform output -raw alb_dns_name && cd ..)
    
    # Get hosted zone ID
    ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='$DOMAIN_NAME.'].Id" --output text)
    
    if [ -n "$ZONE_ID" ]; then
        # Create A record
        aws route53 change-resource-record-sets \
            --hosted-zone-id "$ZONE_ID" \
            --change-batch "{
                \"Changes\": [
                    {
                        \"Action\": \"UPSERT\",
                        \"ResourceRecordSet\": {
                            \"Name\": \"$DOMAIN_NAME\",
                            \"Type\": \"A\",
                            \"AliasTarget\": {
                                \"HostedZoneId\": \"Z35SXDOTRQ7X7K\",
                                \"DNSName\": \"$ALB_DNS\",
                                \"EvaluateTargetHealth\": true
                            }
                        }
                    }
                ]
            }"
        log_success "DNS configurat pentru $DOMAIN_NAME"
    else
        log_warning "Hosted zone nu găsit pentru $DOMAIN_NAME"
    fi
}

# Testează deployment-ul
test_deployment() {
    log_info "Testează deployment-ul..."
    
    # Wait for ALB to be ready
    sleep 30
    
    # Test health endpoint
    ALB_DNS=$(cd terraform && terraform output -raw alb_dns_name && cd ..)
    
    if curl -f "http://$ALB_DNS/api/health" > /dev/null 2>&1; then
        log_success "Deployment testat cu succes!"
        log_info "Aplicația este disponibilă la: http://$ALB_DNS"
    else
        log_warning "Deployment testat, dar health check a eșuat"
        log_info "Verifică logs-urile în CloudWatch"
    fi
}

# Main deployment function
main() {
    log_info "🚀 Începe deployment-ul AWS Performance Max pentru LuxBID"
    
    # Verifică dependențele
    check_aws_cli
    check_docker
    check_terraform
    
    # Setup AWS
    setup_aws_credentials
    create_terraform_bucket
    
    # Build și push image
    build_and_push_image
    
    # Deploy cu Terraform
    deploy_terraform
    
    # Setup DNS
    setup_dns
    
    # Test deployment
    test_deployment
    
    log_success "🎉 Deployment complet! LuxBID este live pe AWS cu performanță maximă!"
    
    # Afișează informații finale
    echo ""
    echo "📊 Informații Deployment:"
    echo "  - ALB DNS: $(cd terraform && terraform output -raw alb_dns_name && cd ..)"
    echo "  - Domain: $DOMAIN_NAME"
    echo "  - RDS Endpoint: $(cd terraform && terraform output -raw rds_endpoint && cd ..)"
    echo "  - Redis Endpoint: $(cd terraform && terraform output -raw redis_endpoint && cd ..)"
    echo ""
    echo "🔗 Link-uri utile:"
    echo "  - AWS Console: https://console.aws.amazon.com"
    echo "  - CloudWatch Logs: https://console.aws.amazon.com/cloudwatch"
    echo "  - ECS Console: https://console.aws.amazon.com/ecs"
    echo ""
}

# Verifică variabilele de mediu
if [ -z "$DOMAIN_NAME" ]; then
    log_error "Variabila DOMAIN_NAME nu este setată"
    echo "Usage: DOMAIN_NAME=yourdomain.com DB_USERNAME=user DB_PASSWORD=pass ./deploy-aws.sh"
    exit 1
fi

if [ -z "$DB_USERNAME" ]; then
    log_error "Variabila DB_USERNAME nu este setată"
    exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
    log_error "Variabila DB_PASSWORD nu este setată"
    exit 1
fi

# Rulează main function
main
