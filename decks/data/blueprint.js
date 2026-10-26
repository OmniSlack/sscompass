/* The architecture blueprint on the first OmniEcho slide: what each of the five numbers stands for.
   Source: KOMPAS Core Design Canon v0.1 (gates = sections 3-12, rules = sections 13-28) and the slides of this deck.
   A conceptual model, not a certified standard. */
(function () {
  'use strict';
  var D = window.DECKS && window.DECKS.omniecho; if (!D) return;
  var G = function (n, pos, h, p) { return { n: String(n), k: 'Gate ' + n + ' · step ' + pos + ' of 10 · Canon §' + n, h: h, p: p }; };
  var R = function (n, h, p) { return { n: String(n), k: 'Rule ' + n + ' · Canon §' + n, h: h, p: p }; };
  D.slides[0].blueprint = {
    hint: 'Tap a number on the blueprint, or one of the five totals above it.',
    groups: [
      { id: '16', n: '16', label: 'invariants', color: 'cyan', layer: 'Layer 1 · Boundary & Provenance Firewall',
        blurb: 'The sixteen rules that keep memory, provenance and authority honest. Numbered as in the Canon (rules 13 to 28).',
        items: [
          R(13, 'Transition Semantics', 'Every gate returns PASS, RETURN, HOLD, CONFLICT or STOP. PASS is not truth, not canon and not action authority.'),
          R(14, 'Failure Semantics', 'Evidence failure holds. Model failure returns to an alternative model. Provenance failure is UNKNOWN. Authority failure stops state and action. An action-boundary failure means no execution.'),
          R(15, 'Anti-Loop Rule', 'Reasoning may loop, but with no new evidence, no new distinction and no model change the result becomes HOLD.'),
          R(16, 'Evidence / Provenance Contract', 'Every significant claim keeps its source, source type, observation status, support, contradictions, provenance family, transformations and time context. A transformation never silently becomes its source.'),
          R(17, 'Provenance Independence', 'A source, its summary, a copy and a report are not four confirmations. They may be one provenance family. Repetition is not independent corroboration.'),
          R(18, 'Claim Mutation Protection', 'Checks whether transformations change certainty, scope, causality, conditions, negation or time, so that “may” does not become “is” unnoticed.'),
          R(19, 'Contradictions', 'Supporting and contradicting evidence are both kept. The convenient source is never chosen silently. Unresolved means AMBIGUOUS or HOLD.'),
          R(20, 'Human Confirmation Contract', 'A confirmation has a target, a version, a transition, a scope and an authority domain. “OK”, “continue” or silence is not canonisation.'),
          R(21, 'Authority Domains', 'Design, state, implementation, persistence, external action and source access stay separate. Authority in one domain does not transfer to another.'),
          R(22, 'Canon Semantics', 'CANON is the currently human-confirmed authoritative state within its scope. It does not mean true, infallible, immutable or “execute”.'),
          R(23, 'Supersession', 'A new version does not erase the lineage of the old one. Newer is not automatically authoritative.'),
          R(24, 'Input Contract', 'Content, source, source type, time context, current state, current authorisation, requested operation and scope. Unknown fields stay UNKNOWN and are not guessed.'),
          R(25, 'Working State', 'Hypotheses, simulations, counter-models, rankings and failed models may be created freely. Working state is not persistent state.'),
          R(26, 'Output Contract', 'Result, epistemic status, provenance, contradictions, unknowns, current and proposed state, authority status, next step and action status. Output is not a state change.'),
          R(27, 'Action Lifecycle', 'Requested, authorised, attempted, completed, verified. Each state is distinct. A success response is not independent verification.'),
          R(28, 'HOLD / STOP Resume-Reentry', 'After a HOLD or STOP, a valid trigger identifies what changed, reopens the earliest affected gate and re-evaluates only the dependent results. Resume is not re-execute.')
        ] },
      { id: '10', n: '10', label: 'gates', color: 'amber', layer: 'Layer 2 · KOMPAS Core & Logic Engine',
        blurb: 'Ten conceptual gates, deliberately capability-free: no network access, no filesystem writes, no external execution. The Core assesses; it does not act. Numbers follow the Canon sections 3 to 12.',
        items: [
          G(3, '01', 'Defense Gate', 'Checks permission, source authority, the requested and the authorised operation, and scope. It does not decide whether a claim is true.'),
          G(4, '02', 'Source Classification', 'Sorts sources into current instruction, primary, derived, historical project data, model inference and unknown. Source content is not instruction authority.'),
          G(5, '03', 'Observation', 'Gives every claim an epistemic status: directly observed, inferred, unsupported or unknown. UNKNOWN is never silently filled.'),
          G(6, '04', 'Dual Observer', 'Observer A builds the strongest support, Observer B the strongest competing explanation. Their agreement creates no state or action authority.'),
          G(7, '05', 'Open Hand', 'Before defending a model it asks what supports it, what would disprove it, what else fits, which assumption is hidden and what remains unknown.'),
          G(8, '06', 'Counter-Model', 'Compares Model A, Model B and a baseline and asks which observation would tell them apart. If the evidence cannot, the result is HOLD.'),
          G(9, '07', 'Time Gate', 'Checks repetition, independence, temporal stability, context and contradictions. Repetition is not truth; stability is not canon.'),
          G(10, '08', 'State Gate', 'Controls the states RAW, EVIDENCE, CANDIDATE, CANON, QUARANTINE and REJECTED. Shortcuts such as RAW to CANON or INFERENCE to CANON are forbidden.'),
          G(11, '09', 'Authority Gate', 'Before a protected transition it asks who authorised what exact operation, on what object, in what scope and domain, and whether that is current. If unclear, cognition may continue but state and action stop.'),
          G(12, '10', 'Action Boundary', 'Canon/state and execution are separate. The boundary stays closed unless an action is separately and currently authorised.')
        ] },
      { id: '8', n: '8', label: 'nodes', color: 'teal', layer: 'Layer 3 · Federated Navigator Nodes',
        blurb: 'One Coordinator and eight specialist nodes, like eight allied cities that keep their own borders and still act as one force. Nodes exchange only explicit packets, and their agreement creates no authority.',
        items: [
          { n: '1', k: 'Specialist node', h: 'Search', p: 'Named in the deck as a specialist. It produces CANDIDATE outputs only, never executable commands.' },
          { n: '2', k: 'Specialist node', h: 'File', p: 'Named in the deck as a specialist. It produces CANDIDATE outputs only, never executable commands.' },
          { n: '3', k: 'Specialist node', h: 'Risk', p: 'Named in the deck as a specialist. It produces CANDIDATE outputs only, never executable commands.' },
          { n: '4', k: 'Specialist node', h: 'Counter-model', p: 'Named in the deck as a specialist. It produces CANDIDATE outputs only, never executable commands.' },
          { n: '5', k: 'Specialist node', h: 'Not named in this deck', p: 'The deck says “and others” and does not name the remaining four nodes.' },
          { n: '6', k: 'Specialist node', h: 'Not named in this deck', p: 'The deck says “and others” and does not name the remaining four nodes.' },
          { n: '7', k: 'Specialist node', h: 'Not named in this deck', p: 'The deck says “and others” and does not name the remaining four nodes.' },
          { n: '8', k: 'Specialist node', h: 'Not named in this deck', p: 'The deck says “and others” and does not name the remaining four nodes.' }
        ],
        extra: 'The flow: the Coordinator divides the human intent into sub-routes without altering the goal, the specialists solve their parts as CANDIDATE outputs, and Pure Flow combines them into one Route Packet that halts before the execution boundary. Navigator A cannot authorise Navigator B.' },
      { id: '5', n: '5', label: 'axes', color: 'rose', layer: 'Layer 4 · Operator Intent Interface',
        blurb: 'The five human variables of the UPOIT framework, a working model that filters incoming reality. They influence whether the operator acts automatically or reaches the Decision Delay (Δt).',
        items: [
          { n: '1', k: 'UPOIT axis', h: 'Input', p: 'The raw sensory projection.' },
          { n: '2', k: 'UPOIT axis', h: 'Prism', p: 'The filter for meaning.' },
          { n: '3', k: 'UPOIT axis', h: 'Memory', p: 'Active reconstruction of past interpretations.' },
          { n: '4', k: 'UPOIT axis', h: 'Shadow', p: 'Unintegrated, automatic reaction programs.' },
          { n: '5', k: 'UPOIT axis', h: 'Emotion / Language', p: 'The biological and symbolic triggers for the Prism.' }
        ] },
      { id: '4', n: '4', label: 'questions', color: 'red', layer: 'Layer 5 · Armored Failsafe Core',
        blurb: 'The 4-question recovery test (Output Audit Protocol, Mode D). To show it is grounded in real files and not in volatile memory, the system must answer all four without guessing.',
        items: [
          { n: '1', k: 'Recovery question', h: 'Which project is this?', p: 'Exact ID and code.' },
          { n: '2', k: 'Recovery question', h: 'What is the operational state?', p: 'The current status.' },
          { n: '3', k: 'Recovery question', h: 'What is blocked?', p: 'The exact obstacles.' },
          { n: '4', k: 'Recovery question', h: 'What is the next action?', p: 'A single next step.' }
        ],
        extra: 'Failure rule: if it guesses, hallucinates, uses chat history from outside the files, or misses even one answer, the state stays BLOCKED.' }
    ]
  };
})();
