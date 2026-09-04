import { useMemo, useState } from "react";
import {
  LayoutGrid,
  RotateCw,
  Tv,
  Star,
  Briefcase,
  Package,
  Zap,
  X,
  Monitor,
  Cpu,
  Fan,
  Laptop,
  MousePointer2,
  Armchair,
  Coffee,
  Printer,
  Image as ImageIcon,
  Keyboard,
  MessagesSquare,
  Flame,
  Car,
  Store,
  CupSoda,
  Sunrise,
  Eye,
  Crosshair,
} from "lucide-react";
import { Scene, CHARACTERS } from "./components/Scene";
import type { CameraFocus, CameraMode } from "./components/CameraController";

/* ------------------------- данные команды ------------------------- */
interface MemberMeta {
  role: string;
  badge: string;
  gear: string[];
  skills: [string, number][];
  fact: string;
  icon: typeof Star;
}

const META: Record<string, MemberMeta> = {
  alex: {
    role: "System Administrator",
    badge: "Мастер инфраструктуры",
    gear: ["2 монитора 24\" 124К", "мощный неттоп без RGB", "великий настольный вентилятор из куллеров 120"],
    skills: [
      ["Компуктеры", 90],
      ["Системы", 90],
      ["Троллинг Виталика", 120],
      ["Бомбёжка от пользаков", 120],
    ],
    fact: "Собирает компы быстрее, чем остальные достают отвёртки.",
    icon: Star,
  },
  vlad: {
    role: "Team Lead / начальник",
    badge: "Начальник",
    gear: ["ноутбук для встреч", "монитор с отчётами"],
    skills: [
      ["Управление командой", 200],
      ["Планирование", 200],
      ["Переговоры", 200],
      ["Дипломатия", 250],
    ],
    fact: "Это надо было сделать уже вчера.",
    icon: Briefcase,
  },
  vitaly: {
    role: "R&D Lead / кладмен",
    badge: "Кладмен",
    gear: ["огромный ultrawide монитор", "маленький ноутбук", "склад коробок с багами"],
    skills: [
      ["Создание сайтов", 40],
      ["Перебирание лута", 999],
      ["Опиздюливание сотрудников", 100],
      ["Работа машинистом электрички", 100],
      ["Работа, но не результат с Claude Code", 999],
    ],
    fact: "Произвожу из 2 багов 4, удаляю проект, делаю заново.",
    icon: Package,
  },
  svyat: {
    role: "System Administrator",
    badge: "Гроза завода",
    gear: ["2 монитора + ПК", "ТВ с метриками за спиной"],
    skills: [
      ["Управление ИТ завода", 90],
      ["Троллинг Виталика", 90],
      ["Согласование комплектующих", 40],
      ["Подписание бланков", 100],
    ],
    fact: "Кладу и поднимаю сервера силой мысли.",
    icon: Zap,
  },
  ruben: {
    role: "Начальник 1С отдела",
    badge: "Маг отчётов и обработок",
    gear: ["жёлтая папка 1С в опущенной руке", "строгий серый костюм с пиджаком", "стоит у кофе-поинта и рассказывает"],
    skills: [
      ["1С:Предприятие", 200],
      ["Отчёты и печатные формы", 200],
      ["Управляемые формы", 200],
      ["Потребление кофе", 200],
    ],
    fact: "«Отчёт уже почти готов» — и это только начало истории на сорок минут.",
    icon: Coffee,
  },
  evgeny: {
    role: "1C разработчик",
    badge: "Слушает Рубена очень внимательно",
    gear: ["ноутбук на коленках", "вся 1C БМХ внутри", "белая рубашка, серые штаны, чёрные туфли"],
    skills: [
      ["Разработка 1C", 100],
      ["Разговоры с Данилушкиной", 250],
      ["Обучение пользаков", 150],
      ["Обеды в быке", 150],
    ],
    fact: "Почему что-то постоянно гудит под ухом в кабинете?",
    icon: Laptop,
  },
  zhukov: {
    role: "Ниндзя охранник",
    badge: "ОСТОРОЖНО ЖУКОВ",
    gear: ["стоит возле бухты кабеля под вывеской IT TEAM", "рассказывает что-то Святославу, жестикулируя", "волос немного, борода как у Владимира, очков нет"],
    skills: [
      ["Опрос пострадавших", 200],
      ["Прогулка по территории", 150],
      ["Доставание Владимира", 250],
      ["Патрик ссыт", 999],
    ],
    fact: "Саша чёрный, Владимир не был на улице, Дон Витто Виталик.",
    icon: Eye,
  },
};

