#!/usr/bin/env bash

set -e

CLUSTER_NAME="bookstore"

echo "Creating Kind cluster: ${CLUSTER_NAME}"

kind create cluster --name "${CLUSTER_NAME}"

kubectl cluster-info
kubectl get nodes

echo "Kind cluster '${CLUSTER_NAME}' is ready."
