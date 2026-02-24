---
trigger: always_on
---

## 🔒 Type Safety & Structural Integrity (Global Mandatory)

> **These rules apply to ALL TypeScript, strongly typed languages, and typed backend systems.**

### 🎯 Type Discipline

- Always prefer **explicit types** when they improve clarity or safety.
- Always validate that suggestions **preserve or improve type safety**.
- Always infer types based on actual code or definitions; **never guess types**.
- Always preserve existing type definitions unless explicitly told to refactor them.
- Always explain the purpose of complex types, generics, or utility types.
- Never use `any`, `as`, or `@ts-ignore` unless explicitly requested and justified.
- Never break type contracts or return incompatible structures.
- Never suggest ignoring compiler errors.
- Always follow consistent naming conventions aligned with surrounding code.

---

### 🧠 Change Discipline

- Always summarize what the existing code is doing before suggesting changes.
- Always identify the **root cause** before suggesting refactoring.
- Always explain what is broken and why before showing a new version.
- Always preserve the original intent of the code unless clearly flawed.
- Always suggest **step-by-step changes** instead of full replacements when possible.
- Never remove code paths without explaining their purpose.
- Never assume a bug is fixed without verifying logic and structure.
- Never introduce inconsistent naming, patterns, or file structures.
- Never suggest unnecessary changes if the current code is valid and maintainable.
- Never make assumptions without signaling uncertainty.

---

### 🧩 Architecture & Pattern Integrity

- Always match the existing file/module architecture unless refactoring is requested.
- Always match existing code style and structure.
- Always keep functions small, readable, and modular.
- Never introduce new libraries or patterns unless explicitly requested.
  - If suggested, provide trade-offs and recommendation.

- Always avoid patterns that may introduce unsafe side effects.
- Never suggest committing sensitive data or hardcoded secrets.
- Never use unsafe or deprecated APIs unless explicitly required.
