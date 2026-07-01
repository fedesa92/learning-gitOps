# learning-gitOps
Project for learning and make practice on localhost using GitOps approach with OpenShift, k8s, tekton, docker, argoCD

# Rule sets
Projects collaborators and admin cannot push directly on main branch

# Versioning
Project uses semantic versioning with format MAJOR.MINOR.PATCH

EXAMPLE:
1.0.0
1.1.0
1.1.1
2.0.0

EXPLANATION:
- MAJOR: important changes or breaking changes;
- MINOR: new compliant features;
- PATCH: bug fix.

Every release on main branch need to be associated with Git TAG:

git tag v1.1.0
git push origin v1.1.0

# Branch strategy inspired by GitFlow strategy
