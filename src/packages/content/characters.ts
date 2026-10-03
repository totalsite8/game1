import type { HeroineId, LocationId } from '@validation/schemas';

export interface HeroineProfile {
  id: HeroineId;
  name_ru: string;
  name_en: string;
  age: number;
  role_ru: string;
  role_en: string;
  trait_summary_ru: string;
  trait_summary_en: string;
  strength_ru: string;
  strength_en: string;
  blindspot_ru: string;
  blindspot_en: string;
  special_ability_ru: string;
  special_ability_en: string;
  accent_color: string;
  coat_hex: string;
}

export interface NpcProfile {
  id: string;
  name_ru: string;
  name_en: string;
  vietnamese_name: string;
  age: number;
  role_ru: string;
  role_en: string;
  location: LocationId;
  bio_ru: string;
  bio_en: string;
  interests_ru: string;
  interests_en: string;
  trust_trigger_ru: string;
  trust_trigger_en: string;
  color_hex: string;
  position_3d: [number, number, number];
}

export interface SafetyTipCard {
  id: string;
  title_ru: string;
  title_en: string;
  summary_ru: string;
  summary_en: string;
  checklist_ru: string[];
  checklist_en: string[];
  badge: string;
}

export const HEROINES: Record<HeroineId, HeroineProfile> = {
  katya: {
    id: 'katya',
    name_ru: 'Катя',
    name_en: 'Katya',
    age: 23,
    role_ru: 'Режиссёр и оператор тревел-дневника',
    role_en: 'Travel Vlog Director & Videographer',
    trait_summary_ru:
      'Быстро действует, ищет живую эмоцию и сильный кадр, легко загорается идеей разоблачения.',
    trait_summary_en:
      'Acts fast, seeks raw emotion and strong framing, easily ignited by investigative scoops.',
    strength_ru:
      'Замечает визуальные детали на камере, быстро находит общий язык в неформальной беседе.',
    strength_en: 'Spots visual clues through her viewfinder and breaks the ice effortlessly.',
    blindspot_ru:
      'Может опубликовать сырой материал или пойти на ненужный риск ради громкого сюжета.',
    blindspot_en:
      'May rush to publish unverified clips or take unnecessary risks for a dramatic story.',
    special_ability_ru:
      'Видоискатель Кати: фиксирует визуальные улики, таблички, номера лодок и несостыковки на фото.',
    special_ability_en:
      'Katya’s Viewfinder: captures visual clues, license plates, boat numbers, and photo metadata.',
    accent_color: '#f59e0b',
    coat_hex: '#f97316',
  },
  olya: {
    id: 'olya',
    name_ru: 'Оля',
    name_en: 'Olya',
    age: 24,
    role_ru: 'Исследователь, аналитик маршрута и хранитель бюджета',
    role_en: 'UX Researcher, Route Analyst & Safety Planner',
    trait_summary_ru:
      'Внимательна к людям, договорам, тону речи и рискам, но иногда слишком долго сомневается.',
    trait_summary_en:
      'Attentive to people, contracts, tone, and risks, though sometimes hesitates too long.',
    strength_ru:
      'Распознаёт манипуляции, проверяет документы и бережёт личные границы собеседников.',
    strength_en:
      'Detects manipulation early, verifies documents, and respects personal & cultural boundaries.',
    blindspot_ru:
      'Из-за тревоги и усталости может закрыться от искренней помощи или передавить контролем.',
    blindspot_en: 'When stressed, may over-control or distrust genuine local kindness.',
    special_ability_ru:
      'Анализ контекста Оли: подсвечивает скрытые риски, условия сделок и эмоциональное состояние людей.',
    special_ability_en:
      'Olya’s Context Lens: highlights hidden risks, contract traps, and emotional subtext.',
    accent_color: '#38bdf8',
    coat_hex: '#0ea5e9',
  },
};

