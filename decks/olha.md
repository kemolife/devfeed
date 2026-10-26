# Deck: olha

Link: https://kemolife.github.io/devfeed/olha/
Cards file: `app/public/decks/olha.json`

## Who

- Junior developer, new position.
- Until now she worked mostly as a "vibe coder": AI writes the code, she reads it.
- Goal: write code by hand, with Claude or with Copilot, but **understand every line**:
  what it does, why, and what can go wrong.

## Stack

PHP 8, OOP in PHP (classes, interfaces, inheritance, readonly, static), Composer (packages, versions,
autoload), Symfony (controllers, services, Doctrine, Twig, forms, security), JavaScript, jQuery,
Git with Bitbucket pull requests.

## What her cards should train

- Reading code exactly: what does it really print or do (PHP type juggling, references,
  JS coercion, scope, async).
- Spotting the common bugs in AI-written code: SQL/DQL injection, XSS (`|raw`, `.html()`),
  N+1 queries, swallowed exceptions, missing validation, `this` in callbacks, AJAX timing.
- Reviewing pull requests like on Bitbucket: approve good ones, reject bad ones, and
  always show the full fixed code.
- Symfony basics with understanding: request flow, autowiring, Doctrine, Twig escaping.
- OOP with understanding: objects vs arrays (handles vs copies), constructors and `parent::__construct`,
  interfaces as contracts, `static` vs `self`, readonly and value objects, composition over inheritance.
- Composer: `require` vs `require-dev`, `install` vs `update`, `composer.lock`, version constraints (`^`, `~`),
  PSR-4 autoload and case-sensitive paths.
- Git habits: small PRs, no secrets in commits, amend/force-push dangers.
- **Her own project** (topic `project`): https://github.com/data4data/file_processing, a small PHP 8.4 JSON
  API for CSV/JSON files (front controller public/index.php, FileController, FileService, CsvFileActions /
  JsonFileActions strategy, exception hierarchy → HTTP codes, jQuery front, PHPUnit). Cards are "a senior
  asks you about your project": why it is built this way, what could break, what you would improve.
  About 1 of her 5 daily cards may be about it; read the repo again first, it changes.

## Style

- Difficulty 1–2 mostly, sometimes 3. Simple B1 English.
- Topics: `project`, `php`, `oop`, `composer`, `symfony`, `js`, `jquery`, `git`.
- Runnable `verify` for PHP (`"lang": "php"`, the `<?php` tag may be left out) and JS (`"lang": "js"`, Node).
- Twig snippets use `"lang": "twig"` (display only, no verify).
