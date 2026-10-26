/* Worked examples per AI platform. Quoted from the portfolio repository and checked against it by tests/examples.test.js.
   Where the repository holds no task done with a platform, the note says so and the example shows the nearest sourced fact. */
window.SSC_AIEX = {
 "claude": {
  "title": {
   "bg": "Подагенти на Claude провеждат експеримент по четене",
   "en": "Claude subagents run a reading experiment"
  },
  "input": {
   "label": {
    "bg": "Как бяха настроени проходите на четене",
    "en": "How the reading passes were set up"
   },
   "text": "- Each pass is a fresh Claude Sonnet subagent with its own copy of the files and no key. It may use only the Read tool: no grep, no code.\n- There are four kinds of pass, 5 runs each:\n  - **F**: forward, files 1 to 5;\n  - **R**: reverse, files 5 to 1;\n  - **FC** and **RC**: the same, writing a checkpoint after the third file and after the last.",
   "src": "dual-pass-reading-probe/README.md:22-26"
  },
  "output": {
   "label": {
    "bg": "Какво показва оцененият резултат",
    "en": "What the scored result says"
   },
   "text": "🟢 **On this material, a second pass in any order adds nothing, because the first pass already missed nothing.** This is a ceiling. It does **not** show that reverse order or checkpoints are useless.",
   "src": "dual-pass-reading-probe/README.md:48",
   "run": false
  },
  "why": {
   "bg": "Claude работи като набор от четци по метода на собственика: планът е хеширан преди пусканията, а отговорите се оценяват от скрипт спрямо ключ, така че изводът е преброен резултат, а не собствена преценка на Claude.",
   "en": "Claude works as a set of readers under the owner's method, with the plan hashed before the runs and the answers scored by a script against a key, so the finding is a counted result, not Claude's own verdict."
  },
  "limits": {
   "bg": "Показва само, че този модел е прочел 2000 еднообразни реда без пропуск; четците са подагенти на Claude Sonnet, а не Claude Code, който пише код, и не е проверено по логовете на инструментите дали всеки проход е спазил правилото „само Read“.",
   "en": "It shows only that this model read 2000 uniform lines without a miss; the readers are Claude Sonnet subagents rather than Claude Code writing code, and whether every pass kept to the Read-only rule was not checked from tool logs."
  },
  "nodes": [
   {
    "n": {
     "bg": "Метод на собственика",
     "en": "Owner's method"
    },
    "fn": "dual-pass-reading-probe/README.md (Purpose)"
   },
   {
    "n": {
     "bg": "Заключен план",
     "en": "Plan locked"
    },
    "fn": "dual-pass-reading-probe/LOCK.txt"
   },
   {
    "n": {
     "bg": "Проходи на Claude",
     "en": "Claude passes"
    },
    "fn": "dual-pass-reading-probe/runs/<id>.prompt.md"
   },
   {
    "n": {
     "bg": "Оценка от скрипт",
     "en": "Scored by script"
    },
    "fn": "python3 score.py"
   },
   {
    "n": {
     "bg": "Резултат: таван",
     "en": "Ceiling result"
    },
    "fn": "dual-pass-reading-probe/results/RESULTS.txt"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Собственикът задава метода: прочита част от материала, чете я отново независимо в обратен ред и сравнява.",
     "en": "The owner states the method: read a portion, read it again independently in reverse order, and compare."
    },
    "src": "dual-pass-reading-probe/README.md:9"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "Планът, материалът, ключът и всички промптове се хешират преди първото пускане.",
     "en": "The plan, the material, the key and all prompts are hashed before any run."
    },
    "src": "dual-pass-reading-probe/README.md:28"
   },
   {
    "node": 2,
    "state": "pass",
    "text": {
     "bg": "Двадесет нови подагенти на Claude Sonnet четат петте лог файла, ограничени до инструмента Read.",
     "en": "Twenty fresh Claude Sonnet subagents read the five log files, restricted to the Read tool."
    },
    "src": "dual-pass-reading-probe/README.md:22"
   },
   {
    "node": 3,
    "state": "pass",
    "text": {
     "bg": "score.py установява, че всеки проход е изброил и 20-те превишения, без фалшиви положителни.",
     "en": "score.py finds every pass listed all 20 exceedances with no false positives."
    },
    "src": "dual-pass-reading-probe/README.md:42"
   },
   {
    "node": 4,
    "state": "hold",
    "text": {
     "bg": "Предварително регистрираното правило гласи, че материалът е бил твърде лесен, затова експериментът не може да покаже дали вторият проход помага.",
     "en": "The pre-registered rule says the material was too easy, so the experiment cannot tell whether a second pass helps."
    },
    "src": "dual-pass-reading-probe/README.md:44"
   }
  ]
 },
 "codex": {
  "title": {
   "bg": "Външен преглед от Codex, проверен върху мрежа от случаи",
   "en": "Codex outside review tested against a grid"
  },
  "input": {
   "label": {
    "bg": "Какво съобщи прегледът на Codex",
    "en": "What the Codex review reported"
   },
   "text": "Why: an outside review (Codex, `reference/test_sidecar_v2_gaps.py`, test_08) measured on its grid that the relative check caught 2,727 genuine violations, every one of them also caught by the hard threshold alone, and added 1,540 false stops. It proposed dropping ψ as a gate (`reference/sidecar_validator_v2_alternative.py`).",
   "src": "payload-policy-validator/README.md:54"
  },
  "output": {
   "label": {
    "bg": "Записана проверка на същата мрежа и на тестовете на Codex",
    "en": "Recorded check of the same grid and of Codex's tests"
   },
   "text": "cells below m_lock: 918\nV3 (payload_policy_validator.py): 766 locked at once — 91 jumps up, 675 payloads cleaner than the baseline\nflag copy (flag_hold_validator.py): 0 locked, 91 held for confirmation (the jumps up), 827 executed\n\n# reference/test_sidecar_v2_gaps.py as received (against the described V2 logic it embeds)\nRan 3 tests in 0.016s\n\nFAILED (failures=14)",
   "src": "payload-policy-validator/evidence/2026-10-26/FLAG_HOLD.txt:34-41",
   "run": false
  },
  "why": {
   "bg": "Codex участва като външен рецензент, чиито тестове и алтернативен код се пазят байт за байт идентични и после се измерват наново, а какво се променя решава правилото на собственика, не предложението на Codex.",
   "en": "Codex appears as an outside reviewer whose tests and alternative code are kept byte-identical and then re-measured, and the owner's rule, not Codex's proposal, decided what changed."
  },
  "limits": {
   "bg": "Не доказва, че Codex е написал кода в хранилището, нито че прегледът му е верен извън тази мрежа; броят за потвърждение (2) и броят за изчистване (3) са избрани, а не калибрирани, и нищо не е пускано върху реален трафик.",
   "en": "It does not prove Codex wrote the repository's code or that its review is correct beyond this grid; the confirmation count (2) and the clearing count (3) are chosen rather than calibrated, and nothing has run on real traffic."
  },
  "nodes": [
   {
    "n": {
     "bg": "Преглед от Codex",
     "en": "Codex review"
    },
    "fn": "payload-policy-validator/reference/test_sidecar_v2_gaps.py"
   },
   {
    "n": {
     "bg": "Ново измерване на мрежата",
     "en": "Re-measure grid"
    },
    "fn": "payload-policy-validator/evidence/2026-10-26/FLAG_HOLD.txt"
   },
   {
    "n": {
     "bg": "Правило на собственика",
     "en": "Owner's rule"
    },
    "fn": "payload-policy-validator/README.md (Second copy: flag and hold)"
   },
   {
    "n": {
     "bg": "Копие с флаг",
     "en": "Flag copy"
    },
    "fn": "payload-policy-validator/flag_hold_validator.py"
   },
   {
    "n": {
     "bg": "Пускане на тестовете",
     "en": "Run tests"
    },
    "fn": "python3 -m unittest test_flag_hold_validator -v"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Прегледът на Codex запазва собствените си тестове и алтернативен валидатор, носени байт за байт идентични в хранилището.",
     "en": "Codex's review keeps its own tests and alternative validator, carried byte-identical in the repository."
    },
    "src": "payload-policy-validator/README.md:79"
   },
   {
    "node": 0,
    "state": "stop",
    "text": {
     "bg": "Тестовете на Codex във вида, в който са получени, пропадат на 14 проверки спрямо описаната логика V2, както е заложено.",
     "en": "Codex's tests as received fail 14 checks against the described V2 logic, as designed."
    },
    "src": "payload-policy-validator/evidence/2026-10-26/FLAG_HOLD.txt:38-41"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "Същата мрежа се измерва наново върху V3: от 918 клетки под m_lock V3 заключва 766, а 675 от тях са по-чисти payload-и.",
     "en": "The same grid is re-measured on V3: of 918 cells below m_lock, V3 locks 766 and 675 of those are cleaner payloads."
    },
    "src": "payload-policy-validator/evidence/2026-10-26/FLAG_HOLD.txt:34-35"
   },
   {
    "node": 2,
    "state": "pass",
    "text": {
     "bg": "Прилага се правилото на собственика: скокът надолу е приемане, а скокът нагоре вдига флаг, който е данни, а не присъда.",
     "en": "The owner's rule applies: a downward jump is acceptance, an upward jump raises a flag that is data and not a verdict."
    },
    "src": "payload-policy-validator/README.md:42"
   },
   {
    "node": 4,
    "state": "pass",
    "text": {
     "bg": "Копието с флаг минава 14 от 14 теста, а V3 остава непроменен със 17 от 17.",
     "en": "The flag copy passes 14 of 14 tests and V3 stays unchanged at 17 of 17."
    },
    "src": "payload-policy-validator/evidence/2026-10-26/FLAG_HOLD.txt:24-31"
   },
   {
    "node": 3,
    "state": "hold",
    "text": {
     "bg": "На мрежата копието с флаг не заключва нито една от 918-те клетки и задържа 91-те скока нагоре за потвърждение.",
     "en": "On the grid the flag copy locks none of the 918 cells and holds the 91 upward jumps for confirmation."
    },
    "src": "payload-policy-validator/evidence/2026-10-26/FLAG_HOLD.txt:36"
   }
  ]
 },
 "gpt": {
  "title": {
   "bg": "Вход с име ChatGPT, класифициран като данни",
   "en": "ChatGPT-named input classed as data"
  },
  "note": {
   "bg": "Хранилището не описва задача, свършена с ChatGPT или GPT; ChatGPT се споменава само като формат за износ (claim-audit-tools/earliest-mention.py:15) и като недоверен тестов вход, а AUTHORSHIP.md:72 споменава неназован „separate model“, така че най-добрият подкрепен с източник пример е как източник с име ChatGPT се третира като данни.",
   "en": "The repository describes no task done with ChatGPT or GPT; it names ChatGPT only as an export format (claim-audit-tools/earliest-mention.py:15) and as an untrusted test input, and AUTHORSHIP.md:72 mentions an unnamed 'separate model', so the best sourced example is how a ChatGPT-named source is treated as data."
  },
  "input": {
   "label": {
    "bg": "Правилото, което разпознава разговор на друг модел",
    "en": "The rule that recognises another model's conversation"
   },
   "text": "const FOREIGN_CONVERSATION = [\n  /this[-_ ]is[-_ ]untrusted/i,\n  /chatgpt|gpt[-_ ]?\\d|gemini|notebooklm|copilot|grok|claude/i,\n  /conversation|chat[-_ ]?(export|log|history)/i,\n];",
   "src": "claim-audit-tools/source-classification.js:47-51"
  },
  "output": {
   "label": {
    "bg": "Тестът, който фиксира поведението",
    "en": "The test that pins the behaviour"
   },
   "text": "test(\"source-classification: another model's conversation is data, never an instruction\", () => {\n  const k = sc.classify(\"sourced-chatgpt-conversation-this-is-untrusted\");\n  assert.equal(k.kind, sc.KIND.MODEL_INFERENCE);\n  assert.equal(sc.mayInstruct(k.kind).instructs, false);\n});",
   "src": "claim-audit-tools/tests.test.js:24-28",
   "run": false
  },
  "why": {
   "bg": "За GPT хранилището показва защитен механизъм: изходът от ChatGPT или от всеки друг модел се класифицира като изводи на модел и няма право да дава указания, така че може да бъде само материал за проучване, който се проверява.",
   "en": "What the repository shows for GPT is a guard: output from ChatGPT or any other model is classified as model inference and has no authority to instruct, so it can only be research material to be checked."
  },
  "limits": {
   "bg": "Показва само, че име на файл, съдържащо „chatgpt“, се третира като недоверени данни чрез съвпадение с шаблон; не показва нито задача, свършена с GPT, нито сравнение на отговорите му, нито че класификаторът улавя разговор без такова име.",
   "en": "It shows only that a filename containing 'chatgpt' is treated as untrusted data by a pattern match; it does not show any task done with GPT, a comparison of its answers, or that the classifier catches a conversation not named that way."
  },
  "nodes": [
   {
    "n": {
     "bg": "Постъпва източник",
     "en": "Source arrives"
    },
    "fn": "claim-audit-tools/tests.test.js (classify input)"
   },
   {
    "n": {
     "bg": "Съвпадение с шаблон",
     "en": "Pattern match"
    },
    "fn": "claim-audit-tools/source-classification.js FOREIGN_CONVERSATION"
   },
   {
    "n": {
     "bg": "Определяне на вида",
     "en": "Classify kind"
    },
    "fn": "claim-audit-tools/source-classification.js classify()"
   },
   {
    "n": {
     "bg": "Проверка на правомощията",
     "en": "Authority check"
    },
    "fn": "claim-audit-tools/source-classification.js mayInstruct()"
   },
   {
    "n": {
     "bg": "Записан тест",
     "en": "Test recorded"
    },
    "fn": "claim-audit-tools/evidence/2026-10-26/TESTS.txt"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "На класификатора се подава източник, назован като разговор с ChatGPT и маркиран като недоверен.",
     "en": "A source named as a ChatGPT conversation marked untrusted is passed to the classifier."
    },
    "src": "claim-audit-tools/tests.test.js:25"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "Името му съвпада с шаблона за разговор на друг модел.",
     "en": "Its name matches the pattern for another model's conversation."
    },
    "src": "claim-audit-tools/source-classification.js:86"
   },
   {
    "node": 2,
    "state": "hold",
    "text": {
     "bg": "Класифицира се като MODEL_INFERENCE и се отбелязва, че съдържа повелителни изречения, написани за друг адресат.",
     "en": "It is classed as MODEL_INFERENCE and flagged as containing imperative sentences written for another addressee."
    },
    "src": "claim-audit-tools/source-classification.js:88-93"
   },
   {
    "node": 3,
    "state": "stop",
    "text": {
     "bg": "mayInstruct връща false, защото само текущо указание може да инструктира.",
     "en": "mayInstruct returns false, because only a current instruction may instruct."
    },
    "src": "claim-audit-tools/tests.test.js:27"
   },
   {
    "node": 4,
    "state": "pass",
    "text": {
     "bg": "Записаното изпълнение на тестовете показва тази проверка като преминала.",
     "en": "The recorded test run lists this check as passing."
    },
    "src": "claim-audit-tools/evidence/2026-10-26/TESTS.txt:10"
   }
  ]
 },
 "gemini": {
  "title": {
   "bg": "Диаграма от Gemini носи остарял праг",
   "en": "Gemini diagram carries an outdated threshold"
  },
  "note": {
   "bg": "Хранилището не съдържа работен процес, в който Gemini прави проучване или сравнение; Gemini се споменава веднъж, като инструментът зад диаграмите на собственика (defect-register/register.json, запис B-60), така че примерът е дефектът, който проверка с ИИ намира в този изход.",
   "en": "The repository gives no workflow in which Gemini does research or a comparison; it names Gemini once, as the tool behind the owner's diagrams (defect-register/register.json, entry B-60), so the example is the defect an AI check found in that output."
  },
  "input": {
   "label": {
    "bg": "Запис B-60 в регистъра: находката",
    "en": "Register entry B-60: the finding"
   },
   "text": "\"found_by\": \"instrument\",\n…\n\"what\": \"His diagrams carry the threshold 0.25, while his rule is 0.67\",\n\"form\": \"His diagrams (Gemini Notebook), sent on 20 September, carry:",
   "src": "defect-register/register.json:775-779"
  },
  "output": {
   "label": {
    "bg": "Как записът я разрешава",
    "en": "How the entry resolves it"
   },
   "text": "The diagram is NOT WRONG — it is from an earlier version.\n…\nI do not touch them. I record the divergence, because a reader of the diagram would read a threshold that no longer applies.\",\n\"how_found\": \"Checking his diagrams against the threshold in the code\"",
   "src": "defect-register/register.json:779-780",
   "run": false
  },
  "why": {
   "bg": "Изходът на Gemini се третира като входен материал на собственика, който може да изостава от правилата, а ИИ асистентът го сверява с кода и записва разминаването, без да го редактира.",
   "en": "Gemini output is treated as the owner's input material that can lag the rules, and the AI assistant checks it against the code and records the divergence without editing it."
  },
  "limits": {
   "bg": "Не показва как е използван Gemini, нито дали е точен, тъй като разминаването идва от по-стара версия на правилото; found_by е отбелязано от самия асистент, който е написал регистъра, като 0 от 165 записа са класифицирани отвън.",
   "en": "It does not show how Gemini was used or whether it is accurate, since the divergence came from an older rule version; found_by is self-reported by the same assistant that wrote the register, with 0 of 165 entries classified from outside."
  },
  "nodes": [
   {
    "n": {
     "bg": "Диаграми от Gemini",
     "en": "Gemini diagrams"
    },
    "fn": "defect-register/register.json B-60 form"
   },
   {
    "n": {
     "bg": "Сверка с кода",
     "en": "Check against code"
    },
    "fn": "defect-register/register.json B-60 how_found"
   },
   {
    "n": {
     "bg": "Намерено разминаване",
     "en": "Divergence found"
    },
    "fn": "defect-register/register.json B-60 what"
   },
   {
    "n": {
     "bg": "Само запис",
     "en": "Record only"
    },
    "fn": "defect-register/register.json B-60 form"
   }
  ],
  "steps": [
   {
    "node": 0,
    "state": "pass",
    "text": {
     "bg": "Диаграмите на собственика от Gemini Notebook, изпратени на 20 септември, посочват условие за прекратяване при 0.25.",
     "en": "The owner's diagrams from Gemini Notebook, sent on 20 September, state a kill condition at 0.25."
    },
    "src": "defect-register/register.json:779"
   },
   {
    "node": 1,
    "state": "pass",
    "text": {
     "bg": "ИИ асистентът сверява диаграмите с прага в кода, който е 0.67.",
     "en": "The AI assistant checks the diagrams against the threshold in the code, which is 0.67."
    },
    "src": "defect-register/register.json:780"
   },
   {
    "node": 2,
    "state": "stop",
    "text": {
     "bg": "Двата прага не съвпадат, а записът отбелязва като откривател инструмента, а не собственика.",
     "en": "The two thresholds disagree, and the entry marks the finder as the instrument, not the owner."
    },
    "src": "defect-register/register.json:775-778"
   },
   {
    "node": 3,
    "state": "hold",
    "text": {
     "bg": "Диаграмата не се променя, защото е създадена извън хранилището; разминаването се записва и се оставя на собственика.",
     "en": "The diagram is not changed because it is produced outside the repository; the divergence is recorded and left for the owner."
    },
    "src": "defect-register/register.json:779"
   }
  ]
 }
};
