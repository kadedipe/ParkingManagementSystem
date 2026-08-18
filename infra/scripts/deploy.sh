#!/bin/bash
# ============================================================================
# Deployment Script - Complete Deployment Automation
# ============================================================================

# parking-management-system/infra/scripts/deploy.sh

#!/bin/bash
set -e

# ============================================================================
# Configuration
# ============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Default values
ENVIRONMENT="dev"
ACTION="deploy"
SKIP_TESTS=false
SKIP_BUILD=false
SKIP_MIGRATIONS=false
VERBOSE=false
DRY_RUN=false

# ============================================================================
# Help Function
# ============================================================================

show_help() {
    cat << EOF
${GREEN}================================================================================${NC}
${GREEN}  Parking Management System - Deployment Script${NC}
${GREEN}================================================================================${NC}

${CYAN}USAGE:${NC}
    ./deploy.sh [OPTIONS]

${CYAN}OPTIONS:${NC}
    -e, --environment ENV    Set deployment environment (dev|staging|prod)
    -a, --action ACTION      Set action (deploy|rollback|destroy|status)
    -s, --skip-tests        Skip running tests
    -b, --skip-build        Skip building the application
    -m, --skip-migrations   Skip running database migrations
    -v, --verbose           Enable verbose output
    -d, --dry-run           Perform a dry run without making changes
    -h, --help              Show this help message

${CYAN}EXAMPLES:${NC}
    ./deploy.sh -e prod -a deploy          # Deploy to production
    ./deploy.sh -e staging -a rollback     # Rollback staging
    ./deploy.sh -e dev -a status           # Check status of dev environment
    ./deploy.sh -e prod --dry-run          # Dry run production deployment

${CYAN}ENVIRONMENTS:${NC}
    dev     - Development environment
    staging - Staging environment
    prod    - Production environment

${CYAN}ACTIONS:${NC}
    deploy   - Deploy the application
    rollback - Rollback to previous version
    destroy  - Destroy the environment
    status   - Check deployment status

${GREEN}================================================================================${NC}
EOF
}

# ============================================================================
# Utility Functions
# ============================================================================

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

log_debug() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${CYAN}[DEBUG]${NC} $1"
    fi
}

log_section() {
    echo ""
    echo -e "${GREEN}================================================================================${NC}"
    echo -e "${GREEN}  $1${NC}"
    echo -e "${GREEN}================================================================================${NC}"
    echo ""
}

confirm_action() {
    local message="${1:-Are you sure you want to continue?}"
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Would prompt for confirmation: $message"
        return 0
    fi
    
    read -p "$message [y/N] " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Operation cancelled"
        exit 1
    fi
}

