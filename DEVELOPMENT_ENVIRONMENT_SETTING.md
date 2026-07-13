# Development Environment Setup

This document defines the standard local development environment for the **BookStore Platform** project.

The goal is to allow all contributors to run, test and evolve the MVP consistently on:

- Ubuntu Linux 24.04 LTS
- Windows 11 with WSL2 + Ubuntu 24.04 LTS

All project commands should be written assuming a **Linux-like shell**.

On Windows, contributors must run commands inside **WSL2 Ubuntu 24.04 LTS**, not in classic Command Prompt.

---

## 1. Supported Development Environments

### Linux

The reference Linux distribution for this project is:

```text
Ubuntu 24.04 LTS
```

Contributors using Linux should use Ubuntu 24.04 LTS whenever possible.

This distribution is chosen because it is:

- Long Term Support (LTS)
- widely documented
- well supported by Docker, Kubernetes, Kind and VS Code
- aligned with the Windows WSL2 setup used by the rest of the team

Expected shell:

```bash
bash
```

or:

```bash
zsh
```

### Windows

The reference Windows development environment is:

```text
Windows 11
Windows Terminal
WSL2
Ubuntu 24.04 LTS
Docker Desktop with WSL2 integration
VS Code with Remote WSL extension
```

Windows users should work inside the Ubuntu WSL2 terminal.

Do not run project commands from `cmd.exe`.

Do not use classic Windows paths as the primary workspace.

Recommended workspace location:

```text
/home/<user>/projects/bookstore-platform
```

Avoid working from Windows paths such as:

```text
C:\Users\<user>\Desktop\bookstore-platform
```

when running commands from WSL2.

---

## 2. Install Ubuntu 24.04 LTS on Windows with WSL2

Open **PowerShell as Administrator** and verify that WSL is available:

```powershell
wsl --status
```

Check the list of installed distributions and their WSL version:

```powershell
wsl --list --verbose
```

If no distributions are installed, Windows may display:

```text
Windows Subsystem for Linux has no installed distributions.
```

This is expected on a new machine.

List the distributions available online:

```powershell
wsl --list --online
```

Install Ubuntu 24.04 LTS:

```powershell
wsl --install -d Ubuntu-24.04
```

If Windows asks for a restart, restart the machine.

After the installation, verify that Ubuntu uses WSL2:

```powershell
wsl --list --verbose
```

Expected result:

```text
  NAME            STATE           VERSION
* Ubuntu-24.04    Stopped         2
```

The `VERSION` column must show `2`.

If Ubuntu is using WSL1, convert it:

```powershell
wsl --set-version Ubuntu-24.04 2
```

Set WSL2 as the default for future distributions:

```powershell
wsl --set-default-version 2
```

Open **Ubuntu 24.04 LTS** from Windows Terminal.

On first start, Ubuntu will ask for:

```text
Enter new UNIX username:
Enter new UNIX password:
Retype new UNIX password:
```

Verify that Ubuntu is running correctly:

```bash
uname -a
```

Verify the Ubuntu version:

```bash
cat /etc/os-release
```

Expected result should include:

```text
VERSION="24.04 LTS (Noble Numbat)"
```

---

## 3. Required Tools

The project uses two categories of tools:

1. **Host tools**, installed on the contributor's workstation or WSL2 environment.
2. **In-cluster tools**, installed later inside Kubernetes or OpenShift.

### 3.1 Host tools

| Tool | Purpose | Required stage |
|------|---------|----------------|
| Git | Source control | Initial setup |
| Docker | Container runtime | MVP |
| Docker Compose | Local multi-container environment | MVP |
| Java 21 | Spring Boot backend | MVP |
| Maven | Java build tool | MVP |
| Node.js LTS | React frontend | MVP |
| npm | Frontend package manager | MVP |
| kubectl | Kubernetes command-line client | Kubernetes |
| Kind | Local Kubernetes cluster | Kubernetes |
| Helm | Kubernetes package manager | Helm |
| Argo CD CLI | Optional command-line client for Argo CD | GitOps |
| VS Code | Recommended editor | Initial setup |

### 3.2 In-cluster tools

These components are not installed as ordinary Ubuntu applications. They are deployed inside Kubernetes or OpenShift when the relevant chapter is reached.

| Tool | Purpose | Required stage |
|------|---------|----------------|
| Argo CD | GitOps continuous delivery controller | GitOps |
| Tekton Pipelines | Kubernetes-native CI pipelines | CI |
| Tekton Triggers | GitHub webhook processing | CI |
| OpenShift GitOps | Red Hat distribution of Argo CD | OpenShift GitOps |
| OpenShift Pipelines | Red Hat distribution of Tekton | OpenShift CI |

The Argo CD CLI is optional. The Argo CD server and controllers still run inside the cluster.

