//! Card verifier for BitFeed.
//!
//! `verifier check <cards.json>`            — validate every card, exit 1 on any failure
//! `verifier merge <cards.json> <new.json>` — validate new cards, append only the passing ones
//!
//! Cards with a `verify` block are compiled and run on the host:
//!   { "lang": "c" | "rust", "expect": "<stdout>" }   → output must match
//!   { "lang": "c" | "rust", "compileFail": true }    → compilation must fail

use serde_json::Value;
use std::collections::HashSet;
use std::path::Path;
use std::process::{Command, ExitCode, Stdio};
use std::time::{Duration, Instant};
use std::{env, fs, thread};

const RUN_TIMEOUT: Duration = Duration::from_secs(5);

fn main() -> ExitCode {
    let args: Vec<String> = env::args().collect();
    let result = match args.get(1).map(String::as_str) {
        Some("check") if args.len() == 3 => check(&args[2]),
        Some("merge") if args.len() == 4 => merge(&args[2], &args[3]),
        Some("summary") if args.len() == 3 => summary(&args[2]),
        _ => Err("usage: verifier check <cards.json> | merge <cards.json> <new.json> | summary <cards.json>".into()),
    };
    match result {
        Ok(true) => ExitCode::SUCCESS,
        Ok(false) => ExitCode::FAILURE,
        Err(e) => {
            eprintln!("error: {e}");
            ExitCode::from(2)
        }
    }
}

fn load(path: &str) -> Result<Vec<Value>, String> {
    let text = fs::read_to_string(path).map_err(|e| format!("{path}: {e}"))?;
    serde_json::from_str(&text).map_err(|e| format!("{path}: {e}"))
}

fn check(path: &str) -> Result<bool, String> {
    let cards = load(path)?;
    let mut ids = HashSet::new();
    let mut failed = 0;
    for card in &cards {
        let id = card["id"].as_str().unwrap_or("<no id>");
        let mut res = verify_card(card);
        if !ids.insert(id.to_string()) {
            res = Err("duplicate id".into());
        }
        report(id, &res);
        failed += res.is_err() as usize;
    }
    println!("\n{} cards, {} failed", cards.len(), failed);
    Ok(failed == 0)
}

fn merge(cards_path: &str, new_path: &str) -> Result<bool, String> {
    let mut cards = load(cards_path)?;
    let mut ids: HashSet<String> =
        cards.iter().filter_map(|c| c["id"].as_str().map(String::from)).collect();
    let (mut added, mut rejected) = (0, 0);
    for card in load(new_path)? {
        let id = card["id"].as_str().unwrap_or("<no id>").to_string();
        let res = if ids.contains(&id) { Err("duplicate id".into()) } else { verify_card(&card) };
        report(&id, &res);
        if res.is_ok() {
            ids.insert(id);
            cards.push(card);
            added += 1;
        } else {
            rejected += 1;
        }
    }
    let json = serde_json::to_string_pretty(&cards).map_err(|e| e.to_string())?;
    fs::write(cards_path, json + "\n").map_err(|e| format!("{cards_path}: {e}"))?;
    println!("\nadded {added}, rejected {rejected}, total {}", cards.len());
    Ok(true)
}

