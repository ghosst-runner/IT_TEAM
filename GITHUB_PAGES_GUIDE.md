# 🚀 Гайд по загрузке на GitHub Pages

Пошаговая инструкция по размещению вашего 3D сайта на GitHub Pages.

> ## ⚡ Актуальный быстрый способ (рекомендуется)
>
> Сборка проекта — **один самодостаточный файл** `dist/index.html`
> (vite-plugin-singlefile): все JS и CSS внутри, внешних ассетов нет,
> поэтому base-path настраивать не нужно.
>
> 1. Создайте репозиторий на GitHub и запушьте код:
>    ```bash
>    git init
>    git add .
>    git commit -m "IT Team Office 3D"
>    git branch -M main
>    git remote add origin https://github.com/USERNAME/REPO.git
>    git push -u origin main
>    ```
> 2. В репозитории: **Settings → Pages → Source: GitHub Actions**.
> 3. Готово: в проекте уже лежит `.github/workflows/deploy.yml` —
>    при каждом `git push` в main сайт пересоберётся и выложится сам.
>    Адрес: `https://USERNAME.github.io/REPO/`
>
> ### Ручной способ без Actions (разово)
> ```bash
> npm install
> npm run build          # получится dist/index.html
> npx gh-pages -d dist   # создаст ветку gh-pages с содержимым dist
> ```
> Затем **Settings → Pages → Source: Deploy from a branch → gh-pages / (root)**.

## 📋 Предусловия

- Аккаунт на GitHub
- Git установлен на компьютер
- Код проекта готов

## 🔧 Способ 1: Через ветку `gh-pages` (Рекомендуется)

### Шаг 1: Собрать проект

```bash
npm run build
```

Будет создана папка `dist/` со всеми файлами для production.

### Шаг 2: Инициализировать Git (если ещё не инициализирован)

```bash
git init
git add .
git commit -m "Initial commit"
```

### Шаг 3: Добавить remote репозиторий

```bash
git remote add origin https://github.com/ВАШЕ_ИМЕНА/НАЗВАНИЕ_РЕПО.git
```

Замените:
- `ВАШЕ_ИМЕНА` - на ваш GitHub username
- `НАЗВАНИЕ_РЕПО` - на имя репозитория

### Шаг 4: Установить `gh-pages` пакет

```bash
npm install --save-dev gh-pages
```

### Шаг 5: Обновить `package.json`

Добавьте в `package.json` (если её нет):

```json
{
  "homepage": "https://ВАШЕ_ИМЕНА.github.io/НАЗВАНИЕ_РЕПО",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "gh-pages -d dist"
  }
}
```

Замените `ВАШЕ_ИМЕНА` и `НАЗВАНИЕ_РЕПО` на реальные значения.

### Шаг 6: Развернуть на GitHub Pages

```bash
npm run deploy
```

Это автоматически:
1. Собирает проект (`npm run build`)
2. Берет содержимое папки `dist/`
3. Выкладывает в ветку `gh-pages`

### Шаг 7: Включить GitHub Pages в настройках

1. Перейдите в ваш репозиторий на GitHub
2. Откройте **Settings** (Параметры)
3. В левом меню найдите **Pages**
4. Под "Source" выберите:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Нажмите **Save**

### Шаг 8: Ждите развертывания

GitHub автоматически развернет ваш сайт. Это может занять 1-5 минут.

Ваш сайт будет доступен по адресу:
```
https://ВАШЕ_ИМЕНА.github.io/НАЗВАНИЕ_РЕПО
```

---

## 🔄 Способ 2: Вручную через веб-интерфейс GitHub

### Если вы не хотите использовать `gh-pages`:

1. Собирите проект локально: `npm run build`
2. На GitHub создайте новую ветку `gh-pages`
3. В эту ветку загрузите содержимое папки `dist/`
4. Включите Pages (как описано выше)

---

## ⚠️ Если сайт не отображается

### Проблема 1: Белый экран
**Решение**: Проверьте консоль браузера (F12) на ошибки.

### Проблема 2: 404 ошибка
**Решение**: 
- Убедитесь, что `dist/index.html` существует
- Проверьте, что ветка `gh-pages` содержит файлы из `dist/`

### Проблема 3: Ресурсы не загружаются (нет текстур, скриптов)
**Решение**: Отредактируйте `vite.config.ts` (если нужно указать base path):

```ts
export default {
  base: '/НАЗВАНИЕ_РЕПО/',
  // ... остальное
}
```

### Проблема 4: WebGL ошибка
**Решение**:
- Попробуйте в другом браузере (Chrome, Firefox, Edge)
- Убедитесь, что браузер поддерживает WebGL 2.0

---

## 📱 Проверка перед публикацией

```bash
# 1. Собрать проект
npm run build

# 2. Проверить локально
npm run preview

# Откроется на http://localhost:4173
# Проверьте все функции:
# - Камера вращается
# - Персонажи видны
# - Мониторы светятся
# - Нет ошибок в консоли
```

---

## 📊 Статус GitHub Pages

После развертывания можно проверить статус:

1. Откройте репозиторий на GitHub
2. **Settings** → **Pages**
3. Там будет надпись типа:
   - ✅ "Your site is live at https://..."
   - 🟡 "Your site is ready to be published..."
   - ❌ "There is a problem with this repository's GitHub Pages site"

---

## 🔐 Дополнительные настройки

### Кастомный домен (опционально)

Если у вас есть собственный домен:

1. Settings → Pages
2. Custom domain: введите `example.com`
3. Проверьте DNS записи у вашего хостера

### HTTPS (автоматически)

GitHub Pages использует HTTPS по умолчанию. Это безопасно и хорошо для SEO.

---

## 🔄 Обновление сайта после изменений

После каждого изменения кода:

```bash
# 1. Внесите изменения в код
# 2. Коммитьте в git
git add .
git commit -m "Описание изменений"
git push origin main

# 3. Пересоберите и развертните
npm run build
npm run deploy
```

Или создайте автоматизацию через GitHub Actions (продвинутый вариант).

---

## 📈 GitHub Actions для автоматизации (Продвинутый уровень)

Создайте файл `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main  # Или main/master - в зависимости от вашей ветки

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

После этого, просто делайте `git push` в main, и GitHub автоматически развернет сайт!

---

## 🎉 Результат

Вы должны увидеть:

```
https://ВАШЕ_ИМЕНА.github.io/НАЗВАНИЕ_РЕПО/
```

На этой странице:
- 3D сцена с вашей IT-командой
- Интерактивная камера
- Неоновые цвета
- Полностью рабочий WebGL сайт

---

## 📞 Если что-то не работает

Проверьте:
1. ✅ Проект собирается: `npm run build`
2. ✅ Нет ошибок в консоли: F12 → Console
3. ✅ Ветка `gh-pages` создана на GitHub
4. ✅ Pages включены в Settings
5. ✅ Правильно указан `homepage` в package.json

---

**Готово! Ваш сайт теперь в интернете! 🚀**
