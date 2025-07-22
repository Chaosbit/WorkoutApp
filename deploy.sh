#!/bin/bash

# Deploy script for Workout Timer PWA to Azure Storage

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Deploying Workout Timer PWA to Azure...${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed. Please install it first.${NC}"
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if Terraform is installed
if ! command -v terraform &> /dev/null; then
    echo -e "${RED}❌ Terraform is not installed. Please install it first.${NC}"
    echo "Visit: https://www.terraform.io/downloads.html"
    exit 1
fi

# Check if logged into Azure
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged into Azure. Logging in...${NC}"
    az login
fi

echo -e "${GREEN}✅ Azure CLI is ready${NC}"

# Change to terraform directory
cd terraform

# Initialize Terraform
echo -e "${GREEN}📦 Initializing Terraform...${NC}"
terraform init

# Plan deployment
echo -e "${GREEN}📋 Planning Terraform deployment...${NC}"
terraform plan

# Apply deployment
echo -e "${GREEN}🏗️  Applying Terraform configuration...${NC}"
terraform apply -auto-approve

# Get outputs
STORAGE_ACCOUNT=$(terraform output -raw storage_account_name)
WEBSITE_URL=$(terraform output -raw website_url)

echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"
echo -e "${GREEN}📦 Storage Account: ${STORAGE_ACCOUNT}${NC}"

# Go back to root directory
cd ..

# Upload files to storage
echo -e "${GREEN}📤 Uploading files to Azure Storage...${NC}"

# Upload each file individually with correct content types
az storage blob upload --account-name "$STORAGE_ACCOUNT" --container-name '$web' --name 'index.html' --file 'index.html' --content-type 'text/html' --overwrite
az storage blob upload --account-name "$STORAGE_ACCOUNT" --container-name '$web' --name 'styles.css' --file 'styles.css' --content-type 'text/css' --overwrite
az storage blob upload --account-name "$STORAGE_ACCOUNT" --container-name '$web' --name 'script.js' --file 'script.js' --content-type 'application/javascript' --overwrite
az storage blob upload --account-name "$STORAGE_ACCOUNT" --container-name '$web' --name 'sw.js' --file 'sw.js' --content-type 'application/javascript' --overwrite
az storage blob upload --account-name "$STORAGE_ACCOUNT" --container-name '$web' --name 'manifest.json' --file 'manifest.json' --content-type 'application/json' --overwrite
az storage blob upload --account-name "$STORAGE_ACCOUNT" --container-name '$web' --name 'icon-192.png' --file 'icon-192.png' --content-type 'image/png' --overwrite
az storage blob upload --account-name "$STORAGE_ACCOUNT" --container-name '$web' --name 'icon-512.png' --file 'icon-512.png' --content-type 'image/png' --overwrite
az storage blob upload --account-name "$STORAGE_ACCOUNT" --container-name '$web' --name 'sample-workout.md' --file 'sample-workout.md' --content-type 'text/markdown' --overwrite

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}🌐 Your PWA is available at: ${WEBSITE_URL}${NC}"
echo -e "${GREEN}📱 You can now install it as a PWA on your Android device!${NC}"