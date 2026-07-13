#!/usr/bin/env bash

set -euo pipefail

echo "Checking the Helm environment..."

helm version

echo
echo "Helm environment check completed successfully."