check_dependencies() {
    local missing_deps=()
    
    for cmd in docker kubectl terraform helm aws jq curl; do
        if ! command -v $cmd &> /dev/null; then
            missing_deps+=($cmd)
        fi
    done
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Please install the following dependencies:"
        for dep in "${missing_deps[@]}"; do
            echo "  - $dep"
        done
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# ============================================================================
# Environment Setup Functions
# ============================================================================

setup_environment() {
    log_section "Setting up environment: $ENVIRONMENT"
    
    # Load environment-specific configuration
    local env_file="$PROJECT_ROOT/.env.$ENVIRONMENT"
    if [ -f "$env_file" ]; then
        log_info "Loading environment configuration from $env_file"
        set -a
        source "$env_file"
        set +a
    else
        log_warning "Environment file $env_file not found, using defaults"
    fi
    
    # Set Kubernetes context
    export KUBECONFIG="$PROJECT_ROOT/infra/kubernetes/kubeconfig-$ENVIRONMENT.yaml"
    
    # Set Terraform workspace
    export TF_WORKSPACE="$ENVIRONMENT"
    
    # Set Docker environment
    export DOCKER_ENV="$ENVIRONMENT"
    
    log_success "Environment setup complete"
}

# ============================================================================
# Build Functions
# ============================================================================

build_application() {
    if [ "$SKIP_BUILD" = true ]; then
        log_warning "Skipping build as requested"
        return 0
    fi
    
    log_section "Building Application"
    
    # Build backend
    log_info "Building backend..."
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Would build backend Docker image"
    else
        docker build \
            -t parking-backend:$ENVIRONMENT \
            -f "$PROJECT_ROOT/infra/docker/Dockerfile.backend" \
            "$PROJECT_ROOT/backend"
        
        if [ $? -eq 0 ]; then
            log_success "Backend built successfully"
        else
            log_error "Backend build failed"
            exit 1
        fi
    fi
    
    # Build frontend
    log_info "Building frontend..."
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Would build frontend Docker image"
    else
        docker build \
            -t parking-frontend:$ENVIRONMENT \
            -f "$PROJECT_ROOT/infra/docker/Dockerfile.frontend" \
            "$PROJECT_ROOT/frontend"
        
        if [ $? -eq 0 ]; then
            log_success "Frontend built successfully"
        else
            log_error "Frontend build failed"
            exit 1
        fi
    fi
    
    # Build workers
    log_info "Building workers..."
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Would build worker Docker images"
    else
        for worker in email notification payment report cache; do
            docker build \
                -t parking-worker-$worker:$ENVIRONMENT \
                -f "$PROJECT_ROOT/infra/docker/Dockerfile.worker" \
                --build-arg WORKER_TYPE=$worker \
                "$PROJECT_ROOT/backend"
        done
        
        log_success "Workers built successfully"
    fi
    
    # Push images to registry
    if [ "$ENVIRONMENT" != "dev" ] && [ "$DRY_RUN" = false ]; then
        log_info "Pushing images to registry..."
        docker push parking-backend:$ENVIRONMENT
        docker push parking-frontend:$ENVIRONMENT
        for worker in email notification payment report cache; do
            docker push parking-worker-$worker:$ENVIRONMENT
        done
        log_success "Images pushed to registry"
    fi
    
    log_success "Application build complete"
}

# ============================================================================
# Test Functions
# ============================================================================

run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        log_warning "Skipping tests as requested"
        return 0
    fi
    
    log_section "Running Tests"
    
    # Run unit tests
    log_info "Running unit tests..."
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Would run unit tests"
    else
        cd "$PROJECT_ROOT/backend"
        npm run test:unit
        if [ $? -ne 0 ]; then
            log_error "Unit tests failed"
            exit 1
        fi
        log_success "Unit tests passed"
    fi
    
    # Run integration tests
    log_info "Running integration tests..."
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Would run integration tests"
    else
        cd "$PROJECT_ROOT/backend"
        npm run test:integration
        if [ $? -ne 0 ]; then
            log_error "Integration tests failed"
            exit 1
        fi
        log_success "Integration tests passed"
    fi
    
    # Run E2E tests (only for staging/prod)
    if [ "$ENVIRONMENT" != "dev" ]; then
        log_info "Running E2E tests..."
        if [ "$DRY_RUN" = true ]; then
            log_warning "DRY RUN: Would run E2E tests"
        else
            cd "$PROJECT_ROOT/mobile"
            npm run test:e2e:${ENVIRONMENT}
            if [ $? -ne 0 ]; then
                log_error "E2E tests failed"
                exit 1
            fi
            log_success "E2E tests passed"
        fi
    fi
    
    log_success "All tests passed"
}

# ============================================================================
# Database Migration Functions
# ============================================================================

run_migrations() {
    if [ "$SKIP_MIGRATIONS" = true ]; then
        log_warning "Skipping migrations as requested"
        return 0
    fi
    
    log_section "Running Database Migrations"
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Would run database migrations"
        return 0
    fi
    
    # Get database connection details
    local db_host=$(kubectl get secret db-secret -n parking-system -o jsonpath='{.data.host}' | base64 -d)
    local db_port=$(kubectl get secret db-secret -n parking-system -o jsonpath='{.data.port}' | base64 -d)
    local db_name=$(kubectl get secret db-secret -n parking-system -o jsonpath='{.data.name}' | base64 -d)
    local db_user=$(kubectl get secret db-secret -n parking-system -o jsonpath='{.data.user}' | base64 -d)
    local db_password=$(kubectl get secret db-secret -n parking-system -o jsonpath='{.data.password}' | base64 -d)
    
    # Run migrations
    log_info "Running database migrations..."
    cd "$PROJECT_ROOT/backend"
    
    export DATABASE_URL="postgresql://$db_user:$db_password@$db_host:$db_port/$db_name"
    
    npm run migration:run
    
    if [ $? -eq 0 ]; then
        log_success "Database migrations completed successfully"
    else
        log_error "Database migrations failed"
        exit 1
    fi
}

