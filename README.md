# learning-gitOps
Project for learning and make practice on localhost using GitOps approach with OpenShift, k8s, tekton, docker, argoCD

# Rule sets
Projects collaborators cannot push directly on main branch

# Versioning
Project uses semantic versioning with format MAJOR.MINOR.PATCH

EXAMPLE:
```bash
1.0.0
1.1.0
1.1.1
2.0.0
```

EXPLANATION:
- MAJOR: important changes or breaking changes;
- MINOR: new compliant features;
- PATCH: bug fix.

Every release on main branch need to be associated with Git TAG:
```bash
  git tag v1.1.0
  git push origin v1.1.0
```

# Branch strategy inspired by GitFlow strategy
This project uses a branch strategy designed to keep developments organized, manage release on production and reduce updates not verified on primary branches like main, develop.

The strategy is based on these branch:
- main
- develop
- feature/*
- bugfix/*
- hotfix/*

---

Primary branches

`main`

Main branch represents the code currently released on production. 
<br/>
<b>Main Rules</b>:
- it contains only stable codes and can be released;
- direct push is not allowed;
- force push is not allowed;
- changes arrives only through Pull Request;
- merge on main can be executed only by admin or by authorized maintainer;
- every merge into main must come from develop, `release/*` or `hotfix/*` branch;

Every version released on production must be identified by git tag, for example
```bash
  v1.0.0
  v1.1.0
```

`develop`

Develop branch represents integrated development environment. On this branch there are 
updates coming from:
- branch feature/*
- branch bugfix/*
<br/>
<b>Main Rules</b>:
- is not allowed direct push;
- updates must arrives through Pull Request;
- before merge from Pull Request must be completed some checks like build, automated tests passed successfully and code review;
- branch must always remain in working state.

When `develop` contains a set of stable feature in state ready for release, it can be merged



---

Working branches

`feature/*`

`bugfix/*`

---

Branch for make hotfix on production

`hotfix/*`

---

Pull Request
