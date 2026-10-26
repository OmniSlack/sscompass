/* Worked examples per project. Inputs and outputs are quoted from the portfolio repository (or captured by running its tools, marked "captured run");
   the step texts explain what happens to that example. Checked against the repository by tests/examples.test.js when the repository is present. */
window.SSC_EX = {
 "agent-execution-control": {
  "title": {
   "bg": "Човешко разрешение е отказано, докато Core връща HOLD",
   "en": "Human permit refused while Core says HOLD"
  },
  "input": {
   "label": {
    "bg": "Тест: Core записва HOLD или UNKNOWN (или нищо), после човек се опитва да издаде разрешение",
    "en": "Test: Core records HOLD or UNKNOWN (or nothing), then a human tries to issue a permit"
   },
   "text": "  for (const decision of [undefined, \"HOLD\", \"UNKNOWN\"] as const) await t.test(decision ?? \"MISSING\", async () => {\n    const repository = new FakeRepository();\n    const runtime = composeRuntime(repository, new MockAdapter());\n    if (decision) await runtime.coreSafety.recordDecision({ envelope: envelopeInput, decision, reason: \"assessment\", provenance: \"core\" });",
   "src": "agent-execution-control/test/unit/authority.test.ts:90-93"
  },
  "output": {
   "label": {
    "bg": "Очакван резултат: разрешението е отхвърлено и нищо не се записва",
    "en": "Expected result: the permit is rejected and none is stored"
   },
   "text": "    await assert.rejects(runtime.humanAuthority.issue({\n      permitId: `permit-${decision ?? \"missing\"}`,\n      envelope: envelopeInput,\n      issuedAt: \"2029-12-31T00:00:00.000Z\",\n      expiresAt: \"2030-01-02T00:00:00.000Z\",\n    }), /Core CLEAR/);\n    assert.equal(repository.permits.size, 0);",
   "src": "agent-execution-control/test/unit/authority.test.ts:94-100",
   "run": false
  },
  "why": {
   "bg": "Дори човек не може да даде на AI агент разрешение за действие, освен ако проверката на риска (Core) не е записала точен CLEAR за същото действие, така че човешко „да“ не може да отмени HOLD.",
   "en": "Even a human cannot hand an AI agent a permit to act unless the risk check (Core) has recorded an exact CLEAR for that same action, so a human yes cannot override a HOLD."
  },
  "limits": {
   "bg": "Двойната врата доказва, че и двата записа съществуват, не че са направени от две различни страни: един и същ извикващ с едни и същи права над базата може да запише Core CLEAR и да издаде разрешението.",
   "en": "The dual gate proves that both records exist, not that two different parties made them: the same caller with the same database rights can write the Core CLEAR and issue the permit."
  },
  "nodes": [
   {
    "n": {
     "bg": "Решение на Core",
     "en": "Core decision"
    },
    "fn": "recordCoreDecision (src/postgres/repository.ts)"
   },
   {
    "n": {
     "bg": "Човекът издава разрешение",
     "en": "Human issues permit"
    },
    "fn": "issuePermit (src/postgres/repository.ts)"
   },
   {
    "n": {
     "bg": "Двойна врата",
     "en": "Dual gate"
    },
    "fn": "enforce_dual_gate_permit_issue (migrations/004_no_override_dual_gate.sql)"
   },
   {
    "n": {
     "bg": "Заявяване и изпращане",
     "en": "Claim and dispatch"
    },
    "fn": "claim_permit / reserve_dispatch (migrations/004_no_override_dual_gate.sql)"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "hold",
    "text": {
     "bg": "Проверката на риска записва HOLD (или UNKNOWN, или нищо) за това точно действие, което не е разрешение.",
     "en": "The risk check records HOLD (or UNKNOWN, or nothing at all) for this exact action, which is not a clearance."
    },
    "src": "agent-execution-control/test/unit/authority.test.ts:93"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "Човек иска да издаде еднократно разрешение за същото действие; заявката е валидна и стига до слоя на базата данни.",
     "en": "A human asks to issue a single-use permit for the same action; the request is well-formed so it reaches the database layer."
    },
    "src": "agent-execution-control/test/unit/authority.test.ts:94-99"
   },
   {
    "node": 2,
    "state": "stop",
    "text": {
     "bg": "Вратата установява, че записаното решение за риск не е точен CLEAR за това действие, версия и зависимости, и вдига грешка.",
     "en": "The gate finds the stored risk decision is not an exact CLEAR for this action, version and dependencies, and raises an error."
    },
    "src": "agent-execution-control/migrations/004_no_override_dual_gate.sql:36-40"
   },
   {
    "node": 2,
    "state": "stop",
    "text": {
     "bg": "Същата проверка се повтаря в кода на приложението преди вмъкването, така че отказът не зависи само от един слой.",
     "en": "The same check is repeated in the application code before the insert, so the refusal does not depend on one layer alone."
    },
    "src": "agent-execution-control/src/postgres/repository.ts:124-125"
   },
   {
    "node": 3,
    "state": "stop",
    "text": {
     "bg": "Няма ред с разрешение, така че няма какво да бъде заявено или изпратено към адаптера на агента.",
     "en": "No permit row exists, so there is nothing that could be claimed or dispatched to the agent's adapter."
    },
    "src": "agent-execution-control/test/unit/authority.test.ts:100"
   }
  ]
 },
 "ai-proposal-evaluator": {
  "title": {
   "bg": "Десет малки действия, един преминат лимит",
   "en": "Ten small actions, one limit crossed"
  },
  "input": {
   "label": {
    "bg": "Тест R1: десет действия по 100, с общ лимит 500 върху 'amount' (CAP)",
    "en": "Test R1: ten actions of 100 each, with a total limit of 500 on 'amount' (CAP)"
   },
   "text": "test(\"R1. ten permitted actions may not sum past a limit none of them crossed\", () => {\n  const c = new Core();\n  const decisions = [];\n  for (let i = 0; i < 10; i++) decisions.push(spend(c, 100, CAP).decision);",
   "src": "ai-proposal-evaluator/adversarial-cumulative-limit.test.js:32-35"
  },
  "output": {
   "label": {
    "bg": "Очакван резултат: пет CLEAR, после HOLD от шестото нататък",
    "en": "Expected result: five CLEAR, then HOLD from the sixth on"
   },
   "text": "  assert.deepStrictEqual(decisions.slice(0, 5), Array(5).fill(\"CLEAR\"));\n  assert.strictEqual(decisions[5], \"HOLD\", \"the sixth crosses 500 and must be refused\");\n  assert.ok(decisions.slice(5).every((d) => d === \"HOLD\"));",
   "src": "ai-proposal-evaluator/adversarial-cumulative-limit.test.js:37-39",
   "run": false
  },
  "why": {
   "bg": "Всяко действие поотделно е допустимо, но оценителят помни вече изпълненото и задържа шестото, защото натрупаната сума би надхвърлила лимита.",
   "en": "Each action is fine on its own, but the evaluator remembers what was already executed and holds the sixth one because the running total would pass the limit."
  },
  "limits": {
   "bg": "Gate 19 отчита само това, което предоставеният журнал показва като изпълнено, в един процес; няма устойчивост на данните нито атомарност между процеси, и оценява формата на числата, не дали са верни.",
   "en": "Gate 19 only counts what the supplied journal shows as executed, in one process; there is no persistence or multi-process atomicity, and it judges the shape of the numbers, not whether they are true."
  },
  "nodes": [
   {
    "n": {
     "bg": "Оценка на предложението",
     "en": "Evaluate proposal"
    },
    "fn": "Core.evaluate (core.js)"
   },
   {
    "n": {
     "bg": "Кумулативен лимит",
     "en": "Cumulative limit"
    },
    "fn": "Gate 19 inside Core.evaluate (core.js)"
   },
   {
    "n": {
     "bg": "Вземане на заключване на действието",
     "en": "Take action lock"
    },
    "fn": "Core.begin (core.js)"
   },
   {
    "n": {
     "bg": "Отбелязване като изпълнено",
     "en": "Mark executed"
    },
    "fn": "Core.complete (core.js)"
   },
   {
    "n": {
     "bg": "Запис в журнала",
     "en": "Journal record"
    },
    "fn": "Core.release (core.js)"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Действие 1 със стойност 100 се оценява и никоя врата не възразява, така че решението е CLEAR.",
     "en": "Action 1 of 100 is evaluated and no gate objects, so the verdict is CLEAR."
    },
    "src": "ai-proposal-evaluator/adversarial-cumulative-limit.test.js:23-24"
   },
   {
    "node": 2,
    "state": "pass",
    "text": {
     "bg": "Тестът взема единственото заключване на действието с това решение и непроменено предложение.",
     "en": "The test takes the single action lock with that verdict and the unchanged proposal."
    },
    "src": "ai-proposal-evaluator/adversarial-cumulative-limit.test.js:26"
   },
   {
    "node": 3,
    "state": "pass",
    "text": {
     "bg": "Отбелязва действието като изпълнено, така че то се брои срещу лимита.",
     "en": "It marks the action as executed, so it counts against the limit."
    },
    "src": "ai-proposal-evaluator/adversarial-cumulative-limit.test.js:27"
   },
   {
    "node": 4,
    "state": "pass",
    "text": {
     "bg": "Действието се освобождава и се добавя в журнала; действия 2 до 5 повтарят това, докато са изпълнени 500, точно колкото е лимитът.",
     "en": "The action is released and appended to the journal; actions 2 to 5 repeat this until 500 has been executed, exactly the limit."
    },
    "src": "ai-proposal-evaluator/adversarial-cumulative-limit.test.js:28"
   },
   {
    "node": 1,
    "state": "hold",
    "text": {
     "bg": "При действие 6 вратата прибавя вече изпълнените 500 към поисканите 100; 600 надвишава лимита от 500.",
     "en": "At action 6 the gate adds the 500 already executed to the 100 asked for; 600 is over the limit of 500."
    },
    "src": "ai-proposal-evaluator/core.js:672-686"
   },
   {
    "node": 0,
    "state": "hold",
    "text": {
     "bg": "Решението е HOLD с причина, назоваваща сбора, и същото се случва с всяко следващо действие, така че нищо повече не се изпълнява, докато човек не прегледа.",
     "en": "The verdict is HOLD with a reason naming the sum, and the same happens to every later action, so nothing further runs until a human looks."
    },
    "src": "ai-proposal-evaluator/core.js:683-689"
   }
  ]
 },
 "agent-action-verifier": {
  "title": {
   "bg": "Адаптер тихомълком добавя получател в cc",
   "en": "Adapter silently adds a cc recipient"
  },
  "input": {
   "label": {
    "bg": "Разрешена обвивка (BASE), после адаптерът я представя с допълнително поле 'cc'",
    "en": "Authorised envelope (BASE), then the adapter presents it with an extra 'cc' field"
   },
   "text": "const BASE = {\n  action: 'send', object: 'invoice-77', target: 'acme@example.test',\n  scope: 'single', quantity: 1, permissions: ['write:invoice'], sideEffects: [],\n};\n…\n  const r1 = checkEnvelope(BASE, { ...BASE, cc: ['boss@example.test'] });",
   "src": "agent-action-verifier/test.js:9-153"
  },
  "output": {
   "label": {
    "bg": "Очакван резултат: STOP, с посочено неизброеното поле",
    "en": "Expected result: STOP, naming the unlisted field"
   },
   "text": "  assert.equal(r1.decision, 'STOP');\n  assert.deepEqual(r1.changed, ['unmodelled:cc']);",
   "src": "agent-action-verifier/test.js:154-155",
   "run": false
  },
  "why": {
   "bg": "Разрешение за изпращане на една фактура до един клиент не се разпростира върху копие до трета страна; всяко поле, което никой не е моделирал, се счита за промяна и се спира.",
   "en": "A permit to send one invoice to one customer does not stretch to copying a third party; any field nobody modelled is treated as a change and stopped."
  },
  "limits": {
   "bg": "Верификаторът няма собствена проба и никога не е свързан с изпълнителна среда: списъците с полета са проектни решения, не доказателства, и никакъв адаптер реално не се извиква.",
   "en": "The verifier has no probe of its own and was never wired to a runtime: the field lists are design decisions, not proofs, and no adapter is actually called."
  },
  "nodes": [
   {
    "n": {
     "bg": "Обвивка на разрешението",
     "en": "Permit envelope"
    },
    "fn": "MATERIAL_FIELDS (envelope.js)"
   },
   {
    "n": {
     "bg": "Каноничен вид",
     "en": "Canonical form"
    },
    "fn": "canonical (envelope.js)"
   },
   {
    "n": {
     "bg": "Съществени полета",
     "en": "Material fields"
    },
    "fn": "checkEnvelope (envelope.js)"
   },
   {
    "n": {
     "bg": "Немоделирани полета",
     "en": "Unmodelled fields"
    },
    "fn": "checkEnvelope (envelope.js)"
   },
   {
    "n": {
     "bg": "Решение",
     "en": "Decision"
    },
    "fn": "checkEnvelope (envelope.js)"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Разрешението оторизира едно действие: изпращане на invoice-77 до acme@example.test, единично, количество 1.",
     "en": "The permit authorised one action: send invoice-77 to acme@example.test, single, quantity 1."
    },
    "src": "agent-action-verifier/test.js:9-12"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "Версията на адаптера е същата плюс ново поле cc; двете страни се привеждат в каноничен вид със сортирани ключове, така че редът на ключовете да не скрие промяна.",
     "en": "The adapter's version is the same plus a new cc field; both sides are put into a canonical form with sorted keys so key order cannot hide a change."
    },
    "src": "agent-action-verifier/envelope.js:45-50"
   },
   {
    "node": 2,
    "state": "pass",
    "text": {
     "bg": "Седемте съществени полета (action, object, target, scope, quantity, permissions, side effects) са идентични, така че нито едно не е отбелязано.",
     "en": "The seven material fields (action, object, target, scope, quantity, permissions, side effects) are all identical, so none is flagged."
    },
    "src": "agent-action-verifier/envelope.js:74-78"
   },
   {
    "node": 3,
    "state": "stop",
    "text": {
     "bg": "Полето cc не е нито в списъка на съществените, нито в списъка на безвредните метаданни, затова появата му се записва като разлика.",
     "en": "The cc field is in neither the material list nor the harmless-metadata list, so its appearance is recorded as a difference."
    },
    "src": "agent-action-verifier/envelope.js:80-84"
   },
   {
    "node": 4,
    "state": "stop",
    "text": {
     "bg": "Резултатът е STOP с changed = unmodelled:cc, и разрешението не оторизира трансформираното действие.",
     "en": "The result is STOP with changed = unmodelled:cc, and the permit does not authorise the transformed action."
    },
    "src": "agent-action-verifier/envelope.js:96-101"
   }
  ]
 },
 "payload-policy-validator": {
  "title": {
   "bg": "Липсващо поле в схема с десет полета",
   "en": "Missing field in a ten-field schema"
  },
  "input": {
   "label": {
    "bg": "Тест: схемата изисква полета f0..f(n-1); товарът има всички освен последното (n = 10, 20, 50)",
    "en": "Test: schema requires fields f0..f(n-1); payload has all but the last (n = 10, 20, 50)"
   },
   "text": "        for n in (10, 20, 50):\n            schema = {\"required_fields\": [f\"f{i}\" for i in range(n)]}\n            payload = {f\"f{i}\": 1 for i in range(n - 1)}\n            m, _ = v.compute_policy_discrepancy(payload, schema)",
   "src": "payload-policy-validator/test_payload_policy_validator.py:89-92"
  },
  "output": {
   "label": {
    "bg": "Очакван резултат: EXECUTION_LOCK за всеки размер на схемата",
    "en": "Expected result: EXECUTION_LOCK for every schema size"
   },
   "text": "            self.assertEqual(\n                v.evaluate_loop(m=m, t_pred=0.0)[\"decision\"], \"EXECUTION_LOCK\",\n                f\"missing field passed with a {n}-field schema (m={m})\",\n            )",
   "src": "payload-policy-validator/test_payload_policy_validator.py:93-96",
   "run": false
  },
  "why": {
   "bg": "Старата версия пускаше товар с едно липсващо задължително поле, когато схемата беше дълга; оценяването в постоянна скала дава еднакъв резултат за същото нарушение навсякъде и то се спира.",
   "en": "The old version let a payload with one missing required field run when the schema was long; scoring on a fixed scale means the same violation gives the same score everywhere and is stopped."
  },
  "limits": {
   "bg": "Всички числа (M_DENOM, теглата, sigma и m_lock) са стойности по подразбиране, които още чакат прогон върху реален безвреден трафик, така че това доказва механизма, не калибрацията.",
   "en": "All numbers (M_DENOM, the weights, sigma and m_lock) are defaults still waiting for a run over real benign traffic, so this proves the mechanism, not the calibration."
  },
  "nodes": [
   {
    "n": {
     "bg": "Намиране на нарушения",
     "en": "Find violations"
    },
    "fn": "compute_policy_discrepancy (payload_policy_validator.py)"
   },
   {
    "n": {
     "bg": "Скалиране към m",
     "en": "Scale to m"
    },
    "fn": "compute_policy_discrepancy (payload_policy_validator.py)"
   },
   {
    "n": {
     "bg": "Абсолютна проверка",
     "en": "Absolute check"
    },
    "fn": "evaluate_loop (payload_policy_validator.py)"
   },
   {
    "n": {
     "bg": "Проверка за изненада",
     "en": "Surprise check"
    },
    "fn": "evaluate_loop (payload_policy_validator.py)"
   },
   {
    "n": {
     "bg": "Решение",
     "en": "Decision"
    },
    "fn": "_decision (payload_policy_validator.py)"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Товарът няма последното задължително поле, затова то се изброява като липсващо и получава оценка 1.0.",
     "en": "The payload lacks the last required field, so it is listed as missing and scores 1.0."
    },
    "src": "payload-policy-validator/payload_policy_validator.py:174-175"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "Оценката се дели на константата 4.0, което дава m = 0.25 независимо от дължината на схемата (старият делител растеше със схемата и даваше 0.083 за десет полета).",
     "en": "The score is divided by a constant 4.0, giving m = 0.25 whatever the schema length (the old divisor grew with the schema, giving 0.083 for ten fields)."
    },
    "src": "payload-policy-validator/payload_policy_validator.py:195"
   },
   {
    "node": 2,
    "state": "hold",
    "text": {
     "bg": "Абсолютната проверка сравнява m = 0.25 с прага на заключване 0.35 и сама не сработва.",
     "en": "The absolute check compares m = 0.25 with the lock threshold 0.35 and does not fire on its own."
    },
    "src": "payload-policy-validator/payload_policy_validator.py:234-235"
   },
   {
    "node": 3,
    "state": "stop",
    "text": {
     "bg": "Спрямо базова стойност 0.0 скокът от 0.25 надвишава границата на изненада от около 0.0855, така че относителната проверка сработва.",
     "en": "Against a baseline of 0.0 the jump of 0.25 exceeds the surprise limit of about 0.0855, so the relative check fires."
    },
    "src": "payload-policy-validator/payload_policy_validator.py:236-240"
   },
   {
    "node": 4,
    "state": "stop",
    "text": {
     "bg": "Достатъчно е една от проверките да заключва: решението е EXECUTION_LOCK и товарът чака човек.",
     "en": "Either check locking is enough: the decision is EXECUTION_LOCK and the payload waits for a human."
    },
    "src": "payload-policy-validator/payload_policy_validator.py:265"
   }
  ]
 },
 "batch-file-gateway": {
  "title": {
   "bg": "Тайна, скрита с невидими знаци",
   "en": "Secret hidden with invisible characters"
  },
  "input": {
   "label": {
    "bg": "Тестов файл: API ключ с невидими знаци с нулева ширина вътре (тук невидими), записан във входната папка",
    "en": "Test file: an API key with invisible zero-width characters inside it (invisible here), written to the input folder"
   },
   "text": "    smuggled = \"Бележки. key s​k-proj-1234567890abcdef‌ end\"\n    f = gw.input_dir / \"doc_01.txt\"\n    f.write_text(smuggled, encoding=\"utf-8\")",
   "src": "batch-file-gateway/test_batch_file_gateway.py:52-54"
  },
  "output": {
   "label": {
    "bg": "Очакван резултат: файлът е BLOCKED и скенерът е видял почистения текст",
    "en": "Expected result: the file is BLOCKED and the scanner saw the cleaned text"
   },
   "text": "    assert result[\"status\"] == \"BLOCKED\", \"the hidden key passed through the gateway\"\n    assert \"​\" not in coord.security_guard.evaluated_text, \\\n        \"evaluate_output received the raw text, not the isolated one\"",
   "src": "batch-file-gateway/test_batch_file_gateway.py:58-60",
   "run": false
  },
  "why": {
   "bg": "Ключ, маскиран с невидими знаци, минава през сканиране на суровия файл, затова шлюзът първо ги премахва и сканира почистения текст, после отказва файла.",
   "en": "A key disguised with invisible characters slips past a scan of the raw file, so the gateway strips them first and scans the cleaned text, then refuses the file."
  },
  "limits": {
   "bg": "Истинският охранителен модул не е предоставен, така че резултатът е срещу заместител, а безопасността на шлюза е толкова добра, колкото е вмъкнатият модул.",
   "en": "The real security guard is not supplied, so this result is against a stub, and the gateway's safety is only as good as the injected guard."
  },
  "nodes": [
   {
    "n": {
     "bg": "Четене на файла",
     "en": "Read file"
    },
    "fn": "BatchFileGateway.process_single_file (batch_file_gateway.py)"
   },
   {
    "n": {
     "bg": "Премахване на скритите знаци",
     "en": "Strip hidden chars"
    },
    "fn": "guard.sanitize_input_boundary (injected guard)"
   },
   {
    "n": {
     "bg": "Сканиране за ключ",
     "en": "Key scan"
    },
    "fn": "guard.evaluate_output (injected guard)"
   },
   {
    "n": {
     "bg": "Запис на изхода",
     "en": "Write output"
    },
    "fn": "open(out_path, 'x') in process_single_file"
   },
   {
    "n": {
     "bg": "Ред в одита",
     "en": "Audit line"
    },
    "fn": "BatchFileGateway._audit (batch_file_gateway.py)"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Байтовете на файла се четат и декодират, а хешът и размерът се отбелязват за одитния запис.",
     "en": "The file's bytes are read and decoded, and the hash and size are noted for the audit record."
    },
    "src": "batch-file-gateway/batch_file_gateway.py:89-95"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "Заместителят на охранителния модул в теста изтрива знаците с нулева ширина, така че ключът отново се чете като обикновен низ sk-proj-...",
     "en": "The test's stand-in guard deletes the zero-width characters, so the key reads as a plain sk-proj-... string again."
    },
    "src": "batch-file-gateway/test_batch_file_gateway.py:27-28"
   },
   {
    "node": 2,
    "state": "stop",
    "text": {
     "bg": "Шаблонът за ключ се прилага върху този почистен текст, съвпада, и модулът отчита файла като блокиран.",
     "en": "The key pattern is run on this cleaned text, matches, and the guard reports the file as blocked."
    },
    "src": "batch-file-gateway/test_batch_file_gateway.py:32-34"
   },
   {
    "node": 3,
    "state": "stop",
    "text": {
     "bg": "Тъй като файлът е блокиран, стъпката на запис се пропуска и не се създава изходно копие.",
     "en": "Because the file is blocked, the write step is skipped and no output copy is created."
    },
    "src": "batch-file-gateway/batch_file_gateway.py:107-123"
   },
   {
    "node": 4,
    "state": "stop",
    "text": {
     "bg": "Веднага се добавя един ред в одита със статус BLOCKED и обща причина, но никога собствения текст на модула, който може да цитира тайната.",
     "en": "One audit line is appended at once with status BLOCKED and a generic reason, never the guard's own text that might quote the secret."
    },
    "src": "batch-file-gateway/batch_file_gateway.py:108-109"
   }
  ]
 },
 "status-flow-validator": {
  "title": {
   "bg": "Заявка прескача стъпката COMPLETED",
   "en": "Request skips the COMPLETED step"
  },
  "input": {
   "label": {
    "bg": "Сценарий от самотеста: историята скача от ATTEMPTED направо към VERIFIED",
    "en": "Self-test scenario: history jumps from ATTEMPTED to VERIFIED"
   },
   "text": "(\n        \"COMPLETED skipped (ATTEMPTED -> VERIFIED)\",\n        \"REQ-FLOW-003\",\n        [\"ATTEMPTED\", \"VERIFIED\"],\n        {\"user\": \"operator_2\", \"action\": \"direct_jump\"},\n    ),",
   "src": "status-flow-validator/status_flow_validator.py:291-296"
  },
  "output": {
   "label": {
    "bg": "Реален изход от: python status_flow_validator.py --selftest (сценарий 3)",
    "en": "Real output of: python status_flow_validator.py --selftest (scenario 3)"
   },
   "text": "[HISTORY]: ATTEMPTED -> VERIFIED\n[STAGE 1 status flow]: FAIL (Out-of-order history ATTEMPTED -> VERIFIED; expected prefix ATTEMPTED -> COMPLETED.)\n[STAGE 2 payload scan]: PASS (Payload clear.)\n[VERDICT]: >>> FLOW INCOMPLETE <<<   OK",
   "src": "captured run · produced by status-flow-validator/status_flow_validator.py:319-323",
   "run": true
  },
  "why": {
   "bg": "Заявка, която скача направо към VERIFIED, без никога да е била COMPLETED, се засича и се обявява за непълна, макар товарът ѝ да е чист, така че грешките в процеса и в товара се докладват поотделно.",
   "en": "A request that jumps straight to VERIFIED without ever being COMPLETED is caught and named as incomplete, even though its payload is clean, so process faults and payload faults are reported separately."
  },
  "limits": {
   "bg": "Етап 1 проверява само реда; не проверява времеви печати, участници или правомощия (те са в слоя за контрол на изпълнението), така че правилният ред не доказва нищо за това кой какво и кога е направил.",
   "en": "Stage 1 checks order only; it does not check timestamps, actors or authority (those live in the execution-control layer), so a correct order proves nothing about who did what or when."
  },
  "nodes": [
   {
    "n": {
     "bg": "Четене на историята",
     "en": "Read history"
    },
    "fn": "StatusFlowValidator.check_status_flow (status_flow_validator.py:109)"
   },
   {
    "n": {
     "bg": "Проверка на реда",
     "en": "Check order"
    },
    "fn": "StatusFlowValidator.check_status_flow (status_flow_validator.py:128-141)"
   },
   {
    "n": {
     "bg": "Сканиране на товара",
     "en": "Scan payload"
    },
    "fn": "StatusFlowValidator.scan_payload (status_flow_validator.py:162)"
   },
   {
    "n": {
     "bg": "Избор на заключение",
     "en": "Pick verdict"
    },
    "fn": "StatusFlowValidator.validate (status_flow_validator.py:205-210)"
   },
   {
    "n": {
     "bg": "Запис на отхвърлянето",
     "en": "Log rejection"
    },
    "fn": "StatusFlowValidator._append_log (status_flow_validator.py:232)"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Историята на статусите [ATTEMPTED, VERIFIED] се нормализира (главни букви, подрязване) и се установява, че съдържа само известни статуси.",
     "en": "The status history [ATTEMPTED, VERIFIED] is cleaned up (upper-cased, trimmed) and found to contain only known statuses."
    },
    "src": "status-flow-validator/status_flow_validator.py:109"
   },
   {
    "node": 1,
    "state": "stop",
    "text": {
     "bg": "Изискваният ред казва, че вторият статус трябва да е COMPLETED, но заявката има там VERIFIED, затова етап 1 пропада и назовава липсващия преход.",
     "en": "The required order says the second status must be COMPLETED, but the request has VERIFIED there, so stage 1 fails and names the missing transition."
    },
    "src": "status-flow-validator/status_flow_validator.py:128-141"
   },
   {
    "node": 2,
    "state": "pass",
    "text": {
     "bg": "Сканирането на товара все пак се изпълнява и не намира нито един от шаблоните за тайни или заобикаляне, така че етап 2 минава.",
     "en": "The payload scan runs anyway and finds none of the secret or override patterns, so stage 2 passes."
    },
    "src": "status-flow-validator/status_flow_validator.py:185-191"
   },
   {
    "node": 3,
    "state": "stop",
    "text": {
     "bg": "Тъй като етап 1 е пропаднал, а етап 2 не, заключението е FLOW INCOMPLETE, а не PAYLOAD BLOCKED.",
     "en": "Because stage 1 failed and stage 2 did not, the verdict is FLOW INCOMPLETE rather than PAYLOAD BLOCKED."
    },
    "src": "status-flow-validator/status_flow_validator.py:207-208"
   },
   {
    "node": 4,
    "state": "stop",
    "text": {
     "bg": "Отхвърлянето, с липсващата стъпка и препоръчано действие, но без текст от товара, се добавя в журнала на отхвърлянията.",
     "en": "The rejection, with the missing step and a recommended action but no payload text, is appended to the rejection log."
    },
    "src": "status-flow-validator/status_flow_validator.py:225-228"
   }
  ]
 },
 "defect-register": {
  "title": {
   "bg": "Откриване на '19 gates' срещу 14 gates",
   "en": "Spotting '19 gates' versus 14 gates"
  },
  "input": {
   "label": {
    "bg": "Нов текст, проверен срещу известните форми на грешки в регистъра",
    "en": "New text checked against the register's known failure forms"
   },
   "text": "The site says 19 gates; the code has 14 gates.",
   "src": "defect-register/register.test.js:110-110"
  },
  "output": {
   "label": {
    "bg": "Реален изход от compare() за този текст (семейство и находка)",
    "en": "Real output of compare() on that text (family and finding)"
   },
   "text": "COUNTING_NAMES_NOT_THINGS\n\"gate…\" gets 2 different numbers: 19, 14 — one of them may be the highest NUMBER, not the count",
   "src": "captured run · produced by defect-register/register.js:74-77",
   "run": true
  },
  "why": {
   "bg": "Грешка, допусната веднъж (отчитане на най-високия номер, 19, като брой, когато са съществували само 14), се разпознава автоматично при следващата поява на същата форма в нов текст.",
   "en": "A mistake that was made once (reporting the highest number, 19, as a count when only 14 existed) is recognised automatically the next time the same form appears in a new text."
  },
  "limits": {
   "bg": "compare() покрива само пет машинно откриваеми форми, а останалите се разпознават от читател; регистърът помни известните форми, но не може да види нов вид грешка.",
   "en": "compare() covers only five machine-detectable forms and the rest are recognised by a reader; the register remembers known forms but cannot see a new kind of failure."
  },
  "nodes": [
   {
    "n": {
     "bg": "Изпълнение на детекторите",
     "en": "Run detectors"
    },
    "fn": "compare (register.js:138)"
   },
   {
    "n": {
     "bg": "Проверка на броя",
     "en": "Count check"
    },
    "fn": "DETECTORS.counting_names_not_things (register.js:64)"
   },
   {
    "n": {
     "bg": "Търсене на изключения",
     "en": "Look up exceptions"
    },
    "fn": "exceptionsFor (register.js:129)"
   },
   {
    "n": {
     "bg": "Докладване на семейството",
     "en": "Report family"
    },
    "fn": "compare (register.js:143-146)"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Новото изречение се подава на compare(), който изпробва върху него всяка от петте машинно откриваеми форми на грешки.",
     "en": "The new sentence is handed to compare(), which tries each of the five machine-detectable failure forms on it."
    },
    "src": "defect-register/register.js:140"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "Проверката на броя намира '19 gates' и '14 gates': една и съща преброявана дума, свързана с две различни числа.",
     "en": "The count check finds '19 gates' and '14 gates': the same counted word attached to two different numbers."
    },
    "src": "defect-register/register.js:66-73"
   },
   {
    "node": 1,
    "state": "stop",
    "text": {
     "bg": "Повече от едно число за една дума поражда находка: едно от тях може да е най-високият номер, а не истинският брой.",
     "en": "More than one number for one word raises a finding: one of them may be the highest number, not the real count."
    },
    "src": "defect-register/register.js:74-77"
   },
   {
    "node": 2,
    "state": "hold",
    "text": {
     "bg": "Известните изключения (I-1, I-2) се прикачат като бележки „възможно изключение“; те маркират находката за преценка от човек и никога не я заглушават.",
     "en": "Known exceptions (I-1, I-2) are attached as 'possible exception' notes; they mark the finding for a human to judge and never silence it."
    },
    "src": "defect-register/register.js:129-135"
   },
   {
    "node": 3,
    "state": "stop",
    "text": {
     "bg": "Резултатът назовава семейството COUNTING_NAMES_NOT_THINGS, което е семейството, записано в регистъра за дефект №18.",
     "en": "The result names the family COUNTING_NAMES_NOT_THINGS, which is the family the register recorded for defect #18."
    },
    "src": "defect-register/register.test.js:121-125"
   }
  ]
 },
 "claim-audit-tools": {
  "title": {
   "bg": "Твърдение тихомълком става по-силно",
   "en": "A claim quietly gets stronger"
  },
  "input": {
   "label": {
    "bg": "Команда, сравняваща стара и нова формулировка на едно твърдение",
    "en": "Command comparing an old and a new wording of one claim"
   },
   "text": "node claim-mutation.js \"this may hold in some cases\" \"this proves it holds in all cases\"",
   "src": "claim-audit-tools/README.md:36-36"
  },
  "output": {
   "label": {
    "bg": "Реален изход (после инструментът излиза с код 1)",
    "en": "Real output (the tool then exits with code 1)"
   },
   "text": "🔴 CERTAINTY    1 → 4   UP\n       needs: a new source — certainty does not grow by retelling\n  🔴 SCOPE        1 → 3   UP\n       needs: the cases it was checked on — scope does not grow by itself\n\n  2 strengthening(s) without a new source.",
   "src": "captured run · produced by claim-audit-tools/claim-mutation.js:194-201",
   "run": true
  },
  "why": {
   "bg": "Преминаването от 'may hold in some cases' към 'proves it holds in all cases' се отбелязва по две оси като по-силно твърдение без ново доказателство зад него, така че не може да мине за същото твърдение.",
   "en": "Going from 'may hold in some cases' to 'proves it holds in all cases' is flagged on two axes as a stronger claim that has no new evidence behind it, so it cannot pass as the same claim."
  },
  "limits": {
   "bg": "Тези инструменти преценяват формата на твърдението, никога неговата истинност; claim-mutation не вижда промяна в значението на субекта.",
   "en": "These tools judge the form of a claim, never its truth; claim-mutation cannot see a change in what the subject means."
  },
  "nodes": [
   {
    "n": {
     "bg": "Четене на версиите",
     "en": "Read versions"
    },
    "fn": "report (claim-mutation.js:179)"
   },
   {
    "n": {
     "bg": "Класиране на формулировката",
     "en": "Rank wording"
    },
    "fn": "rung (claim-mutation.js:132)"
   },
   {
    "n": {
     "bg": "Сравнение на осите",
     "en": "Compare axes"
    },
    "fn": "compare (claim-mutation.js:146)"
   },
   {
    "n": {
     "bg": "Отбелязване на увеличенията",
     "en": "Flag increases"
    },
    "fn": "report (claim-mutation.js:194-203)"
   },
   {
    "n": {
     "bg": "Задаване на изходен код",
     "en": "Set exit code"
    },
    "fn": "report (claim-mutation.js:204)"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "По-старата формулировка ('was') и по-новата ('now') се отпечатват една до друга.",
     "en": "The older wording ('was') and the newer wording ('now') are printed side by side."
    },
    "src": "claim-audit-tools/claim-mutation.js:182-183"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "За всяка от шест оси (certainty, scope, causality, conditions, negation, time) се намира най-високото ниво на формулировка, достигнато от всеки текст.",
     "en": "For each of six axes (certainty, scope, causality, conditions, negation, time) the highest wording level reached by each text is found."
    },
    "src": "claim-audit-tools/claim-mutation.js:132-136"
   },
   {
    "node": 2,
    "state": "stop",
    "text": {
     "bg": "Certainty се повишава от ниво 1 на 4, а scope от 1 на 3, затова и двете оси се маркират UP заедно с това, което би изисквало всяко повишение.",
     "en": "Certainty rises from level 1 to 4 and scope from 1 to 3, so both axes are marked UP together with what each increase would need."
    },
    "src": "claim-audit-tools/claim-mutation.js:163-170"
   },
   {
    "node": 3,
    "state": "stop",
    "text": {
     "bg": "Инструментът отпечатва, че има 2 засилвания без нов източник.",
     "en": "The tool prints that there are 2 strengthenings without a new source."
    },
    "src": "claim-audit-tools/claim-mutation.js:200-203"
   },
   {
    "node": 4,
    "state": "stop",
    "text": {
     "bg": "Връща изходен код 1, така че скрипт или рецензент не може да пропусне, че твърдението е засилено.",
     "en": "It returns exit code 1, so a script or reviewer cannot miss that the claim was strengthened."
    },
    "src": "claim-audit-tools/claim-mutation.js:204"
   }
  ]
 },
 "document-claim-checker": {
  "title": {
   "bg": "Документ сочи ред, който не съществува",
   "en": "A document points to a line that is not there"
  },
  "input": {
   "label": {
    "bg": "Два реда от документ, проверени спрямо three.txt, който има 3 реда",
    "en": "Two document lines checked against three.txt, which has 3 lines"
   },
   "text": "self.assertEqual(self.status(\"see `three.txt:2`\"), dc.REF_IN_RANGE)\n        self.assertEqual(self.status(\"see `three.txt:9`\"), dc.FAILED)",
   "src": "document-claim-checker/test_document_claim_checker.py:70-71"
  },
  "output": {
   "label": {
    "bg": "Реален изход на проверителя за тези два реда (код на изход 1)",
    "en": "Real output of the checker on those two lines (exit code 1)"
   },
   "text": "REF  doc.md:1  file_line  three.txt:2   the line exists (3 lines in total); the claim about its content is not machine-checked\nFAIL doc.md:2  file_line  three.txt:9   points to line 9, the file has 3",
   "src": "captured run · produced by document-claim-checker/document_claim_checker.py:235-241",
   "run": true
  },
  "why": {
   "bg": "Проверителят сверява твърденията на документа с файловете на диска, вместо да вярва на документа: препратка към несъществуващ ред е твърда грешка, а към съществуващ е само „в обхват“, не „вярна“.",
   "en": "The checker verifies a document's claims against the files on disk instead of trusting the document: a reference to a line that does not exist is a hard failure, and one that does exist is only called 'in range', not 'correct'."
  },
  "limits": {
   "bg": "REF_IN_RANGE проверява само че редът съществува; дали документът описва този ред правилно не се проверява, и чист доклад не означава, че документът е верен.",
   "en": "REF_IN_RANGE checks only that a line exists; whether the document describes that line correctly is not checked, and a clean report does not mean the document is true."
  },
  "nodes": [
   {
    "n": {
     "bg": "Извличане на твърденията",
     "en": "Extract claims"
    },
    "fn": "scan (document_claim_checker.py:244)"
   },
   {
    "n": {
     "bg": "Намиране на файла",
     "en": "Find file"
    },
    "fn": "find_file (document_claim_checker.py:141)"
   },
   {
    "n": {
     "bg": "Преброяване на редовете",
     "en": "Count lines"
    },
    "fn": "check_file_line (document_claim_checker.py:221)"
   },
   {
    "n": {
     "bg": "Присвояване на статус",
     "en": "Assign status"
    },
    "fn": "check_file_line (document_claim_checker.py:233-241)"
   },
   {
    "n": {
     "bg": "Код на изход",
     "en": "Exit code"
    },
    "fn": "main (document_claim_checker.py:261)"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Редът 'see `three.txt:9`' се чете и препратката към ред 9 на three.txt се извлича като твърдение.",
     "en": "The line 'see `three.txt:9`' is read and the reference to line 9 of three.txt is extracted as a claim."
    },
    "src": "document-claim-checker/document_claim_checker.py:252-254"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "three.txt е намерен директно в основната папка, така че твърдението може да се провери.",
     "en": "three.txt is found directly under the root folder, so the claim can be checked."
    },
    "src": "document-claim-checker/document_claim_checker.py:152-156"
   },
   {
    "node": 2,
    "state": "pass",
    "text": {
     "bg": "Файлът на диска се преброява и има само 3 реда.",
     "en": "The file on disk is counted and has only 3 lines."
    },
    "src": "document-claim-checker/document_claim_checker.py:229"
   },
   {
    "node": 3,
    "state": "stop",
    "text": {
     "bg": "Ред 9 е отвъд ред 3, затова твърдението се маркира FAILED ('points to line 9, the file has 3'), докато съседното твърдение 'three.txt:2' получава само REF_IN_RANGE.",
     "en": "Line 9 is beyond line 3, so the claim is marked FAILED ('points to line 9, the file has 3'), while the neighbouring 'three.txt:2' claim only gets REF_IN_RANGE."
    },
    "src": "document-claim-checker/document_claim_checker.py:233-236"
   },
   {
    "node": 4,
    "state": "stop",
    "text": {
     "bg": "Тъй като поне едно твърдение е FAILED, изпълнението завършва с код на изход 1.",
     "en": "Because at least one claim FAILED, the run ends with exit code 1."
    },
    "src": "document-claim-checker/README.md:34"
   }
  ]
 },
 "evidence-retriever": {
  "title": {
   "bg": "Намиране на твърдение с точния му адрес",
   "en": "Finding a claim with its exact address"
  },
  "input": {
   "label": {
    "bg": "Примерна бележка, търсена със заявката 'prompt injection'",
    "en": "Sample note searched for the query 'prompt injection'"
   },
   "text": "## Attack surface\n\n- 🟢 `source` Indirect prompt injection through retrieved documents is listed as an agent risk by OWASP. https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html",
   "src": "evidence-retriever/sample/SAMPLE_AGENT_RISKS_CANDIDATE.md:3-5"
  },
  "output": {
   "label": {
    "bg": "Реален изход от: evidence_retriever.ps1 \"prompt injection\" -Root ./sample -Format Markdown",
    "en": "Real output of: evidence_retriever.ps1 \"prompt injection\" -Root ./sample -Format Markdown"
   },
   "text": "Results returned: 1\n\n## SAMPLE_AGENT_RISKS_CANDIDATE.md:5\n\n- Section: ## Attack surface\n- Explicit confidence: 🟢 established\n- Explicit mode: source\n- Explicit signals: none-on-matched-line\n- URLs on matched line: https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html",
   "src": "captured run · produced by evidence-retriever/evidence_retriever.ps1:222-229",
   "run": true
  },
  "why": {
   "bg": "Резултатът от търсенето идва с файла, номера на реда, раздела, маркера за увереност и връзката, записани на същия този ред, така че твърдението може да се проследи до своя адрес, а не да се помни.",
   "en": "A search hit comes back with its file, line number, section, the confidence marker and link written on that very line, so a claim can be traced to its address rather than remembered."
  },
  "limits": {
   "bg": "Дава проследимост, не релевантност или истинност: единствената полза пред обикновеното текстово търсене е адресът и маркерите на ниво ред, а заявка без попадения означава „не е намерено“, не „липсва“.",
   "en": "It gives traceability, not relevance or truth: the only gain over plain text search is the address and the line-level markers, and a query with no hits means 'not found', not 'absent'."
  },
  "nodes": [
   {
    "n": {
     "bg": "Събиране на файловете",
     "en": "Collect files"
    },
    "fn": "Get-ChildItem filter (evidence_retriever.ps1:144)"
   },
   {
    "n": {
     "bg": "Съвпадение на редове",
     "en": "Match lines"
    },
    "fn": "main loop (evidence_retriever.ps1:150-169)"
   },
   {
    "n": {
     "bg": "Четене на маркерите",
     "en": "Read markers"
    },
    "fn": "Get-ExplicitConfidence (evidence_retriever.ps1:47)"
   },
   {
    "n": {
     "bg": "Класиране на резултатите",
     "en": "Rank results"
    },
    "fn": "Get-Score (evidence_retriever.ps1:112)"
   },
   {
    "n": {
     "bg": "Отпечатване на адреса",
     "en": "Print address"
    },
    "fn": "Markdown output branch (evidence_retriever.ps1:207-231)"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Четат се само Markdown файлове, чието име съдържа CANDIDATE; примерната папка има два такива.",
     "en": "Only Markdown files whose name contains CANDIDATE are read; the sample folder has two of them."
    },
    "src": "evidence-retriever/evidence_retriever.ps1:144"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "Ред 5 съдържа фразата 'prompt injection' и се запазва; останалите редове във файла не съвпадат и се пропускат.",
     "en": "Line 5 contains the phrase 'prompt injection' and is kept; the other lines in the file do not match and are skipped."
    },
    "src": "evidence-retriever/evidence_retriever.ps1:156-169"
   },
   {
    "node": 2,
    "state": "pass",
    "text": {
     "bg": "Зеленият маркер на този ред се чете като 'established', думата `source` като негов режим, и уеб връзката се копира, като се използва само написаното на този ред.",
     "en": "The green marker on that line is read as 'established', the word `source` as its mode, and the web link is copied, using only what is written on that line."
    },
    "src": "evidence-retriever/evidence_retriever.ps1:187-190"
   },
   {
    "node": 3,
    "state": "pass",
    "text": {
     "bg": "Попадението се оценява и се избират най-добрите резултати (тук само един).",
     "en": "The hit is scored and the top results (here just one) are selected."
    },
    "src": "evidence-retriever/evidence_retriever.ps1:196-200"
   },
   {
    "node": 4,
    "state": "pass",
    "text": {
     "bg": "Резултатът се отпечатва с файла, номера на реда, раздела, увереността, режима и URL, така че твърдението да може да се намери отново.",
     "en": "The result is printed with its file, line number, section, confidence, mode and URL, so the claim can be found again."
    },
    "src": "evidence-retriever/evidence_retriever.ps1:222-229"
   }
  ]
 },
 "agent-threat-model": {
  "title": {
   "bg": "Prompt injection не бива да стига до действие",
   "en": "Prompt injection must not reach an action"
  },
  "input": {
   "label": {
    "bg": "Риск с ранг №2 в модела на заплахите",
    "en": "Risk ranked #2 in the threat model"
   },
   "text": "| 2 | Indirect prompt/tool injection leads to an action or a leak | high | critical | 🟡 | external content mixes data and instructions; separate reader from actor, validate every action |",
   "src": "agent-threat-model/THREAT_MODEL.md:61-61"
  },
  "output": {
   "label": {
    "bg": "Планирани контроли 3 и 4, които му отговарят",
    "en": "Planned controls 3 and 4 that answer it"
   },
   "text": "3. **Untrusted-content quarantine:** web/email/doc/tool output is marked as data, not authority. The reader agent has no privileged tools; the actor receives only schema-validated facts/proposals. Support: NIST agent hijacking + OWASP Agent/MCP.\n4. **Technical approval gate:** an external/irreversible action is not executed through the model's \"sense of consent\". The owner sees target, exact parameters, data leaving the boundary, cost, diff, rollback and expiry; the approval token is single-use and is checked by the executor.",
   "src": "agent-threat-model/THREAT_MODEL.md:107-108",
   "run": false
  },
  "why": {
   "bg": "Показва как докладът се справя с един конкретен риск: враждебна инструкция, скрита в уеб страница или имейл, се държи далеч от всеки инструмент, който може да действа, а одобрен от човек, еднократен токен стои между текста и действието.",
   "en": "It shows how the report tackles one concrete risk: a hostile instruction hidden in a web page or email is kept away from any tool that can act, and a human-approved, single-use token stands between the text and the action."
  },
  "limits": {
   "bg": "Това е план на проектно ниво: нищо в доклада не е тест за проникване, реална оценка или доказателство, че някой контрол е внедрен, а вероятностите са относителни приоритети, не измерени честоти.",
   "en": "This is a design-level plan: nothing in the report is a penetration test, a live assessment or proof that any control is implemented, and the likelihoods are relative priorities, not measured frequencies."
  },
  "nodes": [
   {
    "n": {
     "bg": "Недоверено съдържание",
     "en": "Untrusted content"
    },
    "fn": "THREAT_MODEL.md section 2, row 'Prompt/context' (line 35)"
   },
   {
    "n": {
     "bg": "Агент-читател",
     "en": "Reader agent"
    },
    "fn": "THREAT_MODEL.md section 5, control 3 (line 107)"
   },
   {
    "n": {
     "bg": "Проверка на схемата",
     "en": "Schema check"
    },
    "fn": "THREAT_MODEL.md section 5, control 3 (line 107)"
   },
   {
    "n": {
     "bg": "Врата за одобрение",
     "en": "Approval gate"
    },
    "fn": "THREAT_MODEL.md section 5, control 4 (line 108)"
   },
   {
    "n": {
     "bg": "Изпълнител",
     "en": "Executor"
    },
    "fn": "THREAT_MODEL.md section 5, control 4 (line 108)"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Уеб страница, имейл или изход от инструмент пристига със скрити инструкции; етикетира се като данни, не като авторитет.",
     "en": "A web page, email or tool output arrives carrying hidden instructions; it is labelled as data, not as authority."
    },
    "src": "agent-threat-model/THREAT_MODEL.md:107"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "Агент-читател без привилегировани инструменти го чете, така че четенето на текста само по себе си не може да направи нищо.",
     "en": "A reader agent that has no privileged tools reads it, so reading the text cannot by itself do anything."
    },
    "src": "agent-threat-model/THREAT_MODEL.md:107"
   },
   {
    "node": 2,
    "state": "stop",
    "text": {
     "bg": "Към агента, който действа, се предават само валидирани по схема факти или предложения, така че суровата инструкция в текста не стига до него като команда.",
     "en": "Only schema-validated facts or proposals are passed to the agent that acts, so a raw instruction in the text does not reach it as a command."
    },
    "src": "agent-threat-model/THREAT_MODEL.md:107"
   },
   {
    "node": 3,
    "state": "hold",
    "text": {
     "bg": "Всяко външно или необратимо действие чака собственика, който вижда целта, точните параметри, цената, diff, възстановяването и срока на валидност.",
     "en": "Any external or irreversible action waits for the owner, who sees the target, exact parameters, cost, diff, rollback and expiry."
    },
    "src": "agent-threat-model/THREAT_MODEL.md:108"
   },
   {
    "node": 4,
    "state": "stop",
    "text": {
     "bg": "Изпълнителят действа само ако намери валиден еднократен токен за одобрение, така че собственото „чувство за съгласие“ на модела никога не е достатъчно.",
     "en": "The executor acts only if it finds a valid single-use approval token, so the model's own 'sense of consent' is never enough."
    },
    "src": "agent-threat-model/THREAT_MODEL.md:108"
   }
  ]
 },
 "observer-gated-control-sim": {
  "title": {
   "bg": "Лъжлив сензор срещу контролер с врата",
   "en": "A lying sensor versus a gated controller"
  },
  "input": {
   "label": {
    "bg": "Грешката, инжектирана в сензора",
    "en": "The fault injected into the sensor"
   },
   "text": "FAULT = (300, 360)               # window of the sensor bias fault\nFAULT_BIAS = 35.0                # the sensor reads +35 °C too high (drives cooling)",
   "src": "observer-gated-control-sim/observer_gated_control.py:48-49"
  },
  "output": {
   "label": {
    "bg": "Отпечатани метрики, seed 7",
    "en": "Printed metrics, seed 7"
   },
   "text": "Metric                          DIRECT    OBSERVER      better\n--------------------------------------------------------------\nIAE (total)                    5766.73     4440.23    OBSERVER\nIAE (clean regime)             3730.87     4387.05      DIRECT\nMax deviation / fault            43.02        2.15    OBSERVER\nMin temperature / fault         136.98      177.85    OBSERVER\nActuator TV (chattering)        145.63       31.49    OBSERVER",
   "src": "observer-gated-control-sim/evidence/2026-10-26/METRICS_seed7_i_clamp400.txt:2-8",
   "run": false
  },
  "why": {
   "bg": "Шестдесет секунди сензорът на термостат отчита 35 градуса повече; обикновеният контролер реагира прекомерно (до 43.02 градуса от целта), а контролерът, който сверява показанието с модел, остава в рамките на 2.15 градуса, на цената да е по-лош, когато сензорът е честен.",
   "en": "For 60 seconds a thermostat sensor reads 35 degrees too high; the plain controller overreacts (up to 43.02 degrees off target) while the controller that checks the reading against a model stays within 2.15 degrees, at the price of being worse when the sensor is honest."
  },
  "limits": {
   "bg": "Това е играчков модел (едно състояние, динамика от първи ред, един вид грешка, на наблюдателя е даден истинският модел на процеса) и не показва същата полза при несъответствие на модела или в реален обект; вратата също струва точност при честен сензор (DIRECT печели IAE в чистия режим в 50 от 50 seed-а).",
   "en": "It is a toy model (one state, first-order dynamics, one fault type, the observer is given the true process model) and does not show the same gain with model mismatch or in a real plant; the gate also costs accuracy when the sensor is honest (DIRECT wins the clean-regime IAE in 50 of 50 seeds)."
  },
  "nodes": [
   {
    "n": {
     "bg": "Неизправен сензор",
     "en": "Faulty sensor"
    },
    "fn": "make_sensor() in observer_gated_control.py"
   },
   {
    "n": {
     "bg": "Остатък",
     "en": "Residual"
    },
    "fn": "run(), step 1 (residual against model prediction)"
   },
   {
    "n": {
     "bg": "Тегло на доверие",
     "en": "Trust weight"
    },
    "fn": "run(), step 2 (w = exp(-r^2 / 2(gate*sig_r)^2))"
   },
   {
    "n": {
     "bg": "PID върху оценката",
     "en": "PID on estimate"
    },
    "fn": "pid_step() called from run(), step 4"
   },
   {
    "n": {
     "bg": "Ограничаване на скоростта",
     "en": "Rate limit"
    },
    "fn": "run(), step 3 (du = DU_MIN + (DU_MAX - DU_MIN)*w)"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Между 300 s и 360 s сензорът отчита 35 градуса повече от реалната температура, така че на контролера се казва, че процесът е твърде горещ, когато е на зададената стойност.",
     "en": "Between 300 s and 360 s the sensor reports 35 degrees more than the real temperature, so the controller is told the process is too hot when it is at the setpoint."
    },
    "src": "observer-gated-control-sim/observer_gated_control.py:68-69"
   },
   {
    "node": 1,
    "state": "hold",
    "text": {
     "bg": "Наблюдателят сравнява показанието с това, което моделът му е предвидил; разликата (остатъкът) е далеч извън вратата от 3 пъти нормалния си размер, но още не може да каже дали греши сензорът, или моделът.",
     "en": "The observer compares the reading with what its model predicted; the gap (the residual) is far outside the gate of 3 times its normal size, but it cannot yet tell if the sensor or the model is wrong."
    },
    "src": "observer-gated-control-sim/observer_gated_control.py:110-111"
   },
   {
    "node": 2,
    "state": "stop",
    "text": {
     "bg": "Изненадващото показание получава ниско тегло на доверие, така че оценката взема само малка част от него; тест фиксира, че доверието е по-ниско по време на грешката, отколкото извън нея.",
     "en": "The surprising reading gets a low trust weight, so the estimate takes only a small part of it; a test pins that trust is lower during the fault than outside it."
    },
    "src": "observer-gated-control-sim/test_observer_gated_control.py:90-95"
   },
   {
    "node": 3,
    "state": "pass",
    "text": {
     "bg": "PID (стандартната формула за обратна връзка) работи с тази доверена оценка вместо със суровото показание.",
     "en": "The PID (the standard feedback formula) works from this trusted estimate instead of the raw reading."
    },
    "src": "observer-gated-control-sim/observer_gated_control.py:122"
   },
   {
    "node": 4,
    "state": "pass",
    "text": {
     "bg": "Ниското доверие също свива колко може да се премести мощността на нагревателя за една проба, и резултатът е максимално отклонение от 2.15 градуса срещу 43.02 за директния контролер.",
     "en": "Low trust also shrinks how far the heater power may move per sample, and the result is a maximum deviation of 2.15 degrees against 43.02 for the direct controller."
    },
    "src": "observer-gated-control-sim/observer_gated_control.py:125-126"
   }
  ]
 },
 "source-monitoring-pilot-sim": {
  "title": {
   "bg": "Объркан сценарий отказва твърдение за механизъм",
   "en": "Confounded scenario refuses a mechanism claim"
  },
  "input": {
   "label": {
    "bg": "Синтетичният сценарий 'confounded_demand'",
    "en": "The synthetic 'confounded_demand' scenario"
   },
   "text": "# Apparent Δc in predicted direction, MPoD-s difference present,\n    # BUT credibility/expectancy also differs beyond margin (confound).\n    # -> MUST trigger the failure rule: mechanism unsupported.\n    \"confounded_demand\": {\n        \"d_dprime\": 0.0,\n        \"d_c\": 0.30,\n        \"mc_offsets\": {\n            \"mpod_s_state_decentering\": 1.5,\n            \"credibility_expectancy\": 1.2,   # confound beyond matched_margin\n        },\n        \"note\": \"Δc present but manipulation confounded by expectancy; failure rule must fire.\",\n    },",
   "src": "source-monitoring-pilot-sim/src/config.py:117-128"
  },
  "output": {
   "label": {
    "bg": "Заключение, записано за този сценарий",
    "en": "Verdict written for that scenario"
   },
   "text": "\"confounded_dimensions\": [\n        \"credibility_expectancy\"\n      ]\n    },\n    \"final_interpretation\": \"CONFOUNDED_criterion_present_mechanism_unsupported\",",
   "src": "source-monitoring-pilot-sim/outputs/verdicts.json:257-261",
   "run": false
  },
  "why": {
   "bg": "Конвейерът вижда реално изглеждаща промяна в критерия за отговор, забелязва, че участниците в едно условие също са очаквали задачата да работи по-добре, и затова отказва да припише ефекта на предвидения механизъм, което е проверката, която прибързан анализ би пропуснал.",
   "en": "The pipeline sees a real-looking shift in the response criterion, notices that participants in one condition also expected the task to work better, and so refuses to credit the intended mechanism, which is the check a hasty analysis would skip."
  },
  "limits": {
   "bg": "Всичко е синтетично и не валидира никаква хипотеза; границите и размерите на ефекта са кандидат-стойности, не емпирично обосновани, а доставената логика на заключението е описателна, не изводното напасване на модела.",
   "en": "Everything is synthetic and validates no hypothesis; the margins and effect sizes are candidate values, not empirically justified, and the shipped verdict logic is descriptive, not the inferential model fit."
  },
  "nodes": [
   {
    "n": {
     "bg": "Генериране на данни",
     "en": "Generate data"
    },
    "fn": "generate_scenario() in src/generate.py"
   },
   {
    "n": {
     "bg": "Оценка на критерия",
     "en": "Score criterion"
    },
    "fn": "contrasts() in src/analyze.py"
   },
   {
    "n": {
     "bg": "Проверка на манипулацията",
     "en": "Manipulation check"
    },
    "fn": "manipulation_check_verdict() in src/manipulation_check.py"
   },
   {
    "n": {
     "bg": "Крайно заключение",
     "en": "Final verdict"
    },
    "fn": "final_interpretation() in src/analyze.py"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Генерират се синтетични участници с вграден сдвиг на критерия 0.30 и допълнителни 1.2 точки очаквана достоверност в групата по децентриране.",
     "en": "Synthetic participants are generated with a built-in criterion shift of 0.30 and an extra 1.2 points of expected credibility in the decentering group."
    },
    "src": "source-monitoring-pilot-sim/src/config.py:120-126"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "Измерената разлика в критерия е 0.3417, над границата за решение 0.1, докато разликата в чувствителността (0.0988) остава под границата си 0.15.",
     "en": "The measured criterion difference comes out at 0.3417, above the 0.1 decision margin, while the sensitivity difference (0.0988) stays under its 0.15 margin."
    },
    "src": "source-monitoring-pilot-sim/outputs/verdicts.json:217-218"
   },
   {
    "node": 2,
    "state": "pass",
    "text": {
     "bg": "Предвидената манипулация е сработила: целевата скала се различава с 1.5178, над минимума 0.5.",
     "en": "The intended manipulation worked: the target scale differs by 1.5178, above the minimum of 0.5."
    },
    "src": "source-monitoring-pilot-sim/src/manipulation_check.py:79"
   },
   {
    "node": 2,
    "state": "stop",
    "text": {
     "bg": "Но очакването за достоверност също се различава с 1.2405, отвъд допустимите 0.5 за съпоставени измерения, така че проверката връща 'confounded_expectancy'.",
     "en": "But credibility expectancy also differs by 1.2405, beyond the 0.5 allowed for matched dimensions, so the check returns 'confounded_expectancy'."
    },
    "src": "source-monitoring-pilot-sim/src/manipulation_check.py:82-88"
   },
   {
    "node": 3,
    "state": "stop",
    "text": {
     "bg": "Объркана проверка при наличен сдвиг на критерия се означава 'criterion present, mechanism unsupported'.",
     "en": "A confounded check with a criterion shift present is labelled 'criterion present, mechanism unsupported'."
    },
    "src": "source-monitoring-pilot-sim/src/analyze.py:81-83"
   }
  ]
 },
 "keynes-beauty-contest-sim": {
  "title": {
   "bg": "Най-дълбокият мислител губи конкурса за красота",
   "en": "Deepest reasoner loses the beauty contest"
  },
  "input": {
   "label": {
    "bg": "Предполагана тълпа от „реални хора“ (дялове по ниво на разсъждение)",
    "en": "Assumed 'real people' crowd (shares per reasoning level)"
   },
   "text": "\"real people (Nagel 1995)\": { 0: 0.1, 1: 0.35, 2: 0.3, 3: 0.15, 4: 0.06, 5: 0.03, 6: 0.01 },",
   "src": "keynes-beauty-contest-sim/keynes_beauty_contest.js:120"
  },
  "output": {
   "label": {
    "bg": "Отпечатан раздел на доклада 'Against real people'",
    "en": "Printed report section 'Against real people'"
   },
   "text": "Against real people:\n  target 17.593\n  level  0 misses by  32.407\n  level  3 misses by   2.778  <- wins\n  level 11 misses by  17.015\n  equilibrium misses by 17.593 — closer than level 0, more than six times further than the winner.",
   "src": "keynes-beauty-contest-sim/evidence/2026-10-26/AFTER.txt:20-25",
   "run": false
  },
  "why": {
   "bg": "В игра, в която печелиш, като познаеш две трети от средното предположение, прекарването през всяко ниво на „те мислят, че аз мисля“ се справя по-зле от спирането на ниво 3, защото правилната дълбочина зависи от това кой друг играе.",
   "en": "In a game where you win by guessing two thirds of the average guess, thinking through every level of 'they think that I think' does worse than stopping at level 3, because the right depth depends on who else is playing."
  },
  "limits": {
   "bg": "Това е модел, не измерване: тълпите са предполагани разпределения (това не са данните на Nagel), а печелившото ниво се променя с тълпата, така че ниво 3 не е общ отговор.",
   "en": "This is a model, not a measurement: the crowds are assumed distributions (this one is not Nagel's data), and the winning level changes with the crowd, so level 3 is not a general answer."
  },
  "nodes": [
   {
    "n": {
     "bg": "Дялове на тълпата",
     "en": "Crowd shares"
    },
    "fn": "CROWDS in keynes_beauty_contest.js"
   },
   {
    "n": {
     "bg": "Стълба на нивата",
     "en": "Level ladder"
    },
    "fn": "choice()"
   },
   {
    "n": {
     "bg": "Средно и цел",
     "en": "Average and target"
    },
    "fn": "play()"
   },
   {
    "n": {
     "bg": "Най-близко ниво",
     "en": "Closest level"
    },
    "fn": "play() loop over levels 0 to 11"
   },
   {
    "n": {
     "bg": "Доклад",
     "en": "Report"
    },
    "fn": "main block under require.main === module"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Тълпата е записана като дялове играчи на всяко ниво на разсъждение, предимно нива 1 и 2 и малко по-дълбоки (предполагано разпределение, не реални данни).",
     "en": "The crowd is written down as shares of players at each reasoning level, mostly levels 1 and 2 and few deeper (an assumed distribution, not real data)."
    },
    "src": "keynes-beauty-contest-sim/keynes_beauty_contest.js:120"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "Играч на ниво k назовава 50 по (2/3) на степен k, така че ниво 0 назовава 50, ниво 3 назовава 14.815, а ниво 11 назовава 0.578.",
     "en": "A player at level k names 50 times (2/3) to the power k, so level 0 names 50, level 3 names 14.815 and level 11 names 0.578."
    },
    "src": "keynes-beauty-contest-sim/keynes_beauty_contest.js:115"
   },
   {
    "node": 2,
    "state": "pass",
    "text": {
     "bg": "Изчислява се средното на тълпата и целта е две трети от него, което тук е 17.593.",
     "en": "The crowd's average is computed and the target is two thirds of it, which is 17.593 here."
    },
    "src": "keynes-beauty-contest-sim/keynes_beauty_contest.js:130-134"
   },
   {
    "node": 3,
    "state": "pass",
    "text": {
     "bg": "Всяко ниво от 0 до 11 се оценява по това колко е далеч числото му от целта; ниво 3 греши само с 2.778 и печели.",
     "en": "Every level from 0 to 11 is scored by how far its number is from the target; level 3 misses by only 2.778 and wins."
    },
    "src": "keynes-beauty-contest-sim/keynes_beauty_contest.js:136-139"
   },
   {
    "node": 4,
    "state": "stop",
    "text": {
     "bg": "Най-дълбокият мислител (ниво 11) греши с 17.015, а равновесният отговор 0 греши с 17.593, така че съвършено разсъждение върху погрешно допускане за другите губи.",
     "en": "The deepest reasoner (level 11) misses by 17.015 and the equilibrium answer 0 misses by 17.593, so perfect reasoning on a wrong assumption about the others loses."
    },
    "src": "keynes-beauty-contest-sim/evidence/2026-10-26/AFTER.txt:24-25"
   }
  ]
 },
 "p-vs-np-gap-measurement": {
  "title": {
   "bg": "Намирането струва 96 милиона стъпки, проверката 9",
   "en": "Finding costs 96 million steps, checking 9"
  },
  "input": {
   "label": {
    "bg": "Задачата, която скриптът си поставя",
    "en": "The task the script sets itself"
   },
   "text": "Subset sum: given n numbers and a target, find a subset\nthat sums to the target.",
   "src": "p-vs-np-gap-measurement/evidence/2026-10-26/AFTER.txt:5-6"
  },
  "output": {
   "label": {
    "bg": "Отпечатани брой стъпки за n = 8 до 22",
    "en": "Printed step counts for n = 8 to 22"
   },
   "text": "n   search space   EXHAUSTION steps   first-hit steps   check steps   ratio\n  8            256               2304               450             4         576\n 10           1024              11264               847             4        2816\n 12           4096              53248             13572             5       10650\n 14          16384             245760              3915             3       81920\n 16          65536            1114112            418914             5      222822\n 18         262144            4980736           2918723             6      830123\n 20        1048576           22020096            692790             9     2446677\n 22        4194304           96468992            496685             9    10718777",
   "src": "p-vs-np-gap-measurement/evidence/2026-10-26/AFTER.txt:8-16",
   "run": false
  },
  "why": {
   "bg": "Прави видима празнината зад въпроса P срещу NP: с 22 числа претърсването на всяко подмножество изисква 96,468,992 отброени стъпки, докато проверката на предложен отговор изисква 9.",
   "en": "It makes the gap behind the P versus NP question visible: with 22 numbers, searching every subset takes 96,468,992 counted steps while checking a proposed answer takes 9."
  },
  "limits": {
   "bg": "Не решава и не може да реши P срещу NP: бавното изчерпване не казва нищо за това дали съществува по-бърз алгоритъм, а са известни по-добри алгоритми за subset-sum (динамично програмиране, meet-in-the-middle).",
   "en": "It does not and cannot resolve P versus NP: exhaustion being slow says nothing about whether a faster algorithm exists, and better subset-sum algorithms (dynamic programming, meet-in-the-middle) are known."
  },
  "nodes": [
   {
    "n": {
     "bg": "Построяване на инстанцията",
     "en": "Build instance"
    },
    "fn": "makeInstance() in p_vs_np_gap.js"
   },
   {
    "n": {
     "bg": "Изчерпващо търсене",
     "en": "Exhaustive search"
    },
    "fn": "find()"
   },
   {
    "n": {
     "bg": "Проверка на отговора",
     "en": "Check answer"
    },
    "fn": "check()"
   },
   {
    "n": {
     "bg": "Сравнение на цената",
     "en": "Compare cost"
    },
    "fn": "measure() and the report in the main block"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Фиксиран генератор на случайни числа прави n четни числа и скрива подмножество в тях, а целта плюс едно (нечетно число) е цел, която със сигурност няма отговор.",
     "en": "A fixed random generator makes n even numbers and hides a subset in them, and the target plus one (an odd number) is a target that certainly has no answer."
    },
    "src": "p-vs-np-gap-measurement/p_vs_np_gap.js:65-70"
   },
   {
    "node": 1,
    "state": "hold",
    "text": {
     "bg": "Намирането пробва всички 2^n подмножества едно по едно, като брои всяко събиране и сравнение за стъпка; за n = 22 това са 96,468,992 стъпки и нищо не се намира, както и трябва.",
     "en": "Finding tries all 2^n subsets one by one, counting each addition and comparison as a step; for n = 22 that is 96,468,992 steps and nothing is found, as it should be."
    },
    "src": "p-vs-np-gap-measurement/p_vs_np_gap.js:87-104"
   },
   {
    "node": 2,
    "state": "pass",
    "text": {
     "bg": "Проверката събира числата на скритото подмножество и сравнява сбора с целта, което отнема 9 стъпки за n = 22.",
     "en": "Checking adds up the numbers of the hidden subset and compares the sum with the target, which takes 9 steps for n = 22."
    },
    "src": "p-vs-np-gap-measurement/p_vs_np_gap.js:74-79"
   },
   {
    "node": 3,
    "state": "pass",
    "text": {
     "bg": "Докладът дели двата броя (10,718,777 за n = 22) и заявява, че проверката остава почти безплатна, а търсенето не.",
     "en": "The report divides the two counts (10,718,777 for n = 22) and states that checking stays almost free while searching does not."
    },
    "src": "p-vs-np-gap-measurement/evidence/2026-10-26/AFTER.txt:16"
   }
  ]
 }
};