---

## 4. Recommended Versions

Use stable or LTS versions whenever possible.

| Tool | Recommended Version |
|------|---------------------|
| Operating System | Ubuntu 24.04 LTS |
| Java | 21 LTS |
| Maven | 3.9.x or newer |
| Node.js | Active LTS |
| Docker | Latest stable |
| Docker Compose | v2 |
| kubectl | Stable version compatible with the local cluster |
| Kind | Latest stable |
| Helm | Latest stable |
| Argo CD CLI | Version compatible with the installed Argo CD server |

Do not use experimental versions for the main laboratory.

The exact versions used by the project should eventually be recorded in a version file or bootstrap script so every contributor can reproduce the same environment.

---

## 5. Linux Setup Checklist

This checklist applies to native Linux users using **Ubuntu 24.04 LTS**.

Update the package index:

```bash
sudo apt update
```

Install base utilities:

```bash
sudo apt install -y \
  git \
  curl \
  wget \
  unzip \
  ca-certificates \
  gnupg \
  lsb-release
```

---

## 6. Windows Setup Checklist

### 6.1 Verify WSL2 from PowerShell

Open **PowerShell as Administrator**.

Check WSL status:

```powershell
wsl --status
```

Check installed distributions and their WSL version:

```powershell
wsl --list --verbose
```

Expected result after Ubuntu installation:

```text
  NAME            STATE           VERSION
* Ubuntu-24.04    Running         2
```

### 6.2 Install Docker Desktop

Install Docker Desktop on Windows.

Enable WSL2 integration:

```text
Docker Desktop
↓
Settings
↓
Resources
↓
WSL Integration
↓
Enable integration with Ubuntu-24.04
```

Docker Engine must not be installed separately inside WSL2 when using Docker Desktop.

After enabling the integration, open Ubuntu and verify:

```bash
docker version
docker compose version
```

If Docker works from Windows but not from Ubuntu, the WSL integration is not configured correctly.

### 6.3 Install VS Code Remote WSL

Install Visual Studio Code and the **WSL** extension.

Open the project from Ubuntu:

```bash
cd ~/projects/bookstore-platform
code .
```

VS Code should display:

```text
WSL: Ubuntu-24.04
```

in the bottom-left corner.

---

## 7. Repository Location

All contributors should clone the repository inside their Linux environment.

Linux and Windows with WSL2:

```bash
mkdir -p ~/projects
cd ~/projects
git clone <repository-url> bookstore-platform
cd bookstore-platform
```

Do not clone the repository into a Windows filesystem path if you plan to run Docker, Maven, npm or Kind from WSL2.

---

## 8. Install the Development Tools

Complete this section before running `scripts/check-env.sh`.

The verification script assumes that Java, Maven, Node.js, npm, Docker, Docker Compose, kubectl and Kind are already available.

### 8.1 Update Ubuntu and install base utilities

Run:

```bash
sudo apt update
sudo apt upgrade -y
```

Install the utilities required by the following steps:

```bash
sudo apt install -y \
  git \
  curl \
  wget \
  unzip \
  ca-certificates \
  gnupg \
  lsb-release
```

Verify Git:

```bash
git --version
```

### 8.2 Install Java 21

Install the Java 21 Development Kit:

```bash
sudo apt install -y openjdk-21-jdk
```

Verify the installation:

```bash
java -version
javac -version
```

Both commands should report version `21`.

### 8.3 Install Maven

Install Maven from the Ubuntu package repository:

```bash
sudo apt install -y maven
```

Verify the installation:

```bash
mvn -version
```

The output should show Maven and Java 21.

### 8.4 Install Node.js and npm

Use the Node Version Manager so the project can switch Node.js versions without modifying the operating system packages.

Install `nvm`:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash
```

Load `nvm` in the current shell:

```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

Install the latest LTS release:

```bash
nvm install --lts
nvm use --lts
nvm alias default 'lts/*'
```

Verify Node.js and npm:

```bash
node -v
npm -v
```

If the `nvm` command is not available after installation, close and reopen the Ubuntu terminal.

### 8.5 Verify Docker and Docker Compose

#### Windows with WSL2

Docker is provided by Docker Desktop.

Do not install a second Docker Engine inside Ubuntu.

Verify from the Ubuntu terminal:

```bash
docker version
docker compose version
```

Test the container runtime:

```bash
docker run --rm hello-world
```

If the `docker` command is unavailable:

1. start Docker Desktop;
2. open Docker Desktop settings;
3. enable WSL Integration for `Ubuntu-24.04`;
4. close and reopen the Ubuntu terminal.

#### Native Ubuntu Linux

Native Linux contributors must install Docker Engine and the Docker Compose plugin using Docker's official Ubuntu installation procedure.

After installation, verify:

