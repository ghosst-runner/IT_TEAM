# 🏗️ Архитектура проекта IT Team Office

Документация по структуре кода и компонентам.

## 📦 Структура папок

```
project-root/
│
├── dist/                           # Собранный проект (production)
│   └── index.html                  # Готовый HTML к публикации
│
├── src/
│   ├── components/                 # React компоненты
│   │   ├── Scene.tsx               # 🎬 Главная сцена
│   │   ├── Room.tsx                # 🏢 Комната (полы, стены, неон)
│   │   ├── PixelCharacter.tsx       # 👤 Пиксельные персонажи
│   │   ├── Furniture.tsx            # 🪑 Мебель (столы, стулья, мониторы)
│   │   ├── Lights.tsx               # 💡 Освещение и неоновые эффекты
│   │   └── CameraController.tsx     # 🎥 Управление камерой
│   │
│   ├── App.tsx                     # 🎯 Главный компонент приложения
│   ├── main.tsx                    # 🚀 Точка входа (React DOM)
│   ├── index.css                   # 🎨 Глобальные стили Tailwind
│   └── utils/
│       └── cn.ts                   # 🔧 Утилита для classNames
│
├── public/                         # Статические файлы (если будут)
│
├── index.html                      # HTML шаблон
├── vite.config.ts                  # Конфигурация Vite
├── tsconfig.json                   # Конфигурация TypeScript
├── package.json                    # Зависимости и скрипты
├── tailwind.config.ts              # Конфигурация Tailwind CSS
│
├── README.md                       # 📖 Основная документация
├── TUTORIAL.md                     # 📚 Подробный туториал
├── GITHUB_PAGES_GUIDE.md           # 🚀 Гайд по публикации
└── ARCHITECTURE.md                 # 📋 Этот файл
```

---

## 🎯 Компоненты и их роли

### 1️⃣ **Scene.tsx** - Главная сцена

**Ответственность:**
- Инициализирует Three.js Canvas
- Размещает все объекты в пространстве
- Управляет расстановкой персонажей

**Структура:**
```tsx
<Canvas camera={{ ... }}>      // Создает 3D контекст
  <Lights />                   // Освещение
  <Room />                     // Комната
  <group>                      // Рабочее место Александра
    <Desk />                   // Стол
    <Chair />                  // Стул
    <Monitor />                // Мониторы
    <PixelCharacter />         // Персонаж
  </group>
  {/* Остальные рабочие места */}
  <CameraController />         // Управление
</Canvas>
```

**Координатная сетка:**
```
     X (влево-вправо)
     ←─────────────→
   -5    0    5
↑ 4 ┌──────────────┐
│ 3 │ Святослав ТВ │
Y 2 │              │
│ 1 │ Виталий      │
│ 0 │ Влади. Алекс.│
↓-1 └──────────────┘
   Z (вперед-назад)
```

---

### 2️⃣ **Room.tsx** - Окружение

**Создает:**
- ✅ Полы (черный пол с неоновыми линиями)
- ✅ Потолок (темный)
- ✅ 4 стены
- ✅ Неоновые полосы (подсветка)

**Материалы:**
```tsx
// Для неоновых полос используется emissive
meshStandardMaterial: {
  color: базовый цвет         // Как выглядит при выключенном свете
  emissive: цвет свечения     // Какой цвет излучает
  emissiveIntensity: 0-1      // Яркость свечения
}
```