/* ------------------------- данные объектов ------------------------- */
interface ObjectInfo {
  title: string;
  lines: string[];
  icon: typeof Monitor;
  tint: string;
}

const OBJECTS: Record<string, ObjectInfo> = {
  "mon-alex": {
    title: "Мониторы Александра",
    lines: ["2 × 27\" 4K: слева код, справа результат", "тема оформления — киберпанк, разумеется"],
    icon: Monitor,
    tint: "#35e0ff",
  },
  "pc-alex": {
    title: "ПК Александра",
    lines: ["RTX 4090 · 64 GB RAM · NVMe 2 TB", "кулеры раскручены до предела"],
    icon: Cpu,
    tint: "#ffc857",
  },
  fan: {
    title: "Вентилятор из кулеров 120",
    lines: ["самосбор: три корпусных кулера 120 мм", "охлаждает воздух и нервы"],
    icon: Fan,
    tint: "#35e0ff",
  },
  "mon-vlad": {
    title: "Монитор Владимира",
    lines: ["дашборд команды и график спринта", "открыт всегда, даже во время обеда"],
    icon: Monitor,
    tint: "#ff5cae",
  },
  "lap-vlad": {
    title: "Ноутбук Владимира",
    lines: ["17 встреч в день, 3 из них можно было письмом", "батарея держит ровно один стендап"],
    icon: Laptop,
    tint: "#9dff57",
  },
  "mon-vitaly": {
    title: "Огромный монитор Виталия",
    lines: ["49\" ultrawide: влево — тесты, вправо — логи", "за ним видно только бороду… ой, это Владимир"],
    icon: Monitor,
    tint: "#9dff57",
  },
  "lap-vitaly": {
    title: "Маленький ноутбук Виталия",
    lines: ["для заметок, шаурма-меню и секретов", "компенсация за большой монитор"],
    icon: Laptop,
    tint: "#35e0ff",
  },
  "pc-vitaly": {
    title: "ПК Виталия",
    lines: ["тягает весь стенд тестов одновременно", "RGB зелёный — под цвет футболок не попал"],
    icon: Cpu,
    tint: "#9dff57",
  },
  "mon-svyat": {
    title: "Мониторы Святослава",
    lines: ["слева — терминалы, справа — графики", "переключается быстрее, чем моргает"],
    icon: Monitor,
    tint: "#35e0ff",
  },
  "pc-svyat": {
    title: "ПК Святослава",
    lines: ["Тут умирает 228 Диких в минуту"],
    icon: Cpu,
    tint: "#35e0ff",
  },
  tv: {
    title: "ТВ за Святославом",
    lines: ["Великий обозреватель инфраструктуры всея Руси"],
    icon: Tv,
    tint: "#ff5cae",
  },
  bossmug: {
    title: "Кружка «БОСС»",
    lines: ["Показывает кто сдесь босс"],
    icon: CupSoda,
    tint: "#ff5cae",
  },
  coffee: {
    title: "Кофе-поинт",
    lines: ["Общественное любимое место"],
    icon: Store,
    tint: "#ffc857",
  },
  audi: {
    title: "Фигурка Audi на столе Владимира",
    lines: ["Лучшая машина в мире"],
    icon: Car,
    tint: "#c7cdea",
  },
  "evg-laptop": {
    title: "Ноутбук на коленях у Евгения",
    lines: ["Вся 1C БМХ лежит здесь."],
    icon: Laptop,
    tint: "#f2c300",
  },
  revolver: {
    title: "Револьвер с 3D-принтера Виталика",
    lines: ["Такой ствол мы уважаем (нет ахахах)"],
    icon: Crosshair,
    tint: "#9dff57",
  },
  printer3d: {
    title: "3D-принтер Виталика",
    lines: ["Спонсор всех бирок в компании", "Любит летать на пол"],
    icon: Printer,
    tint: "#ff5cae",
  },
  ioffe: {
    title: "Постер «ИОФФЕ»",
    lines: ["Любит проеффе токены"],
    icon: ImageIcon,
    tint: "#9dff57",
  },
};

