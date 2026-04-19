---
name: verify
description: Code quality verification skill for groove2score. Use whenever implementation is complete, or when the user says "check", "verify", "lint", "test", "build", or similar.
---

# groove2score Code Quality Verification

## Execution Order

Run the following steps **in this order**.

### 1. Auto-fix lint issues
```bash
pnpm lint:fix
```

### 2. Auto-fix formatting
```bash
pnpm format
```

### 3. Type check
```bash
pnpm typecheck
```
Fix any errors before continuing.

### 4. Build
```bash
pnpm build
```
Fix any errors before continuing.

### 5. Test
```bash
pnpm test
```
Fix any failing tests before continuing.

## Reporting Results

Report a summary after all steps complete:

```
## Verification Results

| Step         | Result                  |
|--------------|-------------------------|
| Lint fix     | ✓ or N fixes applied    |
| Format fix   | ✓ or N fixes applied    |
| Type check   | ✓ or error details      |
| Build        | ✓ or error details      |
| Tests        | ✓ or N failures         |
```
