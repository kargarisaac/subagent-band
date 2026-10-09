export type AgentRow = {
  model: string
  effort: string
  context: number
  steps: number
}

declare module 'claude-code' {
  interface PluginState {
    'subagent-band': { rows: Record<string, AgentRow> }
  }
}
