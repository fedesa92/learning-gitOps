#!/usr/bin/env bash

set -euo pipefail

echo "Checking the Kubernetes environment..."

echo
echo "kubectl:"
kubectl version --client

echo
echo "Kind:"
kind version

echo
echo "Kubernetes contexts:"
kubectl config get-contexts

if kind get clusters | grep -qx "bookstore"; then
  echo
  echo "BookStore Kind cluster:"
  kubectl cluster-info --context kind-bookstore
  kubectl get nodes --context kind-bookstore
else
  echo
  echo "The Kind cluster 'bookstore' does not exist yet."
  echo "Create it with: ./scripts/kind-create.sh"
fi

echo
echo "Kubernetes environment check completed."