# ============================================================================
# Kubernetes Deployment Functions
# ============================================================================

deploy_kubernetes() {
    log_section "Deploying to Kubernetes"
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Would deploy to Kubernetes"
        return 0
    fi
    
    # Check if namespace exists
    if ! kubectl get namespace parking-system &> /dev/null; then
        log_info "Creating namespace parking-system..."
        kubectl create namespace parking-system
    fi
    
    # Apply secrets
    log_info "Applying secrets..."
    kubectl apply -f "$PROJECT_ROOT/infra/kubernetes/secrets.yaml"
    
    # Apply configmaps
    log_info "Applying configmaps..."
    kubectl apply -f "$PROJECT_ROOT/infra/kubernetes/configmap.yaml"
    
    # Apply persistent volume claims
    log_info "Applying persistent volume claims..."
    kubectl apply -f "$PROJECT_ROOT/infra/kubernetes/pvc.yaml"
    
    # Apply services
    log_info "Applying services..."
    kubectl apply -f "$PROJECT_ROOT/infra/kubernetes/service.yaml"
    
    # Apply deployments
    log_info "Applying deployments..."
    
    # Update deployment with environment-specific tags
    sed -i "s/:latest/:$ENVIRONMENT/g" "$PROJECT_ROOT/infra/kubernetes/deployment.yaml"
    
    kubectl apply -f "$PROJECT_ROOT/infra/kubernetes/deployment.yaml"
    
    # Apply ingress
    if [ "$ENVIRONMENT" != "dev" ]; then
        log_info "Applying ingress..."
        kubectl apply -f "$PROJECT_ROOT/infra/kubernetes/ingress.yaml"
    fi
    
    # Apply horizontal pod autoscaler
    if [ "$ENVIRONMENT" == "prod" ]; then
        log_info "Applying horizontal pod autoscaler..."
        kubectl apply -f "$PROJECT_ROOT/infra/kubernetes/hpa.yaml"
    fi
    
    # Apply network policies
    if [ "$ENVIRONMENT" != "dev" ]; then
        log_info "Applying network policies..."
        kubectl apply -f "$PROJECT_ROOT/infra/kubernetes/network-policy.yaml"
    fi
    
    # Wait for deployment to be ready
    log_info "Waiting for deployment to be ready..."
    kubectl rollout status deployment/parking-backend -n parking-system --timeout=5m
    kubectl rollout status deployment/parking-frontend -n parking-system --timeout=5m
    
    log_success "Kubernetes deployment complete"
}

# ============================================================================
# Infrastructure Deployment Functions
# ============================================================================

deploy_infrastructure() {
    log_section "Deploying Infrastructure"
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Would deploy infrastructure with Terraform"
        return 0
    fi
    
    cd "$PROJECT_ROOT/infra/terraform"
    
    # Initialize Terraform
    log_info "Initializing Terraform..."
    terraform init
    
    # Select workspace
    log_info "Selecting workspace: $ENVIRONMENT"
    terraform workspace select $ENVIRONMENT 2>/dev/null || terraform workspace new $ENVIRONMENT
    
    # Plan deployment
    log_info "Planning infrastructure deployment..."
    terraform plan -out=tfplan
    
    # Apply infrastructure
    log_info "Applying infrastructure..."
    terraform apply tfplan
    
    if [ $? -eq 0 ]; then
        log_success "Infrastructure deployment complete"
        rm -f tfplan
    else
        log_error "Infrastructure deployment failed"
        exit 1
    fi
}

# ============================================================================
# Rollback Functions
# ============================================================================

rollback_deployment() {
    log_section "Rolling Back Deployment"
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Would rollback deployment"
        return 0
    fi
    
    confirm_action "Are you sure you want to rollback the deployment?"
    
    # Rollback backend
    log_info "Rolling back backend..."
    kubectl rollout undo deployment/parking-backend -n parking-system
    
    # Rollback frontend
    log_info "Rolling back frontend..."
    kubectl rollout undo deployment/parking-frontend -n parking-system
    
    # Wait for rollback to complete
    log_info "Waiting for rollback to complete..."
    kubectl rollout status deployment/parking-backend -n parking-system --timeout=5m
    kubectl rollout status deployment/parking-frontend -n parking-system --timeout=5m
    
    log_success "Rollback completed successfully"
}

