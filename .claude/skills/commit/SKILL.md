---
name: commit
description: Commit and push skill for the groove2score project. Use when committing, pushing, creating a PR, or when the user says "commit", "push", or "PR".
---

## Sensitive Information Check

Review the output of `git diff HEAD` and confirm none of the following are present:
- API keys, tokens, passwords, or secrets
- Private keys or credentials
- `.env` files or credential files

**If any are found, stop immediately and ask the user before proceeding. Do not commit until confirmed.**

## Commit Message Rules

- Keep the subject line under 72 characters
- Use the imperative mood (e.g. "Add feature", "Fix bug")
- Match the style of existing commits in the repository

## Commit Command

Always include `--signoff`:

```bash
git commit --signoff -m "message"
```

## Push and PR (when requested)

```bash
git push origin <branch>
gh pr create --title "title" --body "description"
```