const WORK_MODES: {
  id: WorkMode;
  label: string;
  icon: typeof Keyboard;
  activeClass: string;
}[] = [
  {
    id: "work",
    label: "Работа",
    icon: Keyboard,
    activeClass: "border-neon-lime bg-neon-lime/15 text-neon-lime shadow-[0_0_18px_rgba(157,255,87,0.35)]",
  },
  {
    id: "meeting",
    label: "Переговоры",
    icon: MessagesSquare,
    activeClass: "border-neon-cyan bg-neon-cyan/15 text-neon-cyan shadow-[0_0_18px_rgba(53,224,255,0.35)]",
  },
  {
    id: "urgent",
    label: "Срочная задача",
    icon: Flame,
    activeClass: "border-neon-pink bg-neon-pink/15 text-neon-pink shadow-[0_0_18px_rgba(255,92,174,0.4)]",
  },
  {
    id: "morning",
    label: "Утро",
    icon: Sunrise,
    activeClass: "border-neon-amber bg-neon-amber/15 text-neon-amber shadow-[0_0_18px_rgba(255,200,87,0.4)]",
  },
];

const TICKER =
  "uptime 99.99% · закрыто 1024 бага · выпито 812 чашек кофе · деплоев в пятницу: 0 (мы не рискуем) · вентилятор Александра работает с 2019 года · монитор Виталия больше, чем его зарплата · собирает компы быстрее, чем остальные достают отвёртки · это надо было сделать уже вчера · произвожу из 2 багов 4, удаляю проект, делаю заново · кладу и поднимаю сервера силой мысли · 3D-принтер любит летать на пол · спонсор всех бирок в компании · ИОФФЕ любит проеффе токены · тут умирает 228 диких в минуту · кружка показывает, кто сдесь босс · лучшая машина в мире — Audi · троллинг Виталика 120 · бомбёжка от пользаков 120 · перебирание лута 999 · работа, но не результат с Claude Code 999 · кофе-поинт — общественное любимое место · великий обозреватель инфраструктуры всея Руси · договариваемся с комплектующими на 40 · бланки подписаны на 100 · ";

export type WorkMode = "work" | "meeting" | "urgent" | "morning";