```bash
docker version
docker compose version
docker run --rm hello-world
```

Depending on the Docker configuration, native Linux users may initially need `sudo`.

Do not add the user to the `docker` group without understanding that it grants root-equivalent privileges.

### 8.6 Install kubectl

Detect the machine architecture:

```bash
dpkg --print-architecture
```

Typical results are:

```text
amd64
```

or:

```text
arm64
```

Store the architecture in a variable:

```bash
ARCH="$(dpkg --print-architecture)"
```

Download the current stable kubectl binary:

```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/${ARCH}/kubectl"
```

Install it:

```bash
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
rm kubectl
```

Verify the installation:

```bash
kubectl version --client
```

### 8.7 Install Kind

Detect the architecture:

```bash
ARCH="$(dpkg --print-architecture)"
```

Map the Ubuntu architecture name to the Kind binary name, create a script
for check and download correct version of kind:

```bash
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
```

Verify the installation:

```bash
kind version
```

### 8.8 Install Helm

Helm is a command-line tool installed on the host. It will be used later to package and deploy Kubernetes applications.

Install Helm by using the official installation script:

```bash
curl -fsSL -o get_helm.sh \
  https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3

chmod 700 get_helm.sh
./get_helm.sh
rm get_helm.sh
```

Verify the installation:

```bash
helm version
```

Helm is installed during the environment setup even though it is not required for the first MVP.

### 8.9 Optional: install the Argo CD CLI

The Argo CD server and controllers will be installed inside the Kubernetes or OpenShift cluster in a later chapter.

The local CLI is optional but useful for login, synchronization and troubleshooting.

Detect the machine architecture:

```bash
ARCH="$(dpkg --print-architecture)"
```

Map the architecture name:

```bash
case "$ARCH" in
  amd64) ARGO_ARCH="amd64" ;;
  arm64) ARGO_ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac
```

Download the latest stable Argo CD CLI:

```bash
ARGOCD_VERSION="$(curl -s \
  https://api.github.com/repos/argoproj/argo-cd/releases/latest \
  | grep '"tag_name":' \
  | cut -d '"' -f 4)"

curl -sSL -o argocd \
  "https://github.com/argoproj/argo-cd/releases/download/${ARGOCD_VERSION}/argocd-linux-${ARGO_ARCH}"
```

Install the binary:

```bash
chmod +x argocd
sudo mv argocd /usr/local/bin/argocd
```

Verify the installation:

```bash
argocd version --client
```

This CLI check does not verify an Argo CD server because the in-cluster installation has not been performed yet.

### 8.10 Final manual verification

Run every command below before using the automated check scripts:

```bash
git --version
java -version
javac -version
mvn -version
node -v
npm -v
docker version
docker compose version
kubectl version --client
kind version
helm version
argocd version --client
docker run --rm hello-world
```

The Argo CD CLI command may be skipped when the optional client has not been installed.

Do not continue until every required command completes successfully.

---

## 9. Progressive Environment Verification Scripts

The project uses progressive checks because not every tool is required from the first chapter.

The repository should contain:

```text
scripts/
  check-env.sh
  check-kubernetes-env.sh
  check-helm-env.sh
  check-gitops-env.sh
```

### 9.1 Base development check

`scripts/check-env.sh` verifies the tools required to build and run the MVP with Docker Compose.

```bash
#!/usr/bin/env bash

set -euo pipefail

echo "Checking the base development environment..."

echo
echo "Operating system:"
grep -E '^(NAME|VERSION)=' /etc/os-release

echo
echo "Git:"
git --version

echo
echo "Java:"
java -version

echo
echo "Java compiler:"
javac -version

echo
echo "Maven:"
mvn -version

echo
echo "Node.js:"
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
echo "Docker hello-world test:"
docker run --rm hello-world >/dev/null

echo
echo "Base development environment check completed successfully."
```

### 9.2 Kubernetes check

`scripts/check-kubernetes-env.sh` verifies the host tools and local cluster required by the Kubernetes chapter.

```bash
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
```

### 9.3 Helm check

`scripts/check-helm-env.sh` verifies the Helm client.

```bash
#!/usr/bin/env bash

set -euo pipefail

echo "Checking the Helm environment..."

helm version

echo
echo "Helm environment check completed successfully."
```

### 9.4 GitOps and CI check

`scripts/check-gitops-env.sh` verifies the optional Argo CD client and the in-cluster Argo CD and Tekton installations.

Run this script only after the GitOps and CI components have been installed in the cluster.

```bash
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
```

Create the scripts:

```bash
mkdir -p scripts
```

After creating each file, make all scripts executable:

```bash
chmod +x scripts/check-env.sh
chmod +x scripts/check-kubernetes-env.sh
chmod +x scripts/check-helm-env.sh
chmod +x scripts/check-gitops-env.sh
```

