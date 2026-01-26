# Manual steps execution for recovery
set -e

# Configuration
IMAGE_NAME="ghcr.io/budd9442/sees-ui:latest"
KUBECONFIG=/etc/rancher/k3s/k3s.yaml

echo "Building Docker image..."
sudo docker build -t $IMAGE_NAME .

echo "Saving Docker image..."
sudo docker save $IMAGE_NAME -o sees-ui.tar

echo "Importing image into K3s..."
sudo k3s ctr images import sees-ui.tar

echo "Creating Secrets (using default local values)..."
# Check if secret exists, delete if so to update
if sudo kubectl --kubeconfig $KUBECONFIG get secret sees-secrets > /dev/null 2>&1; then
    sudo kubectl --kubeconfig $KUBECONFIG delete secret sees-secrets
fi

sudo kubectl --kubeconfig $KUBECONFIG create secret generic sees-secrets \
    --from-literal=POSTGRES_USER='sees_user' \
    --from-literal=POSTGRES_PASSWORD='sees_password' \
    --from-literal=POSTGRES_DB='sees_db' \
    --from-literal=DATABASE_URL='postgresql://sees_user:sees_password@sees-postgres:5432/sees_db' \
    --from-literal=NEXTAUTH_SECRET='local_dev_secret_123' \
    --from-literal=NEXTAUTH_URL='https://sees.budd.codes' \
    --from-literal=BREVO_API_KEY="${BREVO_API_KEY:-}" \
    --from-literal=BREVO_SENDER_EMAIL='noreply@sees.budd.codes' \
    --from-literal=BREVO_SENDER_NAME='SEES Platform'

echo "Applying Manifests..."
sudo kubectl --kubeconfig $KUBECONFIG apply -f k8s/

echo "Restarting Deployment..."
sudo kubectl --kubeconfig $KUBECONFIG rollout restart deployment/sees-ui

echo "Deployment initiated. Check status with: kubectl get pods -l app=sees-ui"
