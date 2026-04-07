# Repo Review, April 7, 2026

Repository: `seankrux/xeo-tools-ext`
Reviewer: ChatGPT
Scope: targeted review of README, manifest, background script, content script, and CI workflow

## Executive summary

This is a strong MVP for a Chrome SEO extension, but it is not production hardened yet. The main risks are duplicate analysis triggers, overbroad permissions, page mutation during highlighting, outdated performance timing logic, and a scoring model that can produce misleading SEO judgments.

## Files reviewed

- `README.md`
- `sean-seo-checker-v2.1/manifest.json`
- `sean-seo-checker-v2.1/scripts/background.js`
- `sean-seo-checker-v2.1/scripts/content.js`
- `.github/workflows/ci.yml`

## Priority findings

### 1. Duplicate analysis triggers
Severity: high

`performAnalysis()` runs from both `chrome.tabs.onUpdated` and `chrome.webNavigation.onCompleted`.

Impact:
- duplicate script execution
- redundant storage writes
- badge flicker and potential race conditions

Recommended fix:
- choose one primary navigation trigger
- add a debounce or dedupe guard keyed by `tabId + url`

### 2. Overbroad permissions and host access
Severity: high

The extension requests:
- `tabs`
- `webNavigation`
- `downloads`
- `"<all_urls>"` host permissions

Impact:
- larger attack surface
- harder Chrome Web Store review
- broader privacy footprint than necessary

Recommended fix:
- prefer `activeTab` plus on demand injection where possible
- reduce `host_permissions` if full site coverage is not strictly required
- keep `downloads` only if export is core

### 3. Unsafe DOM mutation strategy
Severity: high

The content script injects labels directly into headings and links and forces inline styles like `position: relative`, outlines, and backgrounds.

Impact:
- layout breakage on some pages
- interference with site scripts and accessibility
- copied text and visible text can be polluted by labels

Recommended fix:
- use a dedicated overlay layer instead of mutating content elements
- avoid injecting spans into headings and anchors
- preserve and restore original inline styles if style mutation is unavoidable

### 4. Legacy performance timing API
Severity: medium high

The code uses `performance.timing`, which is legacy and unreliable on many modern pages.

Impact:
- inaccurate page speed metrics
- false warnings and weak trust in scoring

Recommended fix:
- use `performance.getEntriesByType('navigation')[0]`
- separate initial navigation metrics from SPA behavior

### 5. Scoring model is too rigid
Severity: medium high

The current score penalizes pages for missing external links, low word count using generic thresholds, missing schema, and fixed title or meta length bands.

Impact:
- false negatives for valid page types like contact, utility, or transactional pages
- weaker trust in the extension's audit output

Recommended fix:
- switch to severity weighted checks
- split critical issues from best practice suggestions
- consider page type aware scoring

### 6. Link classification is simplistic
Severity: medium

Internal links are classified using strict hostname equality.

Impact:
- inaccurate treatment of subdomains, `www` vs non `www`, and some same site variations

Recommended fix:
- normalize hostnames
- optionally support root domain matching
- distinguish internal, cross subdomain, external, mailto, tel, javascript, and hash links

### 7. Structured data parsing is incomplete
Severity: medium

The parser handles top level `@type` and `@graph` but does not robustly cover arrays, nested structures, or malformed JSON-LD reporting.

Impact:
- missed schema detections
- no clarity when schema exists but is invalid

Recommended fix:
- support arrays and nested types
- report parse errors separately from not found

### 8. Storage model may not scale well
Severity: medium

Full analysis objects, including detailed links and images, are stored per tab in `chrome.storage.local`.

Impact:
- larger writes on navigation
- possible stale data buildup
- slower popup experience over time

Recommended fix:
- store only summary data in storage
- fetch detailed data from the content script on demand
- clean up stale tab entries

### 9. Version mismatch in docs
Severity: medium

The README mentions `v2.1` source and `v2.2` packaged release, while the manifest version is `2.0.0`.

Impact:
- confusing release state
- weak release hygiene

Recommended fix:
- align manifest, README, and release naming
- add a changelog

### 10. CI is too shallow
Severity: medium

The CI workflow only checks that a manifest exists and is valid JSON.

Impact:
- no script quality checks
- no packaging validation
- no smoke testing

Recommended fix:
- add ESLint or equivalent linting
- validate packaging
- add a lightweight smoke test for extension load paths

## Code quality notes

### Background script
Strengths:
- readable flow
- clear scoring and issue generation structure

Concerns:
- large monolithic file
- orchestration and business logic are tightly coupled

Recommended fix:
- split scoring, issue generation, and analysis helpers into pure modules

### Content script
Strengths:
- straightforward feature behavior
- easy to follow message handling

Concerns:
- heavy inline styling
- direct mutation of content bearing nodes

Recommended fix:
- refactor into detection, mapping, and overlay rendering layers

## Recommended action plan

### Immediate
1. remove duplicate analysis triggers
2. replace `performance.timing`
3. stop injecting labels into content elements
4. tighten permissions

### Next sprint
1. redesign scoring by issue severity and page type
2. improve schema parsing
3. improve link classification
4. reduce storage payload size

### Hardening
1. add linting and smoke tests to CI
2. fix version consistency
3. add privacy notes in README
4. prep for Chrome Web Store readiness

## Bottom line

This repo has a solid foundation. The most valuable next improvements are event deduplication, safer highlighting, modern timing metrics, and a less rigid scoring model.
