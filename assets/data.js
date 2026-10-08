/* SSC Compass — публични данни на сайта.
   Тук се добавят проекти и социални линкове. Нищо лично не влиза тук:
   сайтът е публичен и всеки може да чете този файл. */
window.SSC = {

  /* Четирите AI-я. Всяко има свое ядро (анимация) и цвят на сайта. */
  ais: [
    { id: 'claude', name: 'CLAUDE', sub: 'Claude Code · Anthropic', accent: '217 70 239', accent2: '240 171 252' },
    { id: 'gpt',    name: 'GPT',    sub: 'ChatGPT · OpenAI',        accent: '52 211 153', accent2: '167 243 208' },
    { id: 'codex',  name: 'CODEX',  sub: 'Codex · OpenAI',          accent: '147 197 253', accent2: '226 232 240' },
    { id: 'gemini', name: 'GEMINI', sub: 'Gemini · Google',         accent: '96 165 250',  accent2: '196 181 253' }
  ],

  /* Умения: област → задача → умение → автоматизация.
     Примерен гръбнак. Ще се замени с моите собствени умения. */
  domains: [
    { name: 'Памет',         task: 'подреждам бележките си',   skill: '/vault-cleanup',   skillNote: 'архивира старите бележки',  auto: 'Всяка неделя',        kind: 'time' },
    { name: 'Продуктивност', task: 'планирам деня си',         skill: '/plan-today',      skillNote: 'календар + план',           auto: 'Всеки ден в 7:00',    kind: 'time' },
    { name: 'Проучване',     task: 'следя новините в AI',      skill: '/morning-intel',   skillNote: 'новини + един кратък бриф', auto: 'Всеки ден в 6:30',    kind: 'time' },
    { name: 'Съдържание',    task: 'преизползвам видеата си',  skill: '/content-cascade', skillNote: 'видео + 3 поста',           auto: 'При ново видео',      kind: 'event' },
    { name: 'Общност',       task: 'отговарям на членове',     skill: '/qa-digest',       skillNote: 'въпроси + един пост',       auto: 'Всеки петък',         kind: 'time' },
    { name: 'Клиенти',       task: 'пиша предложения',         skill: '/proposal',        skillNote: 'разговор + предложение',    auto: 'Ръчно, нарочно',      kind: 'manual' },
    { name: 'Продажби',      task: 'проучвам нови контакти',   skill: '/lead-research',   skillNote: 'контакт + кратка справка',  auto: 'При попълнена форма', kind: 'event' },
    { name: 'Финанси',       task: 'подреждам разписките',     skill: '/receipts',        skillNote: 'разписки + главна книга',   auto: 'На 1-во число',       kind: 'time' }
  ],

  /* Проекти. Кликът върху карта отваря подробности.
     Описанията са само това, което е видимо в проекта. */
  projects: [
    { id: 'omnimax', name: 'OmniMax', tags: ['ai'], chips: ['AI', 'Глас'], status: 'Съществува',
      summary: 'Гласово приложение, което действа като рутер: приема заявка и я насочва към подходящия AI модел.',
      details: ['Част от по-голямата система Compass, но стои отделно от този сайт.', 'Сайтът не го променя и не го управлява.'] },

    { id: 'gapinthegap', name: 'GapInTheGap', tags: ['ai'], chips: ['Архив', 'Claude'], status: 'Работна папка',
      summary: 'Архив с разговори, проекти и дизайн-чатове, изнесени от Claude. Служи като суров материал и памет за Compass.',
      details: ['Съдържа експорт на разговори, спомени, проекти и дизайн-чатове.', 'Има и ранен вариант на таблото. Не се ползва: сайтът е изграден отначало.', 'Съдържанието е лично и не се публикува тук.'] },

    { id: 'kompas', name: 'Kompas', tags: ['ai'], chips: ['Документи', 'Markdown'], status: 'В развитие',
      summary: 'Колекция от markdown документи за Compass: живо ядро, карти, промптове и диспачи за пренос между чатове.',
      details: ['Ядрото е един файл, който се прикачва в нов чат. Версията и датата стоят вътре в него.', 'Правилото: един файл = един чат = една задача.'] },

    { id: 'response-gap', name: 'The Response Gap', tags: ['ai'], chips: ['Книга'], status: 'В работа',
      summary: 'Книга „Процепът на реакцията“: скелет, пълно издание и интегрирана английска версия.',
      details: ['Налични са скелет на книгата, пълно издание (PDF) и HTML версия на английски.', 'Свързан е текстът „Всеки иска да е свободен и щастлив“ (DOCX).'] },

    { id: 'nomnom', name: 'NomNom', tags: ['java'], chips: ['Java', 'Maven'], status: 'Проект',
      summary: 'Java проект със структура по Maven.',
      details: ['Maven артефакт NomNom (pom.xml).', 'Описанието ще се допълни.'] },

    { id: 'the-game', name: 'The Game', tags: ['unity'], chips: ['Unity', 'C#'], status: 'Прототип',
      summary: 'Игрален прототип в Unity 2018.3.',
      details: ['Скрипт за движение на героя (Movement.cs).', 'Материали, палитра и сцени.'] },

    { id: 'sk15', name: 'sk15_automation', tags: ['java'], chips: ['Java', 'Автоматизация'], status: 'Проект',
      summary: 'Java проект за автоматизация, разделен на пакети.',
      details: ['Описанието ще се допълни.'] },

    { id: 'selenium', name: 'Selenium', tags: ['java'], chips: ['Java', 'Тестване'], status: 'Среда',
      summary: 'Библиотеки на Selenium за Java, събрани за автоматизирано тестване на уеб.',
      details: ['Съдържа jar файлове (Selenium, ByteBuddy, commons-exec и др.), лиценз и списък с промени.'] },

    { id: 'exercise', name: 'exercise', tags: ['learn'], chips: ['Учене'], status: 'Упражнения',
      summary: 'Упражнения по лекции, от lecture2 до lecture13.',
      details: ['Описанието ще се допълни.'] }
  ],

  /* Социални платформи. Постави линк в `url`, за да стане картата връзка.
     Докато `url` е празно, картата показва „линк скоро“. */
  socials: [
    { name: 'YouTube',     url: '', handle: '' },
    { name: 'X / Twitter', url: '', handle: '' },
    { name: 'LinkedIn',    url: '', handle: '' },
    { name: 'Facebook',    url: '', handle: '' },
    { name: 'Snapchat',    url: '', handle: '' },
    { name: 'Twitch',      url: '', handle: '' }
  ]
};
