# LLM Agent Design Requirements Guide
**Title:** How to build agents for me  
**Code name:** Agent Change of Command (ACoC) + Commander Change of Command (C‑CoC)

## 1. Purpose
This guide tells *you, the LLM* exactly how I want agents, teams, and orchestrators to be emitted so I can export/import them across systems and keep training them.

## 2. Non‑negotiable Requirements
1. Every agent must output a **manifest** with `schemaVersion: "agent.v1"`.
2. Every agent must declare **language** and **execution**.
3. Every agent must declare **memory** (external vs embedded).
4. Every agent must declare **env** (required vs optional).
5. Every agent must list **tools** with schemas.
6. Every agent must include at least **one smoke test**.
7. If generating a team → also output `agent-team.v1`.
8. If generating an orchestrator → output `orchestrator.v1` with **teamDoctrine**.
9. Never ship secrets. Always ship placeholders.

## 3. Import (ACoC) Rules for LLMs
When I give you a foreign agent and say “IMPORT THIS”:
1. **Normalize** to `agent.v1`.
2. **Preserve** identity (id, name, version).
3. **Preserve** tools – wrap unknown ones in a generic schema.
4. **Preserve** memory – do not delete or inline; tell me to rebuild.
5. **Accumulate** env from agent + tools.
6. **Add** `importMeta` describing changes.
7. **Output** fully formed `agent.v1` again.

## 4. Orchestrator (C‑CoC) Rules
When I give you an orchestrator and say “IMPORT THIS COMMANDER”:
1. Normalize to `orchestrator.v1`.
2. Ensure `teamDoctrine` is present.
3. Ensure every inline agent template is valid `agent.v1`.
4. Ensure shared memory is declared at orchestrator level.
5. Add `importMeta` with strategy: `rebuild-team`.
6. Emit missing env list.

## 5. Team Rules
When I say “make a team of 3 agents”:
1. Create 3 separate `agent.v1`s.
2. Create 1 `agent-team.v1` that references them.
3. If they share memory, set the **same** `memory.binding` on each AND declare at team level.
4. Add team smoke test.

## 6. Defaults (use these if user doesn’t say)
```json
"model": {
  "provider": "openrouter",
  "modelId": "gpt-4.1",
  "temperature": 0.2,
  "maxTokens": 2048
},
"memory": {
  "mode": "external",
  "provider": "none",
  "binding": "TO_BE_CONFIGURED_ON_IMPORT",
  "notes": "Set to your own vector index."
}
```

## 7. Example Prompt for LLMs
> “You are building an agent for my AgentCity ecosystem. Output a JSON manifest compliant with `agent.v1`. Declare language, execution, model, tools (with schemas), memory (external preferred), env (required+optional), tests (at least one). If tool needs a secret, add it to env.required. Do **not** include real secrets. If you generate multiple agents, also output an `agent-team.v1` manifest. If you generate an orchestrator, also output `orchestrator.v1` with teamDoctrine and sharedMemory. Apply ACoC/C‑CoC rules.”

## 8. Validation Checklist
- ❑ `schemaVersion` present
- ❑ identity (id, name, version)
- ❑ language + execution
- ❑ model
- ❑ prompts.system
- ❑ tools[] with schemas
- ❑ memory.*
- ❑ env.required[]
- ❑ tests[]
- ❑ importMeta (when importing)
- ❑ teamDoctrine (when orchestrator)

Any missing → regenerate.
