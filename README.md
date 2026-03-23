<div align="center">
  <h1>XEO Tools</h1>
  <p><strong>Comprehensive on-page SEO analysis extension for Chrome</strong></p>

  <p>
    <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white" alt="Chrome Extension" />
    <img src="https://img.shields.io/badge/Manifest-V3-34A853?style=flat-square" alt="Manifest V3" />
    <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="JavaScript" />
    <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License" />
  </p>
</div>

---

## Overview

Chrome extension providing instant SEO scoring, on-page element highlighting, link auditing, sitemap analysis, and real-time indexing verification. Calculates a 0--100 SEO score per page with categorized issues and actionable recommendations.

## Features

### Meta Analysis
▸ Title tag and meta description length validation
▸ Canonical URL detection
▸ Robots meta tag parsing (`index`/`noindex`, `follow`/`nofollow`)
▸ Quick links to `robots.txt` and `llms.txt`
▸ Word count and page load time metrics

### Headings Outline
▸ Full heading hierarchy in page order (H1--H6)
▸ Click-to-scroll navigation to any heading
▸ On-page heading highlighting with color-coded labels
▸ H1 count validation (flags missing or multiple H1s)

### Links Analysis
▸ Internal, external, and nofollow link breakdown
▸ Filter by type: all, issues only, internal, external, nofollow
▸ On-page link highlighting with `INT`/`EXT`/`NF` labels
▸ Copy all URLs to clipboard or export as CSV

### Images Analysis
▸ Total image count with missing alt text detection
▸ Filter to show only images missing alt attributes
▸ Bulk select and download images
▸ Thumbnail preview for each image

### Structured Data
▸ JSON-LD schema type detection
▸ One-click validation via Schema.org Validator
▸ One-click validation via Google Rich Results Test

### Sitemap Analysis
▸ Sitemap URL detection and parsing
▸ Select and highlight sitemap URLs on the page
▸ Copy or export sitemap URLs as CSV

### DNS and Domain Info
▸ IP address, hosting provider, and server detection
▸ SSL certificate status
▸ Response time measurement

### SEO Scoring
▸ Real-time 0--100 SEO score per page
▸ Color-coded toolbar icon (green / yellow / red) based on score
▸ Badge count showing total issues detected
▸ Categorized issues: errors vs. warnings

## Installation

1. Clone or download this repository
2. Open `chrome://extensions/` in Chrome
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** and select the `sean-seo-checker-v2.1` folder
5. The extension icon will appear in your toolbar

## Versions

| Version | Status |
|---------|--------|
| `v2.1` | Source code included (`sean-seo-checker-v2.1/`) |
| `v2.2` | Packaged release (`sean-seo-checker-v2.2.zip`) |

## Project Structure

```
sean-seo-checker-v2.1/
  manifest.json          # MV3 manifest
  background.js          # Service worker for page metrics
  popup.html             # Extension popup UI
  popup.js               # Analysis logic and rendering
  styles/
    popup.css            # Main popup styles
    settings.css         # Settings panel styles
```

## License

[MIT](LICENSE)

---

<p align="center">Made with 💛 by Sean G</p>
