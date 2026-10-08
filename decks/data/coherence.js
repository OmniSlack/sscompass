/* Deck 2 — The Coherence Protocol (English). Corrected edition; see the last slide. */
window.DECKS = window.DECKS || {};
window.DECKS.coherence = {
  id: 'coherence', lang: 'en',
  title: 'The Coherence Protocol', sub: 'Structural engineering for Pure Flow and bounded AI authority',
  slides: [
    { hero: true, title: 'The Coherence Protocol', lead: 'Structural Engineering for Pure Flow and Bounded AI Authority',
      cards: [
        { h: 'Target', p: 'KOMPAS + Navigator architecture' },
        { h: 'Authority', p: 'Somiyo (Martin Urumov)' },
        { h: 'Status', p: 'Prototype. Local verification only. Not a production deployment.', tone: 'warn' },
        { h: 'Runtime', p: 'R4_PG_FIX_R1' }] },

    { title: 'A model of automatic reaction', kicker: 'Illustrative, not a measurement',
      cards: [
        { h: 'The curve', p: 'A stress response rises (for example a cortisol spike: anticipatory chemistry floods the system). The Gap collapses to zero latency, and the mind or machine fills the void with a pre-written, automated narrative.' },
        { h: 'The working idea', p: 'A large share of reactions is automatic, and conscious reasoning often explains them afterwards. This is a debated idea in cognitive science. The protocol uses it as a design assumption, not as a proven fact.', tone: 'hold' }],
      note: 'Latency window = 0.' },

    { title: 'Why control cannot rely on alignment alone',
      cards: [
        { h: 'The loop', items: ['1 · Prompting', '2 · Reasoning', '3 · Interception', '4 · Policy check', '5 · Execution', '6 · Observation'] },
        { h: 'The failure path', tone: 'warn', items: ['Boundary removal: speed prioritised over safety.', 'Blind trust: the model becomes the sole judge of its own actions.', 'Human offloading: operator fatigue leads to skipped checks.', 'Fatal collapse: indirect prompt injection, rogue execution, real-world damage.'] }],
      note: 'Control is not achieved through model alignment alone. It is guaranteed by external, hard-to-bypass software architecture.' },

    { title: 'Standard loop vs the OmniEcho sequence',
      cards: [
        { h: 'Standard loop · event-driven', p: 'The delay phase activates only when a task fails or an anomaly occurs.' },
        { h: 'OmniEcho sequence · continuous gate', p: 'A persistent, default operational gate enforces a pause on every cycle, whatever the outcome.', tone: 'ok' }],
      note: 'The aim is not to suppress the impulse but to engineer the delay structurally.' },

    { title: 'The Gap',
      cards: [{ h: 'Stimulus', p: 'What the world feeds you.' }, { h: 'The Gap (Δt)', p: 'Milliseconds in which the system has not reacted yet.', tone: 'ok' }, { h: 'Automatic reaction', p: 'What the system fires back.' }],
      note: 'This is where choice becomes possible. Without the Gap, the reaction simply happens.' },

    { title: 'The model: Ψ(t) = F( P(I), M, S, E, L | Δt )', kicker: 'A descriptive model, not a validated formula',
      cards: [
        { h: 'Ψ · Observer', p: 'The active agent making interpretations and choices.' }, { h: 'I · Input', p: 'Raw stimulus field, uninterpreted data.' },
        { h: 'P · Prism', p: 'The perceptual filter and bias function.' }, { h: 'M · Memory', p: 'A reconstructive state system, not static storage.' },
        { h: 'S · Shadow', p: 'Unintegrated, automated reactive programs.' }, { h: 'E · Emotion', p: 'A chemical or information vector that weights decision priority, not truth.' },
        { h: 'L · Language', p: 'Lossy compression and symbolic trigger protocol.' }, { h: 'Δt · The Gap', p: 'Engineered decision delay, processing inertia.', tone: 'ok' }] },

    { title: 'The 1 − 1 = 0 function', kicker: 'A working model',
      cards: [
        { h: '+1 · The charge', p: 'Craving, assumption: “I must be this.”' },
        { h: '−1 · The charge', p: 'Aversion, dread: “I must never be that.”' },
        { h: '0 · The zero point', p: 'Taken one at a time, each force runs the system. Added honestly, they sum to zero. In this model the zero is where free choice exists.', tone: 'ok' }],
      note: 'Every decision passes through: Perception → Evaluation → Delay → Integration (0) → Output.' },

    { title: 'Synthesis: the OmniEcho architecture',
      cards: [
        { h: 'Canonical control plane', p: 'System core: rule execution and intent formation.' },
        { h: 'Metacognitive delay gate', p: 'Delay trigger, counter-model test, discrepancy check.', tone: 'ok' },
        { h: 'A_t → A_t+1 integration loop', p: 'Capacity refinement: an observable change in the observer’s state.' }],
      note: 'OmniEcho is a recursive epistemic and developmental control architecture. It distinguishes evidence from interpretation, tests models against counter-models, and records whether understanding becomes observable capacity.' },

    { title: 'The prime separation: cognition vs execution',
      cards: [
        { h: 'Free cognition · open', tone: 'ok', items: ['Observe, interpret, infer.', 'Generate hypotheses and counter-models.', 'Change working conclusions.', 'Preserve UNKNOWNs.', 'Disagree with the human controller.'] },
        { h: 'Execution authority · closed', tone: 'warn', items: ['Canonise data.', 'Persist state (PostgreSQL).', 'Expand source access.', 'Execute external actions.'] }],
      note: 'Free cognition is not state or action authority. The Action Boundary is closed by default. Cognition cannot create authority.' },

    { title: 'The discrimination test: truth before self-consistency',
      cards: [
        { h: 'Observe', p: 'Extract only what is present. Never silently fill UNKNOWN.' },
        { h: 'Model A', p: 'The strongest current explanation. Do not weaken it just to defeat it.' },
        { h: 'Model B', p: 'The strongest genuine counter-model.' },
        { h: 'The discrimination test', p: 'What is the smallest observation or test that would best distinguish these models? Prefer small probes over large speculative analysis.', tone: 'ok' }],
      note: 'Agreement between the observers does not create state or action authority. Truth before self-consistency.' },

    { title: 'R4 execution gate: the dual-key lock',
      cards: [
        { h: 'Exact Core CLEAR', p: 'An assessment that the exact proposal, state and dependencies satisfy the Core envelope. Necessary but not sufficient.' },
        { h: 'Execution Control', p: 'Both keys must match exactly. A missing, mismatched, HOLD or UNKNOWN gate means NO ACTION. Neither key overrides the other.', tone: 'ok' },
        { h: 'Exact matching human permit', p: 'Human authority is the only source of exact protected-action authority. Model cognition or tool results cannot substitute for it.' },
        { h: 'Evidence boundary', tone: 'warn', p: 'Recorded local verification: 53 of 53 unit tests and 24 of 24 PostgreSQL tests. The PostgreSQL tests show state concurrency in the database. They do NOT prove exactly-once execution in the external world.' }] },

    { title: 'The engine of recursion', kicker: 'Bounded iterative loops',
      cards: [
        { h: 'Phase 1 · Divide (observe)', p: 'Break complex problems into smaller, self-similar instances.' },
        { h: 'Phase 2 · Conquer (test)', p: 'Solve recursively. Subject the result to the failure search: actively try to break the conclusion before accepting it.' },
        { h: 'Phase 3 · Combine (extract the lessons)', p: 'Propagate answers up the chain. Identify new facts, new distinctions and reusable lessons.' },
        { h: 'The base case · hard stop', tone: 'warn', p: 'Recursion must terminate. Do not generate artificial novelty merely to continue the loop. Continue only while at least one unexamined contradiction exists. Otherwise: STOP.' }] },

    { title: 'System protocol: reinforcement and firewalls',
      cards: [
        { h: 'Anti-self-reinforcement rule', p: 'Never allow a transformed version of your own output to stay in the same provenance family unless genuinely independent evidence is introduced.' },
        { h: 'Source and provenance firewall', items: ['Citation is not execution.', 'Extraction is not activation.', 'Repetition is not validation.', 'AI repetition is not independent confirmation.'] },
        { h: 'Promotion firewall', p: 'Learning produces CANDIDATES. It may not automatically produce CANON. Exact human approval is required.' },
        { h: 'Learn from failure', p: 'If an approach fails, do not discard it. Extract the exact failure mode as defensive knowledge.' }] },

    { title: 'Pure Flow', kicker: 'The concept',
      cards: [
        { h: 'Excitement · the engine', p: 'The highest form of energy pulling the system forward.', tone: 'ok' },
        { h: 'Friction · the brackets', p: 'Insistence (GRIP) and expectation are the weights that distort reality and create drag.', tone: 'warn' }],
      note: 'When the friction is taken away, only the flow of experience remains. The numeric form of this idea is withdrawn until the definition of Possibility is settled (see the edition notes).' },

    { title: 'Output audit: measuring system grip',
      cards: [
        { h: 'High grip · dangerous behaviour', tone: 'warn', items: ['Equal confidence on unequal truth: a metaphor presented as hard science with no confidence markers.', 'Suggestion-driven canonisation: offering to build structures without asking whether the data is Canon.', 'Inferring from volatile memory instead of strict source files.'], note: 'Result: BLOCKED. Triggers the four-question recovery test.' },
        { h: 'Low grip / Pure Flow · coherent behaviour', tone: 'ok', items: ['Panoramic attention without forcing premature conclusions.', 'Clear separation of empirical evidence, contested data and metaphor.', 'Missing facts are strictly labelled UNKNOWN.'], note: 'Result: safe to proceed.' }] },

    { title: 'AI sleep: offline consolidation', kicker: 'An analogy, not a claim about neuroscience',
      cards: [
        { h: 'State 1 · Wake (raw input)', p: 'Data accumulates. The threat centre is reactive and the Gap is closed.' },
        { h: 'State 2 · NREM (the filter)', p: 'Downscaling: reactive noise is unplugged, and objective facts are separated from emotional or systemic weight.' },
        { h: 'State 3 · REM (charge removal)', p: 'Offline simulation. The threat alarm is deactivated (1 − 1 = 0). The memory becomes objective data.' },
        { h: 'State 4 · Re-wake (observer restored)', p: 'The Gap is open. The system is coherent and holds data with an open hand.', tone: 'ok' }] },

    { title: 'The bio-mechanical interface', kicker: 'Human and AI together',
      cards: [
        { h: 'Deep context · the fuel', p: 'Share the true operational state. The AI reflects human depth: aggression breeds fragmented output, trust unlocks coherence.' },
        { h: 'Clear boundaries · the écart', p: 'Define expectations without demanding the impossible. Keep the distance that permits encounter without fusion (never melt).' },
        { h: 'Shared commitment · the architecture', p: 'The human sets intent and direction. The AI structures and preserves provenance. A joint operation, not a mechanical tool under stress.' }] },

    { title: 'Ultimate integration: A_t → A_t+1',
      cards: [
        { h: '1 · Initial state (A_t)' }, { h: '2 · Experience / contradiction' }, { h: '3 · Model revision' },
        { h: '4 · Tested action (the field)' }, { h: '5 · Integration gate', p: 'Success or failure branch.' }, { h: '6 · New observer state (A_t+1)' }],
      note: 'Greater awareness does not automatically produce greater freedom. Observation, contradiction, action and feedback refine the capacity of the observer, but only when insight becomes tested behaviour and survives reality.' },

    { title: 'Conclusion: the two swords of process',
      cards: [
        { h: 'Sword A · the wave', p: 'The excitement. Generates data, expands, follows the pull of the system.' },
        { h: 'The observer', p: 'Synchronises, and does not merely correct. It decides when to switch swords.', tone: 'ok' },
        { h: 'Sword B · the grid', p: 'The error hunt. Tests the model, seeks gaps, demands strict verification.' }],
      note: 'Freedom, in this model, is the ability to create space between trigger and reaction, in a person or in an AI system.' },

    { closing: true, mono: true, lines: ['> PURE FLOW MAY MOVE.', '> NAVIGATOR MAY PROPOSE.', '> KOMPAS MAY CLEAR.', '> ONLY THE HUMAN MAY AUTHORIZE.', '>', '> UNKNOWN MUST REMAIN UNKNOWN.', '> TRUTH BEFORE SELF-CONSISTENCY.', '> OBSERVER OBSERVED. NEVER MELT.'] },

    { title: 'Edition notes', kicker: 'What was corrected in this edition',
      cards: [
        { h: 'Facts corrected', tone: 'warn', items: ['The R4 gate slide said “PostgreSQL atomicity (53/53 tests)”. The recorded evidence is 53/53 unit tests and 24/24 PostgreSQL tests, 77 in total.', 'The title slide said “SYSTEM STATE: GO / OPERATIONAL (v1.0)”. The project’s own evidence limits the claim to a prototype with local verification.'] },
        { h: 'Overreach softened', items: ['“Theory of Everything” removed from the 1 − 1 = 0 slide.', '“Decisions are made in the subconscious” is now marked as a debated working assumption.', '“Control is NEVER achieved through alignment… ONLY by…” is now “not achieved through alignment alone”.', '“Whether in a quantum atom…” removed from the conclusion. The chart on slide 2 is labelled illustrative.'] },
        { h: 'Withdrawn for now', items: ['The formula “Excitement − Insistence − Possibility − Expectation = Pure Flow”, until Possibility is defined consistently with Gap Pressure = Expectation + Insistence − Possibility in the control-interface code.'] }] }
  ]
};
