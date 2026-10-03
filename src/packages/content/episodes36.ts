import type { LocationId } from '@validation/schemas';

export interface EpisodeSpec {
  id: number;
  title_ru: string;
  title_en: string;
  genre_ru: string;
  genre_en: string;
  hook_ru: string;
  hook_en: string;
  mechanic_ru: string;
  mechanic_en: string;
  priority_tier: 'flagship_mvp' | 'priority_top5' | 'season_catalog';
  starting_location: LocationId;
  initial_modifiers?: {
    budget?: number;
    travel_time?: number;
    battery?: number;
    safety?: number;
    trust_katya_olya?: number;
  };
}

/**
 * Complete 36-episode anthology catalog from Section 4 of GAME_BRIEF_KATYA_OLYA_VIETNAM_RU.md.
 * Every episode centers on Katya & Olya traveling through Vietnam.
 */
export const EPISODES_36: EpisodeSpec[] = [
  {
    id: 1,
    title_ru: 'Карта без адреса',
    title_en: 'Map Without an Address',
    genre_ru: 'Дорожный mystery-adventure',
    genre_en: 'Road Mystery-Adventure',
    hook_ru:
      'В случайно перепутанной сумке оказывается карта памяти с отмеченными точками в Дананге и Хойане; подруги решают, кому верить и как проверить факты без риска.',
    hook_en:
      'A swapped travel bag reveals a memory card with marked spots across Da Nang and Hoi An; the friends decide whom to trust and how to verify facts safely.',
    mechanic_ru:
      'Планирование маршрута, проверка подсказок, баланс камеры Кати и осторожности Оли.',
    mechanic_en:
      'Route planning, clue verification, balancing Katya’s camera impulse and Olya’s caution.',
    priority_tier: 'flagship_mvp',
    starting_location: 'hotel_alley',
  },
  {
    id: 2,
    title_ru: 'Последний рейс в Хойан',
    title_en: 'Last Ride to Hoi An',
    genre_ru: 'Survival-lite',
    genre_en: 'Survival-Lite',
    hook_ru:
      'Из-за тропического шторма меняется транспорт и расписание; нужно успеть к безопасному месту, не оставляя без помощи других людей.',
    hook_en:
      'A tropical storm disrupts transport and schedules; reach safe shelter without leaving others behind.',
    mechanic_ru: 'Управление временем, бюджетом, зарядом батареи и уровнем риска.',
    mechanic_en: 'Managing time, budget, phone battery, and weather risk.',
    priority_tier: 'priority_top5',
    starting_location: 'riverfront_pier',
    initial_modifiers: { travel_time: 18, battery: 55 },
  },
  {
    id: 3,
    title_ru: 'Фальшивый волонтёрский лагерь',
    title_en: 'Fake Volunteer Camp',
    genre_ru: 'Социальный триллер',
    genre_en: 'Social Thriller',
    hook_ru:
      'Красивое объявление о помощи местным оказывается манипулятивной схемой платного «волонтёрства».',
    hook_en:
      'A glossy ad about helping locals turns out to be a manipulative paid-"voluntourism" scheme.',
    mechanic_ru: 'Проверка организации, документов, лицензий и реальных отзывов.',
    mechanic_en: 'Verifying NGO credentials, documents, licenses, and authentic reviews.',
    priority_tier: 'season_catalog',
    starting_location: 'hotel_alley',
  },
  {
    id: 4,
    title_ru: 'Шифр на рисовой бумаге',
    title_en: 'Cipher on Rice Paper',
    genre_ru: 'Puzzle mystery',
    genre_en: 'Puzzle Mystery',
    hook_ru: 'Набор чеков и рисунков ведёт к истории пропавшего художника и поддельной галереи.',
    hook_en:
      'A set of receipts and sketches leads to the story of a missing artist and a counterfeit gallery.',
    mechanic_ru: 'Сопоставление предметов без взлома и незаконного проникновения.',
    mechanic_en: 'Cross-referencing physical clues without trespassing or illegal entry.',
    priority_tier: 'season_catalog',
    starting_location: 'night_market',
  },
  {
    id: 5,
    title_ru: 'Вечерний рынок: семь обещаний',
    title_en: 'Night Market: Seven Promises',
    genre_ru: 'Social deduction',
    genre_en: 'Social Deduction',
    hook_ru:
      'Семь незнакомцев предлагают разные «идеальные» решения проблемы; только часть говорит правду.',
    hook_en:
      'Seven strangers offer different "perfect" fixes to a travel crisis; only some tell the truth.',
    mechanic_ru: 'Наблюдение, уточняющие вопросы и сравнение версий.',
    mechanic_en: 'Observation, clarifying questions, and comparing testimonies.',
    priority_tier: 'season_catalog',
    starting_location: 'night_market',
  },
  {
    id: 6,
    title_ru: 'Письмо из будущего',
    title_en: 'Letter from the Future',
    genre_ru: 'Научно-фантастический narrative game',
    genre_en: 'Sci-Fi Narrative Game',
    hook_ru:
      'Странное офлайн-приложение предсказывает последствия каждого маршрута на 30 минут вперёд.',
    hook_en: 'A strange offline app predicts the consequences of every route 30 minutes ahead.',
    mechanic_ru: 'Ограниченные попытки изменить решение и цена знания.',
    mechanic_en: 'Limited foresight charges and the moral weight of foreknowledge.',
    priority_tier: 'season_catalog',
    starting_location: 'hotel_alley',
  },
  {
    id: 7,
    title_ru: 'Тени фонарей',
    title_en: 'Lantern Shadows',
    genre_ru: 'Мистический adventure',
    genre_en: 'Mystic Adventure',
    hook_ru: 'Ночью шёлковые фонари показывают сцены из чужих воспоминаний о старом порте.',
    hook_en: 'At night, silk lanterns project memories of the old port’s past.',
    mechanic_ru: 'Уважительное исследование местных легенд без превращения культуры в страшилку.',
    mechanic_en: 'Respectful exploration of local legends without turning culture into horror.',
    priority_tier: 'season_catalog',
    starting_location: 'lantern_terrace',
  },
  {
    id: 8,
    title_ru: 'Фото, которого нет',
    title_en: 'The Missing Photo',
    genre_ru: 'Расследовательская драма',
    genre_en: 'Investigative Drama',
    hook_ru: 'С камеры исчезает единственный кадр, который мог оправдать честного гида.',
    hook_en:
      'The single frame that could exonerate an honest local guide vanishes from Katya’s camera.',
    mechanic_ru: 'Восстановление хронологии, метаданных и интервью со свидетелями.',
    mechanic_en: 'Reconstructing timelines, EXIF metadata, and witness interviews.',
    priority_tier: 'flagship_mvp',
    starting_location: 'night_market',
  },
  {
    id: 9,
    title_ru: 'Голос на мотобайке',
    title_en: 'Voice on the Motorbike',
    genre_ru: 'Интерактивный road movie',
    genre_en: 'Interactive Road Movie',
    hook_ru:
      'Катя слышит странную подсказку в аудиозаписи, а Оля замечает, что маршрут в навигаторе подменён.',
    hook_en:
      'Katya hears a clue on an audio clip while Olya notices their navigation route was altered.',
    mechanic_ru: 'Безопасный выбор транспорта, навигация и диалог в пути.',
    mechanic_en: 'Safe transport verification, route checking, and on-the-road dialogue.',
    priority_tier: 'season_catalog',
    starting_location: 'hotel_alley',
  },
  {
    id: 10,
    title_ru: 'Мастерская дронов',
    title_en: 'Drone Workshop',
    genre_ru: 'Техно-экотриллер',
    genre_en: 'Techno Eco-Thriller',
    hook_ru:
      'Съёмка побережья случайно показывает экологическую проблему, но сырая публикация может навредить рыбакам.',
    hook_en:
      'Coastal footage accidentally reveals pollution, but unedited publication could harm local fishers.',
    mechanic_ru: 'Этичный монтаж, проверка разрешений на съёмку и защита источников.',
    mechanic_en: 'Ethical editing, flight permit verification, and source protection.',
    priority_tier: 'season_catalog',
    starting_location: 'riverfront_pier',
  },
  {
    id: 11,
    title_ru: 'Риф без цвета',
    title_en: 'Colorless Reef',
    genre_ru: 'Экологический adventure',
    genre_en: 'Ecological Adventure',
    hook_ru:
      'Подруги участвуют в береговой инициативе и выясняют причину локального загрязнения лагуны.',
    hook_en:
      'The friends join a coastal initiative and investigate what is polluting a quiet lagoon.',
    mechanic_ru: 'Наблюдение, сортировка проб и командная работа с экологами.',
    mechanic_en: 'Field observation, sample sorting, and teamwork with marine biologists.',
    priority_tier: 'season_catalog',
    starting_location: 'riverfront_pier',
  },
  {
    id: 12,
    title_ru: 'Дом на сваях',
    title_en: 'House on Stilts',
    genre_ru: 'Cozy management',
    genre_en: 'Cozy Management',
    hook_ru: 'После непогоды Катя и Оля помогают семье восстановить уютный гостевой дом.',
    hook_en: 'After heavy rains, Katya and Olya help a family restore their guesthouse.',
    mechanic_ru: 'Бюджет, ресурсы, тёплые отношения с соседями.',
    mechanic_en: 'Budgeting, resource care, and building warm neighborly trust.',
    priority_tier: 'season_catalog',
    starting_location: 'hotel_alley',
  },
  {
    id: 13,
    title_ru: 'Лабиринт перевода',
    title_en: 'Translation Labyrinth',
    genre_ru: 'Языковая puzzle-игра',
    genre_en: 'Language Puzzle Game',
    hook_ru: 'Один и тот же жест или фраза по-разному понимается в разных ситуациях.',
    hook_en: 'A single phrase or gesture carries different meanings across social contexts.',
    mechanic_ru: 'Контекст, тон, уважительные обращения и визуальные подсказки.',
    mechanic_en: 'Context, tone, respectful honorifics, and visual cues.',
    priority_tier: 'priority_top5',
    starting_location: 'night_market',
  },
  {
    id: 14,
    title_ru: 'Два паспорта, одна ошибка',
    title_en: 'Two Passports, One Mistake',
    genre_ru: 'Бюрократическая dramedy',
    genre_en: 'Bureaucratic Dramedy',
    hook_ru:
      'В квитанции отеля перепутаны данные, а поездка под угрозой из-за цепочки бытовых мелочей.',
    hook_en:
      'Hotel receipt details get mixed up, threatening the itinerary through a chain of small slip-ups.',
    mechanic_ru: 'Аккуратность, сроки, официальные источники и спокойное общение.',
    mechanic_en: 'Attention to detail, deadlines, official channels, and calm communication.',
    priority_tier: 'season_catalog',
    starting_location: 'hotel_alley',
  },
  {
    id: 15,
    title_ru: 'Ночь в Хюэ',
    title_en: 'Night in Hue',
    genre_ru: 'Исторический mystery',
    genre_en: 'Historical Mystery',
    hook_ru:
      'В старом квартале пропадает семейная реликвия, и каждая версия связана с памятью разных поколений.',
    hook_en:
      'A family heirloom goes missing in the old quarter, each version tied to generational memory.',
    mechanic_ru: 'Исследование архивных заметок и сопоставление устных рассказов.',
    mechanic_en: 'Archival note study and comparing oral histories.',
    priority_tier: 'season_catalog',
    starting_location: 'lantern_terrace',
  },
  {
    id: 16,
    title_ru: 'Хранители фонарей',
    title_en: 'Keepers of the Lanterns',
    genre_ru: 'Community drama',
    genre_en: 'Community Drama',
    hook_ru: 'Локальный фестиваль под угрозой из-за спора между мастерами и арендаторами.',
    hook_en:
      'A neighborhood lantern festival is threatened by a dispute between artisans and shopkeepers.',
    mechanic_ru: 'Переговоры, медиация и поиск честного компромисса.',
    mechanic_en: 'Negotiation, mediation, and finding fair middle ground.',
    priority_tier: 'season_catalog',
    starting_location: 'lantern_terrace',
  },
  {
    id: 17,
    title_ru: 'Зелёный маршрут',
    title_en: 'The Green Route',
    genre_ru: 'Travel strategy',
    genre_en: 'Travel Strategy',
    hook_ru:
      'Выбрать маршрут с меньшим ущербом для природы и кварталов, не превращая экологию в показуху.',
    hook_en:
      'Plan an itinerary with minimal footprint on nature and neighborhoods without greenwashing.',
    mechanic_ru: 'Планирование переездов, бюджета и долгосрочных последствий.',
    mechanic_en: 'Transit planning, budget allocation, and long-term impact.',
    priority_tier: 'season_catalog',
    starting_location: 'riverfront_pier',
  },
  {
    id: 18,
    title_ru: 'Сигнал SOS из хостела',
    title_en: 'SOS from the Hostel Chat',
    genre_ru: 'Digital-safety thriller',
    genre_en: 'Digital-Safety Thriller',
    hook_ru:
      'В общем чате путешественников появляется просьба о помощи: реальная, фальшивая или опасно неполная.',
    hook_en:
      'A distress message appears in a travelers group chat—real, fake, or dangerously incomplete.',
    mechanic_ru: 'Проверка личности, связь с персоналом отеля и защита приватности.',
    mechanic_en: 'Identity verification, alerting hotel staff, and protecting privacy.',
    priority_tier: 'priority_top5',
    starting_location: 'hotel_alley',
  },
  {
    id: 19,
    title_ru: 'Код уличной кухни',
    title_en: 'Street Kitchen Code',
    genre_ru: 'Culinary cozy game',
    genre_en: 'Culinary Cozy Game',
    hook_ru:
      'Катя снимает уличную еду, а Оля узнаёт историю семейного бульона и учится не нарушать личные границы.',
    hook_en:
      'Katya films street food while Olya learns the story behind a family broth without crossing boundaries.',
    mechanic_ru: 'Ингредиенты, этикет за столом, уважительный разговор.',
    mechanic_en: 'Ingredients, table etiquette, and respectful conversation.',
    priority_tier: 'season_catalog',
    starting_location: 'night_market',
  },
  {
    id: 20,
    title_ru: 'Потерянная кошка на пароме',
    title_en: 'Lost Cat on the Ferry',
    genre_ru: 'Семейная приключенческая игра',
    genre_en: 'Family Adventure',
    hook_ru:
      'Поиск пушистого пассажира знакомит подруг с несколькими семьями на паромной переправе.',
    hook_en:
      'Searching for a lost cat introduces the friends to several families along the ferry crossing.',
    mechanic_ru: 'Следы, приметы, фото и безопасное перемещение по причалу.',
    mechanic_en: 'Clues, sightings, photos, and safe navigation around the pier.',
    priority_tier: 'season_catalog',
    starting_location: 'riverfront_pier',
  },
  {
    id: 21,
    title_ru: 'Чемодан не Оли',
    title_en: 'Not Olya’s Suitcase',
    genre_ru: 'Комедийный mystery',
    genre_en: 'Comedy Mystery',
    hook_ru:
      'Оля получает чужой чемодан, внутри — личный дневник и подарки к свадьбе, которые нельзя публиковать.',
    hook_en:
      'Olya receives a stranger’s suitcase holding wedding gifts and a diary that must not be publicized.',
    mechanic_ru: 'Этика блогера, деликатный поиск владельца и соблюдение границ.',
    mechanic_en: 'Creator ethics, discreet owner search, and respecting privacy.',
    priority_tier: 'season_catalog',
    starting_location: 'hotel_alley',
  },
  {
    id: 22,
    title_ru: 'Невидимый третий',
    title_en: 'The Invisible Third',
    genre_ru: 'Кибер-мистерия',
    genre_en: 'Cyber Mystery',
    hook_ru:
      'Черновики Кати в облаке начинают синхронизироваться с чужим устройством из-за публичного Wi-Fi.',
    hook_en:
      'Katya’s cloud drafts start syncing with an unknown device after using an unsecured Wi-Fi spot.',
    mechanic_ru: 'Цифровая гигиена, сессии, 2FA и резервные копии.',
    mechanic_en: 'Digital hygiene, active session audit, 2FA, and backups.',
    priority_tier: 'season_catalog',
    starting_location: 'night_market',
  },
  {
    id: 23,
    title_ru: 'Чай для двоих',
    title_en: 'Tea for Two',
    genre_ru: 'Relationship drama',
    genre_en: 'Relationship Drama',
    hook_ru:
      'Главный конфликт внутри дуэта: Катя жаждет открытий, Оля устала нести ответственность за двоих.',
    hook_en:
      'The core conflict is internal: Katya craves spontaneity while Olya is exhausted from carrying all caution.',
    mechanic_ru: 'Честный разговор за чаем, распределение ролей и признание ошибок.',
    mechanic_en: 'Honest conversation over tea, sharing responsibility, and owning mistakes.',
    priority_tier: 'season_catalog',
    starting_location: 'lantern_terrace',
  },
  {
    id: 24,
    title_ru: 'Дождь на стекле',
    title_en: 'Rain on the Glass',
    genre_ru: 'Атмосферный психологический adventure',
    genre_en: 'Atmospheric Psychological Adventure',
    hook_ru:
      'Тропический ливень и накопленная усталость заставляют подруг видеть угрозу даже в добрых жестах.',
    hook_en:
      'Monsoon rain and travel fatigue make the friends misread even kind gestures as threats.',
    mechanic_ru: 'Снижение стресса, отдых, проверка фактов и забота о себе.',
    mechanic_en: 'Stress recovery, rest, fact-checking, and self-care.',
    priority_tier: 'season_catalog',
    starting_location: 'riverfront_pier',
  },
  {
    id: 25,
    title_ru: 'Город, который меняет улицы',
    title_en: 'The City That Shifts Streets',
    genre_ru: 'Магический реализм',
    genre_en: 'Magical Realism',
    hook_ru:
      'Каждое утро вывески и ставни переулка меняются, отражая отношение подруг к окружающим.',
    hook_en:
      'Each morning the alley’s shutters and signs shift, reflecting how the friends treat those around them.',
    mechanic_ru: 'Повторное посещение локаций и память мира.',
    mechanic_en: 'Re-visiting transformed spaces and world-state memory.',
    priority_tier: 'season_catalog',
    starting_location: 'hotel_alley',
  },
  {
    id: 26,
    title_ru: 'Квест без ведущего',
    title_en: 'Quest Without a Host',
    genre_ru: 'Meta-ARG adventure',
    genre_en: 'Meta-ARG Adventure',
    hook_ru:
      'Городской квест для туристов продолжается, но организатор перестал выходить на связь.',
    hook_en: 'A city puzzle game for tourists continues, but the organizer has gone offline.',
    mechanic_ru: 'Отделять игровую условность от реального риска и не заходить в закрытые зоны.',
    mechanic_en: 'Separating game fiction from real risk and refusing to enter restricted zones.',
    priority_tier: 'season_catalog',
    starting_location: 'night_market',
  },
  {
    id: 27,
    title_ru: 'Легенда о золотом мосте',
    title_en: 'Legend of the Golden Bridge',
    genre_ru: 'Лёгкое fantasy-adventure',
    genre_en: 'Light Fantasy-Adventure',
    hook_ru:
      'Старинная притча помогает двум подругам разобраться в современном споре вокруг массового туризма.',
    hook_en: 'An old parable helps the two friends untangle a modern dispute around mass tourism.',
    mechanic_ru: 'Символы, выбор трактовки и уважение к разным точкам зрения.',
    mechanic_en: 'Symbols, interpretive choices, and honoring multiple perspectives.',
    priority_tier: 'season_catalog',
    starting_location: 'lantern_terrace',
  },
  {
    id: 28,
    title_ru: 'Вторая смена',
    title_en: 'Second Shift',
    genre_ru: 'Life-management / социальная драма',
    genre_en: 'Life-Management / Social Drama',
    hook_ru:
      'Подругам предлагают «лёгкую подработку моделями/промоутерами», скрывающую кабальные условия.',
    hook_en: 'The friends are offered an "easy promo/modeling gig" that hides exploitative terms.',
    mechanic_ru: 'Проверка договора, твёрдый отказ, защита паспорта и предупреждение других.',
    mechanic_en: 'Contract scrutiny, firm refusal, keeping passports safe, and warning others.',
    priority_tier: 'season_catalog',
    starting_location: 'night_market',
  },
  {
    id: 29,
    title_ru: 'Паспорт в облаке',
    title_en: 'Passport in the Cloud',
    genre_ru: 'Кибер-survival',
    genre_en: 'Cyber-Survival',
    hook_ru:
      'Ссылка на скан документа случайно отправлена в чужой диалог; нужно быстро отозвать доступ.',
    hook_en:
      'A link to a document scan was sent to the wrong chat; revoke access before it is abused.',
    mechanic_ru: 'Управление правами доступа, пароли, 2FA и официальные сервисы.',
    mechanic_en: 'Access revocation, password hygiene, 2FA, and official support channels.',
    priority_tier: 'season_catalog',
    starting_location: 'hotel_alley',
  },
  {
    id: 30,
    title_ru: 'Три минуты до звонка',
    title_en: 'Three Minutes to the Call',
    genre_ru: 'Real-time decision game',
    genre_en: 'Paced Decision Game',
    hook_ru:
      'Через три минуты начнётся эфир со спонсором, а ключевой факт в репортаже Кати оказался спорным.',
    hook_en:
      'A sponsor livestream starts in three minutes, and Katya’s key story claim turns out to be disputed.',
    mechanic_ru: 'Подготовка тезисов заранее без наказания за вдумчивое чтение.',
    mechanic_en: 'Pre-stream fact preparation without penalizing thoughtful reading speed.',
    priority_tier: 'season_catalog',
    starting_location: 'lantern_terrace',
  },
  {
    id: 31,
    title_ru: 'След на песке',
    title_en: 'Track on the Sand',
    genre_ru: 'Экологический детектив',
    genre_en: 'Eco-Detective',
    hook_ru: 'Утром на берегу обнаруживаются следы ночного сброса отходов у причала.',
    hook_en: 'At dawn, traces of illegal night waste dumping appear near the pier.',
    mechanic_ru: 'Безопасная фотофиксация и передача данных инспекции без прямого столкновения.',
    mechanic_en: 'Safe photo documentation and reporting to authorities without confrontation.',
    priority_tier: 'season_catalog',
    starting_location: 'riverfront_pier',
  },
  {
    id: 32,
    title_ru: 'Музыка, которую нельзя потерять',
    title_en: 'Music That Must Not Be Lost',
    genre_ru: 'Музыкальная narrative game',
    genre_en: 'Musical Narrative Game',
    hook_ru:
      'Оля помогает найти запись старой семейной колыбельной, а Катя спрашивает разрешение на саундтрек.',
    hook_en:
      'Olya helps locate an old family lullaby recording while Katya seeks proper permission to feature it.',
    mechanic_ru: 'Согласие авторов, уважение к наследию и совместное творчество.',
    mechanic_en: 'Creator consent, heritage respect, and collaborative sound design.',
    priority_tier: 'season_catalog',
    starting_location: 'lantern_terrace',
  },
  {
    id: 33,
    title_ru: 'Код улыбки',
    title_en: 'Code of a Smile',
    genre_ru: 'Empathy adventure',
    genre_en: 'Empathy Adventure',
    hook_ru:
      'Подруги учатся понимать, когда улыбка означает радость, а когда — вежливое несогласие или неловкость.',
    hook_en:
      'The friends learn when a smile means warmth and when it masks polite disagreement or discomfort.',
    mechanic_ru: 'Слушать, уточнять, замечать контекст и не додумывать за собеседника.',
    mechanic_en: 'Active listening, gentle clarification, and reading situational context.',
    priority_tier: 'season_catalog',
    starting_location: 'night_market',
  },
  {
    id: 34,
    title_ru: 'Семь дверей Дананга',
    title_en: 'Seven Doors of Da Nang',
    genre_ru: 'Escape-room adventure',
    genre_en: 'Moral Escape Adventure',
    hook_ru:
      'Семь встреч за один вечер — каждая требует выбрать: уйти, попросить помощи, признать ошибку или проверить.',
    hook_en:
      'Seven encounters in one evening—each asks whether to step back, seek help, admit fault, or verify.',
    mechanic_ru: 'Компактные ситуационные головоломки и семь честных исходов.',
    mechanic_en: 'Compact situational puzzles leading to seven grounded outcomes.',
    priority_tier: 'season_catalog',
    starting_location: 'hotel_alley',
  },
  {
    id: 35,
    title_ru: 'Катя говорит, Оля молчит',
    title_en: 'Katya Speaks, Olya Keeps Quiet',
    genre_ru: 'Двухперспективная психологическая история',
    genre_en: 'Dual-Perspective Psychological Story',
    hook_ru: 'Один и тот же спорный вечер на рынке рассказывается с точки зрения Кати и Оли.',
    hook_en:
      'The same tense evening at the market is replayed from both Katya’s and Olya’s perspectives.',
    mechanic_ru: 'Переключение героинь и сопоставление субъективных воспоминаний.',
    mechanic_en: 'Switching heroines and reconciling subjective memories.',
    priority_tier: 'season_catalog',
    starting_location: 'night_market',
  },
  {
    id: 36,
    title_ru: 'Вьетнам без фильтра',
    title_en: 'Vietnam Unfiltered',
    genre_ru: 'Документальный ethics simulator',
    genre_en: 'Documentary Ethics Simulator',
    hook_ru:
      'Финальный монтаж честного тревел-фильма: что этично включить в выпуск, а что должно остаться за кадром ради безопасности людей.',
    hook_en:
      'Final cut of an honest travel documentary: what is ethical to publish and what must stay off-camera to protect people.',
    mechanic_ru: 'Разрешения на съёмку, монтаж фактов, согласие героев и реакция аудитории.',
    mechanic_en: 'Release consent, fact-checked editing, subject protection, and audience impact.',
    priority_tier: 'flagship_mvp',
    starting_location: 'lantern_terrace',
  },
];
