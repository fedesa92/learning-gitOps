#!/usr/bin/env bash

set -euo pipefail

ARGOCD_NAMESPACE="${ARGOCD_NAMESPACE:-argocd}"
TEKTON_NAMESPACE="${TEKTON_NAMESPACE:-tekton-pipelines}"

echo "Checking the GitOps and CI environment..."

echo
echo "Argo CD CLI:"
if command -v argocd >/dev/null 2>&1; then
  argocd version --client
else
  echo "Argo CD CLI is not installed. This client is optional."
fi

echo
echo "Argo CD namespace:"
if kubectl get namespace "${ARGOCD_NAMESPACE}" >/dev/null 2>&1; then
  kubectl get pods -n "${ARGOCD_NAMESPACE}"
else
  echo "Namespace '${ARGOCD_NAMESPACE}' was not found."
fi

echo
echo "Tekton Pipelines namespace:"
if kubectl get namespace "${TEKTON_NAMESPACE}" >/dev/null 2>&1; then
  kubectl get pods -n "${TEKTON_NAMESPACE}"
else
  echo "Namespace '${TEKTON_NAMESPACE}' was not found."
fi

echo
echo "GitOps and CI environment check completed."
