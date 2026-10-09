import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { AgentRow } from '../types'

const rows = atom({ plugin: 'subagent-band', key: 'rows' } as const, {} as Record<string, AgentRow>)

const kilo = (n: number) => (n >= 1000 ? `${Math.round(n / 1000)}k` : `${n}`)

export const register: Register = on => {
  on('turn.step', async function* ($, e, next) {
    const id = e.agentId

    if (id === undefined) {
      return yield* next(e)
    }

    const response = yield* next(e)
    const usage = response.usage

    await update($, rows, current => ({
      ...current,
      [id]: {
        model: usage?.model ?? e.model,
        effort: e.effort === undefined ? '-' : String(e.effort),
        context: usage
          ? usage.input_tokens + usage.cache_read_input_tokens + usage.cache_creation_input_tokens
          : (current[id]?.context ?? 0),
        steps: (current[id]?.steps ?? 0) + 1,
      },
    }))

    return response
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const agents = (await $.agent.list()).filter(a => a.status === 'running')

    if (e.props.hasSurvey || agents.length === 0) {
      return next(e)
    }

    const known = await read($, rows)
    const { Box, Text } = $.ui.resolve(e)

    return (
      <Box flexDirection="column">
        {agents.map(a => {
          const r = known[a.id]

          return (
            <Text key={a.id} dimColor>
              {a.type} · {r ? `${r.model.replace(/^claude-/, '')} · ${r.effort} · ${kilo(r.context)}` : 'starting'}
            </Text>
          )
        })}
      </Box>
    )
  })
}
