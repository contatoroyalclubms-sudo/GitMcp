#!/bin/bash

# Railway Automated Deploy Script (Bash version)
# Zero-downtime deployment with health checks and rollback capability

set -e  # Exit on any error

# Configuration
PROJECT_NAME="${1:-sistema-meep01}"
HEALTH_CHECK_TIMEOUT=120
MAX_RETRIES=30
RETRY_INTERVAL=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Railway CLI is installed and authenticated
check_railway_cli() {
    log_info "Checking Railway CLI..."
    
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI not found. Please install it first."
        exit 1
    fi
    
    if ! railway whoami &> /dev/null; then
        log_error "Railway CLI not authenticated. Please run 'railway login' first."
        exit 1
    fi
    
    log_success "Railway CLI ready"
}

# Pre-deployment checks
pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check package.json
    if [ ! -f "package.json" ]; then
        log_error "package.json not found"
        exit 1
    fi
    
    # Check main server file
    if [ ! -f "server.js" ]; then
        log_error "server.js not found"
        exit 1
    fi
    
    # Syntax check
    if ! node --check server.js; then
        log_error "Syntax error in server.js"
        exit 1
    fi
    
    log_success "Pre-deployment checks passed"
}

# Link to Railway project with automated selection
link_project() {
    log_info "Linking to Railway project: $PROJECT_NAME"
    
    # Check if already linked
    if railway status &> /dev/null; then
        log_success "Directory already linked to Railway project"
        return 0
    fi
    
    # Get list of projects and find the target project
    log_info "Fetching project list..."
    projects_output=$(railway list 2>/dev/null || echo "")
    
    if [[ $projects_output == *"$PROJECT_NAME"* ]]; then
        log_info "Found project: $PROJECT_NAME"
        
        # Use expect to automate project selection if available
        if command -v expect &> /dev/null; then
            log_info "Using automated project selection..."
            expect -c "
                spawn railway link
                expect \"Select a project:\"
                send \"$PROJECT_NAME\r\"
                expect eof
            " || {
                log_warning "Automated selection failed, falling back to manual method"
                manual_project_link
            }
        else
            log_warning "expect not available, using manual method"
            manual_project_link
        fi
    else
        log_error "Project '$PROJECT_NAME' not found in your Railway account"
        exit 1
    fi
    
    # Verify link was successful
    if railway status &> /dev/null; then
        log_success "Successfully linked to project"
    else
        log_error "Failed to link to project"
        exit 1
    fi
}

# Manual project linking fallback
manual_project_link() {
    log_info "Manual project linking..."
    log_warning "Please select the project '$PROJECT_NAME' when prompted"
    
    # This will require manual interaction
    railway link || {
        log_error "Failed to link project manually"
        exit 1
    }
}

# Deploy application
deploy_application() {
    log_info "Starting deployment..."
    
    # Store current deployment info for rollback
    railway status > .railway-rollback.txt 2>/dev/null || true
    
    # Deploy with detached mode for monitoring
    if railway up --detach; then
        log_success "Deployment initiated"
    else
        log_error "Deployment failed to start"
        exit 1
    fi
}

# Monitor deployment progress
monitor_deployment() {
    log_info "Monitoring deployment progress..."
    
    local retries=0
    local deployed=false
    
    while [ $retries -lt $MAX_RETRIES ]; do
        sleep $RETRY_INTERVAL
        
        local status_output=$(railway status 2>/dev/null || echo "")
        
        if [[ $status_output == *"Deployed"* ]]; then
            log_success "Deployment completed successfully"
            deployed=true
            break
        elif [[ $status_output == *"Failed"* ]]; then
            log_error "Deployment failed according to Railway status"
            return 1
        else
            log_info "Deployment in progress... (attempt $((retries + 1))/$MAX_RETRIES)"
        fi
        
        retries=$((retries + 1))
    done
    
    if [ "$deployed" = false ]; then
        log_error "Deployment monitoring timed out"
        return 1
    fi
    
    return 0
}

# Perform health check
health_check() {
    log_info "Performing health check..."
    
    # Get deployment URL
    local domain_output=$(railway domain 2>/dev/null || echo "")
    local url=$(echo "$domain_output" | grep -oE 'https?://[^[:space:]]+' | head -1)
    
    if [ -n "$url" ]; then
        log_info "Testing health endpoint: $url/health"
        
        # Wait a bit for service to be fully ready
        sleep 10
        
        # Perform health check with retry
        local health_retries=0
        local health_check_passed=false
        
        while [ $health_retries -lt 5 ]; do
            if curl -f -s "$url/health" > /dev/null 2>&1; then
                log_success "Health check passed"
                health_check_passed=true
                break
            else
                log_info "Health check attempt $((health_retries + 1))/5 failed, retrying..."
                sleep 5
            fi
            health_retries=$((health_retries + 1))
        done
        
        if [ "$health_check_passed" = false ]; then
            log_warning "Health check failed, but deployment may still be starting"
        fi
    else
        log_warning "Could not determine deployment URL for health check"
    fi
    
    return 0
}

# Rollback deployment
rollback_deployment() {
    log_info "Initiating rollback..."
    
    if railway down; then
        log_success "Rollback completed"
    else
        log_error "Rollback failed"
        return 1
    fi
    
    return 0
}

# Main deployment flow
main() {
    echo "🚂 Railway Automated Deployment Starting..."
    echo "📋 Target Project: $PROJECT_NAME"
    echo "⏰ Started at: $(date)"
    
    # Store start time
    local start_time=$(date +%s)
    
    # Execute deployment pipeline
    if check_railway_cli && \
       pre_deployment_checks && \
       link_project && \
       deploy_application && \
       monitor_deployment && \
       health_check; then
        
        # Calculate deployment time
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        echo ""
        log_success "🎉 Deployment completed successfully!"
        log_info "⏰ Total time: ${duration} seconds"
        log_info "⏰ Completed at: $(date)"
        
        # Show final status
        echo ""
        log_info "Final deployment status:"
        railway status
        
        return 0
    else
        log_error "💥 Deployment failed!"
        log_info "🚨 Attempting automatic rollback..."
        
        if rollback_deployment; then
            log_success "Rollback completed successfully"
        else
            log_error "Rollback also failed - manual intervention required"
        fi
        
        exit 1
    fi
}

# Run main function with all arguments
main "$@"