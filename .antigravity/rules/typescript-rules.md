# Development Rules: TypeScript Strict Standards

These rules enforce high code quality, typing strictness, and asynchronous patterns in TypeScript.

---

## 🚫 Rule 1: Strict Typings & No 'any'
* **Constraint**: Loose typing leads to runtime crashes, which are unacceptable in production Discord bots.
* **Requirements**:
  - The use of `any` (or `any[]`) is strictly forbidden.
  - If a type is unknown (e.g. database payload, API response), use `unknown` and validate it using custom type-guards or schema libraries.
  - Use clear interface definitions for configurations, events, and command structures.

---

## 🧵 Rule 2: Floating Promise Avoidance
* **Constraint**: Floating promises that are not awaited or handled can lead to unhandled rejections and memory leaks.
* **Requirements**:
  - All operations returning a Promise must be awaited or handled.
  - If a promise is deliberately meant to run asynchronously in the background, prefix it with `void`:
    ```typescript
    // Correct way to ignore floating promise
    void refreshCache(client);
    ```
  - Ensure all asynchronous calls are wrapped in `try/catch` blocks.

---

## ⚙️ Rule 3: Strict tsconfig parameters
* **Constraint**: Maintain compiler safety.
* **Requirements**:
  - The `tsconfig.json` must always have the following properties set to `true`:
    - `"strict": true`
    - `"noImplicitAny": true`
    - `"strictNullChecks": true`
    - `"noUnusedLocals": true`
    - `"noUnusedParameters": true`

---

## 📝 Rule 4: File and Class Naming Conventions
* **Constraint**: Consistent naming aids readability and modular loading.
* **Requirements**:
  - **Files**: Use kebab-case for file names (e.g., `guild-settings.service.ts`, `autorole-config.ts`).
  - **Classes**: Use PascalCase (e.g., `GuildSettingsService`, `AutoRoleConfigManager`).
  - **Variables/Functions**: Use camelCase (e.g., `refreshCounter`, `isStringArray`).
