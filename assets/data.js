/* SSC Compass — публични данни на сайта / public site data.
   Текст = { bg, en }. Низ без език важи и за двата.
   Нищо лично не влиза тук: сайтът е публичен и всеки може да чете този файл. */
window.SSC = {

  owner: { bg: 'Мартин Урумов', en: 'Martin Urumov' },
  cv: { url: 'cv/Martin_Urumov_CV.pdf', note: { bg: 'PDF · на английски', en: 'PDF · in English' } },

  /* Четирите AI-я. Всяко има свое ядро (анимация) и цвят на сайта. */
  ais: [
    { id: 'claude', name: 'CLAUDE', sub: 'Claude Code · Anthropic', accent: '217 119 87', accent2: '240 170 140' },
    { id: 'gpt',    name: 'GPT',    sub: 'ChatGPT · OpenAI',        accent: '52 211 153', accent2: '167 243 208' },
    { id: 'codex',  name: 'CODEX',  sub: 'Codex · OpenAI',          accent: '147 197 253', accent2: '226 232 240' },
    { id: 'gemini', name: 'GEMINI', sub: 'Gemini · Google',         accent: '96 165 250',  accent2: '196 181 253' }
  ],

  /* Умения: област → задача → умение → автоматизация. Примерен гръбнак. */
  domains: [
    { name: { bg: 'Памет', en: 'Memory' },              task: { bg: 'подреждам бележките си', en: 'tidy my notes' },          skill: '/vault-cleanup',   note: { bg: 'архивира старите бележки', en: 'archives old notes' },        auto: { bg: 'Всяка неделя', en: 'Every Sunday' },       kind: 'time' },
    { name: { bg: 'Продуктивност', en: 'Productivity' }, task: { bg: 'планирам деня си', en: 'plan my day' },                  skill: '/plan-today',      note: { bg: 'календар + план', en: 'calendar + plan' },                auto: { bg: 'Всеки ден в 7:00', en: 'Daily at 7:00' },  kind: 'time' },
    { name: { bg: 'Проучване', en: 'Research' },         task: { bg: 'следя новините за AI', en: 'keep up with AI news' },      skill: '/morning-intel',   note: { bg: 'новини + един кратък бриф', en: 'news + one short brief' },    auto: { bg: 'Всеки ден в 6:30', en: 'Daily at 6:30' },  kind: 'time' },
    { name: { bg: 'Съдържание', en: 'Content' },         task: { bg: 'преизползвам видеата си', en: 'repurpose my videos' },  skill: '/content-cascade', note: { bg: 'видео + 3 поста', en: 'video + 3 posts' },                auto: { bg: 'При публикуване на ново видео', en: 'When a new video is published' }, kind: 'event' },
    { name: { bg: 'Общност', en: 'Community' },          task: { bg: 'отговарям на въпроси на членове', en: "answer members' questions" },          skill: '/qa-digest',       note: { bg: 'въпроси + един пост', en: 'questions + one post' },      auto: { bg: 'Всеки петък', en: 'Every Friday' },       kind: 'time' },
    { name: { bg: 'Клиенти', en: 'Clients' },            task: { bg: 'пиша предложения', en: 'write proposals' },              skill: '/proposal',        note: { bg: 'разговор + предложение', en: 'call + proposal' },        auto: { bg: 'Ръчно, нарочно', en: 'Manual, on purpose' }, kind: 'manual' },
    { name: { bg: 'Продажби', en: 'Sales' },             task: { bg: 'проучвам нови контакти', en: 'research new leads' },    skill: '/lead-research',   note: { bg: 'контакт + кратка справка', en: 'lead + short briefing' },  auto: { bg: 'При попълнена форма', en: 'When a form is submitted' }, kind: 'event' },
    { name: { bg: 'Финанси', en: 'Finance' },            task: { bg: 'подреждам разписките', en: 'sort receipts' },           skill: '/receipts',        note: { bg: 'разписки + главна книга', en: 'receipts + ledger' },       auto: { bg: 'На 1-во число', en: '1st of the month' },   kind: 'time' }
  ],

  /* Проекти: само завършените. Недовършеното стои в личния таб (запечатан vault), не тук. */
  projects: [
    { id: 'omnimax', name: 'OmniMax', tags: ['system'], chips: [{ bg: 'AI', en: 'AI' }, { bg: 'Глас', en: 'Voice' }], status: { bg: 'Съществува', en: 'Exists' },
      summary: { bg: 'Гласово приложение, което действа като рутер: приема заявка и я насочва към подходящия AI модел.', en: 'A voice app that works as a router: it takes a request and sends it to the right AI model.' },
      details: [{ bg: 'Част от по-голямата система Compass, но стои отделно от този сайт.', en: 'Part of the larger Compass system, but separate from this site.' }, { bg: 'Сайтът не го променя и не го управлява.', en: 'This site does not change or control it.' }] },

    { id: 'omniecho-core', name: 'OmniEcho Core', tags: ['system'], chips: [{ bg: 'JavaScript', en: 'JavaScript' }, { bg: 'AI оценка', en: 'AI evaluation' }], status: { bg: '2026', en: '2026' },
      summary: { bg: 'JavaScript оценител на граници на авторитета, без зависимости. Решава по подредена скала: STOP > HOLD > CLEAR.', en: 'A dependency-free JavaScript evaluator for authority boundaries. It decides on an ordered scale: STOP > HOLD > CLEAR.' },
      details: [{ bg: 'STOP е окончателно и не може да бъде отслабено от по-късна проверка.', en: 'STOP is final and cannot be weakened by a later check.' }, { bg: 'История на версиите, включително намерен дефект и регресионни тестове.', en: 'Version history, including a found defect and regression tests.' }, { bg: 'Описанието е взето от CV-то ми. Хранилището още не е публично.', en: 'Description taken from my CV. The repository is not public yet.' }] },

    { id: 'deck-omniecho', name: 'The OmniEcho Architecture', tags: ['deck'], chips: [{ bg: 'Презентация', en: 'Deck' }, { bg: 'Архитектура', en: 'Architecture' }], status: { bg: 'Поправено издание', en: 'Corrected edition' },
      summary: { bg: 'Презентация от 15 слайда за петте слоя на архитектурата OmniEcho / KOMPAS: 16 инварианта, 10 гейта, 8 възела, 5 оси и 4 въпроса.', en: 'A 15-slide deck on the five layers of the OmniEcho / KOMPAS architecture: 16 invariants, 10 gates, 8 nodes, 5 axes and 4 questions.' },
      details: [{ bg: 'На английски. Концептуален модел, не сертифициран стандарт.', en: 'In English. A conceptual model, not a certified standard.' }, { bg: 'Последният слайд описва какво е поправено спрямо първата чернова.', en: 'The last slide lists what was corrected from the first draft.' }],
      links: [{ label: { bg: 'Отвори презентацията', en: 'Open the deck' }, url: 'decks/index.html#omniecho/1' }] },

    { id: 'deck-coherence', name: 'The Coherence Protocol', tags: ['deck'], chips: [{ bg: 'Презентация', en: 'Deck' }, { bg: 'Контрол на ИИ', en: 'AI control' }], status: { bg: 'Поправено издание', en: 'Corrected edition' },
      summary: { bg: 'Презентация от 20 слайда за ограничаване на правомощията на ИИ: разделение между познание и изпълнение, двоен ключ за действие и защитни прегради за промоция.', en: 'A 20-slide deck on bounding AI authority: cognition kept apart from execution, a dual-key action gate and promotion firewalls.' },
      details: [{ bg: 'На английски. Състоянието е прототип с локална проверка: 53 от 53 unit теста и 24 от 24 PostgreSQL теста.', en: 'In English. Status is a prototype with local verification: 53 of 53 unit tests and 24 of 24 PostgreSQL tests.' }, { bg: 'Твърденията от невронауката са означени като работни допускания.', en: 'Claims from neuroscience are marked as working assumptions.' }],
      links: [{ label: { bg: 'Отвори презентацията', en: 'Open the deck' }, url: 'decks/index.html#coherence/1' }] },

    { id: 'deck-dream', name: 'Dream Protocol', tags: ['deck'], chips: [{ bg: 'Презентация', en: 'Deck' }, { bg: 'Български', en: 'Bulgarian' }], status: { bg: 'Поправено издание', en: 'Corrected edition' },
      summary: { bg: 'Презентация от 15 слайда на български: интегрирана киберзащитна и когнитивна архитектура, описана с метафори.', en: 'A 15-slide deck in Bulgarian: an integrated cyber-defence and cognitive architecture, described through metaphors.' },
      details: [{ bg: 'Киберзащитният език е метафора за вътрешни процеси, не описание на реална защита.', en: 'The cyber-defence language is a metaphor for inner processes, not a description of real protection.' }, { bg: 'Последният слайд описва поправките.', en: 'The last slide lists the corrections.' }],
      links: [{ label: { bg: 'Отвори презентацията', en: 'Open the deck' }, url: 'decks/index.html#dream/1' }] },








  ],

  /* Контакти: само живите връзки. Платформите без линк са в личния таб. */
  socials: [
    { name: 'GitHub',      url: 'https://github.com/OmniSlack',                 handle: 'OmniSlack' },
    { name: 'LinkedIn',    url: 'https://www.linkedin.com/in/martin-urumov/',   handle: 'martin-urumov' },
    { name: 'YouTube',     url: 'https://www.youtube.com/@OmniEcho26',          handle: '@OmniEcho26' },
    { name: 'TikTok',      url: 'https://www.tiktok.com/@omniecho26',           handle: '@omniecho26' },
    { name: 'Facebook',    url: 'https://www.facebook.com/martin.urumov.7/',    handle: 'martin.urumov.7' },
  ]
};