export const VIETNAMESE_NPCS: NpcProfile[] = [
  {
    id: 'linh',
    name_ru: 'Лин (Нгуен Фыонг Лин)',
    name_en: 'Linh (Nguyễn Phương Linh)',
    vietnamese_name: 'Nguyễn Phương Linh',
    age: 26,
    role_ru: 'Администратор бутик-отеля «Лотос» в Дананге',
    role_en: 'Front Desk Manager at Hotel Lotus, Da Nang',
    location: 'hotel_alley',
    bio_ru:
      'Выпускница факультета гостеприимства, увлекается плёночной фотографией. Знает, как отличить официальных перевозчиков от уличных посредников.',
    bio_en:
      'Hospitality graduate and film photography enthusiast. Knows how to distinguish licensed transit from street middlemen.',
    interests_ru: 'Аналоговая фотография, архитектура модернизма во Вьетнаме, защита прав гостей.',
    interests_en: 'Analog photography, Vietnamese modernist architecture, guest safety.',
    trust_trigger_ru:
      'Вежливое обращение без спешки и готовность показать бирку перепутанной сумки.',
    trust_trigger_en: 'Polite conversation without rushing and showing the swapped bag tag openly.',
    color_hex: '#10b981',
    position_3d: [-3.5, 0, -2.2],
  },
  {
    id: 'hai',
    name_ru: 'Хай («Макс Вайб»)',
    name_en: 'Hai ("Max Vibe")',
    vietnamese_name: 'Đặng Quốc Hải',
    age: 28,
    role_ru: 'Уличный промоутер закрытых вечеринок и «быстрых туров»',
    role_en: 'Street Promoter for Closed Parties & "Express Tours"',
    location: 'hotel_alley',
    bio_ru:
      'Обаятельный посредник, который предлагает туристам аренду байков «под залог паспорта» и приглашения на сомнительные закрытые мероприятия за городом.',
    bio_en:
      'Charismatic middleman pushing "passport-deposit" scooter rentals and invitations to unverified closed off-grid events.',
    interests_ru: 'Быстрые комиссии, вирусные сторис, обход официальных касс.',
    interests_en: 'Fast commissions, viral stories, bypassing official ticket desks.',
    trust_trigger_ru:
      'С ним важно держать безопасную дистанцию: вежливо сказать «нет», не отдавать паспорт и не садиться в чужой транспорт.',
    trust_trigger_en:
      'Keep safe boundaries: politely say no, never hand over your passport, and decline unverified rides.',
    color_hex: '#f43f5e',
    position_3d: [4.2, 0, -1.5],
  },
  {
    id: 'minh',
    name_ru: 'Минь (Чан Куанг Минь)',
    name_en: 'Minh (Trần Quang Minh)',
    vietnamese_name: 'Trần Quang Minh',
    age: 21,
    role_ru: 'Студент ИТ и лингвистики, подрабатывает переводом на рынке',
    role_en: 'IT & Linguistics Student, Part-Time Market Translator',
    location: 'night_market',
    bio_ru:
      'Разрабатывает открытый разговорник вьетнамских идиом. Помогает Кате и Оле расшифровать пометки на карте памяти и квитанции на рисовой бумаге.',
    bio_en:
      'Builds an open-source Vietnamese idiom app. Helps Katya and Olya decode the memory card notes and rice-paper receipts.',
    interests_ru: 'Компьютерная лингвистика, инди-игры, уличный кофе со сгущёнкой (cà phê sữa đá).',
    interests_en: 'Computational linguistics, indie games, iced milk coffee (cà phê sữa đá).',
    trust_trigger_ru:
      'Уважение к его времени, честная оплата перевода или помощь с проверкой текста.',
    trust_trigger_en: 'Respecting his study time and asking before recording his translation.',
    color_hex: '#8b5cf6',
    position_3d: [-2.8, 0, 1.8],
  },
  {
    id: 'bao',
    name_ru: 'Дядюшка Бао (Фам Ван Бао)',
    name_en: 'Uncle Bao (Phạm Văn Bảo)',
    vietnamese_name: 'Bác Phạm Văn Bảo',
    age: 58,
    role_ru: 'Владелец семейного кафе «Фо и Фонари»',
    role_en: 'Owner of "Phở & Lanterns" Family Café',
    location: 'night_market',
    bio_ru:
      'Бывший капитан речного парома. Тридцать лет варит бульон по семейному рецепту и сразу видит, когда над рекой собирается шторм.',
    bio_en:
      'Former river ferry captain who has simmered family broth for thirty years and reads river weather at a glance.',
    interests_ru: 'Речная навигация, традиционные фонари Хойана, шахматы ко-тыонг (cờ tướng).',
    interests_en: 'River navigation, traditional Hoi An lanterns, Vietnamese chess (cờ tướng).',
    trust_trigger_ru:
      'Не снимать кухню без разрешения и уважительно поздороваться («Xin chào bác»).',
    trust_trigger_en:
      'Asking permission before filming his kitchen and greeting him respectfully ("Xin chào bác").',
    color_hex: '#eab308',
    position_3d: [3.4, 0, 2.2],
  },
  {
    id: 'duc',
    name_ru: 'Дык (Хоанг Минь Дык)',
    name_en: 'Duc (Hoàng Minh Đức)',
    vietnamese_name: 'Hoàng Minh Đức',
    age: 34,
    role_ru: 'Координатор лицензированных речных маршрутов',
    role_en: 'Licensed River & Heritage Route Coordinator',
    location: 'riverfront_pier',
    bio_ru:
      'Честный предприниматель, чей логотип и имя незаконно скопировали организаторы фальшивых «VIP-экскурсий». Поначалу кажется подозрительным, пока Оля не сверяет номера лицензий.',
    bio_en:
      'Honest operator whose logo was cloned by fake "VIP tour" scammers. Looks suspicious until Olya cross-checks his official license.',
    interests_ru: 'Экологичный речной транспорт, сохранение прибрежных мангровых рощ.',
    interests_en: 'Clean river transit, mangrove conservation, safe passenger boats.',
    trust_trigger_ru:
      'Не обвинять с порога на камеру, а дать возможность показать официальный реестр причала.',
    trust_trigger_en: 'Checking his official pier registry instead of ambushing him on camera.',
    color_hex: '#06b6d4',
    position_3d: [-3.2, 0, -1.8],
  },
  {
    id: 'trang',
    name_ru: 'Чанг (Ле Тху Чанг)',
    name_en: 'Trang (Lê Thu Trang)',
    vietnamese_name: 'Lê Thu Trang',
    age: 31,
    role_ru: 'Журналистка отдела городских расследований и прав потребителей',
    role_en: 'Urban Investigative & Consumer-Rights Journalist',
    location: 'lantern_terrace',
    bio_ru:
      'Ведёт расследование о сети подставных «агентств приключений», которые обманывают и туристов, и местных лодочников. Ценит только проверяемые факты и защиту свидетелей.',
    bio_en:
      'Investigates a ring of shell "adventure agencies" defrauding both tourists and local boatmen. Values verified evidence and witness protection.',
    interests_ru: 'Документальная этика, проверка источников, защита уязвимых работников.',
    interests_en: 'Documentary ethics, source verification, protecting vulnerable workers.',
    trust_trigger_ru: 'Передать проверенные улики и скрыть лица случайных людей перед публикацией.',
    trust_trigger_en:
      'Providing verified facts and blurring innocent bystanders before publication.',
    color_hex: '#ec4899',
    position_3d: [0, 0, -2.6],
  },
];

