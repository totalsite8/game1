import type { HeroineId, LocationId } from '@validation/schemas';

/**
 * Внешность персонажа. Данные, а не код рендера:
 * тот же профиль может быть отрисован 3D-сборкой, плоским портретом или текстом.
 * Все размеры — доли роста (H), поэтому силуэт масштабируется без правок геометрии.
 */
export type HairStyle = 'ponytail' | 'low_bun' | 'bob' | 'wavy_long' | 'short' | 'short_grey';
export type BottomCut = 'trousers' | 'shorts' | 'skirt';
export type Sleeve = 'none' | 'short' | 'long';
export type Prop = 'camera' | 'tote' | 'phone' | 'tray' | 'clipboard' | 'cup' | 'notebook' | 'none';
export type Posture = 'relaxed' | 'guarded' | 'upright' | 'stoic';

export interface LookProfile {
  /** Рост в метрах. */
  height: number;
  /** Ширина корпуса: 0.92 — худощавый, 1.08 — плотный. */
  build: number;
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  eyes: string;
  top: string;
  bottom: string;
  shoes: string;
  bottomCut: BottomCut;
  sleeve: Sleeve;
  prop: Prop;
  propColor: string;
  /** Тип осанки: влияет на idle-позу и жестикуляцию. */
  posture: Posture;
  /** Темп внутренних движений: 0.85 — спокойный, 1.15 — быстрый. */
  tempo: number;
  /** Степень проработки грудной клетки: 0 — без акцента, 1 — выражена. */
  bust?: number;
  cap?: string;
  glasses?: boolean;
  lanyard?: boolean;
  apron?: string;
  backpack?: boolean;
  conicalHat?: boolean;
}

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
  /** Как персонаж выглядит в кадре. */
  look_ru: string;
  look_en: string;
  /** Одежда и вещи, которые при нём. */
  outfit_ru: string;
  outfit_en: string;
  /** Пластика: походка, жесты, привычки. */
  mannerism_ru: string;
  mannerism_en: string;
  look: LookProfile;
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
  /** Поворот корпуса по умолчанию в радианах: персонаж стоит лицом в эту сторону. */
  facing: number;
  look_ru: string;
  look_en: string;
  outfit_ru: string;
  outfit_en: string;
  mannerism_ru: string;
  mannerism_en: string;
  look: LookProfile;
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
    look_ru:
      'Рост 168 см, подвижная, лёгкая в плечах. Каштановые волосы собраны в небрежный хвост, на переносице — след от видоискателя, на запястье — шнурок от камеры.',
    look_en:
      '168 cm, quick and light-shouldered. Chestnut hair in a loose ponytail, a viewfinder mark on the bridge of her nose, a camera strap worn smooth on her wrist.',
    outfit_ru:
      'Льняная рубашка цвета заката, оливковые шорты с карманами для карт памяти, поношенные кроссовки, через плечо — сумка с камерой и запасным аккумулятором.',
    outfit_en:
      'Sunset-coloured linen shirt, olive cargo shorts with memory-card pockets, worn sneakers, a camera bag with a spare battery over her shoulder.',
    mannerism_ru:
      'Разворачивается к собеседнику всем корпусом, говорит быстро, жестикулирует свободной рукой; сомневаясь — опускает камеру и прищуривается, как будто кадрирует реальность.',
    mannerism_en:
      'Turns her whole torso toward whoever speaks, talks fast, gestures with her free hand; when unsure she lowers the camera and half-squints, framing reality.',
    look: {
      height: 1.68,
      build: 0.97,
      skin: '#f0c9a9',
      hair: '#6b432b',
      hairStyle: 'ponytail',
      eyes: '#7a6547',
      top: '#e07a3f',
      bottom: '#47523c',
      shoes: '#2f3a3b',
      bottomCut: 'shorts',
      sleeve: 'short',
      prop: 'camera',
      propColor: '#2b2b30',
      posture: 'relaxed',
      tempo: 1.12,
      bust: 1,
      backpack: true,
    },
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
    look_ru:
      'Рост 172 см, прямая осанка, тёмно-русые волосы каре. Смотрит внимательно и чуть исподлобья; в нагрудном кармане — тонкие очки для чтения.',
    look_en:
      '172 cm, straight-backed, dark-blonde bob. Watches closely from under her brows; slim reading glasses in her chest pocket.',
    outfit_ru:
      'Пыльно-голубая рубашка с длинным рукавом — от солнца и кондиционеров, светлые льняные брюки, кожаные сандалии, плотный шоппер с блокнотом и копиями документов.',
    outfit_en:
      'Dusty-blue long-sleeve shirt against sun and air-conditioning, light linen trousers, leather sandals, a sturdy tote with her notebook and document copies.',
    mannerism_ru:
      'Сначала слушает, потом отвечает. Стоит на обеих стопах, руки сомкнуты перед собой; проверяя деталь, касается бирки или квитанции подушечками пальцев.',
    mannerism_en:
      'Listens first, answers second. Stands on both feet, hands clasped in front; when checking a detail she touches the tag or receipt with her fingertips.',
    look: {
      height: 1.72,
      build: 0.95,
      skin: '#eec7a6',
      hair: '#a3825a',
      hairStyle: 'bob',
      eyes: '#6d8398',
      top: '#8fb0c9',
      bottom: '#ded5c2',
      shoes: '#4a443c',
      bottomCut: 'trousers',
      sleeve: 'long',
      prop: 'tote',
      propColor: '#c8a373',
      posture: 'guarded',
      tempo: 0.92,
      bust: 1,
    },
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
    facing: 0.55,
    look_ru:
      'Рост 160 см, собранная. Чёрные волосы в низкий пучок, идеально отглаженная блузка, бейдж администратора на ленте.',
    look_en:
      '160 cm, composed. Black hair in a low bun, perfectly pressed blouse, a reception badge on a lanyard.',
    outfit_ru:
      'Кремовая блузка с коротким рукавом, тёмные брюки, закрытые туфли на низком каблуке, бейдж «Lotus · Reception».',
    outfit_en:
      'Cream short-sleeve blouse, dark trousers, low-heeled closed shoes, a “Lotus · Reception” badge.',
    mannerism_ru:
      'Говорит ровно, смотрит в глаза и делает паузу перед ответом. Прежде чем что-то передать гостю, кладёт вещь на стойку — так принято у неё на ресепшене.',
    mannerism_en:
      'Speaks evenly, holds eye contact, pauses before answering. She places things on the counter before handing them over — reception habit.',
    look: {
      height: 1.6,
      build: 0.94,
      skin: '#e9bd93',
      hair: '#241c19',
      hairStyle: 'low_bun',
      eyes: '#3b2a20',
      top: '#f2ece0',
      bottom: '#333c44',
      shoes: '#2b2b30',
      bottomCut: 'trousers',
      sleeve: 'short',
      prop: 'none',
      propColor: '#2b3a52',
      posture: 'upright',
      tempo: 1,
      bust: 1,
      lanyard: true,
    },
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
    facing: -0.7,
    look_ru:
      'Рост 174 см, широкие плечи, быстрая улыбка. Тёмные очки не снимает даже вечером, короткая стрижка, тонкая цепочка на шее.',
    look_en:
      '174 cm, broad shoulders, a quick smile. Keeps dark sunglasses on even at night, short crop, a thin chain at his collar.',
    outfit_ru: 'Чёрное поло, тёмные джинсы, белые кроссовки; телефон всё время в правой руке.',
    outfit_en: 'Black polo, dark jeans, white sneakers; a phone permanently in his right hand.',
    mannerism_ru:
      'Подходит ближе, чем принято, говорит громко и торопит «решить сейчас»; на прямой вопрос отвечает шуткой и переводит разговор на скидку.',
    mannerism_en:
      'Steps closer than is comfortable, speaks loudly, pushes to “decide now”; answers direct questions with a joke and steers back to a discount.',
    look: {
      height: 1.74,
      build: 1.06,
      skin: '#cf9a70',
      hair: '#1e1a17',
      hairStyle: 'short',
      eyes: '#33261e',
      top: '#22232a',
      bottom: '#1e2733',
      shoes: '#e6e6e6',
      bottomCut: 'trousers',
      sleeve: 'short',
      prop: 'phone',
      propColor: '#15161a',
      posture: 'relaxed',
      tempo: 1.15,
      glasses: true,
    },
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
    facing: 0.9,
    look_ru:
      'Рост 168 см, худощавый. Короткие чёрные волосы, рюкзак на одном плече, в руке — стаканчик кофе со сгущёнкой.',
    look_en:
      '168 cm, slim. Short black hair, backpack slung on one shoulder, an iced milk coffee in his hand.',
    outfit_ru: 'Лавандовая футболка со стёршимся принтом, шорты, кеды, рюкзак с ноутбуком.',
    outfit_en: 'Faded lavender T-shirt, shorts, canvas sneakers, a laptop backpack.',
    mannerism_ru:
      'Подбирая точное слово, смотрит в экран; стесняется камеры, но расправляет плечи, когда перевод понимают с первого раза.',
    mannerism_en:
      'Looks at his screen while hunting for the right word; camera-shy, but squares his shoulders when his translation lands first try.',
    look: {
      height: 1.68,
      build: 0.92,
      skin: '#e2b48a',
      hair: '#221a16',
      hairStyle: 'short',
      eyes: '#33261e',
      top: '#7f86c9',
      bottom: '#39404d',
      shoes: '#dcdcdc',
      bottomCut: 'shorts',
      sleeve: 'short',
      prop: 'cup',
      propColor: '#e8dfd0',
      posture: 'relaxed',
      tempo: 1.05,
      backpack: true,
    },
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
    facing: -0.9,
    look_ru:
      'Рост 166 см, плотный, медлительный. Короткая седая стрижка, лицо и руки обветрены рекой; полотенце на плече.',
    look_en:
      '166 cm, thickset, unhurried. Close-cropped grey hair, river-weathered face and hands; a towel over his shoulder.',
    outfit_ru:
      'Светлая майка, тёмные брюки, коричневый фартук в бульонных пятнах, рабочие сандалии.',
    outfit_en: 'Light vest, dark trousers, a brown apron stained with broth, working sandals.',
    mannerism_ru:
      'Говорит мало: сначала смотрит на небо и на воду, потом отвечает. Решив — кивает один раз. Руки постоянно заняты: чашка, поднос, крышка кастрюли.',
    mannerism_en:
      'Speaks little: checks the sky and the river first, then answers. Nods once when he has decided. His hands are always busy — a bowl, a tray, a pot lid.',
    look: {
      height: 1.66,
      build: 1.09,
      skin: '#c08a5e',
      hair: '#8d8b86',
      hairStyle: 'short_grey',
      eyes: '#3a2a1e',
      top: '#efe6d5',
      bottom: '#4a4038',
      shoes: '#3a3a3a',
      bottomCut: 'trousers',
      sleeve: 'none',
      prop: 'tray',
      propColor: '#c8a97e',
      posture: 'stoic',
      tempo: 0.85,
      apron: '#8a4f3c',
    },
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
    facing: 0.75,
    look_ru:
      'Рост 172 см, подтянутый. Бейсболка с логотипом причала, короткая стрижка, в руке — планшет с реестром рейсов.',
    look_en:
      '172 cm, fit. Cap with the pier logo, short hair, a tablet showing the sailing registry in his hands.',
    outfit_ru:
      'Поло цвета морской волны, тёмные брюки, закрытые рабочие ботинки, кепка с логотипом причала.',
    outfit_en: 'Teal polo shirt, dark trousers, closed work shoes, cap with the pier logo.',
    mannerism_ru:
      'Держит дистанцию, когда на него направлена камера; если его не обвиняют, спокойно разворачивает реестр экраном к собеседнику.',
    mannerism_en:
      'Keeps his distance when a camera points at him; if he is not being accused, he calmly turns the registry screen toward you.',
    look: {
      height: 1.72,
      build: 1.02,
      skin: '#d8a274',
      hair: '#1f1a17',
      hairStyle: 'short',
      eyes: '#33261e',
      top: '#3c8f9c',
      bottom: '#33414a',
      shoes: '#33393d',
      bottomCut: 'trousers',
      sleeve: 'short',
      prop: 'clipboard',
      propColor: '#d9cbb0',
      posture: 'stoic',
      tempo: 0.95,
      cap: '#25555f',
    },
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
    facing: 0.2,
    look_ru:
      'Рост 165 см, стройная. Волосы до плеч мягкой волной, внимательный недоверчивый взгляд; блокнот и бейдж прессы на ленте.',
    look_en:
      '165 cm, slender. Soft shoulder-length waves, an attentive, sceptical gaze; notebook and a press badge on a lanyard.',
    outfit_ru:
      'Блузка пыльной розы, тёмные брюки, закрытые туфли на плоской подошве; в руке — блокнот в плотной обложке.',
    outfit_en:
      'Dusty-rose blouse, dark trousers, flat closed shoes; a hard-backed notebook in hand.',
    mannerism_ru:
      'Задаёт уточняющие вопросы и повторяет услышанное, чтобы проверить. Никогда не обещает снять сюжет сразу и не называет источников.',
    mannerism_en:
      'Asks follow-up questions and repeats what she heard to verify it. Never promises a story on the spot and never names a source.',
    look: {
      height: 1.65,
      build: 0.97,
      skin: '#e0b28b',
      hair: '#241d1a',
      hairStyle: 'wavy_long',
      eyes: '#3b2a20',
      top: '#c07f92',
      bottom: '#2f3644',
      shoes: '#3b3b3b',
      bottomCut: 'trousers',
      sleeve: 'short',
      prop: 'notebook',
      propColor: '#f0e9dc',
      posture: 'upright',
      tempo: 1,
      bust: 1,
      lanyard: true,
    },
  },
];

