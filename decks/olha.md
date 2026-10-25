# Deck: olha

Link: https://kemolife.github.io/devfeed/?deck=olha
Cards file: `app/public/decks/olha.json`

## Who

- Junior developer, new position.
- Until now she worked mostly as a "vibe coder": AI writes the code, she reads it.
- Goal: write code by hand, with Claude or with Copilot, but **understand every line**:
  what it does, why, and what can go wrong.

## Stack

PHP 8, Symfony (controllers, services, Doctrine, Twig, forms, security), JavaScript, jQuery,
Git with Bitbucket pull requests.

## What her cards should train

- Reading code exactly: what does it really print or do (PHP type juggling, references,
  JS coercion, scope, async).
- Spotting the common bugs in AI-written code: SQL/DQL injection, XSS (`|raw`, `.html()`),
  N+1 queries, swallowed exceptions, missing validation, `this` in callbacks, AJAX timing.
- Reviewing pull requests like on Bitbucket: approve good ones, reject bad ones, and
  always show the full fixed code.
- Symfony basics with understanding: request flow, autowiring, Doctrine, Twig escaping.
- Git habits: small PRs, no secrets in commits, amend/force-push dangers.

## Style

- Difficulty 1–2 mostly, sometimes 3. Simple B1 English.
- Topics: `php`, `symfony`, `js`, `jquery`, `git`.
- Runnable `verify` for PHP (`"lang": "php"`, the `<?php` tag may be left out) and JS (`"lang": "js"`, Node).
- Twig snippets use `"lang": "twig"` (display only, no verify).