export default function App() {
  const [mode, setMode] = useState<CameraMode | "focus">("overview");
  const [focus, setFocus] = useState<CameraFocus | null>(null);
  const [focusNonce, setFocusNonce] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [objectKey, setObjectKey] = useState<string | null>(null);
  const [workMode, setWorkMode] = useState<WorkMode>("work");

  const pickCharacter = (id: string) => {
    const c = CHARACTERS.find((x) => x.id === id)!;
    setSelected(id);
    setObjectKey(null);
    setFocus({ x: c.seat[0], z: c.seat[1] });
    setFocusNonce((n) => n + 1);
    setMode("focus");
  };

  const pickObject = (key: string) => {
    setObjectKey(key);
  };

  const member = selected ? META[selected] : null;
  const memberVisual = selected ? CHARACTERS.find((c) => c.id === selected)! : null;
  const object = objectKey ? OBJECTS[objectKey] : null;

  const presets = useMemo(
    () =>
      [
        { id: "overview" as const, label: "Общий план", icon: LayoutGrid },
        { id: "auto" as const, label: "Автооблёт", icon: RotateCw },
        { id: "tv" as const, label: "На ТВ", icon: Tv },
      ],
    []
  );

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-night-900 text-slate-100 font-body">
      {/* 3D-сцена */}
      <div className="absolute inset-0">
        <Scene
          mode={mode}
          focus={focus}
          focusNonce={focusNonce}
          selected={selected}
          workMode={workMode}
          onSelectCharacter={pickCharacter}
          onObjectClick={pickObject}
        />
      </div>

      {/* CRT-оверлей */}
      <div className="crt-overlay absolute inset-0 z-10" />

      {/* ---------- шапка ---------- */}
      <header className="pointer-events-none absolute left-5 top-5 z-20">
        <h1 className="font-display text-3xl font-extrabold tracking-[0.18em] text-neon-cyan drop-shadow-[0_0_14px_rgba(53,224,255,0.65)]">
          IT TEAM
        </h1>
        <p className={`mode-line mode-${workMode}`}>
          <span className={`mode-dot mode-dot-${workMode}`} />
          {workMode === "work"
            ? "РЕЖИМ: РАБОТА"
            : workMode === "meeting"
              ? "РЕЖИМ: ПЕРЕГОВОРЫ"
              : workMode === "urgent"
                ? "РЕЖИМ: СРОЧНАЯ ЗАДАЧА"
                : "РЕЖИМ: УТРО"}
        </p>
      </header>

      {/* ---------- пресеты камеры ---------- */}
      <nav className="absolute right-5 top-5 z-20 flex flex-col gap-2">
        {presets.map((p) => {
          const active = mode === p.id;
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => {
                setMode(p.id);
                setFocus(null);
              }}
              className={`hud-chip hud-panel flex items-center gap-2 px-3.5 py-2 font-mono text-[11px] tracking-wide ${
                active
                  ? "border-neon-cyan bg-neon-cyan/15 text-neon-cyan shadow-[0_0_18px_rgba(53,224,255,0.35)]"
                  : "text-slate-300 hover:border-neon-cyan/60 hover:text-neon-cyan"
              }`}
            >
              <Icon size={14} />
              {p.label}
            </button>
          );
        })}
        <div className="my-1 h-px bg-neon-cyan/25" />
        {WORK_MODES.map((w) => {
          const active = workMode === w.id;
          const Icon = w.icon;
          return (
            <button
              key={w.id}
              onClick={() => setWorkMode(w.id)}
              className={`hud-chip hud-panel flex items-center gap-2 px-3.5 py-2 font-mono text-[11px] tracking-wide ${
                active
                  ? w.activeClass
                  : "text-slate-300 hover:border-neon-cyan/60 hover:text-neon-cyan"
              }`}
            >
              <Icon size={14} />
              {w.label}
            </button>
          );
        })}
      </nav>

      {/* ---------- чипы персонажей ---------- */}
      <nav className="absolute bottom-12 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {CHARACTERS.map((c) => {
          const Icon = META[c.id].icon;
          const active = selected === c.id;
          return (
            <button
              key={c.id}
              onClick={() => pickCharacter(c.id)}
              className={`hud-chip hud-panel flex items-center gap-2 px-4 py-2 font-mono text-[12px] ${
                active ? "text-night-900" : "text-slate-200"
              }`}
              style={
                active
                  ? { background: c.accent, borderColor: c.accent, boxShadow: `0 0 22px ${c.accent}66` }
                  : undefined
              }
            >
              <Icon size={14} style={{ color: active ? "#0d1024" : c.accent }} />
              {c.name}
            </button>
          );
        })}
      </nav>

      {/* ---------- подсказка ---------- */}
      <div className="pointer-events-none absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 font-mono text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          <MousePointer2 size={11} className="text-neon-cyan" /> ЛКМ — вращать
        </span>
        <span className="text-slate-600">·</span>
        <span>колесо — зум</span>
        <span className="text-slate-600">·</span>
        <span>клик по человеку или технике — карточка</span>
      </div>

      {/* ---------- инфо-карточка ---------- */}
      {(member || object) && (
        <aside
          key={selected ?? objectKey}
          className="card-in hud-panel absolute right-5 top-1/2 z-30 w-[320px] -translate-y-1/2 p-5"
        >
          <button
            onClick={() => {
              setSelected(null);
              setObjectKey(null);
            }}
            className="hud-chip absolute right-3 top-3 rounded p-1 text-slate-400 hover:text-neon-pink"
            aria-label="Закрыть"
          >
            <X size={16} />
          </button>

          {member && memberVisual && (
            <>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-sm"
                  style={{ background: `${memberVisual.accent}22`, color: memberVisual.accent }}
                >
                  <member.icon size={20} />
                </span>
                <div>
                  <h2 className="font-display text-lg font-bold leading-tight" style={{ color: memberVisual.accent }}>
                    {memberVisual.name}
                  </h2>
                  <p className="font-mono text-[10px] tracking-wide text-slate-400">{member.role}</p>
                </div>
              </div>

              <p
                className="mt-3 inline-block px-2 py-1 font-mono text-[10px] tracking-widest"
                style={{ background: `${memberVisual.accent}1a`, color: memberVisual.accent }}
              >
                ★ {member.badge.toUpperCase()}
              </p>

              <dl className="mt-4 space-y-2 font-mono text-[11px] text-slate-300">
                <div className="flex items-start gap-2">
                  <Armchair size={13} className="mt-0.5 shrink-0 text-slate-500" />
                  <ul className="space-y-0.5">
                    {member.gear.map((g) => (
                      <li key={g}>— {g}</li>
                    ))}
                  </ul>
                </div>
              </dl>

              <div className="mt-4 space-y-2">
                {member.skills.map(([s, v]) => (
                  <div key={s}>
                    <div className="flex justify-between font-mono text-[10px] text-slate-400">
                      <span>{s}</span>
                      <span style={{ color: memberVisual.accent }}>{v}</span>
                    </div>
                    <div className="mt-0.5 h-1.5 w-full bg-night-600">
                      <div
                        className={`h-full transition-all duration-500 ${s === "Патрик ссыт" ? "rainbow-bar" : ""}`}
                        style={{
                          width: `${Math.min(100, v)}%`,
                          ...(s === "Патрик ссыт" ? {} : { background: memberVisual.accent }),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-4 border-l-2 pl-3 font-mono text-[11px] italic text-slate-400" style={{ borderColor: memberVisual.accent }}>
                {member.fact}
              </p>
            </>
          )}

          {object && !member && (
            <>
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-sm"
                  style={{ background: `${object.tint}22`, color: object.tint }}
                >
                  <object.icon size={20} />
                </span>
                <h2 className="font-display text-base font-bold leading-tight" style={{ color: object.tint }}>
                  {object.title}
                </h2>
              </div>
              <ul className="mt-4 space-y-1.5 font-mono text-[11px] text-slate-300">
                {object.lines.map((l) => (
                  <li key={l}>— {l}</li>
                ))}
              </ul>
            </>
          )}
        </aside>
      )}

      {/* ---------- бегущая строка ---------- */}
      <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden border-t border-neon-cyan/20 bg-night-900/85 py-1.5">
        <div className="ticker-track flex w-max whitespace-nowrap font-mono text-[10px] tracking-widest text-neon-cyan/80">
          <span className="px-4">{TICKER}</span>
          <span className="px-4">{TICKER}</span>
        </div>
      </div>
    </div>
  );
}
