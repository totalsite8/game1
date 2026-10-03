export type Locale = 'ru' | 'en';
export type Text = { ru: string; en: string };
export const t = (ru: string, en: string): Text => ({ ru, en });
export type Stats = {
  trust: number;
  safety: number;
  budget: number;
  battery: number;
  evidence: number;
  time: number;
};
export interface Choice {
  label: Text;
  result: Text;
  effect: Partial<Stats>;
  fact?: Text;
  verified?: boolean;
  flag?: string;
  requires?: number;
}
export interface Beat {
  place: number;
  title: Text;
  speaker: string;
  text: Text;
  observation: Text;
  choices: Choice[];
  tense?: boolean;
}
const c = (
  ru: string,
  en: string,
  rr: string,
  re: string,
  effect: Partial<Stats>,
  extra: Partial<Choice> = {}
): Choice => ({ label: t(ru, en), result: t(rr, re), effect, ...extra });
export const places = [
  t('Двор отеля', 'Hotel courtyard'),
  t('Вечерний рынок', 'Evening market'),
  t('Набережная', 'Riverfront'),
];
export const story: Beat[] = [
  {
    place: 0,
    title: t('Не наша сумка', 'Not our bag'),
    speaker: 'olya',
    text: t(
      'Катя, на бирке не твоё имя. Похожая сумка, тот же цвет… Только внутри карта памяти и чужой блокнот. Давай сначала разберёмся, а потом включим камеру.',
      'Katya, that isn’t your name on the tag. Same bag, same color… But there’s a memory card and someone’s notebook inside. Let’s understand this before turning on the camera.'
    ),
    observation: t(
      'На бирке — номер стойки хранения. Имени владельца не видно.',
      'The tag has a luggage desk number. The owner’s name is not visible.'
    ),
    choices: [
      c(
        'Попросить Лин проверить бирку',
        'Ask Linh to check the tag',
        'Лин записывает номер сумки и обещает связаться с перевозчиком. Личные вещи остаются закрытыми.',
        'Linh records the bag number and contacts the carrier. Personal belongings stay private.',
        { trust: 5, safety: 5, evidence: 1 },
        {
          fact: t(
            'Бирка относится к рейсу нашего перевозчика.',
            'The tag belongs to our carrier’s route.'
          ),
          verified: true,
        }
      ),
      c(
        'Снять находку для черновика',
        'Film the discovery for a draft',
        'Оля просит не показывать чужие записи. Катя убирает их из кадра, но разговор становится напряжённее.',
        'Olya asks not to show the private notes. Katya reframes, but the conversation grows tense.',
        { trust: -8, battery: -5 },
        { flag: 'filmed' }
      ),
    ],
  },
  {
    place: 0,
    title: t('Время на разговор', 'Time to talk'),
    speaker: 'linh',
    text: t(
      'Я могу оставить сумку в закрытой комнате и выдать квитанцию. А ещё — дать вам зарядку. Вы только приехали, не обязательно решать всё за один вечер.',
      'I can keep the bag in a locked room and give you a receipt. And lend you a charger. You just arrived; you don’t have to solve everything tonight.'
    ),
    observation: t(
      'На стойке есть квитанции и телефон перевозчика. Лин не просит паспорт в залог.',
      'There are receipts and a carrier contact at the desk. Linh does not ask to keep your passport.'
    ),
    choices: [
      c(
        'Оставить сумку по квитанции и зарядить телефон',
        'Get a receipt and charge the phone',
        'Сумка в безопасности. За чаем Катя и Оля договариваются всегда уходить вместе, если одной некомфортно.',
        'The bag is secure. Over tea, they agree to leave together whenever either feels uneasy.',
        { battery: 20, trust: 8, safety: 8, time: -1 },
        { flag: 'receipt' }
      ),
      c(
        'Взять сумку с собой — быстрее найдём владельца',
        'Take the bag to find its owner faster',
        'Лин оставляет контакт. Оля теперь следит и за своими вещами, и за чужими.',
        'Linh shares a contact. Olya now has to watch two sets of belongings.',
        { safety: -8, trust: -4, time: 0 }
      ),
    ],
  },
  {
    place: 0,
    title: t('Приглашение без адреса', 'An invitation without an address'),
    speaker: 'katya',
    tense: true,
    text: t(
      'У ворот незнакомый промоутер предлагает закрытую встречу с «нужными людьми». Адрес обещает прислать уже по дороге. Катя: «Звучит как история… Но почему такая спешка?»',
      'Outside, an unfamiliar promoter offers a closed event with “the right people.” He will share the address on the way. Katya: “Sounds like a story… but why the rush?”'
    ),
    observation: t(
      'Нет адреса, организатора и условий возвращения. Это конкретное непроверенное предложение, не характеристика города.',
      'No address, organizer, or return plan. This is one unverified offer, not a reflection of the city.'
    ),
    choices: [
      c(
        'Отказаться и остаться у отеля',
        'Decline and stay by the hotel',
        '«Спасибо, у нас другие планы». Подруги возвращаются к освещённой стойке.',
        '“Thank you, we have other plans.” The friends return to the lit reception.',
        { safety: 10, trust: 4 },
        {
          fact: t(
            'У приглашения не было проверяемого адреса.',
            'The invitation had no verifiable address.'
          ),
          verified: true,
        }
      ),
      c(
        'Уточнить условия, не уходя от стойки',
        'Ask for details without leaving reception',
        'Конкретных ответов нет. Подруги отказываются. Разговор стоил времени, но не безопасности.',
        'There are no specific answers. They decline. The conversation cost time, not safety.',
        { time: -1, battery: -3, safety: 4 },
        {
          fact: t(
            'Обещания промоутера не подтверждены.',
            'The promoter’s promises are unconfirmed.'
          ),
        }
      ),
    ],
  },
  {
    place: 1,
    title: t('Кофе и разрешение', 'Coffee and consent'),
    speaker: 'bao',
    text: t(
      'Бао ставит на стол два кофе. «Рецепт семейный. Кухню я пока снимать не хочу, но о своём кафе расскажу». Катя опускает камеру: «Тогда сначала просто послушаем?»',
      'Bao sets down two coffees. “A family recipe. I don’t want the kitchen filmed, but I can tell you about my café.” Katya lowers her camera: “Let’s just listen first?”'
    ),
    observation: t(
      'Хозяин согласен на разговор, но не на съёмку кухни. Согласие относится к конкретному действию.',
      'The owner welcomes a conversation, not filming his kitchen. Consent is specific.'
    ),
    choices: [
      c(
        'Убрать камеру и послушать',
        'Put the camera away and listen',
        'Бао рассказывает о соседях и замечает знакомый логотип на квитанции. Он знакомит вас с Минем.',
        'Bao talks about his neighbors and recognizes a logo on the receipt. He introduces Minh.',
        { trust: 5, budget: -60000, time: -1 },
        { flag: 'respect' }
      ),
      c(
        'Снять только свой кофе',
        'Film only our coffee',
        'Катя проверяет, что в кадре нет других гостей. Красивое начало дневника — без чужих лиц.',
        'Katya checks that no other guests are in frame. A beautiful opening without exposing anyone.',
        { battery: -5, budget: -60000 },
        { flag: 'coffee' }
      ),
    ],
  },
  {
    place: 1,
    title: t('Два похожих названия', 'Two similar names'),
    speaker: 'minh',
    text: t(
      'Минь сравнивает квитанцию и вывеску. «Это не одно и то же название. Переводчик убрал важное слово. Давайте не будем обвинять кафе из-за похожего логотипа».',
      'Minh compares the receipt to the sign. “These names aren’t the same. The translator dropped a word. Let’s not blame the café because the logos look alike.”'
    ),
    observation: t(
      'На квитанции другое юридическое название. Логотип сам по себе ничего не доказывает.',
      'The receipt has a different registered name. A logo alone proves nothing.'
    ),
    choices: [
      c(
        'Оплатить перевод и записать различие',
        'Pay for a translation and note the distinction',
        'Минь объясняет разницу. В дневнике появляется проверяемое наблюдение, а не обвинение.',
        'Minh explains the distinction. Your journal gains a checkable observation, not an accusation.',
        { budget: -100000, evidence: 2, time: -1 },
        {
          fact: t(
            'Названия на квитанции и вывеске различаются.',
            'The receipt and the sign show different names.'
          ),
          verified: true,
        }
      ),
      c(
        'Пока сохранить автоматический перевод',
        'Keep the automatic translation for now',
        'Вы экономите деньги, но помечаете перевод как непроверенный.',
        'You save money but mark the translation as unverified.',
        { battery: -4 },
        {
          fact: t(
            'Автоматический перевод названия требует проверки.',
            'The automatic name translation needs checking.'
          ),
        }
      ),
    ],
  },
  {
    place: 1,
    title: t('Кадр вне контекста', 'A frame without context'),
    speaker: 'katya',
    text: t(
      'Лин перезванивает: владелец сумки найден. Он разрешает посмотреть только фото квитанции, которое сам прислал. На нём человек у лодки. «Мы ведь не знаем, зачем он там», — напоминает Оля.',
      'Linh calls: the bag’s owner has been found. He shares only a receipt photo with permission to view it. A person stands beside a boat. “We don’t know why he’s there,” Olya reminds Katya.'
    ),
    observation: t(
      'Разрешение на просмотр одного фото не означает разрешение публиковать его.',
      'Permission to view one photo is not permission to publish it.'
    ),
    choices: [
      c(
        'Сверить время снимка с квитанцией',
        'Compare the photo time to the receipt',
        'Время не совпадает с объявленной экскурсией. Это повод задать вопрос, не доказательство вины.',
        'The time differs from the advertised tour. A reason to ask, not proof of guilt.',
        { evidence: 2, battery: -6, time: -1 },
        {
          fact: t(
            'Время фото отличается от времени тура в квитанции.',
            'The photo time differs from the receipt’s tour time.'
          ),
          verified: true,
        }
      ),
      c(
        'Подготовить эмоциональный тизер без публикации',
        'Draft a dramatic teaser without posting',
        'Катя пишет громкий заголовок. Оля просит не превращать предположение в факт.',
        'Katya writes a dramatic headline. Olya asks not to turn speculation into fact.',
        { trust: -12, battery: -8 },
        { flag: 'teaser' }
      ),
    ],
  },
  {
    place: 1,
    title: t('Перед дождём', 'Before the rain'),
    speaker: 'olya',
    text: t(
      'Над рекой темнеет. До набережной недалеко, но телефон садится. Оля предлагает заказать транспорт через отель и отправить Лин план возвращения.',
      'Clouds gather over the river. The waterfront isn’t far, but the phone is running low. Olya suggests booking through the hotel and sharing a return plan with Linh.'
    ),
    observation: t(
      'В кафе можно переждать дождь. На причале нет срочной встречи.',
      'You can wait at the café. Nothing at the pier requires rushing.'
    ),
    choices: [
      c(
        'Переждать, зарядиться и заказать поездку',
        'Wait, recharge and book a ride',
        'Бао приносит воду. Через час дождь стихает. Водитель и номер машины подтверждены отелем.',
        'Bao brings water. An hour later, the rain eases. The hotel confirms the driver and plate.',
        { battery: 25, safety: 8, budget: -120000, time: -2 }
      ),
      c(
        'Пойти по освещённой улице вдвоём',
        'Walk together along the lit street',
        'Вы не разделяетесь и не сворачиваете в переулки. Дождь всё же замедляет путь.',
        'You stay together on the main street. The rain still slows the journey.',
        { battery: -12, safety: -5, time: -2 }
      ),
    ],
  },
  {
    place: 2,
    title: t('Другая сторона истории', 'The other side'),
    speaker: 'duc',
    text: t(
      'Дык показывает расписание своего причала. «На этой бумаге наше старое оформление, но телефон чужой. Я тоже хочу разобраться. Только не снимайте пассажиров».',
      'Duc shows the pier schedule. “That paper uses our old branding but someone else’s phone number. I want to understand too. Please don’t film the passengers.”'
    ),
    observation: t(
      'Проверка реестра и контакта полезнее сходства вывесок. Люди на причале не давали согласия на съёмку.',
      'Registry details and verified contacts matter more than similar signs. Passengers have not consented to filming.'
    ),
    choices: [
      c(
        'Сравнить официальный контакт и квитанцию',
        'Compare the official contact to the receipt',
        'Контакты различаются. Дык разрешает записать только открытые данные стойки.',
        'The contacts differ. Duc allows you to record only the desk’s public information.',
        { evidence: 2, trust: 5, time: -1 },
        {
          fact: t(
            'Телефон в квитанции не совпадает с контактом стойки.',
            'The receipt phone does not match the pier desk contact.'
          ),
          verified: true,
        }
      ),
      c(
        'Задать резкий вопрос на камеру',
        'Ask a confrontational question on camera',
        'Дык просит прекратить запись. Вы останавливаетесь. Разговор можно восстановить, но доверие пострадало.',
        'Duc asks you to stop recording. You do. The conversation can recover, but trust has suffered.',
        { trust: -15, safety: -5 },
        { flag: 'confrontation' }
      ),
    ],
  },
  {
    place: 2,
    title: t('Без чужих лиц', 'No bystanders in frame'),
    speaker: 'trang',
    text: t(
      'Журналистка Чанг согласилась поговорить в открытом кафе у набережной. «Разделите материалы на то, что вы видели сами, и то, что вам рассказали. И уберите личные данные».',
      'Journalist Trang agrees to meet at an open waterfront café. “Separate what you saw from what you were told. And remove personal data.”'
    ),
    observation: t(
      'У вас есть наблюдения и версии. Установить намерения людей по одному фото нельзя.',
      'You have observations and claims. One photo cannot establish someone’s intentions.'
    ),
    choices: [
      c(
        'Собрать обезличенную хронологию',
        'Build an anonymized timeline',
        'Вы закрываете лица и частные контакты. Чанг получает только материалы, которыми разрешено делиться.',
        'You redact faces and private contacts. Trang receives only material you have permission to share.',
        { evidence: 1, battery: -8, time: -1 },
        {
          flag: 'protected',
          fact: t(
            'Материалы перед передачей обезличены.',
            'Material was anonymized before sharing.'
          ),
          verified: true,
        }
      ),
      c(
        'Пока передать только устный пересказ',
        'Share only a verbal account for now',
        'Чанг записывает вопросы для будущей проверки. Материалы остаются у их владельца.',
        'Trang notes questions for future verification. The material stays with its owner.',
        { safety: 5 },
        { flag: 'private' }
      ),
    ],
  },
  {
    place: 2,
    title: t('Две точки зрения', 'Two perspectives'),
    speaker: 'olya',
    text: t(
      '«Я не хочу всё запрещать, — говорит Оля. — Я хочу, чтобы ты слышала, когда мне страшно». Катя смотрит на потухший экран: «А я боюсь, что без сильной истории поездка ничего не значит».',
      '“I don’t want to forbid everything,” says Olya. “I want you to listen when I’m scared.” Katya looks at the dark screen. “And I’m afraid that without a great story this trip means nothing.”'
    ),
    observation: t(
      'Обе говорят о своих страхах, а не о вине другой.',
      'Both are describing their fears, not blaming the other.'
    ),
    choices: [
      c(
        'Признать ошибки и решить вместе',
        'Own our mistakes and decide together',
        '«Поездка уже значит многое. Мы здесь вдвоём». Громкий выпуск может подождать.',
        '“It already means something. We’re here together.” The big story can wait.',
        { trust: 18, time: -1 },
        { flag: 'repaired' }
      ),
      c(
        'Отложить разговор до отеля',
        'Leave the conversation until the hotel',
        'Подруги устали. Они договариваются вернуться вместе, но важный разговор ещё впереди.',
        'They are tired. They agree to return together, but the important conversation is still ahead.',
        { trust: -4, safety: 3 }
      ),
    ],
  },
  {
    place: 2,
    title: t('Цена заголовка', 'The cost of a headline'),
    speaker: 'katya',
    text: t(
      'Черновик почти готов. На обложке можно написать «Мы раскрыли схему». Но что именно доказано? Катя открывает дневник вместо редактора.',
      'The draft is almost ready. The cover could say “We exposed the scheme.” But what is actually proven? Katya opens the journal instead of the editor.'
    ),
    observation: t(
      'Проверенный факт может быть скромнее красивой истории. Это не делает его менее важным.',
      'A verified fact may be smaller than a compelling story. That does not make it less important.'
    ),
    choices: [
      c(
        'Удалить неподтверждённые обвинения',
        'Remove unverified accusations',
        'Остаются наблюдения, вопросы и благодарности людям, которые помогли.',
        'What remains: observations, questions and thanks to the people who helped.',
        { trust: 5, safety: 5 },
        { flag: 'careful' }
      ),
      c(
        'Оставить интригу и неоднозначный намёк',
        'Keep the suspense and ambiguous hint',
        'Имена скрыты, но местные могут узнать человека по контексту. Оля предупреждает о риске.',
        'Names are hidden, but locals may identify someone from context. Olya warns of the risk.',
        { trust: -12, safety: -10 },
        { flag: 'hint' }
      ),
    ],
  },
  {
    place: 2,
    title: t('Что останется за кадром', 'What stays off camera'),
    speaker: 'trang',
    text: t(
      'На реке загораются фонари. Вы не обязаны заканчивать вечер расследованием. Что вы хотите сделать с этой историей?',
      'Lanterns light up along the river. This evening does not have to end in an investigation. What will you do with this story?'
    ),
    observation: t(
      'Финал зависит от накопленных решений — и от того, какие сведения действительно проверены.',
      'The ending depends on earlier choices, including how much you actually verified.'
    ),
    choices: [
      c(
        'Передать проверенную часть Чанг',
        'Give the verified material to Trang',
        'Чанг продолжит проверку. Вы не публикуете обвинений и сохраняете границы свидетелей.',
        'Trang will continue checking. You publish no accusations and protect witnesses.',
        {},
        { flag: 'handoff', requires: 3 }
      ),
      c(
        'Опубликовать эмоциональный ролик',
        'Publish the dramatic video',
        'История выходит раньше проверки. В комментариях появляются догадки о людях, которые не давали согласия.',
        'The story goes out before verification. Comments speculate about people who never consented.',
        { trust: -15, safety: -15 },
        { flag: 'viral' }
      ),
      c(
        'Выбрать безопасность и закончить съёмку',
        'Choose safety and put down the camera',
        'Вы возвращаетесь в отель. В дневнике остаются вопросы и имена людей, которым хочется сказать спасибо.',
        'You return to the hotel. Your journal keeps its questions and the names of people you want to thank.',
        { safety: 10 },
        { flag: 'leave' }
      ),
    ],
  },
];
export const endings = {
  honest: t('Честный маршрут', 'An honest route'),
  restored: t('Доверие восстановлено', 'Trust restored'),
  safe: t('Мы выбрали безопасность', 'We chose safety'),
  viral: t('Сенсация любой ценой', 'A story at any cost'),
};