Run only the check appropriate for the current stage:

```bash
./scripts/check-env.sh
./scripts/check-kubernetes-env.sh
./scripts/check-helm-env.sh
./scripts/check-gitops-env.sh
```

A failed command identifies the missing or incorrectly configured component.

---

## 10. Local Kubernetes Cluster

The project uses **Kind** as the default local Kubernetes environment.

Create a local cluster:

```bash
kind create cluster --name bookstore
```

Verify it:

```bash
kubectl cluster-info
kubectl get nodes
```

Expected node status:

```text
Ready
```

Delete the cluster when needed:

```bash
kind delete cluster --name bookstore
```

---

## 11. Kind Helper Scripts

The repository should contain:

```text
scripts/
  kind-create.sh
  kind-delete.sh
```

### `scripts/kind-create.sh`

```bash
#!/usr/bin/env bash

set -e

CLUSTER_NAME="bookstore"

echo "Creating Kind cluster: ${CLUSTER_NAME}"

kind create cluster --name "${CLUSTER_NAME}"

kubectl cluster-info
kubectl get nodes

echo "Kind cluster '${CLUSTER_NAME}' is ready."
```

### `scripts/kind-delete.sh`

```bash
#!/usr/bin/env bash

set -e

CLUSTER_NAME="bookstore"

echo "Deleting Kind cluster: ${CLUSTER_NAME}"

kind delete cluster --name "${CLUSTER_NAME}"

echo "Kind cluster '${CLUSTER_NAME}' deleted."
```

Make both scripts executable:

```bash
chmod +x scripts/kind-create.sh
chmod +x scripts/kind-delete.sh
```

---

## 12. Project Command Standard

All commands in the book and in repository documentation must assume:

```text
Ubuntu 24.04 LTS / WSL2 Ubuntu 24.04 LTS shell
```

Examples should use Bash syntax:

```bash
./scripts/check-env.sh
```

PowerShell is used only for installing and managing WSL itself.

---

## 13. MVP Local Run Strategy

The first MVP should be runnable in two modes.

### Mode 1 — Docker Compose

Used in the first part of the book.

```bash
docker compose up -d
```

Expected services:

```text
frontend
backend
postgres
```

### Mode 2 — Kubernetes with Kind

Used starting from the Kubernetes chapter.

```bash
kind create cluster --name bookstore
kubectl apply -f kubernetes/
```

The Kubernetes deployment will be introduced progressively.

---

## 14. Repository Structure

Recommended initial structure:

```text
bookstore-platform/
├── PROJECT_SPEC.md
├── ARCHITECTURE.md
├── DEVELOPMENT_ENVIRONMENT.md
├── README.md
├── .gitignore
├── .env.example
├── frontend/
├── backend/
├── database/
├── docker/
├── kubernetes/
├── helm/
├── openshift/
├── tekton/
├── argocd/
├── scripts/
│   ├── check-env.sh
│   ├── check-kubernetes-env.sh
│   ├── check-helm-env.sh
│   ├── check-gitops-env.sh
│   ├── kind-create.sh
│   └── kind-delete.sh
└── documentation/
```

The `argocd/` and `tekton/` directories contain declarative resources for components that run inside the cluster. They do not replace the optional host CLIs.

## 15. Official References

- Ubuntu 24.04 LTS: https://releases.ubuntu.com/24.04/
- Microsoft WSL documentation: https://learn.microsoft.com/windows/wsl/
- Docker Desktop WSL2 backend: https://docs.docker.com/desktop/features/wsl/
- Docker with WSL2: https://docs.docker.com/desktop/features/wsl/use-wsl/
- Docker Engine on Ubuntu: https://docs.docker.com/engine/install/ubuntu/
- Docker Compose documentation: https://docs.docker.com/compose/
- Node.js downloads: https://nodejs.org/en/download
- NVM repository: https://github.com/nvm-sh/nvm
- Kubernetes install tools: https://kubernetes.io/docs/tasks/tools/
- Install kubectl on Linux: https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/
- Kind quick start: https://kind.sigs.k8s.io/docs/user/quick-start/
- Helm documentation: https://helm.sh/docs/
- Installing Helm: https://helm.sh/docs/intro/install/
- Argo CD documentation: https://argo-cd.readthedocs.io/
- Argo CD CLI installation: https://argo-cd.readthedocs.io/en/stable/cli_installation/
- Tekton Pipelines documentation: https://tekton.dev/docs/pipelines/
- Tekton Triggers documentation: https://tekton.dev/docs/triggers/
- Kind on WSL2: https://kind.sigs.k8s.io/docs/user/using-wsl2/
- VS Code Remote Development: https://code.visualstudio.com/docs/remote/remote-overview
