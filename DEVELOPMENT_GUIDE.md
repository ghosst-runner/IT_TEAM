# 🛠️ Гайд по разработке - Технические инструкции

Полное руководство для разработчиков по работе с проектом.

---

## 🚀 Быстрый старт

### Первый запуск

```bash
# 1. Клонируем репозиторий
git clone https://github.com/YOUR_NAME/it-team-office.git
cd it-team-office

# 2. Устанавливаем зависимости
npm install

# 3. Запускаем dev сервер
npm run dev

# 4. Открываем http://localhost:5173
# Готово! 🎉
```

---

## 📁 Структура файлов в деталях

### `src/components/`

#### `Scene.tsx` (170 строк)
**Что это:** Главная сцена, где всё собирается вместе

**Основные части:**
```tsx
// 1. Canvas - контекст для 3D
<Canvas camera={{ position: [3, 2, 4], fov: 60 }}>

// 2. Suspense для async loading
<Suspense fallback={null}>

// 3. Компоненты сцены
<Lights />          // Свет
<Room />            // Комната
<group>...</group>  // Рабочие места

// 4. Управление
<CameraController />
</Suspense>
</Canvas>
```

**Когда редактировать:**
- Изменить позицию персонажа
- Добавить новый объект в сцену
- Изменить расстановку мебели

#### `Room.tsx` (90 строк)
**Что это:** Окружение офиса (полы, стены, неон)

**Основные части:**
```tsx
// Geometries
<planeGeometry args={[width, height]} />  // Плоский
<boxGeometry args={[w, h, d]} />          // Куб

// Materials
<meshStandardMaterial color={0xHEXCODE} />
```

**Когда редактировать:**
- Изменить цвета комнаты
- Добавить новые неоновые полосы
- Изменить размер комнаты

#### `PixelCharacter.tsx` (100 строк)
**Что это:** Пиксельный 3D персонаж

**Интерфейс:**
```ts
interface CharacterProps {
  position: [number, number, number]    // XYZ координаты
  skinColor: number                     // Hex цвет кожи
  shirtColor: number                    // Hex цвет рубашки
  pantsColor: number                    // Hex цвет штанов
  hasGlasses?: boolean                  // Очки?
  hasBeard?: boolean                    // Борода?
  scale?: number                        // Масштаб (0.7-1.0)
}
```

**Как добавить новый элемент тела:**
```tsx
// Например, шапка
<mesh position={[0, 1.9, 0]}>
  <boxGeometry args={[0.5, 0.15, 0.5]} />
  <meshStandardMaterial color={0xFF0000} />
</mesh>
```

#### `Furniture.tsx` (300 строк)
**Что это:** Вся мебель и интерьер

**Экспортируемые компоненты:**
- `Desk` - стол
- `Chair` - стул
- `Monitor` - монитор
- `TV` - телевизор
- `PCCase` - корпус ПК
- `Laptop` - ноутбук
- `Cabinet` - шкаф

**Как добавить новый предмет:**
```tsx
export function NewItem({ position }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color={0x123456} />
    </mesh>
  );
}
```

#### `Lights.tsx` (30 строк)
**Что это:** Освещение сцены

**Типы света:**
```tsx
// Ambient - везде одинаково
<ambientLight intensity={value} color={0xHEXCODE} />

// Point - из точки (как лампа)
<pointLight 
  position={[x, y, z]} 
  intensity={value} 
  color={0xHEXCODE} 
/>

// Directional - как солнце
<directionalLight position={[x, y, z]} intensity={value} />
```

#### `CameraController.tsx` (80 строк)
**Что это:** Управление камерой (вращение + зум)

**Как работает:**
1. Ловит события мыши (`pointerdown`, `pointermove`, `pointerup`)
2. Вычисляет углы вращения
3. Преобразует в сферические координаты
4. Позиционирует камеру
5. Обновляет каждый кадр в `useFrame`

**Изменить параметры камеры:**
```tsx
// В функции CameraController:
const cameraDistance = 5;        // Близость к центру
const cameraHeight = 1.5;        // Высота камеры
const rotationSpeed = 0.005;     // Чувствительность мыши
const zoomSpeed = 0.2;           // Чувствительность скролла
```

---

## 🎨 Система цветов

### Hex-коды используемые в проекте

```tsx
// Фон и темные цвета
0x0a0e27   // Очень темный синий (фон сцены)
0x0a0a0a   // Почти черный (пол)
0x1a1a2e   // Темный синий (мебель)
0x0f0f0f   // Черный (детали)

// Неоновые цвета
0x00d9ff   // Киан (синий неон)
0xff00ff   // Магента (фиолетовый)
0xff0080   // Hot Pink (розовый)

// Мониторы
0x0099ff   // Синий экран (Александр)
0x00ff99   // Зелёный экран (Владимир)
0xff0099   // Розовый экран (Виталий)
0x00ffff   // Голубой экран (Святослав)

// Персонажи
0xffcba4   // Цвет кожи
0x333333   // Темно-серый (одежда)
0x1a1a1a   // Черный (одежда)
0xd4af9e   // Бежевый (Виталий)
0x666666   // Серый (Святослав)
```