export const TRAVEL_SAFETY_CARDS: SafetyTipCard[] = [
  {
    id: 'passport_safety',
    title_ru: 'Паспорт и документы',
    title_en: 'Passport & Document Safety',
    summary_ru:
      'Никогда не оставляйте оригинал загранпаспорта в залог за аренду байка, снаряжения или билетов.',
    summary_en:
      'Never leave your original passport as collateral for scooter rentals, gear, or tickets.',
    checklist_ru: [
      'Храните оригинал в сейфе отеля, а с собой носите бумажную копию и защищённый офлайн-скан.',
      'Лицензированные прокаты принимают денежный депозит и проверяют международные права категории А.',
      'Не отправляйте фото паспорта в незнакомые чаты или открытые формы.',
    ],
    checklist_en: [
      'Keep originals in the hotel safe; carry a paper copy and an encrypted offline scan.',
      'Licensed rentals accept a cash deposit and verify a valid international motorcycle permit.',
      'Never send passport scans to unverified chats or public web forms.',
    ],
    badge: 'DOC-01',
  },
  {
    id: 'invitations_boundaries',
    title_ru: 'Сомнительные приглашения и закрытые вечеринки',
    title_en: 'Unverified Invitations & Closed Events',
    summary_ru:
      'Умение спокойно сказать «нет» и остаться в людном освещённом месте — главный навык безопасности.',
    summary_en:
      'Saying a calm, firm "no" and staying in well-lit public spaces is your strongest safety tool.',
    checklist_ru: [
      'Отказывайтесь от поездок «в секретное место без адреса» и закрытых мероприятий без обратного транспорта.',
      'Не принимайте открытые напитки, свёрнутые пакеты или предложения «попробовать местный эксклюзив».',
      'Договоритесь с подругой о стоп-слове: если одной некомфортно — уходите вдвоём сразу.',
    ],
    checklist_en: [
      'Decline rides to "secret off-map locations" or closed events without independent return transit.',
      'Never accept opened drinks, unmarked packages, or substances.',
      'Use a buddy code word: if either friend feels uneasy, both leave together immediately.',
    ],
    badge: 'SAFE-02',
  },
  {
    id: 'transport_weather',
    title_ru: 'Транспорт, погода и маршрут',
    title_en: 'Transit, Weather & Route Verification',
    summary_ru:
      'В сезон дождей в Центральном Вьетнаме (Дананг, Хойан, Хюэ) погода и расписание паромов меняются быстро.',
    summary_en:
      'During Central Vietnam’s rainy season (Da Nang, Hoi An, Hue), weather and river schedules shift quickly.',
    checklist_ru: [
      'Сверяйте номер машины/лодки и заказывайте транспорт через стойку отеля или официальные приложения.',
      'Держите пауэрбанк заряженным минимум на 50% перед вечерним выходом.',
      'Отправляйте точку маршрута и время возвращения на ресепшен или близким.',
    ],
    checklist_en: [
      'Match license plates/boat numbers and book transit via hotel reception or official apps.',
      'Keep a power bank above 50% before heading out in the evening.',
      'Share your route pin and expected return time with hotel reception or trusted contacts.',
    ],
    badge: 'NAV-03',
  },
  {
    id: 'creator_ethics',
    title_ru: 'Этика съёмки и публикаций',
    title_en: 'Filming & Publication Ethics',
    summary_ru:
      'Камера — это ответственность. Непроверенное обвинение в сети может разрушить жизнь невиновного человека.',
    summary_en:
      'A camera carries responsibility. An unverified viral accusation can ruin an innocent person’s livelihood.',
    checklist_ru: [
      'Всегда спрашивайте разрешение перед крупным планом («May I take a video? / Cho phép mình quay видео nhé?»).',
      'Не публикуйте чужие документы, адреса и лица случайных свидетелей.',
      'Отделяйте проверенные факты от слухов в своём дневнике и монтаже.',
    ],
    checklist_en: [
      'Always ask permission before close-up filming ("Cho phép mình quay video nhé?").',
      'Never publish private documents, home addresses, or unblurred bystanders.',
      'Separate verified facts from rumors in your journal and final edit.',
    ],
    badge: 'ETH-04',
  },
];