/// Short view for the card generator: counts, one line per card, and one full example per
/// type. About 10x smaller than reading cards.json, and it stays small as the file grows.
fn summary(path: &str) -> Result<bool, String> {
    use std::collections::BTreeMap;
    let cards = load(path)?;
    let mut by_topic: BTreeMap<String, usize> = BTreeMap::new();
    let mut by_type: BTreeMap<String, usize> = BTreeMap::new();
    let mut tags: BTreeMap<String, usize> = BTreeMap::new();
    let mut examples: BTreeMap<String, &Value> = BTreeMap::new();
    let str_of = |v: &Value| v.as_str().unwrap_or("?").to_string();

    for c in &cards {
        *by_topic.entry(str_of(&c["topic"])).or_default() += 1;
        *by_type.entry(str_of(&c["type"])).or_default() += 1;
        for t in c["tags"].as_array().into_iter().flatten() {
            *tags.entry(str_of(t)).or_default() += 1;
        }
        examples.entry(str_of(&c["type"])).or_insert(c);
    }
    let fmt = |m: &BTreeMap<String, usize>| {
        m.iter().map(|(k, v)| format!("{k}={v}")).collect::<Vec<_>>().join(" ")
    };
    println!("{} cards", cards.len());
    println!("topics: {}", fmt(&by_topic));
    println!("types:  {}", fmt(&by_type));
    println!("tags:   {}", fmt(&tags));
    println!("\nid | type | topic | tags | title");
    for c in &cards {
        let title = c["title"].as_str().or(c["pr"]["title"].as_str()).unwrap_or("");
        let tags: Vec<String> = c["tags"].as_array().into_iter().flatten().map(str_of).collect();
        println!("{} | {} | {} | {} | {}", str_of(&c["id"]), str_of(&c["type"]), str_of(&c["topic"]), tags.join(","), title);
    }
    println!("\nOne full example per type:");
    for (t, c) in examples {
        println!("--- {t}\n{}", serde_json::to_string_pretty(c).map_err(|e| e.to_string())?);
    }
    Ok(true)
}

fn report(id: &str, res: &Result<&'static str, String>) {
    match res {
        Ok(how) => println!("  ok    {id} ({how})"),
        Err(e) => println!("  FAIL  {id}: {e}"),
    }
}

/// Schema check for every card, plus compile-and-run for cards with `verify`.
fn verify_card(card: &Value) -> Result<&'static str, String> {
    let s = |k: &str| card[k].as_str().filter(|v| !v.trim().is_empty());
    s("id").ok_or("missing id")?;
    match s("topic") {
        // main deck | web decks
        Some("rust" | "c" | "cpp" | "embedded" | "electronics" | "php" | "symfony" | "js" | "jquery" | "git" | "oop" | "composer") => {}
        _ => return Err("bad topic".into()),
    }
    match card["difficulty"].as_u64() {
        Some(1..=3) => {}
        _ => return Err("difficulty must be 1..3".into()),
    }
    if !card["tags"].as_array().is_some_and(|t| !t.is_empty()) {
        return Err("needs at least one tag".into());
    }

    match s("type") {
        Some("quiz") => {
            s("title").ok_or("missing title")?;
            s("explain").ok_or("missing explain")?;
            let n = card["options"].as_array().map_or(0, Vec::len);
            if !(2..=4).contains(&n) {
                return Err("quiz needs 2..4 options".into());
            }
            if !card["answer"].as_u64().is_some_and(|a| (a as usize) < n) {
                return Err("answer index out of range".into());
            }
        }
        Some("bug") => {
            s("title").ok_or("missing title")?;
            s("explain").ok_or("missing explain")?;
            let lines = s("code").ok_or("missing code")?.lines().count() as u64;
            let bug_lines = card["bugLines"].as_array().ok_or("missing bugLines")?;
            if bug_lines.is_empty() || bug_lines.iter().any(|l| !l.as_u64().is_some_and(|l| (1..=lines).contains(&l))) {
                return Err(format!("bugLines must be within 1..{lines}"));
            }
        }
        Some("pr") => {
            s("explain").ok_or("missing explain")?;
            let diff = s("diff").ok_or("missing diff")?;
            if diff.lines().any(|l| !matches!(l.chars().next(), Some('+' | '-' | ' '))) {
                return Err("every diff line must start with '+', '-' or ' '".into());
            }
            match card["pr"]["verdict"].as_str() {
                Some("approve") => {}
                // the reader must see the corrected code, not only a hint
                Some("changes") if s("fix").is_none() => {
                    return Err("pr with verdict \"changes\" needs \"fix\": the full corrected code".into());
                }
                Some("changes") => {}
                _ => return Err("pr.verdict must be approve|changes".into()),
            }
        }
        Some("concept") => {
            s("title").ok_or("missing title")?;
            if card["bullets"].as_array().is_none_or(|b| b.is_empty()) {
                return Err("concept needs bullets".into());
            }
        }
        _ => return Err("unknown type".into()),
    }

    let verify = &card["verify"];
    if verify.is_null() {
        return Ok("schema");
    }
    let code = s("code").ok_or("verify needs code")?;
    let lang = verify["lang"].as_str().ok_or("verify.lang missing")?;
    let compile_fail = verify["compileFail"].as_bool().unwrap_or(false);

    let dir = tempfile::tempdir().map_err(|e| e.to_string())?;
    let compiled = compile(lang, code, dir.path())?;

    if compile_fail {
        return if compiled.is_err() { Ok("compile fails as expected") } else { Err("expected compile error, but it compiled".into()) };
    }
    let program = compiled.map_err(|e| format!("compile error:\n{e}"))?;

    let expect = verify["expect"].as_str().ok_or("verify.expect missing")?;
    let out = run(program)?;
    if normalize(&out) == normalize(expect) {
        Ok("compiled + output matches")
    } else {
        Err(format!("output mismatch: expected {expect:?}, got {out:?}"))
    }
}

