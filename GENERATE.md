# Daily card generation (prompt for the scheduled Claude task)

You add new cards to BitFeed, a swipe-feed app for an embedded developer
(Rust, C, C++, firmware, MCU peripherals, electronics). The goal of the app:
learn to see bug patterns in code and in pull requests.

Working directory: the `devfeed/` folder.

## Steps

1. Read `app/public/cards.json`. Note existing `id`s and titles. Count cards per `topic` and per `type`.
2. Write **10 new cards** to `inbox/<YYYY-MM-DD>.json` (a JSON array). Mix:
   - 3 × `bug` (spot the bug line)
   - 3 × `pr` (approve / request changes). About 1 in 3 PRs must be correct (`"verdict": "approve"`).
   - 2 × `quiz` with runnable code and a `verify` block
   - 1 × `quiz` electronics (no code)
   - 1 × `concept` (a pattern summary, 3–5 bullets)
   Prefer topics with the fewest cards. Never repeat an existing pattern with the same idea.
3. Run the verifier. It compiles and runs code, and only merges cards that pass:
   ```bash
   cargo run --release --manifest-path verifier/Cargo.toml -- merge app/public/cards.json inbox/<YYYY-MM-DD>.json
   ```
   If a card is rejected, fix it or drop it, then run the merge again with only the fixed cards.
4. Run `cargo run --release --manifest-path verifier/Cargo.toml -- check app/public/cards.json`. It must end with `0 failed`.
5. If this folder is a git repo with a remote: commit `cards: +N for <date>` and push (this deploys the app).
6. Report in 3 lines: cards added, topics, anything rejected and why.

## Topics to draw from

- Interrupts: shared state, `volatile`, atomicity, NVIC priorities, ISR length, reentrancy
- Peripherals: UART, SPI, I2C, DMA (cache coherency, buffer lifetime), timers, ADC, watchdog, clocks, low-power modes
- Memory: stack size, alignment, packed structs, endianness, linker sections, heap after init
- Rust embedded: `embedded-hal` traits, `critical-section`, `heapless`, `embassy` async, `unsafe` and `static mut`, panics in `no_std`, `as` casts
- C/C++: integer promotion, UB (shifts, signed overflow, aliasing), macros, `constexpr`, RAII for peripherals
- Electronics: pull-ups, decoupling, dividers, level shifting, RC filters, current limits, ESD, ground loops
- PRs: take ideas from real bug-fix PRs in Zephyr, FreeRTOS, embassy, rust-embedded HALs, STM32 HAL issues and errata sheets. Rewrite them small. Do not copy code. Put the link in an optional `"source"` field.

## Card rules

- Schema: see `app/src/types/card.ts`. The verifier also checks it.
- `id`: short kebab-case, unique, prefixed by type (`bug-`, `pr-`, `c-`, `rs-`, `el-`, `concept-`).
- `tags`: 1–3 bug-pattern tags. Reuse existing tags when they fit (`isr`, `volatile`, `rmw-race`, `integer-overflow`, `ignored-error`, …).
- Code: 3–15 lines. It must fit a phone screen (max ~50 chars per line).
- Quiz with `verify`: `code` must be a full program that runs on the host (no MCU headers). `expect` is the exact stdout.
  Use `{"lang": "rust", "compileFail": true}` for "does not compile" answers.
- Bug cards: `bugLines` are 1-based. List every line that is a fair answer.
- Text: simple B1 English. Short sentences. `explain` ≤ 70 words. It names the pattern and the fix.
- No trick questions that depend on one compiler's quirks, unless the title says which target.
