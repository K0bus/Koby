# Development Rules: Project Structure & Module Organization

These rules dictate how code files must be organized, how modules are loaded, and how handlers route incoming traffic.

---

## 📁 Rule 1: Folder Organization
The codebase must be structured as follows:

```
src/
├── bot/                # Core client setup & command registration
├── config/             # Config schemas, fallbacks & validation
│   ├── base/           # Base configuration classes (GuildModuleConfig)
│   └── managers/       # Feature-specific config managers
├── db/                 # Database services (Prisma client & GuildSettings)
├── modules/            # Feature-specific modules
│   ├── base/           # BaseModule abstract class definition
│   ├── commands/       # Subfolders per feature containing slash commands
│   ├── events/         # Subfolders per feature containing event listeners
│   ├── managers/       # Module definition files registering commands/events
│   └── services/       # Core business logic services
├── types/              # Type and interface definitions
└── utils/              # General helper and utility functions
```

---

## 🔄 Rule 2: Modular Architecture Enforcement
* **Constraint**: Features must be fully isolated inside modules.
* **Requirements**:
  - A feature is defined as a module (e.g. `AutoRole`).
  - All commands, events, and business services related to `AutoRole` must be defined inside their respective directories (`src/modules/commands/autorole/`, `src/modules/events/autorole/`, `src/modules/services/autorole-service.ts`).
  - The module manager file `src/modules/managers/autorole-module.ts` must extend `BaseModule` and register the commands and events.
  - The module must be registered in the global list of modules inside `src/modules/index.ts`.

---

## 🏎️ Rule 3: Single Listener Command Handler (Optimized Routage)
* **Constraint**: Registering a separate `Events.InteractionCreate` listener for every command causes memory leaks and latency.
* **Requirements**:
  - Implement a central command registry using `Collection<string, BotCommand>` attached to the custom `BotClient` class.
  - Register a **single** global interaction listener for `Events.InteractionCreate` in `src/bot/client.ts` or `src/modules/index.ts`.
  - Look up the incoming interaction's command name in the registry in $O(1)$ and execute it.