# ============================================================================
# Status Check Functions
# ============================================================================

check_status() {
    log_section "Checking Deployment Status"
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Would check deployment status"
        return 0
    fi
    
    # Check pods
    log_info "Pod Status:"
    kubectl get pods -n parking-system
    
    echo ""
    
    # Check services
    log_info "Service Status:"
    kubectl get svc -n parking-system
    
    echo ""
    
    # Check deployments
    log_info "Deployment Status:"
    kubectl get deployments -n parking-system
    
    echo ""
    
    # Check ingress
    if [ "$ENVIRONMENT" != "dev" ]; then
        log_info "Ingress Status:"
        kubectl get ingress -n parking-system
    fi
    
    echo ""
    
    # Check HPA
    if [ "$ENVIRONMENT" == "prod" ]; then
        log_info "HPA Status:"
        kubectl get hpa -n parking-system
    fi
    
    echo ""
    
    # Check PVCs
    log_info "PVC Status:"
    kubectl get pvc -n parking-system
    
    echo ""
    
    # Check events
    log_info "Recent Events:"
    kubectl get events -n parking-system --sort-by='.lastTimestamp' | tail -10
    
    log_success "Status check complete"
}

# ============================================================================
# Destroy Functions
# ============================================================================

destroy_environment() {
    log_section "Destroying Environment"
    
    if [ "$DRY_RUN" = true ]; then
        log_warning "DRY RUN: Would destroy environment"
        return 0
    fi
    
    if [ "$ENVIRONMENT" == "prod" ]; then
        log_error "Cannot destroy production environment"
        exit 1
    fi
    
    confirm_action "Are you sure you want to destroy the $ENVIRONMENT environment?"
    
    # Destroy Kubernetes resources
    log_info "Destroying Kubernetes resources..."
    kubectl delete -f "$PROJECT_ROOT/infra/kubernetes/" --ignore-not-found
    
    # Destroy infrastructure
    log_info "Destroying infrastructure..."
    cd "$PROJECT_ROOT/infra/terraform"
    terraform destroy -auto-approve
    
    log_success "Environment destroyed successfully"
}

# ============================================================================
# Main Function
# ============================================================================

main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -a|--action)
                ACTION="$2"
                shift 2
                ;;
            -s|--skip-tests)
                SKIP_TESTS=true
                shift
                ;;
            -b|--skip-build)
                SKIP_BUILD=true
                shift
                ;;
            -m|--skip-migrations)
                SKIP_MIGRATIONS=true
                shift
                ;;
            -v|--verbose)
                VERBOSE=true
                shift
                ;;
            -d|--dry-run)
                DRY_RUN=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Validate environment
    if [[ ! "$ENVIRONMENT" =~ ^(dev|staging|prod)$ ]]; then
        log_error "Invalid environment: $ENVIRONMENT"
        show_help
        exit 1
    fi
    
    # Validate action
    if [[ ! "$ACTION" =~ ^(deploy|rollback|destroy|status)$ ]]; then
        log_error "Invalid action: $ACTION"
        show_help
        exit 1
    fi
    
    # Print banner
    log_section "Parking Management System - Deployment"
    log_info "Environment: $ENVIRONMENT"
    log_info "Action: $ACTION"
    log_info "Dry Run: $DRY_RUN"
    log_info "Skip Tests: $SKIP_TESTS"
    log_info "Skip Build: $SKIP_BUILD"
    log_info "Skip Migrations: $SKIP_MIGRATIONS"
    
    # Check dependencies
    check_dependencies
    
    # Setup environment
    setup_environment
    
    # Execute action
    case $ACTION in
        deploy)
            deploy_infrastructure
            build_application
            run_tests
            deploy_kubernetes
            run_migrations
            log_success "Deployment completed successfully!"
            ;;
        rollback)
            rollback_deployment
            log_success "Rollback completed successfully!"
            ;;
        destroy)
            destroy_environment
            log_success "Destroy completed successfully!"
            ;;
        status)
            check_status
            ;;
    esac
}

# ============================================================================
# Script Execution
# ============================================================================

# Trap errors
trap 'log_error "An error occurred on line $LINENO"; exit 1' ERR

# Run main function
main "$@"

exit 0