### Как выбрать цвет?

1. Используйте **Online Hex Color Picker**: https://htmlcolorcodes.com/
2. Или в коде:
```tsx
// Вариант 1: Hex
<meshStandardMaterial color={0x00d9ff} />

// Вариант 2: RGB число
<meshStandardMaterial color={new THREE.Color(0, 217, 255)} />

// Вариант 3: Строка
<meshStandardMaterial color="#00d9ff" />
```

---

## 🔧 Работа с математикой и координатами

### Система координат Three.js

```
         Y (вверх)
         ↑
         |
    Z ← -+- → X
    (в)  |  (вперед)
         |
         0 (исходная точка)
```

### Позиции в нашей сцене

```
          Z (вперед)
    -10 (дверь) ← ... → 3.8 (ТВ)
    
    X от -4 (левый монитор) до 4.5 (шкаф)
    Y (высота)
     -2 (пол)
      0 (стол/талия персонажа)
      2 (над столом)
```

### Примеры позиций

```tsx
// Александр
position={[-3, -0.8, -0.4]}

// Справа
position={[2.5, -1, 0]}

// На столе
position={[-3, -0.3, 0.2]}

// На стене позади
position={[2.5, 0.8, 3.8]}
```

---

## 🎬 Работа с анимациями (Этап 2)

### useFrame hook

Вызывается каждый кадр (60 раз в секунду):

```tsx
import { useFrame } from '@react-three/fiber';

function AnimatedCharacter() {
  const ref = useRef();

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();  // Секунды от старта
    
    // Анимируем вращение
    ref.current.rotation.y = Math.sin(time) * Math.PI;
    
    // Анимируем позицию
    ref.current.position.x = Math.cos(time) * 2;
    
    // Анимируем масштаб
    ref.current.scale.y = 1 + Math.sin(time) * 0.1;
  });

  return <mesh ref={ref}>...</mesh>;
}
```

### Функции для анимаций

```tsx
Math.sin(time)      // Волна от -1 до 1
Math.cos(time)      // Волна от -1 до 1 (сдвинута)
Math.sin(time * 2)  // Волна быстрее в 2 раза
Math.sin(time) * 0.5  // Волна амплитуда 0.5
```

### Примеры простых анимаций

**Печать:**
```tsx
useFrame(({ clock }) => {
  const time = clock.getElapsedTime();
  rightArm.position.y = 0.9 + Math.sin(time * 3) * 0.05;
  leftArm.position.y = 0.9 + Math.sin(time * 3 + Math.PI) * 0.05;
});
```

**Поворот головы:**
```tsx
useFrame(({ clock }) => {
  const time = clock.getElapsedTime();
  head.rotation.y = Math.sin(time * 0.5) * 0.3;
});
```

**Дыхание:**
```tsx
useFrame(({ clock }) => {
  const time = clock.getElapsedTime();
  body.scale.y = 1 + Math.sin(time) * 0.02;
});
```

---

## 📊 Работа с данными

### Информация о персонажах

Если захотите добавить данные о персонажах:

```tsx
// src/data/characters.ts
export const characters = [
  {
    id: 'alexander',
    name: 'Александр',
    role: 'Senior Frontend Developer',
    position: [-3, -0.8, -0.4],
    colors: {
      skin: 0xffcba4,
      shirt: 0x1a1a1a,
      pants: 0x333333,
    },
    skills: ['React', 'Three.js', 'WebGL'],
  },
  // ...
];

// Использование в Scene.tsx
import { characters } from '../data/characters';

{characters.map(char => (
  <PixelCharacter
    key={char.id}
    position={char.position}
    skinColor={char.colors.skin}
    shirtColor={char.colors.shirt}
    pantsColor={char.colors.pants}
  />
))}
```

---

## 🧪 Тестирование и Debugging

### Browser DevTools

Откройте **F12** в браузере:

```
Console    - Ошибки JavaScript
Performance - FPS, время рендеринга
Network    - Загрузка ресурсов
Elements   - HTML структура
```

### Проверка Three.js

```tsx
// В консоли браузера
window.__THREE_VERSION__  // Версия Three.js

// Лог FPS
let lastTime = Date.now();
useFrame(() => {
  const now = Date.now();
  console.log('FPS:', 1000 / (now - lastTime));
  lastTime = now;
});
```

### Вывод информации о сцене

```tsx
import { useThree } from '@react-three/fiber';

function DebugInfo() {
  const { scene } = useThree();
  
  return (
    <group>
      {/* Логируем объекты в сцене */}
      {scene.children.map((child, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color={0xff0000} />
        </mesh>
      ))}
    </group>
  );
}
```

---

## 🔍 Частые ошибки и решения

### Ошибка: "Cannot read property 'position' of undefined"

**Причина:** Ref не привязана к элементу

