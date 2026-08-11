# Step 2: Configuration Style

## Goal

Document how the component manages its configuration — where settings live, how they are loaded, and what patterns are used.

## What to Discover

Identify which configuration mechanisms the component uses. A component may use one or several of these:

1. **Configuration files**: YAML, JSON, XML, `.properties`, `.ini`, `.toml`, `.env` files
2. **Environment variables**: Settings read from the OS environment at runtime
3. **External configuration systems**: Consul, etcd, HashiCorp Vault, AWS Parameter Store, Spring Cloud Config, etc.
4. **Code-based configuration**: Constants, enums, or hardcoded values in source code
5. **Database-stored configuration**: Settings stored and managed through a database
6. **Command-line arguments**: Parameters passed at startup

## How to Explore

- Search for common config files: `application.yml`, `application.properties`, `config.json`, `.env`, `.env.example`, `appsettings.json`, `config/`
- Grep for environment variable access patterns:
  - Java/Kotlin: `System.getenv`, `@Value("${`, `@ConfigurationProperties`
  - Node/TypeScript: `process.env`, `dotenv`, `config.get`
  - Python: `os.environ`, `os.getenv`, `pydantic.BaseSettings`
  - .NET: `IConfiguration`, `Environment.GetEnvironmentVariable`
- Look for external config client libraries in dependencies (Consul, Vault, Spring Cloud Config, etc.)
- Check for config profiles or environment-specific files (e.g., `application-dev.yml`, `application-prod.yml`)
- Note the presence of secrets management (Vault references, encrypted files, sealed secrets)

## Key Questions This Step Must Answer

- Where does the component get its configuration at runtime — local files, environment variables, or an external system?
- Is there a clear separation of configuration per environment (dev, staging, prod)?
- Are secrets (passwords, API keys, tokens) managed securely, or are there hardcoded values in the codebase?
- Does the component depend on an external configuration system (Vault, Consul) to start? What is the risk if that system is unavailable?
- Is configuration centralized in one mechanism or scattered across multiple?

## Notes

- If secrets appear to be hardcoded or committed to source control, flag this as a concern
- Note whether configuration is centralized (one place) or scattered across multiple mechanisms
- If there are environment profiles (dev, staging, prod), list them