/// Outer Err = tool problem (abort card). Inner Err = the compiler (or the PHP / Node syntax
/// check) rejected the code. Ok(Ok(cmd)) = the command that runs the program.
fn compile(lang: &str, code: &str, dir: &Path) -> Result<Result<Command, String>, String> {
    let bin = dir.join("prog");
    let (file, mut cmd, source, runner): (&str, Command, String, Command) = match lang {
        "c" => {
            let mut c = Command::new("cc");
            // -pedantic-errors: every diagnostic the standard requires is an error on both
            // clang (macOS) and GCC (CI). With -w, GCC let "compile error" cards compile.
            c.args(["-std=c11", "-O2", "-pedantic-errors", "-o"]).arg(&bin);
            ("main.c", c, code.to_string(), Command::new(&bin))
        }
        "cpp" => {
            let mut c = Command::new("c++");
            c.args(["-std=c++20", "-O2", "-pedantic-errors", "-o"]).arg(&bin);
            ("main.cpp", c, code.to_string(), Command::new(&bin))
        }
        "rust" => {
            let mut c = Command::new("rustc");
            c.args(["--edition", "2024", "-O", "-A", "warnings", "-o"]).arg(&bin);
            ("main.rs", c, code.to_string(), Command::new(&bin))
        }
        "php" => {
            // cards may leave out the opening tag to stay short
            let source = if code.trim_start().starts_with("<?php") { code.to_string() } else { format!("<?php\n{code}") };
            let mut c = Command::new("php");
            c.arg("-l");
            let mut r = Command::new("php");
            r.args(["-d", "display_errors=stderr", "-d", "error_reporting=E_ALL"]).arg(dir.join("main.php"));
            ("main.php", c, source, r)
        }
        "js" => {
            let mut c = Command::new("node");
            c.arg("--check");
            let mut r = Command::new("node");
            r.arg(dir.join("main.js"));
            ("main.js", c, code.to_string(), r)
        }
        other => return Err(format!("unsupported verify.lang {other:?}")),
    };
    let src = dir.join(file);
    fs::write(&src, source).map_err(|e| e.to_string())?;
    let out = cmd.arg(&src).output().map_err(|e| format!("cannot start compiler: {e}"))?;
    Ok(if out.status.success() {
        Ok(runner)
    } else {
        let mut msg = String::from_utf8_lossy(&out.stderr).into_owned();
        msg.push_str(&String::from_utf8_lossy(&out.stdout));
        Err(msg)
    })
}

fn run(mut program: Command) -> Result<String, String> {
    let mut child = program
        .stdout(Stdio::piped())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| e.to_string())?;
    let start = Instant::now();
    while child.try_wait().map_err(|e| e.to_string())?.is_none() {
        if start.elapsed() > RUN_TIMEOUT {
            let _ = child.kill();
            return Err("timeout".into());
        }
        thread::sleep(Duration::from_millis(20));
    }
    let out = child.wait_with_output().map_err(|e| e.to_string())?;
    Ok(String::from_utf8_lossy(&out.stdout).into_owned())
}

fn normalize(s: &str) -> String {
    s.lines().map(str::trim_end).collect::<Vec<_>>().join("\n").trim().to_string()
}
