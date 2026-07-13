#!/usr/bin/env bash

set -e

echo "Checking development environment..."

echo
echo "Operating system:"
cat /etc/os-release | grep -E 'NAME=|VERSION='

echo
echo "Git:"
git --version

echo
echo "Java:"
java -version

echo
echo "Maven:"
mvn -version

echo
echo "Node:"
node -v

echo
echo "npm:"
npm -v

echo
echo "Docker:"
docker version --format '{{.Server.Version}}'

echo
echo "Docker Compose:"
docker compose version

echo
echo "kubectl:"
kubectl version --client

echo
echo "kind:"
kind version

echo
echo "Docker hello-world test:"
docker run --rm hello-world >/dev/null

echo
echo "Environment check completed successfully."

