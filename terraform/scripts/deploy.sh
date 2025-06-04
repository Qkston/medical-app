#!/bin/bash

# Deploy script for Terraform
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment parameter is provided
if [ $# -eq 0 ]; then
    print_error "Please provide environment (dev, staging, prod)"
    echo "Usage: $0 <environment> [action]"
    echo "Actions: plan, apply, destroy, init"
    exit 1
fi

ENVIRONMENT=$1
ACTION=${2:-plan}

# Validate environment
case $ENVIRONMENT in
    dev|staging|prod)
        print_info "Environment: $ENVIRONMENT"
        ;;
    *)
        print_error "Invalid environment. Use: dev, staging, prod"
        exit 1
        ;;
esac

# Validate action
case $ACTION in
    init|plan|apply|destroy)
        print_info "Action: $ACTION"
        ;;
    *)
        print_error "Invalid action. Use: init, plan, apply, destroy"
        exit 1
        ;;
esac

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    print_error "Terraform is not installed"
    exit 1
fi

# Change to terraform directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TERRAFORM_DIR="$(dirname "$SCRIPT_DIR")"
cd "$TERRAFORM_DIR"

print_info "Working directory: $(pwd)"

# Set variables file
TFVARS_FILE="environments/$ENVIRONMENT.tfvars"

if [ ! -f "$TFVARS_FILE" ]; then
    print_error "Environment file not found: $TFVARS_FILE"
    exit 1
fi

print_info "Using variables file: $TFVARS_FILE"

# Execute Terraform command
case $ACTION in
    init)
        print_info "Initializing Terraform..."
        terraform init
        ;;
    plan)
        print_info "Planning Terraform changes..."
        terraform plan -var-file="$TFVARS_FILE" -out="terraform-$ENVIRONMENT.plan"
        print_info "Plan saved to terraform-$ENVIRONMENT.plan"
        ;;
    apply)
        print_warning "Applying Terraform changes for $ENVIRONMENT environment..."
        if [ -f "terraform-$ENVIRONMENT.plan" ]; then
            terraform apply "terraform-$ENVIRONMENT.plan"
            rm "terraform-$ENVIRONMENT.plan"
            print_info "Plan file cleaned up"
        else
            print_warning "No plan file found. Running apply with auto-approve..."
            terraform apply -var-file="$TFVARS_FILE" -auto-approve
        fi
        ;;
    destroy)
        print_warning "This will DESTROY all resources in $ENVIRONMENT environment!"
        read -p "Are you sure? Type 'yes' to continue: " -r
        if [[ $REPLY == "yes" ]]; then
            terraform destroy -var-file="$TFVARS_FILE" -auto-approve
            print_info "Resources destroyed"
        else
            print_info "Destroy cancelled"
        fi
        ;;
esac

print_info "Operation completed!" 