**Цвета:**
- Киан (#00d9ff) - синий неон
- Магента (#ff00ff) - фиолетовый неон
- Hot Pink (#ff0080) - розовый неон

---

### 3️⃣ **PixelCharacter.tsx** - Персонажи

**Входные параметры:**
```ts
interface CharacterProps {
  position: [x, y, z]        // Координаты в сцене
  skinColor: number          // Hex-код цвета кожи
  shirtColor: number         // Hex-код цвета рубашки
  pantsColor: number         // Hex-код цвета штанов
  hasGlasses?: boolean       // Добавить очки?
  hasBeard?: boolean         // Добавить бороду?
  scale?: number             // Масштаб (0.7-1.0)
}
```

**Структура тела:**
```
         ← Волосы (0.15 высота)
       ← Голова (0.4×0.4×0.4)
         ← Очки (если есть)
         ← Борода (если есть)
       ← Тело/Рубашка (0.35×0.5×0.25)
       ← Руки (слева и справа)
       ← Штаны (0.35×0.4×0.25)
       ← Ноги (слева и справа)
```

**Персонажи в проекте:**
| Имя | Цвета | Особенности | Позиция |
|-----|-------|-------------|---------|
| Александр | Черная поло (#1a1a1a) | Очки, вентилятор | -3, 0 |
| Владимир | Костюм (#222244) | Борода, ноутбук | -0.5, 0 |
| Виталий | Бежевая (#d4af9e) | Большой монитор | 2.5, 0 |
| Святослав | Серая (#666666) | 2 монитора, ТВ | 2.5, 2 |

---

### 4️⃣ **Furniture.tsx** - Мебель и интерьер

**Экспортированные компоненты:**

#### `Desk`
```tsx
<Desk position={[x, y, z]} width={1.5} />
// Создает стол с столешницей и двумя ножками
```

#### `Chair`
```tsx
<Chair position={[x, y, z]} />
// Офисный стул с сиденьем, спинкой и ножками
```

#### `Monitor`
```tsx
<Monitor 
  position={[x, y, z]} 
  screenColor={0x0099ff}    // Цвет экрана
  isLarge={false}           // Большой ли монитор?
  onClick={callback}        // На клик
/>
// Монитор с экраном (светящийся), подставкой и ножкой
```

#### `TV`
```tsx
<TV position={[x, y, z]} onClick={callback} />
// Телевизор на стене
```

#### `PCCase`
```tsx
<PCCase position={[x, y, z]} />
// ПК корпус с вентилятором и LED подсветкой
```

#### `Laptop`
```tsx
<Laptop position={[x, y, z]} />
// Ноутбук с открытым экраном
```

#### `Cabinet`
```tsx
<Cabinet position={[x, y, z]} />
// Шкаф с двумя дверцами и ручками
```

---

### 5️⃣ **Lights.tsx** - Освещение

**Типы огней:**

#### Ambient Light (Рассеянный)
```tsx
<ambientLight intensity={0.5} color={0xffffff} />
// Равномерный свет из всех направлений
// intensity: яркость (0-1)
```

#### Point Light (Точечный)
```tsx
<pointLight 
  position={[x, y, z]} 
  intensity={0.6} 
  color={0x00d9ff} 
/>
// Свет из конкретной точки (как лампа)
```

#### Directional Light (Направленный)
```tsx
<directionalLight 
  position={[x, y, z]} 
  intensity={0.8} 
/>
// Свет как солнце (параллельные лучи)
```

**Стратегия освещения:**
1. Базовый ambient light (0.5)
2. Цветные точечные источники (неон)
3. Направленный основной свет
4. Свет от мониторов (точечные источники)

---

### 6️⃣ **CameraController.tsx** - Управление камерой

**Особенности:**
- ✅ Свободное вращение (левая и правая кнопка мыши)
- ✅ Зум колесом мыши
- ✅ Сферические координаты для позиции

**Математика:**
```tsx
// Сферические координаты
x = center.x + distance * sin(rotationY) * cos(rotationX)
y = center.y + height + distance * sin(rotationX)
z = center.z + distance * cos(rotationY) * cos(rotationX)

// Ограничения:
rotationX: [-π/2.5, π/2.5]  // Вверх-вниз
rotationY: любой             // Влево-вправо
zoom: [2, 8]                 // FOV камеры
```

**Обработчики событий:**
```ts
pointerdown  → начало вращения
pointermove  → обновление углов
pointerup    → конец вращения
wheel        → изменение zoom
```

---

### 7️⃣ **App.tsx** - Главный компонент

**Роль:**
- Оборачивает сцену в контейнер
- Добавляет UI текст
- Управляет глобальными стилями

**Структура:**
```tsx
<div className="w-full h-screen bg-black">
  <Scene />              {/* 3D сцена во весь экран */}
  
  {/* Overlay UI */}
  <div className="absolute top-4 left-4">
    {/* Заголовок и инструкции */}
  </div>
</div>
```

---

## 🎨 Материалы и физика

### MeshStandardMaterial (Стандартный материал)

```ts
interface MeshStandardMaterial {
  color: number              // Базовый цвет (hex)
  emissive: number           // Излучаемый цвет
  emissiveIntensity: number  // Яркость излучения (0-1)
  metalness: number          // Металлический (0-1)
  roughness: number          // Шероховатость (0-1)
}
```

**Примеры:**
```tsx
// Матовый черный (мебель)
<meshStandardMaterial color={0x1a1a1a} />

// Светящийся неон (полосы)
<meshStandardMaterial 
  color={0x00d9ff} 
  emissive={0x00d9ff} 
  emissiveIntensity={0.8}
/>

// Монитор (светящийся)
<meshStandardMaterial 
  color={0x0099ff}
  emissive={0x0099ff}
  emissiveIntensity={0.3}
/>
```

---

## 🔢 Единицы и масштабы

**Условные единицы Three.js:**

| Объект | Размер | Примечание |
|--------|--------|-----------|
| Человек | 1.5-2 ед | От ног до головы |
| Монитор | 0.6-0.8 × 0.3-0.5 | Ширина × высота |
| Стол | 1.5 × 0.6 | Ширина × глубина |
| Комната | 20 × 20 | Пол |

---

## 🔄 Data Flow

```
App.tsx
  ↓
Canvas (Three.js)
  ├── Lights.tsx (Освещение)
  ├── Room.tsx (Комната)
  ├── Scene.tsx (Разместить объекты)
  │   ├── Desk, Chair (Мебель)
  │   ├── Monitor, TV, PCCase, Laptop (Интерьер)
  │   ├── PixelCharacter (Персонажи)
  │   └── CameraController (Управление)
  └── Rendering Loop (60 FPS)
```

---

## 🚀 Жизненный цикл приложения

1. **Загрузка** (Load)
   - React монтирует App.tsx
   - Canvas инициализируется
   - Все компоненты создаются

2. **Рендеринг** (Render)
   - `useFrame` вызывается каждый кадр
   - CameraController обновляет позицию камеры
   - Three.js рендерит сцену

3. **Взаимодействие** (Interaction)
   - Пользователь двигает мышь
   - CameraController обновляет углы
   - Камера плавно движется

4. **Выгрузка** (Cleanup)
   - React размонтирует компоненты
   - Canvas удаляется
   - Ресурсы освобождаются

---

## 📊 Performance Metrics

**Текущие показатели:**

| Метрика | Значение | Примечание |
|---------|----------|-----------|
| Объектов 3D | ~50 | Meshes |
| Источников света | ~15 | Point + Directional + Ambient |
| Материалов | ~15 | Уникальные |
| Размер bundle | ~300KB | Gzipped |
| FPS | 60 | На стандартном ПК |

**Оптимизация:**
- ✅ Используются стандартные геометрии (не импортируются модели)
- ✅ Материалы переиспользуются
- ✅ Lazy loading через Suspense
- ✅ Нет ненужных анимаций

---

## 🔧 Как добавить новый элемент

### 1. Добавить новый персонаж

```tsx
// Scene.tsx
<group>
  <Desk position={[5, -1.2, 0]} />
  <Chair position={[5, -1, 0]} />
  <Monitor position={[5, -0.3, 0.2]} screenColor={0xff00ff} />
  <PixelCharacter
    position={[5, -0.8, -0.4]}
    skinColor={0xffcba4}
    shirtColor={0x123456}
    pantsColor={0x654321}
  />
</group>
```

### 2. Добавить новый источник света

```tsx
// Lights.tsx
<pointLight
  position={[5, 2, 0]}
  intensity={0.7}
  color={0x00ff00}  // Зеленый неон
/>
```

### 3. Добавить новый предмет мебели

```tsx
// Furniture.tsx
export function PlantPot({ position }) {
  return (
    <mesh position={position}>
      <coneGeometry args={[0.2, 0.3, 8]} />
      <meshStandardMaterial color={0xff9900} />
    </mesh>
  );
}

// Scene.tsx
<PlantPot position={[4, -1.3, 1]} />
```

---

## 🐛 Debugging Tips

**Проверка позиций:**
```tsx
// Временно добавьте визуальные маркеры
<mesh position={[0, 0, 0]}>
  <sphereGeometry args={[0.1]} />
  <meshStandardMaterial color={0xff0000} />
</mesh>
```

**Проверка освещения:**
```tsx
// Временно добавьте яркий свет
<pointLight position={[0, 5, 0]} intensity={2} />
```

**Проверка камеры:**
```tsx
// Логируйте позицию камеры
useFrame(({ camera }) => {
  console.log(camera.position);
});
```

---

## 📚 Полезные ссылки для разработчиков

- [Three.js Docs](https://threejs.org/docs/)
- [R3F Docs](https://docs.pmnd.rs/react-three-fiber/)
- [WebGL Reference](https://www.khronos.org/webgl/)
- [Drei Components](https://github.com/pmndrs/drei)

---

**Архитектура готова! Можно начинать Этап 2. 🚀**
