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

  /* Проекти. Кликът върху карта отваря подробности. Описанията са само това, което е видимо в проекта. */
  projects: [
    { id: 'omnimax', name: 'OmniMax', tags: ['ai'], chips: [{ bg: 'AI', en: 'AI' }, { bg: 'Глас', en: 'Voice' }], status: { bg: 'Съществува', en: 'Exists' },
      summary: { bg: 'Гласово приложение, което действа като рутер: приема заявка и я насочва към подходящия AI модел.', en: 'A voice app that works as a router: it takes a request and sends it to the right AI model.' },
      details: [{ bg: 'Част от по-голямата система Compass, но стои отделно от този сайт.', en: 'Part of the larger Compass system, but separate from this site.' }, { bg: 'Сайтът не го променя и не го управлява.', en: 'This site does not change or control it.' }] },

    { id: 'omniecho-core', name: 'OmniEcho Core', tags: ['ai'], chips: [{ bg: 'JavaScript', en: 'JavaScript' }, { bg: 'AI оценка', en: 'AI evaluation' }], status: { bg: '2026', en: '2026' },
      summary: { bg: 'JavaScript оценител на граници на авторитета, без зависимости. Решава по подредена скала: STOP > HOLD > CLEAR.', en: 'A dependency-free JavaScript evaluator for authority boundaries. It decides on an ordered scale: STOP > HOLD > CLEAR.' },
      details: [{ bg: 'STOP е окончателно и не може да бъде отслабено от по-късна проверка.', en: 'STOP is final and cannot be weakened by a later check.' }, { bg: 'История на версиите, включително намерен дефект и регресионни тестове.', en: 'Version history, including a found defect and regression tests.' }, { bg: 'Описанието е взето от CV-то ми. Хранилището още не е публично.', en: 'Description taken from my CV. The repository is not public yet.' }] },

    { id: 'gapinthegap', name: 'GapInTheGap', tags: ['ai'], chips: [{ bg: 'Архив', en: 'Archive' }, { bg: 'Claude', en: 'Claude' }], status: { bg: 'Работна папка', en: 'Working folder' },
      summary: { bg: 'Архив с разговори, проекти и дизайн-чатове, изнесени от Claude. Служи като суров материал и памет за Compass.', en: 'An archive of conversations, projects and design chats exported from Claude. It is raw material and memory for Compass.' },
      details: [{ bg: 'Съдържа експорт на разговори, спомени, проекти и дизайн-чатове.', en: 'Contains an export of conversations, memories, projects and design chats.' }, { bg: 'Има и ранен вариант на таблото. Не се ползва: сайтът е изграден от нулата.', en: 'It also holds an early version of the dashboard. It is not used: the site was built from scratch.' }, { bg: 'Съдържанието е лично и не се публикува тук.', en: 'The content is personal and is not published here.' }] },

    { id: 'kompas', name: 'Kompas', tags: ['ai'], chips: [{ bg: 'Документи', en: 'Documents' }, { bg: 'Markdown', en: 'Markdown' }], status: { bg: 'В развитие', en: 'In progress' },
      summary: { bg: 'Колекция от markdown документи за Compass: живо ядро, карти, промптове и диспачи за пренос между чатове.', en: 'A collection of markdown documents for Compass: a living core, maps, prompts and dispatches for carrying work between chats.' },
      details: [{ bg: 'Ядрото е един файл, който се прикачва в нов чат. Версията и датата стоят вътре в него.', en: 'The core is one file attached to a new chat. Its version and date live inside it.' }, { bg: 'Правилото: един файл = един чат = една задача.', en: 'The rule: one file = one chat = one task.' }] },

    { id: 'response-gap', name: 'The Response Gap', tags: ['ai'], chips: [{ bg: 'Книга', en: 'Book' }], status: { bg: 'В развитие', en: 'In progress' },
      summary: { bg: 'Книга „Празнината на реакцията“: личен модел за емоционално възстановяване.', en: 'A book, “The Response Gap”: a personal model for emotional recovery.' },
      details: [{ bg: 'Основна идея: между стимула и реакцията има интервал. Осъзнатостта в него превръща автоматичната реакция в избран отговор.', en: 'Core idea: there is an interval between stimulus and reaction. Awareness placed in it turns an automatic reaction into a chosen response.' }, { bg: 'Налични са български текст, скелет, пълно издание (PDF) и английска HTML версия.', en: 'A Bulgarian text, an outline, a full edition (PDF) and an English HTML version exist.' }] },

    { id: 'nomnom', name: 'NomNom', tags: ['java'], chips: [{ bg: 'Java', en: 'Java' }, { bg: 'Maven', en: 'Maven' }], status: { bg: 'Проект', en: 'Project' },
      summary: { bg: 'Java проект със структура по Maven.', en: 'A Java project with a Maven structure.' },
      details: [{ bg: 'Maven артефакт NomNom (pom.xml).', en: 'Maven artifact NomNom (pom.xml).' }, { bg: 'Описанието ще се допълни.', en: 'A description will follow.' }] },

    { id: 'the-game', name: 'The Game', tags: ['unity'], chips: [{ bg: 'Unity', en: 'Unity' }, { bg: 'C#', en: 'C#' }], status: { bg: 'Прототип', en: 'Prototype' },
      summary: { bg: 'Игрален прототип в Unity 2018.3.', en: 'A game prototype in Unity 2018.3.' },
      details: [{ bg: 'Скрипт за движение на героя (Movement.cs).', en: 'A character movement script (Movement.cs).' }, { bg: 'Материали, палитра и сцени.', en: 'Materials, a palette and scenes.' }] },

    { id: 'sk15', name: 'sk15_automation', tags: ['java'], chips: [{ bg: 'Java', en: 'Java' }, { bg: 'Автоматизация', en: 'Automation' }], status: { bg: 'Проект', en: 'Project' },
      summary: { bg: 'Java проект за автоматизация, разделен на пакети.', en: 'A Java automation project split into packages.' },
      details: [{ bg: 'Описанието ще се допълни.', en: 'A description will follow.' }],
      links: [{ label: { bg: 'Код в GitHub', en: 'Code on GitHub' }, url: 'https://github.com/OmniSlack/sk15_automation' }] },

    { id: 'selenium', name: 'Selenium', tags: ['java'], chips: [{ bg: 'Java', en: 'Java' }, { bg: 'Тестване', en: 'Testing' }], status: { bg: 'Среда', en: 'Setup' },
      summary: { bg: 'Библиотеки на Selenium за Java, събрани за автоматизирано тестване на уеб.', en: 'Selenium libraries for Java, gathered for automated web testing.' },
      details: [{ bg: 'Съдържа jar файлове (Selenium, ByteBuddy, commons-exec и др.), лиценз и списък с промени.', en: 'Holds jar files (Selenium, ByteBuddy, commons-exec and others), a licence and a changelog.' }] },

    { id: 'exercise', name: 'exercise', tags: ['learn'], chips: [{ bg: 'Учене', en: 'Learning' }], status: { bg: 'Упражнения', en: 'Exercises' },
      summary: { bg: 'Упражнения по лекции, от lecture2 до lecture13.', en: 'Lecture exercises, from lecture2 to lecture13.' },
      details: [{ bg: 'Описанието ще се допълни.', en: 'A description will follow.' }] }
  ],

  /* Контакти и платформи. Празен `url` = „линк скоро“. */
  socials: [
    { name: 'GitHub',      url: 'https://github.com/OmniSlack',                 handle: 'OmniSlack' },
    { name: 'LinkedIn',    url: 'https://www.linkedin.com/in/martin-urumov/',   handle: 'martin-urumov' },
    { name: 'YouTube',     url: 'https://www.youtube.com/@OmniEcho26',          handle: '@OmniEcho26' },
    { name: 'TikTok',      url: 'https://www.tiktok.com/@omniecho26',           handle: '@omniecho26' },
    { name: 'Facebook',    url: 'https://www.facebook.com/martin.urumov.7/',    handle: 'martin.urumov.7' },
    { name: 'X / Twitter', url: '', handle: '' },
    { name: 'Snapchat',    url: '', handle: '' },
    { name: 'Twitch',      url: '', handle: '' }
  ]
};
