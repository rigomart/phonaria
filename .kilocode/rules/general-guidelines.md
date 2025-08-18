# general-guidelines.md

General instructions that you must absolutely follow.

## Guidelines
- Do not include inline comments in code, unless the complexity makes it absolutely necessary.
- Use consistent naming conventions and coding styles: 
  - camelCase for variables and functions
  - PascalCase for classes, components and types
  - UPPER_SNAKE_CASE for constants
  - kebab-case for filenames
- You can read .env.example files to know what environment variables exist in the project.
- DO NOT READ any other .env file apart from the specified previously as they may contain sensitive info.
- DO NOT add new dependencies editing the package.json directly. Prefer the use of commands like `pnpm add <dependency_name>`.

### TypeScript Guidelines
- Prefer the use of types instead of interfaces.
- Prefer type unions instead of extending interfaces.
- AVOID the use of `any`.