import { expect, test } from 'claude-code/testing'

const AGENT = {
  id: 'agent-1',
  description: 'research the thing',
  type: 'Explore',
  status: 'running' as const,
}

const step = (agentId?: string) => ({
  turnId: 't1',
  index: 0,
  model: 'claude-sonnet-5-5',
  effort: 'high' as const,
  messageCount: 3,
  ...(agentId === undefined ? {} : { agentId }),
})

const answer = {
  turnId: 't1',
  index: 0,
  answer: '',
  toolUses: [],
  stopReason: 'end_turn' as const,
  usage: {
    model: 'claude-haiku-5-5',
    input_tokens: 100,
    output_tokens: 10,
    cache_read_input_tokens: 4000,
    cache_creation_input_tokens: 900,
  },
}

const PROPS = { hasSurvey: false, isWorking: true, maxRows: 10, bodyColumns: 100 } as never

test('the band shows a running subagent as type, model, effort and context', async ($, on) => {
  on('agent.list', () => ({ value: [AGENT] }))
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  on('turn.step', async function* () {
    return answer
  })

  const stream = $.turn.step(step('agent-1'))
  for await (const _ of stream) void _
  await stream.result

  const ui = await $.ui.mount({ plugin: 'subagent-band', surface: 'terminal', component: 'AbovePrompt', props: PROPS })
  const row = await ui.find({ type: 'Text' })

  expect(row?.text).toContain('haiku-5-5')
  expect(row?.text).toContain('high')
  expect(row?.text).toContain('5k')
})

test('a main-loop step leaves a running subagent at starting', async ($, on) => {
  on('agent.list', () => ({ value: [AGENT] }))
  on('ui.render', () => ({ type: 'Box', props: {}, children: [] }) as never)
  on('turn.step', async function* () {
    return answer
  })

  const stream = $.turn.step(step())
  for await (const _ of stream) void _
  await stream.result

  const ui = await $.ui.mount({ plugin: 'subagent-band', surface: 'terminal', component: 'AbovePrompt', props: PROPS })
  const row = await ui.find({ type: 'Text' })

  expect(row?.text).toContain('starting')
})
