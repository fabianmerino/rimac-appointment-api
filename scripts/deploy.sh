#!/bin/bash

# Deploy script for Rimac Appointment Backend
# Usage: ./scripts/deploy.sh [stage] [region]

set -e

STAGE=${1:-dev}
REGION=${2:-us-east-1}

echo "🚀 Deploying Rimac Appointment Backend to stage: $STAGE, region: $REGION"

# Build the project
echo "📦 Building TypeScript..."
npm run build

# Run linting
echo "🔍 Running linting..."
npm run lint

# Run tests
echo "🧪 Running tests..."
npm test

# Deploy with Serverless
echo "☁️ Deploying to AWS..."
serverless deploy --stage $STAGE --region $REGION --verbose

echo "✅ Deployment completed successfully!"
echo "📖 API Documentation: https://api.rimac.com/$STAGE/docs"
echo "📊 CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home?region=$REGION#logsV2:log-groups"
