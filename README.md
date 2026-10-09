# subagent-band

A Claude Code mod that shows each running subagent's model, effort and context size in a band above the prompt.

```
worker · haiku-5-5 · xhigh · 12k
```

The statusline only shows the main session. This band gives each running subagent its own row.

## Install

```
/plugin install subagent-band --marketplace kargarisaac/subagent-band
```

Answer `y` to add the marketplace, then pick a scope.

## What it shows

- One row per running subagent: type, model, effort, context tokens.
- `starting` until the subagent's first model request finishes.
- Context is a token count (input plus cache reads and writes), not a percentage.
- Nothing shows when no subagent is running.

## Develop

```
claude plugin validate .
claude plugin test .
```
