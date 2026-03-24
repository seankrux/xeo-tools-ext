<div align="center">
  <h1>XEO Tools — SEO Checker</h1>
  <p><strong>Instant, comprehensive on-page SEO analysis built directly into your browser.</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome Extension" />
    <img src="https://img.shields.io/badge/Manifest-V3-34A853?style=flat-square&logo=google&logoColor=white" alt="Manifest V3" />
    <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript ES6+" />
  </p>
</div>

---

## Overview

XEO Tools is a Chrome extension that delivers real-time SEO intelligence for any webpage — no accounts, no dashboards, no data leaving your browser. Pop it open on any page and instantly surface a scored breakdown of meta tags, heading structure, link health, image accessibility, structured data, DNS info, and sitemap coverage. A live 0–100 SEO score updates as you browse, with the toolbar icon shifting between green, yellow, and red so you always know where a page stands at a glance.

Built for SEO professionals, developers, and content teams who need fast, actionable insights without leaving their workflow.

---

## Features

### SEO Scoring
- Real-time **0–100 SEO score** calculated per page
- Color-coded toolbar icon (green / yellow / red) reflects current score
- Badge counter displays the total number of detected issues
- Issues categorized as **errors** vs **warnings** for prioritization

### Meta Analysis
- Title tag and meta description length validation with character counts
- Canonical URL detection and display
- Robots meta tag parsing (`index`/`noindex`, `follow`/`nofollow`)
- Quick-access links to `robots.txt` and `llms.txt`
- Word count and page load time metrics

### Headings Outline
- Full heading hierarchy rendered in document order (H1–H6)
- Click any heading to scroll directly to it on the page
- On-page heading highlighting with color-coded labels per level
- H1 validation — flags missing or duplicate H1 tags

### Links Analysis
- Breakdown of internal, external, and nofollow links
- Filter view by type: all, issues only, internal, external, nofollow
- On-page link highlighting with `INT` / `EXT` / `NF` labels
- Copy all URLs to clipboard or export the full list as CSV

### Images Analysis
- Total image count with missing alt text detection
- Filter to show only images lacking alt attributes
- Thumbnail preview for each discovered image
- Bulk select and download images

### Structured Data
- JSON-LD schema type detection and display
- One-click validation via **Schema.org Validator**
- One-click validation via **Google Rich Results Test**

### Sitemap Analysis
- Automatic sitemap URL detection and parsing
- Select and highlight sitemap URLs on the current page
- Copy or export sitemap URLs as CSV

### DNS & Domain Info
- IP address, hosting provider, and server identification
- SSL certificate status
- Response time measurement

---

## Installation

XEO Tools is loaded as an unpacked extension during development. No Chrome Web Store listing is required.

1. **Clone or download** this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle in the top-right corner.
4. Click **Load unpacked** and select the `sean-seo-checker-v2.1` folder.
5. The XEO Tools icon will appear in your Chrome toolbar.

> To update after pulling new changes, return to `chrome://extensions/` and click the refresh icon on the XEO Tools card.

---

## Usage

1. Navigate to any webpage in Chrome.
2. Click the **XEO Tools** icon in the toolbar to open the popup panel.
3. The panel loads automatically with the SEO score and categorized analysis tabs.
4. Use the tab navigation to switch between **Meta**, **Headings**, **Links**, **Images**, **Schema**, **Sitemap**, and **DNS** sections.
5. Click the **highlight** toggle in any section to overlay visual labels directly on the page.
6. Use **Copy** or **Export CSV** buttons to extract data from any section.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Extension Platform | Chrome Extensions API (Manifest V3) |
| Language | JavaScript (ES6+) |
| UI | HTML5 / CSS3 (no framework) |
| Background | Service Worker (`background.js`) |
| Content Injection | Content Script + CSS Highlighter |
| Storage | Chrome Storage API |
| Downloads | Chrome Downloads API |

---

## Architecture Overview

```
sean-seo-checker-v2.1/
├── manifest.json              # MV3 manifest — permissions, content scripts, service worker
├── popup.html                 # Extension popup entry point
├── pages/
│   └── settings.html          # Options/settings page
├── scripts/
│   ├── background.js          # Service worker — handles page metrics, tab events, badge updates
│   └── content.js             # Content script — injected into all pages for DOM analysis and highlighting
└── styles/
    ├── popup.css              # Popup panel styles
    ├── settings.css           # Settings page styles
    └── highlighter.css        # On-page element highlight overlay styles
```

**Data flow:**

1. `content.js` is injected at `document_idle` into every page and performs DOM analysis.
2. The popup (`popup.html` / `popup.js`) requests analysis results from the content script via Chrome message passing.
3. `background.js` (service worker) tracks navigation events, computes response times, and updates the toolbar badge and icon color.
4. All user preferences are persisted via the Chrome Storage API — no external servers involved.

---

## Versions

| Version | Notes |
|---|---|
| `v2.1` | Source code — load unpacked from `sean-seo-checker-v2.1/` |
| `v2.2` | Packaged release — `sean-seo-checker-v2.2.zip` |

---

## Contributing

Contributions, bug reports, and feature suggestions are welcome.

1. Fork the repository.
2. Create a feature branch: `git checkout -b feat/your-feature-name`
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, etc.
4. Open a Pull Request with a clear description of what changed and why.

Please keep the extension dependency-free and consistent with the existing vanilla JS / CSS approach.

---

<p align="center">Made with 💛 by <a href="https://www.seanguillermo.com"><strong>Sean G</strong></a></p>