**Решение:**
```tsx
const ref = useRef();  // Создаём ref

// Привязываем к mesh
<mesh ref={ref}>
  <boxGeometry />
  <meshStandardMaterial />
</mesh>

// Используем в useFrame
useFrame(() => {
  if (ref.current) {  // Проверяем наличие!
    ref.current.position.x += 0.1;
  }
});
```

### Ошибка: "Three is not defined"

**Причина:** Забыли импортировать Three

**Решение:**
```tsx
import * as THREE from 'three';

// Теперь можно использовать
new THREE.Vector3(0, 0, 0);
```

### Сцена черная

**Причина:** Освещение слишком слабое

**Решение:**
```tsx
// Добавьте яркий свет временно
<ambientLight intensity={1} />  // Увеличьте интенсивность
```

### Камера не движется

**Причина:** CameraController не добавлен или обработчики не работают

**Решение:**
```tsx
// Проверьте, что CameraController в сцене
<Canvas>
  <CameraController />  // Должно быть!
</Canvas>

// В консоли проверьте события мыши
canvas.addEventListener('pointerdown', () => console.log('click'));
```

---

## 📦 Установка новых пакетов

Если нужен новый пакет:

```bash
# Установка
npm install package-name

# Если это dev dependency
npm install --save-dev package-name

# Добавить в package.json (автоматически)
```

**Часто используемые:**
```bash
npm install @react-three/drei        # Утилиты для R3F
npm install gsap                     # Анимации
npm install zustand                  # State management
npm install axios                    # HTTP запросы
```

---

## 🔄 Git Workflow

### Базовый workflow

```bash
# 1. Создаём новую ветку
git checkout -b feature/new-feature

# 2. Делаем изменения
# ... редактируем файлы ...

# 3. Проверяем что изменилось
git status

# 4. Добавляем в staging
git add src/components/NewComponent.tsx

# 5. Коммитим
git commit -m "Add new feature: XYZ"

# 6. Пушим
git push origin feature/new-feature

# 7. На GitHub создаём Pull Request

# 8. После одобрения - merge в main
git checkout main
git merge feature/new-feature
```

### Полезные команды

```bash
# Посмотреть историю
git log --oneline

# Вернуться на шаг назад
git reset --hard HEAD~1

# Отменить последний коммит (но сохранить файлы)
git reset --soft HEAD~1

# Найти кто написал строку
git blame src/components/Scene.tsx
```

---

## 📈 Оптимизация кода

### Правила производительности

1. **Не создавайте новые объекты в useFrame:**
```tsx
// ❌ ПЛОХО - создаёт новый объект каждый кадр
useFrame(() => {
  const position = new THREE.Vector3(x, y, z);
});

// ✅ ХОРОШО - переиспользует объект
const position = useRef(new THREE.Vector3());
useFrame(() => {
  position.current.set(x, y, z);
});
```

2. **Мемоизируйте компоненты:**
```tsx
export const Character = React.memo(function Character(props) {
  return <PixelCharacter {...props} />;
});
```

3. **Используйте LOD (Level of Detail):**
```tsx
// Показать подробную модель близко, простую далеко
<LOD>
  <mesh>detail</mesh>
  <mesh>simple</mesh>
</LOD>
```

---

## 🚀 Деплой на GitHub Pages

```bash
# 1. Собираем production версию
npm run build

# 2. Проверяем локально
npm run preview

# 3. Пушим изменения на GitHub
git add .
git commit -m "Update site"
git push origin main

# 4. Деплоим на GitHub Pages
npm run deploy

# Готово! Сайт на https://username.github.io/repo-name
```

---

## 📚 Дополнительные ресурсы

### Документация
- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Drei Components](https://github.com/pmndrs/drei)
- [Tailwind CSS](https://tailwindcss.com/)

### Туториалы
- [Three.js для начинающих](https://threejs.org/manual/)
- [R3F примеры](https://github.com/pmndrs/react-three-fiber/tree/master/examples)
- [WebGL шейдеры](https://learnopengl.com/)

### Инструменты
- [Three.js Editor](https://threejs.org/editor/)
- [Babylon.js Inspector](https://doc.babylonjs.com/features/featuresDeepDive/Babylon.js_Inspector)
- [Color Picker](https://htmlcolorcodes.com/)
- [Shader Editor](https://www.shadertoy.com/)

---

## ✅ Чек-лист перед деплоем

- [ ] Код работает локально без ошибок
- [ ] FPS ≥ 50 в браузере
- [ ] Консоль чистая (без ошибок)
- [ ] Сцена загружается < 3 сек
- [ ] Камера работает плавно
- [ ] Все персонажи видны
- [ ] На мобильном работает (опционально)
- [ ] Документация обновлена
- [ ] Версия обновлена в package.json

---

## 🎓 Рекомендуемая кривая обучения

1. **Неделя 1:** Изучите структуру проекта
2. **Неделя 2:** Попробуйте добавить простую анимацию
3. **Неделя 3:** Создайте новый персонаж
4. **Неделя 4:** Добавьте интерактивность
5. **Неделя 5+:** Самостоятельные проекты

---

**Готовы писать код? Let's go! 🚀**
