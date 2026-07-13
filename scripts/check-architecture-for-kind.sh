#!/usr/bin/env bash

set -euo pipefail

KIND_VERSION="$(
  curl -fsSL https://api.github.com/repos/kubernetes-sigs/kind/releases/latest |
  grep '"tag_name":' |
  cut -d '"' -f 4
)"

ARCH="$(dpkg --print-architecture)"

case "$ARCH" in
  amd64)
    KIND_ARCH="amd64"
    ;;
  arm64)
    KIND_ARCH="arm64"
    ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

KIND_URL="https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-${KIND_ARCH}"

echo "Kind version: $KIND_VERSION"
echo "Downloading: $KIND_URL"

curl -fL -o /tmp/kind "$KIND_URL"

chmod +x /tmp/kind
sudo install /tmp/kind /usr/local/bin/kind
rm /tmp/kind

kind version

