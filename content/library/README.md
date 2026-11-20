# SEO-библиотека статей

Markdown + frontmatter → универсальный шаблон → статический HTML при `npm run build`.

## Добавление пакета статей

1. Положите файлы `.md` в `content/library/`.
2. Для каждой статьи заполните frontmatter (см. ниже).
3. Обложки 16:9 положите в `public/media/...` и укажите путь в `cover`.
4. Запустите локально: `npm run build` (сначала `build:library`).
5. Проверьте каталог `/articles`, страницу `/{slug}`, sitemap и HTML в `dist/{slug}/index.html`.
6. В production попадают только `status: published`. Черновики (`draft`) не в каталоге, sitemap и статических маршрутах.

Не коммитьте тестовые статьи с `status: published`, если пакет ещё не готов к деплою.

## Frontmatter

```yaml
---
slug: my-article-slug
title: "SEO-заголовок | Ксения Ахмедова"
h1: "Заголовок на странице"
description: "Описание до ~160 символов."
author: "Ксения Ахмедова"
date: "2026-11-19"
updatedAt: "2026-11-19"
sourceUrl: ""
cluster: rejection   # rejection | asking | desires | relationships | other
related: [other-slug]
practice: kogda-net  # kogda-net | otkaz-ot-sebya | none
status: draft        # draft | published
cover: /media/portraits/example.png
coverAlt: "Описание обложки"
---
```

## Кластеры и практики

- `kogda-net` → `/kogda-govoryat-net`
- `otkaz-ot-sebya` → `/praktika-ne-otkazyvatsya-ot-sebya`

Slug не должен совпадать с legacy-статьями, практиками и служебными путями (`articles`, `legal`, `api`…).

## Тестовая статья

`test-seo-library-scaffold.md` — только для локальной проверки каркаса. Перед production-деплоем смените на `status: draft` или удалите файл из репозитория публикации.
