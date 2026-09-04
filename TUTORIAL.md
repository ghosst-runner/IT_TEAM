# 📖 Пошаговый туториал - Разработка IT Team Office 3D Scene

Этот документ описывает процесс создания интерактивной 3D сцены с нашей IT-командой.

## 🎯 Общий план

**Этап 1** (ЗАВЕРШЁН):
1. Подготовка проекта (установка зависимостей)
2. Базовая сцена Three.js (комната, освещение)
3. Пиксельные персонажи
4. Мебель и интерьер
5. Управление камерой
6. Первый запуск

**Этап 2** (Следующий):
- Анимации персонажей
- Интерактивные элементы
- Информационные окна
- Звук

**Этап 3+**:
- Расширенная функциональность

---

## 📚 Подробная разработка Этапа 1

### Шаг 1: Установка зависимостей

**Почему нужны эти пакеты?**

```bash
npm install three @react-three/fiber @react-three/drei @types/three
```

- **three** - главная библиотека для 3D графики
- **@react-three/fiber** - превращает Three.js в React-компоненты
- **@react-three/drei** - вспомогательные компоненты (камеры, эффекты)
- **@types/three** - типы TypeScript для Three.js

### Шаг 2: Создание компонента Room

**Файл**: `src/components/Room.tsx`

Этот компонент создает окружение офиса:

```tsx
// Пол, потолок, стены
<mesh position={[0, -2, 0]}> // Пол внизу на -2
  <planeGeometry args={[20, 20]} /> // 20x20 единиц
  <meshStandardMaterial color={0x0a0a0a} /> // Почти черный
</mesh>
```

**Концепция координат:**
- `x` - влево/вправо
- `y` - вверх/вниз
- `z` - вперед/назад

**Неоновые полосы** - это пластины с `emissive` материалом:
```tsx
<meshStandardMaterial 
  color={0x00d9ff}           // Базовый цвет
  emissive={0x00d9ff}        // Свечение
  emissiveIntensity={0.8}    // Интенсивность свечения
/>
```

### Шаг 3: Создание пиксельного персонажа

**Файл**: `src/components/PixelCharacter.tsx`

Каждый персонаж состоит из простых кубов (boxes):

```tsx
// Голова - один куб
<mesh position={[0, 1.5, 0]}>
  <boxGeometry args={[0.4, 0.4, 0.4]} /> // width, height, depth
  <meshStandardMaterial color={skinColor} />
</mesh>

// Тело - куб побольше
<mesh position={[0, 0.8, 0]}>
  <boxGeometry args={[0.35, 0.5, 0.25]} />
  <meshStandardMaterial color={shirtColor} />
</mesh>
```

**Особенности персонажей:**
- `hasGlasses` - добавляет два маленьких куба на лице
- `hasBeard` - добавляет куб для бороды
- `scale` - масштаб персонажа (некоторые ниже)

### Шаг 4: Мебель и интерьер

**Файл**: `src/components/Furniture.tsx`

Отдельные компоненты для каждого типа мебели:

#### Стол (Desk)
```tsx
// Столешница
<mesh position={[0, 0, 0]}>
  <boxGeometry args={[width, 0.08, 0.6]} /> // Плоский прямоугольник
  <meshStandardMaterial color={0x1a1a2e} />
</mesh>

// Ножка
<mesh position={[x, -0.3, z]}>
  <boxGeometry args={[0.08, 0.6, 0.08]} /> // Тонкая вертикальная
  <meshStandardMaterial color={0x0f0f0f} />
</mesh>
```

#### Монитор (Monitor)
```tsx
// Экран - плоский куб
<mesh position={[0, 0, 0.02]}>
  <boxGeometry args={[width, height, 0.02]} />
  <meshStandardMaterial 
    color={screenColor}
    emissive={screenColor}      // Мониторы светятся!
    emissiveIntensity={0.3}
  />
</mesh>
```

**Интерактивность:**
```tsx
<mesh onClick={onClick}> // При клике
  {/* ... */}
</mesh>
```

#### ПК (PCCase)
```tsx
// Корпус
<boxGeometry args={[0.3, 0.6, 0.5]} />

// Передняя панель с вентилятором
<cylinderGeometry args={[0.08, 0.08, 0.02, 32]} /> // Круглый вентилятор

// LED свечение
<meshStandardMaterial 
  color={0xff00ff}
  emissive={0xff00ff}
  emissiveIntensity={0.8}
/>
```

### Шаг 5: Управление камерой

**Файл**: `src/components/CameraController.tsx`

**Как это работает:**

1. **Сферические координаты** - камера движется по кругу вокруг центра
```tsx
const x = cameraCenter.x + cameraDistance * Math.sin(rotation.y) * Math.cos(rotation.x);
const y = cameraCenter.y + cameraHeight + cameraDistance * Math.sin(rotation.x);
const z = cameraCenter.z + cameraDistance * Math.cos(rotation.y) * Math.cos(rotation.x);
```

2. **Обработка мыши**
```tsx
canvas.addEventListener('pointerdown', handleMouseDown); // Начало перетаскивания
canvas.addEventListener('pointermove', handleMouseMove); // Вращение
canvas.addEventListener('pointerup', handleMouseUp);     // Конец
```

3. **Зум - изменение FOV**
```tsx
canvas.addEventListener('wheel', handleWheel);
camera.fov = zoom; // Поле зрения
camera.updateProjectionMatrix();
```

