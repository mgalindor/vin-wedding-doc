# Step 1: Repository Overview

## Goal

Produce a high-level technical overview of the component: what it is built with, how it runs, and what its main dependencies are.

## What to Discover

Explore the component root directory and its project descriptor files to identify:

1. **Programming language(s)**: Primary and secondary languages used in the codebase
2. **Runtime target**: e.g., JVM 17, Node 20, Python 3.12, .NET 8, Go 1.22
3. **Execution platform**: e.g., Linux container (Docker), Kubernetes, AWS Lambda, bare metal, Windows Service
4. **Build tool and dependency manager**: e.g., Maven, Gradle, npm, pnpm, pip, uv, poetry, Cargo
5. **Frameworks and libraries**: List the key ones with a brief note on their purpose

## How to Explore

- Read the project descriptor file (`pom.xml`, `package.json`, `build.gradle`, `Cargo.toml`, `pyproject.toml`, `go.mod`, etc.)
- Read `Dockerfile` or `docker-compose.yaml` if present — they reveal runtime and platform
- Check for CI/CD config files (`.github/workflows/`, `Jenkinsfile`, `.gitlab-ci.yml`) for build hints
- Read the project's `README.md` if it exists for setup instructions
- Scan the top-level directory structure to understand code organization

## Key Questions This Step Must Answer

- What language(s) and version(s) is this component written in?
- What is the runtime target (JVM, Node.js, Python interpreter, .NET CLR, Go binary, etc.) and its version?
- Where does this component run — container, Kubernetes pod, Lambda function, bare metal server, Windows Service?
- What tool manages the build and dependency resolution?
- What are the key frameworks and what specific purpose does each serve in this codebase?
- Are there multiple languages or hybrid runtimes in the same component?

## Notes

- List only the **significant** frameworks/libraries — not every transitive dependency
- If the version is determinable from the descriptor file, include it
- If multiple languages are present (e.g., Java + Kotlin), note both
- This section is critical because it informs ALL subsequent steps — every future subagent will read this section to know what technologies to expect
