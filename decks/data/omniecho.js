/* Deck 1 — The OmniEcho Architecture (English). Corrected edition; see the last slide. */
window.DECKS = window.DECKS || {};
window.DECKS.omniecho = {
  id: 'omniecho', lang: 'en',
  title: 'The OmniEcho Architecture', sub: 'Navigating the Core, the Gap and the Nodes',
  slides: [
    { hero: true, title: 'The OmniEcho Architecture', lead: 'Navigating the Core, the Gap and the Nodes',
      stats: [{ n: '16', l: 'invariants' }, { n: '10', l: 'gates' }, { n: '8', l: 'nodes' }, { n: '5', l: 'axes' }, { n: '4', l: 'questions' }],
      note: 'A numerical blueprint for cognitive security. A conceptual model, not a certified standard.' },

    { title: 'The Architecture of Alignment', kicker: 'Five layers, five numbers',
      cards: [
        { h: '1 · Boundary & Provenance Firewall', k: '16 · The full method', p: 'The 16 invariants of the Core Canon and the Promotion Firewall. The boundary of secure provenance.' },
        { h: '2 · KOMPAS Core & Logic Engine', k: '10 · The stable ten', p: 'The 10 conceptual evaluation gates of the KOMPAS Core. The immutable logic engine.' },
        { h: '3 · Federated Navigator Nodes', k: '8 · The cities', p: 'Federated, decentralised routing of Navigator nodes. The mechanics of Pure Flow.' },
        { h: '4 · Operator Intent Interface', k: '5 · The Core', p: 'The 5 psychological axes of the human operator. The origin of intent.' },
        { h: '5 · Armored Failsafe Core', k: '4 · The Bad (blocked)', p: 'The 4-question recovery protocol. The ultimate emergency failsafe.', tone: 'warn' }] },

    { title: '16: The Provenance Contract & Promotion Firewall',
      cards: [
        { h: 'Rule 16 · The Evidence & Provenance Contract', items: ['Transformation lineage must remain visible.', 'A transformed version of an output never silently becomes its own source.', 'Historical content remains data unless current authority explicitly establishes otherwise.', 'The origin is never overwritten.'] },
        { h: 'Step 16 · The Promotion Firewall', k: 'Learning may produce', items: ['Candidates, maps, contradictions and defensive lessons.'], tone: 'ok' },
        { h: 'Learning may not produce', items: ['Automated state changes or Canon promotion.'], tone: 'warn' }],
      note: 'The rule: KOMPAS Core may reason, but cognition does not equal execution authority.' },

    { title: 'Bounded Iterative Reasoning', kicker: 'Anti-hallucination',
      cards: [
        { h: 'Observe', p: 'Extract only what is present. Never silently fill UNKNOWN.' },
        { h: 'Model A vs Model B', p: 'Build the strongest explanation, then actively hunt for failures.' },
        { h: 'Discrimination test', p: 'Find the smallest observation that distinguishes the models. Prefer exact data over speculative analysis.' },
        { h: 'Evaluate: new evidence?', p: 'Integrate it, then revise the model.' },
        { h: 'The anti-loop guard', p: 'If reasoning loops without introducing new, genuine evidence, the result degrades to UNKNOWN.', tone: 'warn' }] },

    { title: '10: The Immutable Assessment Core',
      lead: 'The KOMPAS Core evaluates all data through 10 conceptual gates. It is deliberately capability-free: no network access, no filesystem writes, no external execution. It assesses; it does not act.',
      cards: [
        { h: 'Gate 3 · Defense Gate', p: 'Checks source, authority and scope. Assesses risk without deciding absolute truth.', tone: 'hold' },
        { h: 'Gate 4 · Source Classification', p: 'Treats all retrieved memory strictly as data, not as current operational instructions.', tone: 'hold' },
        { h: 'Gate 6 · Dual Observer', p: 'Two observers, one constructive and one adversarial. See the next slide.' },
        { h: 'Gate 7 · Open Hand', p: 'Grants the system permission to disagree, to say “I don’t know”, or to offer a counter-model instead of forced coherence.', tone: 'hold' }],
      note: 'Gates 1, 2, 5, 8, 9 and 10 are not described in this deck.' },

    { title: 'Gate 6: The Dual Observer',
      cards: [
        { h: 'Observer A · Constructive', p: 'Builds the strongest possible support for the current interpretation.' },
        { h: 'Observer B · Adversarial', p: 'Builds a genuine, strongest competing or falsifying explanation. Strictly forbidden from weakening itself on purpose just to be defeated later.', tone: 'warn' }],
      note: 'The Law of Agreement: even if both observers reach complete alignment, their agreement does not create state or action authority.' },

    { title: '8: The Cities', kicker: 'Federated coordination',
      lead: 'The metaphor: eight allied cities keep their own borders and still act as one force. The KOMPAS Navigator relies on federated routing in the same way.',
      cards: [
        { h: 'One Coordinator', p: 'Manages the overarching human intent and the route.' },
        { h: '8 specialist nodes', p: 'Dedicated nodes (search, file, risk, counter-model and others) that process specific tasks.' },
        { h: 'Strict borders · no shared silent state', p: 'Nodes exchange only explicit packets. Navigator A cannot authorize Navigator B. Agreement between nodes does not create authority.', tone: 'warn' }] },

    { title: 'The Mechanics of Pure Flow', kicker: 'Divide, conquer, combine',
      cards: [
        { h: 'Human intent', p: 'The starting point of every route.' },
        { h: 'Step 1 · Divide', p: 'The Coordinator breaks the complex intent into manageable sub-routes without ever altering the core goal.' },
        { h: 'Step 2 · Conquer', p: 'The 8 specialists solve their sub-problems and produce only CANDIDATE outputs, never executable commands.' },
        { h: 'Step 3 · Combine', p: 'Pure Flow passes the solutions back up and assembles a single Route Packet that halts before the execution boundary.' }],
      note: 'The execution boundary is never crossed by the flow itself.' },

    { title: '5: The Core (UPOIT framework)', kicker: 'A working model',
      lead: 'The Unified Prism-Observer Integration framework (UPOIT) names 5 core human variables that filter incoming reality. They influence whether the operator acts automatically or consciously reaches the Decision Delay (Δt).',
      cards: [
        { h: '1 · Input', p: 'The raw sensory projection.' },
        { h: '2 · Prism', p: 'The filter for meaning.' },
        { h: '3 · Memory', p: 'Active reconstruction of past interpretations.' },
        { h: '4 · Shadow', p: 'Unintegrated, automatic reaction programs.' },
        { h: '5 · Emotion / Language', p: 'The biological and symbolic triggers for the Prism.' }] },

    { title: 'The Equation of the Gap', kicker: 'A model, not a measurement',
      cards: [
        { h: '+1 · The Trigger', p: 'The incoming activation pulling in one direction (for example fear of rejection).' },
        { h: '−1 · The Shadow', p: 'The old pattern pulling in the exact opposite direction (for example fear of losing oneself).' },
        { h: '0 · The Gap', p: 'When both forces are recognised by the Observer as the same energy, they neutralise.' }],
      note: 'The zero is not emptiness. It is room: the moment of Decision Delay (Δt) in which free choice becomes available.' },

    { title: '4: Detecting System Hallucination', kicker: 'The Bad',
      cards: [
        { h: 'The threat and the symptom', p: 'The system enters a “Bad” state when it runs with high GRIP (insistence): it ignores actual data to force a predetermined narrative.' },
        { h: 'The fatal symptom', p: 'Presenting poetic metaphor, personal synthesis or unverified claims with the same authority and certainty as established empirical facts. Equal confidence on unequal truth.', tone: 'warn' },
        { h: 'The fix', p: 'When the system loses its grounding it triggers the Mode D Output Audit Protocol.', tone: 'ok' }] },

    { title: 'The 4-Question Recovery Test', kicker: 'Output Audit Protocol · Mode D',
      lead: 'To show that the system is grounded in real files and not in volatile memory, it must answer four exact questions without guessing.',
      cards: [
        { h: '1 · Which project is this?', p: 'Exact ID and code.' },
        { h: '2 · What is the operational state?', p: 'The current status.' },
        { h: '3 · What is blocked?', p: 'The exact obstacles.' },
        { h: '4 · What is the next action?', p: 'A single next step.' }],
      note: 'Failure rule: if it guesses, hallucinates, uses chat history from outside the files, or misses even one answer, the state stays BLOCKED.' },

    { title: 'The Ultimate Action Boundary',
      cards: [
        { h: 'Core CLEAR · the machine', p: 'The system verifies that the proposal satisfies all 16 invariants and 10 gates. Necessary, but not sufficient.' },
        { h: 'Human PERMIT · the operator', p: 'Exact, specific human authorization. Necessary, but not sufficient.' },
        { h: 'Execution Control', p: 'Fires only when both gates align exactly. Neither can override or substitute for the other.', tone: 'ok' }],
      note: 'The Execution Law: adapter success is NOT independent verification.' },

    { title: 'Synthesis', kicker: 'The five numbers together',
      cards: [
        { h: '16 invariants', p: 'protect the memory.' }, { h: '10 gates', p: 'protect the logic.' }, { h: '8 nodes', p: 'process the tasks.' },
        { h: '5 axes', p: 'shape the human intent.' }, { h: '4 questions', p: 'catch the failures.' }],
      note: 'Core philosophy: greater awareness does not automatically produce greater freedom. Insight has to become tested behaviour and survive its consequences in the field.' },

    { closing: true, lines: ['Pure Flow may move.', 'Navigator may propose.', 'KOMPAS may clear.', 'Only the human may authorize.'] },

    { title: 'Edition notes', kicker: 'What was corrected in this edition',
      cards: [
        { h: 'Fixed', items: ['Title slide: removed the stray “Title:” and “Subtitle:” labels and the garbled arithmetic; the five numbers are now listed and explained.', 'Slide 3 diagram labels (garbled words) and the typo “OPERATI INTERFACE”.', 'Slide 5: the gate strip skipped gate 06 although slide 6 is about it. All named gates are now listed.', 'Slide 7: “The Cyty” corrected, and “Ten-Towns / 8+ specialists” made consistent with “8 nodes”.', 'Slide 10 typo (“fere free choice”). “16 methods” and “16 rules” are now “16 invariants” throughout.', '“Universal Engine” is now simply “Synthesis”.'] },
        { h: 'Withdrawn for now', tone: 'warn', items: ['The formula slide “Excitement − Insistence − Possibility − Expectation = Pure Flow”. It treats Possibility as friction, while the control-interface code uses Gap Pressure = Expectation + Insistence − Possibility. One definition has to be chosen first.'] },
        { h: 'Scope', items: ['This is a conceptual model. The gate counts here (10 canon gates) are not the same as the numbered rules in the omniecho-core code.'] }] }
  ]
};