/** Фоновые горожане: не участвуют в диалогах, но делают двор, рынок и набережную живыми. */
export const TOWNSFOLK: LookProfile[] = [
  {
    height: 1.56,
    build: 0.96,
    skin: '#d9a077',
    hair: '#241c19',
    hairStyle: 'low_bun',
    eyes: '#33261e',
    top: '#cfd6d3',
    bottom: '#5c6b62',
    shoes: '#3a3a3a',
    bottomCut: 'trousers',
    sleeve: 'long',
    prop: 'tote',
    propColor: '#c8a97e',
    posture: 'stoic',
    tempo: 0.9,
    bust: 1,
    conicalHat: true,
  },
  {
    height: 1.7,
    build: 1,
    skin: '#cf9a70',
    hair: '#1f1a17',
    hairStyle: 'short',
    eyes: '#33261e',
    top: '#dcd3c0',
    bottom: '#3f4a55',
    shoes: '#2f2f2f',
    bottomCut: 'shorts',
    sleeve: 'short',
    prop: 'phone',
    propColor: '#15161a',
    posture: 'relaxed',
    tempo: 1.08,
  },
  {
    height: 1.55,
    build: 1.04,
    skin: '#c99a6f',
    hair: '#6f6a64',
    hairStyle: 'low_bun',
    eyes: '#3a2a1e',
    top: '#a893b8',
    bottom: '#463f4a',
    shoes: '#3a3a3a',
    bottomCut: 'trousers',
    sleeve: 'short',
    prop: 'none',
    propColor: '#8a7f6a',
    posture: 'stoic',
    tempo: 0.86,
    bust: 1,
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
