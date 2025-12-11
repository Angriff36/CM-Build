#!/bin/bash

# Sync secrets from Doppler for specified config
# Usage: ./sync_secrets.sh [config-name] (default: ck-dev) [--validate]

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

CONFIG=${1:-dev}
VALIDATE=false

if [ "$2" = "--validate" ]; then
  VALIDATE=true
fi

# Map config to project
case $CONFIG in
  "dev")
    PROJECT="ck-dev"
    ;;
  "stg")
    PROJECT="ck-stg"
    ;;
  "prod")
    PROJECT="ck-prod"
    ;;
  *)
    echo -e "${RED}Error: Invalid config '$CONFIG'. Must be one of: dev, stg, prod${NC}"
    exit 1
    ;;
esac

# Required secrets
REQUIRED_SECRETS=("SUPABASE_URL" "SUPABASE_ANON_KEY" "FLAGS_API_KEY")

if ! command -v doppler &> /dev/null; then
  echo -e "${RED}Error: Doppler CLI not installed. Please install it first.${NC}"
  exit 1
fi

if [ "$VALIDATE" = true ]; then
  echo -e "${GREEN}Validating secrets for config: $CONFIG (project: $PROJECT)${NC}"
  doppler secrets download --project $PROJECT --config $CONFIG --format json > /tmp/secrets.json 2>/dev/null
  if [ $? -eq 0 ]; then
    MISSING=()
    for secret in "${REQUIRED_SECRETS[@]}"; do
      if ! jq -e ".\"$secret\"" /tmp/secrets.json > /dev/null 2>&1; then
        MISSING+=("$secret")
      fi
    done
    rm /tmp/secrets.json
    if [ ${#MISSING[@]} -gt 0 ]; then
      echo -e "${RED}Missing required secrets: ${MISSING[*]}${NC}"
      exit 1
    fi
    echo -e "${GREEN}All required secrets present.${NC}"
    
    # Validate Doppler template
    echo -e "${GREEN}Validating Doppler template...${NC}"
    doppler secrets substitute configs/doppler.env.template --project $PROJECT --config $CONFIG --output /tmp/template_test.env
    if [ $? -eq 0 ]; then
      echo -e "${GREEN}Doppler template validation successful.${NC}"
      rm /tmp/template_test.env
    else
      echo -e "${RED}Doppler template validation failed.${NC}"
      exit 1
    fi
  else
    echo -e "${RED}Failed to validate secrets. Check your Doppler access.${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}Syncing secrets for config: $CONFIG${NC}"

  # Use Doppler template to generate .env file
  doppler secrets substitute configs/doppler.env.template --project $PROJECT --config $CONFIG --output .env
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Secrets synced successfully to .env using template.${NC}"
  else
    # Fallback to direct download
    echo -e "${YELLOW}Template failed, falling back to direct download...${NC}"
    doppler secrets download --config $CONFIG --format env > .env
    echo -e "${GREEN}Secrets synced successfully to .env${NC}"
  fi
fi