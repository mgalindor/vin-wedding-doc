---
name: gene2-upgrade-kit
description: "Upgrade gene2 kit , provide the git url of the kit to perform the upgrade"
user-invocable: true
metadata:
    type: skill
    version: "1.1.0"
    updated-at: "2026-05-15"
---

# Upgrade Kit

required input:
- git url of the kit

Very Important: Do not do anything until you have the required inputs, ask for them if you don't have them.


# Steps to perform the upgrade

1. Clone the main branch into a temp folder  Eg. `git clone <url-repositorio> temp`
2. Copy [script](./scripts/upgrade-kit.js) into the root of the workspace
3. Execute the nodejs script `upgrade-kit.js`
4. Print the output of the script
5. Delete the `upgrade-kit.js` script in the root of the workspace


# Verification
- Verify the temp folder was deleted after the process
- Verify the `upgrade-kit.js` is deleted