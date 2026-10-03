import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  ArrowRight,
  Compass,
  Map,
  BookOpen,
  Settings,
  ShieldCheck,
  Camera,
  ChevronRight,
  Sun,
  VolumeX,
  Leaf,
  Heart,
  Battery,
  Clock,
  Wallet,
  Check,
  Download,
  Upload,
  X,
  Play,
  Footprints,
  Eye,
  RotateCcw,
  Menu,
  Flag,
  Globe,
  Info,
} from 'lucide-react';
import { initial, choose, ending, restore, type Game } from './packages/game-core/core';
import { load, save, remove } from './packages/platform/storage';
import { story, places, endings, type Locale } from './packages/story/story';
const World = lazy(() => import('./packages/render-babylon/World'));
type Panel =
  'journal' | 'map' | 'settings' | 'privacy' | 'warning' | 'dialogue' | 'restart' | 'ending' | null;
const names: Record<string, { ru: string; en: string }> = {
  katya: { ru: 'Катя', en: 'Katya' },
  olya: { ru: 'Оля', en: 'Olya' },
  linh: { ru: 'Лин · администратор', en: 'Linh · reception' },
  bao: { ru: 'Бао · хозяин кафе', en: 'Bao · café owner' },
  minh: { ru: 'Минь · переводчик', en: 'Minh · translator' },
  duc: { ru: 'Дык · координатор причала', en: 'Duc · pier coordinator' },
  trang: { ru: 'Чанг · журналистка', en: 'Trang · journalist' },
};
function preference(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
export default function App() {
  const [locale, setLocale] = useState<Locale>(preference('locale', 'ru') === 'en' ? 'en' : 'ru');
  const ru = locale === 'ru';
  const tr = (a: string, b: string) => (ru ? a : b);
  const [game, setGame] = useState<Game>(initial);
  const [ready, setReady] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [result, setResult] = useState<{ step: number; choice: number } | null>(null);
  const [textMode, setTextMode] = useState(preference('textMode', 'false') === 'true');
  const [low, setLow] = useState(preference('low', 'false') === 'true');
  const [comfort, setComfort] = useState(preference('comfort', 'false') === 'true');
  const [large, setLarge] = useState(preference('large', 'false') === 'true');
  const [saveStatus, setSaveStatus] = useState('');
  const [notice, setNotice] = useState('');
  const [offline, setOffline] = useState(!navigator.onLine);
  const [install, setInstall] = useState<any>(null);
  const [observation, setObservation] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const beat = story[Math.min(game.step, story.length - 1)];
  const finished = game.step === story.length;
  useEffect(() => {
    load()
      .then((g) => {
        if (g) {
          setGame(g);
          setHasSave(true);
        }
      })
      .catch(() =>
        setNotice(
          'Локальное сохранение недоступно или повреждено. / Local save unavailable or invalid.'
        )
      )
      .finally(() => setReady(true));
    const online = () => setOffline(!navigator.onLine);
    window.addEventListener('online', online);
    window.addEventListener('offline', online);
    const prompt = (e: Event) => {
      e.preventDefault();
      setInstall(e);
    };
    window.addEventListener('beforeinstallprompt', prompt);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', online);
      window.removeEventListener('beforeinstallprompt', prompt);
    };
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    for (const [k, v] of Object.entries({ locale, textMode, low, comfort, large })) {
      try {
        localStorage.setItem(k, String(v));
      } catch {}
    }
  }, [locale, textMode, low, comfort, large]);
  useEffect(() => {
    if (!ready || !playing) return;
    let current = true;
    setSaveStatus('saving');
    save(game)
      .then(() => {
        if (current) {
          setSaveStatus('saved');
          setHasSave(true);
        }
      })
      .catch(() => {
        if (current) setSaveStatus('error');
      });
    return () => {
      current = false;
    };
  }, [game, ready, playing]);
  useEffect(() => {
    if (panel) {
      dialog.current?.showModal();
    } else {
      dialog.current?.close();
    }
  }, [panel]);
  const open = (p: Panel) => {
    setResult(null);
    setPanel(p);
  };
  const start = () => open('warning');
  const continueStory = () => {
    setObservation(false);
    setPlaying(true);
    setPanel(finished ? 'ending' : null);
    if (location.pathname !== '/telegram') history.replaceState(null, '', '/play');
  };
  const apply = (i: number) => {
    const next = choose(game, i);
    if (next === game) return;
    setResult({ step: game.step, choice: i });
    setGame(next);
    setObservation(false);
  };
  const exportSave = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' })
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = 'unfiltered-route-save.json';
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  async function importSave(file?: File) {
    if (!file) return;
    try {
      if (file.size > 100000) throw Error();
      const g = restore(JSON.parse(await file.text()));
      await save(g);
      setGame(g);
      setHasSave(true);
      setPlaying(false);
      setNotice(tr('Сохранение импортировано.', 'Save imported.'));
      setPanel(null);
    } catch {
      setNotice(
        tr(
          'Файл не подходит или хранилище недоступно. Прогресс не заменён.',
          'Invalid file or storage unavailable. Progress was not replaced.'
        )
      );
    }
    if (input.current) input.current.value = '';
  }
  return (
    <div className={`app ${large ? 'large-text' : ''}`}>
      <aside className="sidebar">
        <a
          href="/"
          className="brand"
          onClick={(e) => {
            e.preventDefault();
            setPlaying(false);
            history.replaceState(null, '', '/');
          }}
          aria-label={tr('На главную', 'Home')}
        >
          <Compass size={29} />
        </a>
        <span className="vertical-label">UNFILTERED ROUTE</span>
        <nav>
          <button
            className={!panel ? 'nav-item active' : 'nav-item'}
            onClick={() => {
              setPanel(null);
              setPlaying(false);
            }}
            aria-label={tr('Главная', 'Home')}
          >
            <Compass size={22} />
          </button>
          <button
            className={panel === 'map' ? 'nav-item active' : 'nav-item'}
            onClick={() => open('map')}
            aria-label={tr('Карта маршрута', 'Route map')}
          >
            <Map size={22} />
          </button>
          <button
            className={panel === 'journal' ? 'nav-item active' : 'nav-item'}
            onClick={() => open('journal')}
            aria-label={tr('Дневник', 'Journal')}
          >
            <BookOpen size={22} />
            {game.journal.length > 0 && <i />}
          </button>
        </nav>
        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() => open('settings')}
            aria-label={tr('Настройки', 'Settings')}
          >
            <Settings size={21} />
          </button>
          <button
            className="nav-item"
            onClick={() => open('privacy')}
            aria-label={tr('О проекте и приватность', 'About and privacy')}
          >
            <Info size={21} />
          </button>
          <span className="version">v0.1</span>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="wordmark">
            {tr('Маршрут', 'Unfiltered')} <em>{tr('без фильтра', 'route')}</em>
            <span className="wordmark-dot" />
          </div>
          <div className="top-actions">
            <span className="status">
              <i />
              {offline
                ? tr('Офлайн', 'Offline')
                : tr('Личная история. Твой выбор.', 'Your story. Your choices.')}
            </span>
            <button className="language" onClick={() => setLocale(ru ? 'en' : 'ru')}>
              <Globe size={14} />
              {ru ? 'RU' : 'EN'}
            </button>
            <button
              className="circle-button"
              onClick={() => open('settings')}
              aria-label={tr('Открыть настройки', 'Open settings')}
            >
              <Settings size={18} />
            </button>
          </div>
        </header>
        <main>
          {!playing ? (
            <>
              <div className="page-heading">
                <div>
                  <div className="eyebrow">
                    <span />
                    {tr('ДОРОЖНЫЕ ИСТОРИИ', 'STORIES FROM THE ROAD')}
                  </div>
                  <h1>{tr('Дальше — только вместе.', 'The road is better together.')}</h1>
                  <p>
                    {tr(
                      'Неидеальное путешествие. Настоящая дружба. Твой маршрут.',
                      'An imperfect journey. A real friendship. Your own route.'
                    )}
                  </p>
                </div>
                <span className="edition">
                  {tr('ПЕРВЫЙ ЭПИЗОД', 'FIRST EPISODE')}
                  <b>VIETNAM / 01</b>
                </span>
              </div>
              <section className="hero">
                <img
                  src="/images/hoi-an.jpg"
                  alt={tr(
                    'Художественная иллюстрация: две путешественницы на улице с фонарями у реки',
                    'Concept art: two travelers on a lantern-lit riverside street'
                  )}
                />
                <div className="hero-shade" />
                <div className="hero-top">
                  <span className="glass-tag">
                    <span />
                    {tr('ИНТЕРАКТИВНАЯ ИСТОРИЯ', 'INTERACTIVE ADVENTURE')}
                  </span>
                  <span className="age">16+</span>
                </div>
                <div className="hero-copy">
                  <div className="hero-location">
                    <Map size={14} />
                    {tr('ВЬЕТНАМ · ГОРОД У РЕКИ', 'VIETNAM · A RIVERSIDE TOWN')}
                  </div>
                  <h2>
                    {tr('Карта', 'A map without')}
                    <br />
                    <em>{tr('без адреса.', 'an address.')}</em>
                  </h2>
                  <p>
                    {tr(
                      'Две подруги. Одна чужая сумка. И история, в которой не всё стоит снимать на камеру.',
                      'Two friends. One swapped bag. And a story that doesn’t all belong on camera.'
                    )}
                  </p>
                  <div className="hero-buttons">
                    <button className="primary light" disabled={!ready} onClick={start}>
                      <Play size={17} fill="currentColor" />
                      {!ready
                        ? tr('Загрузка…', 'Loading…')
                        : hasSave
                          ? tr('Продолжить историю', 'Continue your story')
                          : tr('Начать путешествие', 'Start the journey')}
                      <ArrowRight size={18} />
                    </button>
                    <span className="hero-meta">
                      {tr('12 решений', '12 decisions')}
                      <br />
                      <small>
                        {tr('Прототип · без регистрации', 'Prototype · no account needed')}
                      </small>
                    </span>
                  </div>
                </div>
                <div className="hero-foot">
                  <span>
                    <span className="small-line" />
                    {tr('КАТЯ И ОЛЯ ВО ВЬЕТНАМЕ', 'KATYA & OLYA IN VIETNAM')}
                  </span>
                  <span>
                    01 <span className="slide-line" /> 03
                  </span>
                </div>
              </section>
              <div className="under-hero">
                <span>
                  <ShieldCheck size={15} />
                  {tr('Без боя. Не без последствий.', 'No combat. Not without consequences.')}
                </span>
                <span>
                  <Leaf size={15} />
                  {tr('В твоём темпе', 'At your own pace')}
                </span>
                <span>
                  <Check size={15} />
                  {tr('Прогресс на этом устройстве', 'Progress on this device')}
                </span>
              </div>
              <section className="journey-section">
                <div className="section-heading">
                  <h2>{tr('У каждой — свой взгляд', 'Two friends. Two perspectives.')}</h2>
                  <span>{tr('ОДНО ПУТЕШЕСТВИЕ НА ДВОИХ', 'ONE JOURNEY, TOGETHER')}</span>
                </div>
                <div className="bottom-grid">
                  <button
                    className={`character-card katya ${game.hero === 'katya' ? 'chosen' : ''}`}
                    onClick={() => setGame({ ...game, hero: 'katya' })}
                  >
                    <div className="portrait warm">
                      <Camera size={31} />
                      <span>К</span>
                    </div>
                    <div>
                      <span className="card-kicker">
                        {tr('ЗАМЕЧАЕТ МОМЕНТЫ', 'CAPTURES THE MOMENT')}
                      </span>
                      <h3>
                        {tr('Катя', 'Katya')}
                        <ArrowUpRight size={17} />
                      </h3>
                      <p>
                        {tr('Сначала кадр. Потом вопросы.', 'The shot first. Questions later.')}
                      </p>
                    </div>
                    <span className="selected-dot">
                      {game.hero === 'katya' && <Check size={11} />}
                    </span>
                  </button>
                  <button
                    className={`character-card olya ${game.hero === 'olya' ? 'chosen' : ''}`}
                    onClick={() => setGame({ ...game, hero: 'olya' })}
                  >
                    <div className="portrait cool">
                      <BookOpen size={31} />
                      <span>О</span>
                    </div>
                    <div>
                      <span className="card-kicker">
                        {tr('ВИДИТ ЗА ДЕТАЛЯМИ', 'READS BETWEEN THE LINES')}
                      </span>
                      <h3>
                        {tr('Оля', 'Olya')}
                        <ArrowUpRight size={17} />
                      </h3>
                      <p>
                        {tr('Сначала вопросы. Потом доверие.', 'Questions first. Trust follows.')}
                      </p>
                    </div>
                    <span className="selected-dot">
                      {game.hero === 'olya' && <Check size={11} />}
                    </span>
                  </button>
                  <button className="journal-teaser" onClick={() => open('journal')}>
                    <div className="teaser-icon">
                      <BookOpen size={23} />
                    </div>
                    <span>
                      <small>{tr('НИЧЕГО НЕ УПУСТИТЬ', 'KEEP THE DETAILS')}</small>
                      <strong>{tr('Дорожный дневник', 'Travel journal')}</strong>
                      <p>
                        {tr(
                          'Факты, догадки и маленькие открытия',
                          'Facts, questions and little discoveries'
                        )}
                      </p>
                    </span>
                    <ArrowUpRight size={18} />
                  </button>
                </div>
              </section>
              <section className="route-preview">
                <div>
                  <Map size={20} />
                  <strong>
                    {tr(
                      'Три остановки. Много способов пройти путь.',
                      'Three stops. Many ways to get there.'
                    )}
                  </strong>
                </div>
                <button className="text-button" onClick={() => open('map')}>
                  {tr('Посмотреть маршрут', 'Explore the route')}
                  <ArrowRight size={16} />
                </button>
              </section>
            </>
          ) : (
            <>
              <div className="play-heading">
                <div>
                  <div className="eyebrow">
                    {tr('ЭПИЗОД 01 / КАРТА БЕЗ АДРЕСА', 'EPISODE 01 / MAP WITHOUT AN ADDRESS')}
                  </div>
                  <h1>{places[beat.place][locale]}</h1>
                </div>
                <button className="text-button" onClick={() => setPlaying(false)}>
                  {tr('В меню', 'Back to menu')}
                  <X size={17} />
                </button>
              </div>
              <div className="game-stats">
                <span>
                  <Heart size={16} />
                  {tr('Доверие', 'Trust')} <b>{game.stats.trust}</b>
                </span>
                <span>
                  <ShieldCheck size={16} />
                  {tr('Безопасность', 'Safety')} <b>{game.stats.safety}</b>
                </span>
                <span>
                  <Wallet size={16} />
                  <b>{Math.round(game.stats.budget / 1000)}k ₫</b>
                </span>
                <span>
                  <Battery size={16} />
                  <b>{game.stats.battery}%</b>
                </span>
                <span>
                  <Clock size={16} />
                  <b>
                    {game.stats.time}
                    {tr(' ч', ' h')}
                  </b>
                </span>
                <span>
                  <BookOpen size={16} />
                  {tr('Факты', 'Facts')} <b>{game.stats.evidence}/10</b>
                </span>
              </div>
              <section className="world-wrap">
                <div className="world-tags">
                  <span className="glass-tag">
                    {textMode ? tr('ТЕКСТОВЫЙ РЕЖИМ', 'TEXT MODE') : '3D · WEBGL'}
                  </span>
                  <span className="glass-tag">{names[game.hero][locale]}</span>
                </div>
                {!textMode ? (
                  <Suspense
                    fallback={
                      <div className="world-fallback">
                        {tr('Открываем город…', 'Opening the town…')}
                      </div>
                    }
                  >
                    <World
                      place={beat.place}
                      hero={game.hero}
                      low={low}
                      paused={!!panel}
                      locale={locale}
                      speaker={beat.speaker}
                      onInspect={() => open(finished ? 'ending' : 'dialogue')}
                    />
                  </Suspense>
                ) : (
                  <div className="text-world">
                    <img src="/images/hoi-an.jpg" alt="" />
                    <div>
                      <Compass size={35} />
                      <h2>{places[beat.place][locale]}</h2>
                      <p>{beat.observation[locale]}</p>
                    </div>
                  </div>
                )}
                <div className="world-controls">
                  <button
                    onClick={() =>
                      setGame({ ...game, hero: game.hero === 'katya' ? 'olya' : 'katya' })
                    }
                  >
                    <RotateCcw size={16} />
                    {tr('Сменить героиню', 'Switch heroine')}
                  </button>
                  <span>
                    <Footprints size={15} />
                    {tr(
                      'Нажми на землю · WASD / стрелки · перетаскивай для обзора',
                      'Tap ground · WASD / arrows · drag to orbit'
                    )}
                  </span>
                </div>
              </section>
              <section className="objective">
                <div className="objective-number">
                  {String(Math.min(game.step + 1, 12)).padStart(2, '0')}
                  <small>/ 12</small>
                </div>
                <div className="objective-content">
                  <span className="card-kicker">
                    {finished
                      ? tr('ИСТОРИЯ ЗАВЕРШЕНА', 'STORY COMPLETE')
                      : tr('ТЕКУЩИЙ МОМЕНТ', 'CURRENT MOMENT')}
                  </span>
                  <h2>{finished ? endings[ending(game)][locale] : beat.title[locale]}</h2>
                  <p>
                    {observation
                      ? beat.observation[locale]
                      : tr(
                          'Осмотрись, выслушай собеседника и реши, как поступить.',
                          'Look around, listen and choose how to respond.'
                        )}
                  </p>
                </div>
                <div className="objective-actions">
                  <button className="secondary" onClick={() => setObservation(!observation)}>
                    <Eye size={17} />
                    {tr('Осмотреть', 'Observe')}
                  </button>
                  <button
                    className="primary"
                    onClick={() => open(finished ? 'ending' : 'dialogue')}
                  >
                    {finished ? tr('Итоги', 'Your ending') : tr('Поговорить', 'Talk')}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </section>
              <div className="save-line" role="status">
                <span>
                  <i />
                  {saveStatus === 'error'
                    ? tr(
                        'Не удалось сохранить — экспортируйте файл в настройках',
                        'Save failed — export a file in settings'
                      )
                    : saveStatus === 'saving'
                      ? tr('Сохраняем…', 'Saving…')
                      : tr('Сохранено на этом устройстве', 'Saved on this device')}
                </span>
                <button className="text-button" onClick={() => open('journal')}>
                  {tr('Открыть дневник', 'Open journal')}
                  <BookOpen size={15} />
                </button>
              </div>
            </>
          )}
        </main>
        <footer>
          <span>© 2026 · {tr('Маршрут без фильтра', 'Unfiltered route')}</span>
          <span>
            {tr('Маленькие решения меняют большие истории.', 'Small choices change big stories.')}
          </span>
          <button onClick={() => open('privacy')}>
            {tr('О проекте и приватность', 'About & privacy')}
            <ArrowUpRight size={13} />
          </button>
        </footer>
      </div>
      {notice && (
        <div className="toast" role="status">
          {notice}
          <button
            onClick={() => setNotice('')}
            aria-label={tr('Закрыть уведомление', 'Dismiss notice')}
          >
            <X size={16} />
          </button>
        </div>
      )}
      <input
        ref={input}
        hidden
        type="file"
        accept="application/json,.json"
        onChange={(e) => void importSave(e.target.files?.[0])}
      />
      <dialog
        ref={dialog}
        onCancel={() => setPanel(null)}
        onClick={(e) => {
          if (e.target === dialog.current) setPanel(null);
        }}
      >
        <div className="modal-content">
          <button
            className="close-modal"
            aria-label={tr('Закрыть', 'Close')}
            onClick={() => setPanel(null)}
          >
            <X size={22} />
          </button>
          {panel === 'warning' && (
            <>
              <span className="eyebrow">{tr('ПЕРЕД ПУТЕШЕСТВИЕМ', 'BEFORE THE JOURNEY')}</span>
              <h2>{tr('История, в которой есть выбор.', 'A story with room to choose.')}</h2>
              <p>
                {tr(
                  'Катя и Оля — совершеннолетние подруги. В истории есть обман, напряжённые разговоры и непроверенные приглашения. Нет графичного насилия. Рекомендуемый возраст: 16+.',
                  'Katya and Olya are adult friends. The story includes deception, tense conversations and unverified invitations. No graphic violence. Recommended age: 16+.'
                )}
              </p>
              <p>
                {tr(
                  'Это короткий художественный прототип, не туристическая инструкция. Персонажи и события вымышлены. Можно играть без 3D и без ограничения времени.',
                  'This is a short fictional prototype, not travel advice. Characters and events are invented. You can play without 3D or time pressure.'
                )}
              </p>
              <label className="toggle-row">
                <span>
                  {tr('Мягкий пересказ напряжённых сцен', 'Gentle summaries of tense scenes')}
                </span>
                <input
                  type="checkbox"
                  checked={comfort}
                  onChange={(e) => setComfort(e.target.checked)}
                />
              </label>
              <button className="primary full" onClick={continueStory}>
                {tr('Понятно. Отправляемся', 'Understood. Let’s go')}
                <ArrowRight size={18} />
              </button>
            </>
          )}
          {panel === 'dialogue' && (
            <>
              {result ? (
                <>
                  <span className="eyebrow">{tr('ПОСЛЕ ВЫБОРА', 'AFTER YOUR CHOICE')}</span>
                  <h2>{tr('История продолжается', 'The story continues')}</h2>
                  <p className="dialogue-text">
                    {story[result.step].choices[result.choice].result[locale]}
                  </p>
                  <div className="effects">
                    {Object.entries(story[result.step].choices[result.choice].effect).map(
                      ([k, v]) => (
                        <span key={k}>
                          {
                            (
                              {
                                trust: tr('Доверие', 'Trust'),
                                safety: tr('Безопасность', 'Safety'),
                                budget: '₫',
                                battery: tr('Заряд', 'Battery'),
                                time: tr('Часы', 'Hours'),
                                evidence: tr('Факты', 'Facts'),
                              } as Record<string, string>
                            )[k]
                          }{' '}
                          {v > 0 ? '+' : ''}
                          {v.toLocaleString()}
                        </span>
                      )
                    )}
                  </div>
                  {story[result.step].choices[result.choice].fact && (
                    <p className="journal-note">
                      <BookOpen size={18} />
                      {tr('Новая запись в дневнике', 'New journal entry')}
                    </p>
                  )}
                  <button
                    className="primary full"
                    onClick={() => {
                      setResult(null);
                      setPanel(finished ? 'ending' : null);
                    }}
                  >
                    {tr('Продолжить', 'Continue')}
                    <ArrowRight size={18} />
                  </button>
                </>
              ) : (
                <>
                  <span className="eyebrow">
                    {places[beat.place][locale]} / {game.step + 1}
                  </span>
                  <h2>{beat.title[locale]}</h2>
                  <div className="speaker">
                    <span>{names[beat.speaker][locale].slice(0, 1)}</span>
                    {names[beat.speaker][locale]}
                  </div>
                  <p className="dialogue-text">
                    {comfort && beat.tense
                      ? tr(
                          'Подругам предлагают непроверенную встречу. Они остаются у отеля и решают, как безопасно завершить разговор.',
                          'The friends receive an unverified invitation. They stay at the hotel and decide how to end the conversation safely.'
                        )
                      : beat.text[locale]}
                  </p>
                  <div className="choice-list">
                    {beat.choices.map((c, i) => (
                      <button
                        key={i}
                        disabled={!!c.requires && game.stats.evidence < c.requires}
                        onClick={() => apply(i)}
                      >
                        <span>{String(i + 1).padStart(2, '0')}</span>
                        <div>
                          {c.label[locale]}
                          {c.requires && game.stats.evidence < c.requires && (
                            <small>
                              {tr('Нужно проверенных фактов: ', 'Verified facts needed: ')}
                              {c.requires}
                            </small>
                          )}
                        </div>
                        <ChevronRight size={18} />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          {panel === 'journal' && (
            <>
              <span className="eyebrow">{tr('ДОРОЖНЫЙ ДНЕВНИК', 'TRAVEL JOURNAL')}</span>
              <h2>{tr('Не всё, что кажется, — факт.', 'Not everything is a fact.')}</h2>
              <p>
                {tr(
                  'Отделяй наблюдения от версий. Твой дневник заполняется по мере прохождения.',
                  'Separate observations from claims. Your journal grows as the story unfolds.'
                )}
              </p>
              {game.journal.length === 0 ? (
                <div className="empty-state">
                  <BookOpen size={38} />
                  <h3>{tr('Чистая страница', 'A fresh page')}</h3>
                  <p>
                    {tr(
                      'Первые открытия ещё впереди. Начни путешествие, чтобы сделать запись.',
                      'The discoveries are ahead. Start your journey to make your first entry.'
                    )}
                  </p>
                </div>
              ) : (
                game.journal.map((j) => {
                  const c = story[j.step].choices[j.choice];
                  return (
                    <article className="journal-entry" key={j.step}>
                      <span className={c.verified ? 'fact' : 'claim'}>
                        {c.verified
                          ? tr('НАБЛЮДЕНИЕ', 'OBSERVATION')
                          : tr('НУЖНА ПРОВЕРКА', 'NEEDS CHECKING')}
                      </span>
                      <h3>{c.fact?.[locale]}</h3>
                      <small>
                        {places[story[j.step].place][locale]} · {story[j.step].title[locale]}
                      </small>
                    </article>
                  );
                })
              )}
            </>
          )}
          {panel === 'map' && (
            <>
              <span className="eyebrow">{tr('МАРШРУТ ЭПИЗОДА', 'EPISODE ROUTE')}</span>
              <h2>
                {tr(
                  'От первого вопроса до своего ответа.',
                  'From a first question to your answer.'
                )}
              </h2>
              <p>
                {tr(
                  'Локации открываются по ходу истории. Это художественный маршрут, не реальная карта.',
                  'Locations open as the story progresses. This is a fictional route, not a real map.'
                )}
              </p>
              <div className="route-map">
                {places.map((p, i) => (
                  <div key={i} className={`route-stop ${i <= beat.place ? 'reached' : ''}`}>
                    <span>{i < beat.place ? <Check size={20} /> : `0${i + 1}`}</span>
                    <div>
                      <h3>{p[locale]}</h3>
                      <p>
                        {
                          [
                            tr('Чужая сумка, первые вопросы', 'A swapped bag, first questions'),
                            tr(
                              'Разговоры за кофе, проверка версий',
                              'Coffee conversations, checking claims'
                            ),
                            tr('Две точки зрения, одно решение', 'Two perspectives, one decision'),
                          ][i]
                        }
                      </p>
                      <small>
                        {i === beat.place
                          ? tr('ВЫ ЗДЕСЬ', 'YOU ARE HERE')
                          : i < beat.place
                            ? tr('ПРОЙДЕНО', 'VISITED')
                            : tr('ДАЛЬШЕ ПО ИСТОРИИ', 'LATER IN THE STORY')}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="primary full"
                onClick={() => {
                  setPanel(null);
                  if (!playing) start();
                }}
              >
                {playing
                  ? tr('Вернуться в историю', 'Return to the story')
                  : tr('Отправиться в путь', 'Start the journey')}
                <ArrowRight size={18} />
              </button>
            </>
          )}
          {panel === 'settings' && (
            <>
              <span className="eyebrow">{tr('КАК ТЕБЕ УДОБНО', 'MAKE YOURSELF COMFORTABLE')}</span>
              <h2>{tr('Твой темп. Твои настройки.', 'Your pace. Your settings.')}</h2>
              {[
                [textMode, setTextMode, tr('Текстовый режим · без 3D', 'Text mode · no 3D')],
                [low, setLow, tr('Экономный графический режим', 'Lower-resolution graphics')],
                [
                  comfort,
                  setComfort,
                  tr('Мягкий пересказ напряжённых сцен', 'Gentle summaries of tense scenes'),
                ],
                [large, setLarge, tr('Увеличенный текст диалогов', 'Larger dialogue text')],
              ].map(([val, set, label], i) => (
                <label className="toggle-row" key={i}>
                  <span>{String(label)}</span>
                  <input
                    type="checkbox"
                    checked={Boolean(val)}
                    onChange={(e) => (set as (b: boolean) => void)(e.target.checked)}
                  />
                </label>
              ))}
              <div className="settings-note">
                <ShieldCheck size={20} />
                <p>
                  {tr(
                    'Сохранения только на этом устройстве. Для переноса экспортируй файл. Облачная синхронизация пока не подключена.',
                    'Saves stay on this device. Export a file to transfer progress. Cloud sync is not connected yet.'
                  )}
                </p>
              </div>
              <div className="button-row">
                <button className="secondary" onClick={exportSave}>
                  <Download size={16} />
                  {tr('Экспорт', 'Export')}
                </button>
                <button className="secondary" onClick={() => input.current?.click()}>
                  <Upload size={16} />
                  {tr('Импорт', 'Import')}
                </button>
              </div>
              {install ? (
                <button
                  className="secondary full"
                  onClick={async () => {
                    await install.prompt();
                    setInstall(null);
                  }}
                >
                  <Download size={16} />
                  {tr('Установить приложение', 'Install app')}
                </button>
              ) : (
                <p className="small-note">
                  {tr(
                    'На iPhone: меню «Поделиться» → «На экран Домой». Установка доступна после публикации по HTTPS.',
                    'On iPhone: Share → Add to Home Screen. Installation requires HTTPS.'
                  )}
                </p>
              )}
              <button className="danger" onClick={() => open('restart')}>
                <RotateCcw size={16} />
                {tr('Удалить прогресс и начать заново', 'Delete progress and restart')}
              </button>
            </>
          )}
          {panel === 'restart' && (
            <>
              <h2>{tr('Начать с чистой страницы?', 'Start with a fresh page?')}</h2>
              <p>
                {tr(
                  'Локальный прогресс будет удалён. Сначала можно экспортировать сохранение. Это действие нельзя отменить.',
                  'Local progress will be deleted. You can export a save first. This cannot be undone.'
                )}
              </p>
              <div className="button-row">
                <button className="secondary" onClick={exportSave}>
                  {tr('Экспортировать', 'Export')}
                </button>
                <button
                  className="primary"
                  onClick={async () => {
                    setPlaying(false);
                    try {
                      await remove();
                      setGame(initial());
                      setHasSave(false);
                      setSaveStatus('');
                      setPanel(null);
                    } catch {
                      setNotice(tr('Не удалось удалить сохранение.', 'Could not delete the save.'));
                    }
                  }}
                >
                  {tr('Удалить', 'Delete')}
                </button>
              </div>
            </>
          )}
          {panel === 'ending' && (
            <>
              <div className="ending-icon">
                <Flag size={35} />
              </div>
              <span className="eyebrow">{tr('ТВОЙ ФИНАЛ', 'YOUR ENDING')}</span>
              <h2>{endings[ending(game)][locale]}</h2>
              <p className="dialogue-text">
                {ending(game) === 'viral'
                  ? tr(
                      'Ролик привлёк внимание, но зрители приняли предположения за обвинения. Подругам предстоит опубликовать исправление и восстановить доверие. Сильный заголовок оказался не последним словом.',
                      'The video drew attention, but viewers took speculation for accusations. The friends must publish a correction and rebuild trust. A strong headline was not the last word.'
                    )
                  : ending(game) === 'safe'
                    ? tr(
                        'Не каждая поездка должна стать расследованием. Вы сохранили вещи, границы и возможность вернуться к разговору позже. Иногда хороший финал — спокойно дойти домой вместе.',
                        'Not every trip needs to be an investigation. You protected belongings, boundaries and the chance to talk later. Sometimes a good ending is simply coming home together.'
                      )
                    : ending(game) === 'restored'
                      ? tr(
                          'Вы успели ошибиться, выслушать друг друга и исправить курс. Чанг проверит материалы, а вы оставите за кадром то, что могло навредить людям. Доверие — не отсутствие ошибок, а готовность их признавать.',
                          'You made mistakes, listened and changed course. Trang will verify the material while you keep harmful details off camera. Trust is not never making mistakes, but being willing to acknowledge them.'
                        )
                      : tr(
                          'Вместо громкого разоблачения получилась честная история. Чанг продолжает проверку; имена случайных людей не становятся заголовками. А Катя и Оля остаются не только попутчицами, но и командой.',
                          'Instead of a sensational exposé, you made an honest story. Trang continues checking; bystanders’ names stay out of headlines. Katya and Olya remain not just travelers, but a team.'
                        )}
              </p>
              <div className="ending-stats">
                <span>
                  <strong>{game.stats.evidence}/10</strong>
                  {tr('проверенных фактов', 'verified facts')}
                </span>
                <span>
                  <strong>{game.stats.trust}/100</strong>
                  {tr('доверие подруг', 'mutual trust')}
                </span>
              </div>
              <p className="small-note">
                {tr(
                  'Конец прототипа. Большая история и другие эпизоды — в плане разработки.',
                  'End of the prototype. The full story and other episodes are planned.'
                )}
              </p>
              <div className="button-row">
                <button className="secondary" onClick={() => open('journal')}>
                  {tr('Мой дневник', 'My journal')}
                </button>
                <button className="primary" onClick={() => open('restart')}>
                  {tr('Пройти иначе', 'Try another path')}
                  <ArrowRight size={17} />
                </button>
              </div>
            </>
          )}
          {panel === 'privacy' && (
            <>
              <span className="eyebrow">UNFILTERED ROUTE / 0.1</span>
              <h2>{tr('История без слежки.', 'A story without tracking.')}</h2>
              <p>
                {tr(
                  'Играбельный прототип по брифу «Маршрут без фильтра». Доступны 12 выборов, 3 процедурные 3D-локации и 4 исхода. Полная игра на 6–10 часов, 36 эпизодов и облачные сохранения не реализованы.',
                  'Playable prototype of Unfiltered Route. Includes 12 decisions, 3 procedural 3D locations and 4 outcomes. The full 6–10 hour game, 36 episodes and cloud saves are not implemented.'
                )}
              </p>
              <h3>{tr('Твои данные', 'Your data')}</h3>
              <p>
                {tr(
                  'Прогресс хранится в IndexedDB, настройки — в localStorage браузера. Регистрации, рекламы и аналитики нет. Мы не запрашиваем камеру, микрофон, контакты или геолокацию. Игровая камера — только часть истории.',
                  'Progress is stored in IndexedDB, preferences in browser localStorage. No account, advertising or analytics. We do not request camera, microphone, contacts or location access. The in-game camera is fictional.'
                )}
              </p>
              <p>
                {tr(
                  'Экспорт и удаление прогресса доступны в настройках. Хостинг может обрабатывать стандартные технические журналы запросов. При очистке данных браузера локальный прогресс пропадёт; сохраняй резервную копию.',
                  'Export and deletion are available in settings. The hosting provider may process standard request logs. Clearing browser data deletes local progress; keep an exported backup.'
                )}
              </p>
              <h3>{tr('Вымышленный мир', 'A fictional world')}</h3>
              <p>
                {tr(
                  'Иллюстрация создана с помощью ИИ; 3D-сцены собраны процедурно. Это художественная интерпретация, не точное изображение реальных мест. Тексты ещё требуют культурной и редакторской проверки. Музыка и озвучка пока отсутствуют.',
                  'The illustration is AI-generated; 3D scenes are procedural. This is a fictional interpretation, not an accurate depiction of real places. Texts still need cultural and editorial review. Music and voice acting are not included yet.'
                )}
              </p>
              <p>
                {tr(
                  'На 2030 год заложена поддерживаемая архитектура, а не обещание вечной совместимости: нужны обновления зависимостей и проверки новых браузеров.',
                  'The architecture is designed for ongoing maintenance, not guaranteed compatibility through 2030: dependency updates and browser testing remain necessary.'
                )}
              </p>
            </>
          )}
        </div>
      </dialog>
    </div>
  );
}
