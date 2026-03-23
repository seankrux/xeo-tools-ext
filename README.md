# XEO Tools

**Chrome SEO Analysis Extension**

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?style=flat-square&logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-34A853?style=flat-square)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

Comprehensive SEO analysis Chrome extension with on-page highlighting, link checking, sitemap analysis, and real-time indexing verification. Provides an instant SEO score with categorized issues and actionable recommendations for any webpage.

## Features

### Meta Analysis
- Title tag length validation (30-60 character range)
- Meta description length validation (120-160 character range)
- Canonical URL detection
- Robots meta tag parsing (index/noindex, follow/nofollow)
- Quick links to `robots.txt` and `llms.txt`
- Word count and page load time metrics

### Headings Outline
- Full heading hierarchy displayed in page order (H1-H6)
- Click-to-scroll navigation to any heading on the page
- On-page heading highlighting with color-coded labels
- H1 count validation (flags missing or multiple H1s)

### Links Analysis
- Internal, external, and nofollow link breakdown
- Filter by type: all, issues only, internal, external, nofollow
- On-page link highlighting with INT/EXT/NF labels
- Copy all URLs to clipboard
- Export links as CSV

### Images Analysis
- Total image count with missing alt text detection
- Filter to show only images missing alt attributes
- Bulk select and download images
- Thumbnail preview for each image

### Structured Data
- JSON-LD schema type detection
- One-click validation via Schema.org Validator
- One-click validation via Google Rich Results Test

### Sitemap Analysis
- Sitemap URL detection and parsing
- Select and highlight sitemap URLs on the page
- Copy or export sitemap URLs as CSV

### DNS & Domain Info
- IP address, hosting provider, and server detection
- SSL certificate status
- Response time measurement

### SEO Scoring
- Real-time 0-100 SEO score calculated per page
- Color-coded toolbar icon (green/yellow/red) based on score
- Badge count showing total issues detected
- Categorized issues: errors vs. warnings

## Installation

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top right)
4. Click **Load unpacked** and select the `sean-seo-checker-v2.1` folder
5. The extension icon will appear in your toolbar

## Versions

| Version | Status |
|---------|--------|
| v2.1 | Source code included (`sean-seo-checker-v2.1/`) |
| v2.2 | Packaged release (`sean-seo-checker-v2.2.zip`) |

## Code Review Notes

- **Missing `downloads` permission** in `manifest.json` — the extension uses `chrome.downloads.download()` for image and CSV exports, but `downloads` is not listed in the permissions array. Add `"downloads"` to the `permissions` field to prevent runtime errors.
- **Deprecated API usage** — `performance.timing` (used in `background.js`) is deprecated in favor of `PerformanceNavigationTiming`. Functional for now but should be updated.
- **Sitemap analysis is a stub** — the `analyzeSitemap()` function in `popup.js` returns hardcoded placeholder data rather than parsing actual sitemap XML.

## License

MIT

---

Made with 💛 by Sean G
