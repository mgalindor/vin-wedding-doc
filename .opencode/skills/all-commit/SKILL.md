---
name: all-commit
description: 'use when you need to generate a commit message for all staged changes'
metadata:
    type: skill
    version: "1.0.0"
    updated-at: "2026-08-11"
---


- Use conventional commit format.
- Base the message ONLY on staged changes — ignore unstaged or untracked files. 
- The type is determined ONLY by the file extension and folder, never by whether content is new or updated. 
- Rules: 
    - `docs` for .md, .txt, prompts, skills, templates, AI instructions, guidelines — even if they are brand new files; 
    - `chore` for settings, config, .gitkeep, .gitignore, tooling; 
    - `ci` for pipeline/workflow files; 
    - `feat` ONLY for application source code (.ts, .js, .py, .cs, .java, etc.) that adds a new user-facing capability; 
    - `fix` ONLY for source code that corrects a bug. When a commit mixes docs and chore, use `docs`. 
- Write subject in imperative mood, lowercase, no period. Always include a bullet list body with only the most relevant staged changes — skip trivial files like .gitkeep.

Example commit message:

```
feat(auth): add user authentication module
```

```
feat(user-profile): implement profile picture upload
- add endpoint , service and database for uploading profile pictures
- add connection with s3 bucket for storing images
```

```
feat!: drop support for Node 6

BREAKING CHANGE: use JavaScript features not available in Node 6.
```