### Шаг 6: Освещение

**Файл**: `src/components/Lights.tsx`

**Типы света:**

```tsx
// Рассеянный свет - освещает всё одинаково
<ambientLight intensity={0.5} color={0xffffff} />

// Точечный свет - из конкретной точки, как лампа
<pointLight 
  position={[-5, 1, 0]} 
  intensity={0.6} 
  color={0x00d9ff}  // Синий неоновый
/>

// Направленный свет - как солнце
<directionalLight 
  position={[5, 4, 5]} 
  intensity={0.8} 
  color={0xffffff} 
/>
```

### Шаг 7: Главная сцена

**Файл**: `src/components/Scene.tsx`

Здесь всё собирается вместе:

```tsx
<Canvas camera={{ position: [3, 2, 4], fov: 60 }}>
  <Suspense fallback={null}>
    {/* Освещение */}
    <Lights />
    
    {/* Окружение */}
    <Room />
    
    {/* Персонажи и их места */}
    <group>
      {/* Рабочее место Александра */}
      <Desk position={[-3, -1.2, 0]} width={1.8} />
      <Monitor ... />
      <PixelCharacter ... />
    </group>
    
    {/* Управление камерой */}
    <CameraController />
  </Suspense>
</Canvas>
```

### Шаг 8: Главный App компонент

**Файл**: `src/App.tsx`

```tsx
import { Scene } from './components/Scene';

export default function App() {
  return (
    <div className="w-full h-screen bg-black overflow-hidden">
      <Scene />
      
      {/* UI текст сверху */}
      <div className="absolute top-4 left-4 text-white">
        <h1>IT Team Office</h1>
        <p>🖱️ Drag to rotate | 🔄 Scroll to zoom</p>
      </div>
    </div>
  );
}
```

---

## 🔧 Как изменять элементы

### Изменить цвет комнаты
Отредактируйте `src/components/Room.tsx`:
```tsx
// Измените цвет пола
<meshStandardMaterial color={0x0a0a0a} /> // Измените hex-код
```

### Добавить новый персонаж
1. Отредактируйте `src/components/Scene.tsx`
2. Добавьте новую группу:
```tsx
<group>
  <Desk position={[x, y, z]} />
  <PixelCharacter 
    position={[x, y, z]}
    skinColor={0xffcba4}
    shirtColor={0x123456}  // Измените цвет рубашки
    pantsColor={0x654321}
  />
</group>
```

### Изменить положение камеры по умолчанию
Отредактируйте `src/components/Scene.tsx`:
```tsx
<Canvas camera={{ 
  position: [3, 2, 4],    // Измените эти координаты
  fov: 60 
}}>
```

### Добавить новый мебель
1. Создайте компонент в `src/components/Furniture.tsx`
2. Используйте его в `Scene.tsx`:
```tsx
<NewFurniture position={[x, y, z]} />
```

---

## 🎨 Схема расстановки персонажей

```
ДВЕРЬ (z = -10)
    ↓
[Александр -3,0]  [Владимир -0.5,0]  [Виталий 2.5,0]
                                       [Святослав 2.5,2]
    ↓
ШКАФ (4.5,0)    ТВ позади Святослава (2.5,3.8)
```

**Координатная система:**
- `x`: `-4` (левый монитор Александра) до `4.5` (шкаф)
- `y`: всегда `~-1` для персонажей (сидят на стульях)
- `z`: `-10` (дверь) до `3.8` (ТВ)

---

## 📊 Таблица частей персонажей

| Часть | Позиция Y | Размер | Примечание |
|-------|-----------|--------|-----------|
| Волосы | 1.75 | 0.15 | На голове |
| Голова | 1.5 | 0.4 | Основа |
| Тело | 0.8 | 0.5 | Рубашка |
| Штаны | 0.3 | 0.4 | Ноги |
| Ноги | 0 | 0.3 | Ступни |

---

## 🚀 Запуск и тестирование

```bash
# Запустить dev сервер
npm run dev

# Откроется на http://localhost:5173
# Попробуйте управлять камерой:
# - Кликните и тащите мышь
# - Крутите колесо мыши
```

---

## 🐛 Частые ошибки и решения

### Ошибка: "Cannot find module 'three'"
**Решение**: `npm install three`

### Ошибка: "Camera is undefined"
**Решение**: Проверьте, что используете `useThree()` из `@react-three/fiber` внутри `<Canvas>`

### Сцена черная
**Решение**: Проверьте освещение в `Lights.tsx` или позицию камеры

### Персонаж не видно
**Решение**: Убедитесь, что `position` персонажа в видимой области сцены

### Камера не движется
**Решение**: Проверьте обработчики событий мыши в `CameraController.tsx`

---

## 📈 Производительность

**Оптимизация:**
- Используйте `Suspense` для ленивой загрузки
- Не создавайте много уникальных материалов (переиспользуйте)
- Используйте `useFrame` осторожно (он вызывается каждый кадр)

**Текущая сцена:**
- ~50 объектов 3D
- ~15 источников света
- ~15 материалов

---

## 📚 Полезные ссылки

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber/)
- [WebGL 2.0 Spec](https://www.khronos.org/webgl/wiki/Main_Page)

---

**Готовы перейти к Этапу 2? Пишите! 🚀**
