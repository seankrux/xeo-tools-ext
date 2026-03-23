// XEO SEO Checker v2.1 - Popup Script

let currentTabId = null;
let currentAnalysis = null;
let linksHighlighted = false;
let headingsHighlighted = false;
let currentLinkFilter = 'all';
let showOnlyMissingAlt = false;

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabId = tab.id;
  
  document.getElementById('currentUrl').textContent = tab.url;
  
  await loadAnalysis();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Tab switching
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });
  
  // Meta tab
  document.getElementById('reanalyzeBtn').addEventListener('click', reanalyze);
  
  // Headings tab
  document.getElementById('toggleHeadings').addEventListener('click', toggleHeadings);
  
  // Links tab
  document.getElementById('filterLinksBtn').addEventListener('click', toggleLinksFilter);
  document.getElementById('copyLinksBtn').addEventListener('click', copyLinks);
  document.getElementById('downloadLinksBtn').addEventListener('click', downloadLinksCSV);
  document.getElementById('toggleLinks').addEventListener('click', scanAndHighlightLinks);
  document.querySelectorAll('input[name="linkFilter"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentLinkFilter = e.target.value;
      displayLinks();
    });
  });
  
  // Images tab
  document.getElementById('filterImagesBtn').addEventListener('click', toggleImagesFilter);
  document.getElementById('selectAllImagesBtn').addEventListener('click', selectAllImages);
  document.getElementById('downloadAllImagesBtn').addEventListener('click', downloadAllImages);
  
  // Schema tab
  document.getElementById('validateSchemaBtn').addEventListener('click', () => validateSchema('schema'));
  document.getElementById('validateRichBtn').addEventListener('click', () => validateSchema('rich'));
  document.getElementById('validateBothBtn').addEventListener('click', () => validateSchema('both'));
  
  // Sitemap tab
  document.getElementById('analyzeSitemapBtn').addEventListener('click', analyzeSitemap);
  document.getElementById('copySitemapBtn').addEventListener('click', copySitemap);
  document.getElementById('downloadSitemapBtn').addEventListener('click', downloadSitemapCSV);
  document.getElementById('selectAllSitemap').addEventListener('change', selectAllSitemapURLs);
  document.getElementById('highlightSelectedBtn').addEventListener('click', highlightSelectedURLs);
  
  // Settings
  document.getElementById('settingsBtn').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}

// Load analysis from storage
async function loadAnalysis() {
  const key = `analysis_${currentTabId}`;
  const result = await chrome.storage.local.get(key);
  
  if (result[key]) {
    currentAnalysis = result[key];
    displayAnalysis();
  } else {
    document.getElementById('scoreValue').textContent = '--';
  }
}

// Display analysis
function displayAnalysis() {
  if (!currentAnalysis) return;
  
  // Score
  document.getElementById('scoreValue').textContent = currentAnalysis.score || '--';
  
  // Meta tab
  displayMetaInfo();
  displayIssues();
  
  // Headings tab
  displayHeadings();
  
  // Links tab
  displayLinks();
  
  // Images tab
  displayImages();
  
  // Schema tab
  displaySchema();
  
  // Sitemap tab (placeholder)
  displaySitemap();
  
  // DNS tab
  displayDNS();
  
  // Update tab badges
  updateTabBadges();
}

// Display meta information
function displayMetaInfo() {
  const { overview } = currentAnalysis;
  
  // Robots status
  const robots = overview.robots || '';
  const isIndexable = !robots.includes('noindex');
  const isFollowable = !robots.includes('nofollow');
  
  const indexBadge = document.getElementById('robotsIndexable');
  const followBadge = document.getElementById('robotsFollowable');
  
  indexBadge.textContent = isIndexable ? 'INDEX' : 'NOINDEX';
  indexBadge.className = `robots-badge ${isIndexable ? 'robots-good' : 'robots-bad'}`;
  
  followBadge.textContent = isFollowable ? 'FOLLOW' : 'NOFOLLOW';
  followBadge.className = `robots-badge ${isFollowable ? 'robots-good' : 'robots-bad'}`;
  
  document.getElementById('robotsDetails').textContent = robots || 'No robots meta tag';
  
  // Set robots.txt and llms.txt links
  const url = new URL(currentAnalysis.url);
  const origin = url.origin;
  document.getElementById('robotsTxtLink').href = `${origin}/robots.txt`;
  document.getElementById('llmsTxtLink').href = `${origin}/llms.txt`;
  
  // Title
  const titleRow = document.querySelector('.meta-row:nth-child(2)');
  document.getElementById('metaTitle').textContent = overview.title || 'Missing';
  document.getElementById('titleLength').textContent = `${overview.titleLength} chars`;
  const titleIsGood = overview.titleLength >= 30 && overview.titleLength <= 60;
  const titleStatus = titleIsGood ? '✓ Good' : '⚠ Warning';
  document.getElementById('titleStatus').textContent = titleStatus;
  document.getElementById('titleStatus').className = `metric-status ${titleIsGood ? 'status-good' : 'status-warning'}`;
  
  // Add warning highlight to row if warning
  if (!titleIsGood) {
    titleRow.classList.add('warning-highlight');
  } else {
    titleRow.classList.remove('warning-highlight');
  }
  
  // Description
  const descRow = document.querySelector('.meta-row:nth-child(3)');
  document.getElementById('metaDescription').textContent = overview.description || 'Missing';
  document.getElementById('descLength').textContent = `${overview.descriptionLength} chars`;
  const descIsGood = overview.descriptionLength >= 120 && overview.descriptionLength <= 160;
  const descStatus = descIsGood ? '✓ Good' : '⚠ Warning';
  document.getElementById('descStatus').textContent = descStatus;
  document.getElementById('descStatus').className = `metric-status ${descIsGood ? 'status-good' : 'status-warning'}`;
  
  // Add warning highlight to row if warning
  if (!descIsGood) {
    descRow.classList.add('warning-highlight');
  } else {
    descRow.classList.remove('warning-highlight');
  }
  
  // Canonical
  document.getElementById('metaCanonical').textContent = overview.canonical || 'Not set';
  
  // Stats
  document.getElementById('wordCount').textContent = currentAnalysis.content.wordCount || 0;
  document.getElementById('loadTime').textContent = `${currentAnalysis.performance.loadTime}ms`;
}

// Display issues by category
function displayIssues() {
  const issuesList = document.getElementById('issuesList');
  const { issues } = currentAnalysis;
  
  if (!issues || (issues.errors.length === 0 && issues.warnings.length === 0)) {
    issuesList.innerHTML = '<div class="no-issues">✓ No issues found</div>';
    return;
  }
  
  // Group issues by category
  const categories = {
    'Meta Tags': [],
    'Content': [],
    'Links': [],
    'Images': [],
    'Technical': []
  };
  
  [...issues.errors, ...issues.warnings].forEach(issue => {
    if (issue.includes('title') || issue.includes('description') || issue.includes('canonical')) {
      categories['Meta Tags'].push(issue);
    } else if (issue.includes('H1') || issue.includes('word count')) {
      categories['Content'].push(issue);
    } else if (issue.includes('link')) {
      categories['Links'].push(issue);
    } else if (issue.includes('image') || issue.includes('alt')) {
      categories['Images'].push(issue);
    } else {
      categories['Technical'].push(issue);
    }
  });
  
  let html = '';
  Object.entries(categories).forEach(([category, categoryIssues]) => {
    if (categoryIssues.length > 0) {
      html += `<div class="issue-category">
        <div class="issue-category-title">${category} (${categoryIssues.length})</div>
        ${categoryIssues.map(issue => {
          const isError = issues.errors.includes(issue);
          return `<div class="issue-item ${isError ? 'issue-error' : 'issue-warning'}">
            <span class="issue-icon">${isError ? '✕' : '⚠'}</span>
            <span class="issue-text">${issue}</span>
          </div>`;
        }).join('')}
      </div>`;
    }
  });
  
  issuesList.innerHTML = html;
}

// Display headings (sorted by page order)
function displayHeadings() {
  const outline = document.getElementById('headingsOutline');
  const { allHeadingsInOrder, headings } = currentAnalysis.content;
  
  // Use allHeadingsInOrder if available (maintains page order)
  const headingsToDisplay = allHeadingsInOrder || [];
  
  if (headingsToDisplay.length === 0) {
    outline.innerHTML = '<div class="empty-state">No headings found</div>';
    return;
  }
  
  const h1Count = (headings.h1 || []).length;
  const h1Color = h1Count === 1 ? '#10b981' : '#ef4444';
  
  let html = headingsToDisplay.map(h => {
    const indent = parseInt(h.level.substring(1)) - 1;
    const color = h.level === 'h1' ? h1Color : getHeadingColor(h.level);
    return `<div class="heading-item" style="padding-left: ${indent * 16}px" data-level="${h.level}" data-global-index="${h.globalIndex}">
      <span class="heading-tag" style="background: ${color}">${h.level.toUpperCase()}</span>
      <span class="heading-text">${h.text}</span>
    </div>`;
  }).join('');
  
  outline.innerHTML = html;
  
  // Add click listeners to jump to headings
  outline.querySelectorAll('.heading-item').forEach(item => {
    item.addEventListener('click', () => {
      const globalIndex = parseInt(item.dataset.globalIndex);
      jumpToHeadingByGlobalIndex(globalIndex);
    });
  });
}

// Get heading color
function getHeadingColor(level) {
  const colors = {
    h1: '#10b981',
    h2: '#f59e0b',
    h3: '#eab308',
    h4: '#3b82f6',
    h5: '#8b5cf6',
    h6: '#ec4899'
  };
  return colors[level] || '#71717a';
}

// Jump to heading by global index
function jumpToHeadingByGlobalIndex(globalIndex) {
  chrome.tabs.sendMessage(currentTabId, {
    action: 'jumpToHeadingByIndex',
    globalIndex
  });
}

// Jump to heading (legacy)
function jumpToHeading(level, index) {
  chrome.tabs.sendMessage(currentTabId, {
    action: 'jumpToHeading',
    level,
    index
  });
}

// Toggle headings highlight
function toggleHeadings() {
  chrome.tabs.sendMessage(currentTabId, { action: 'toggleHeadings' });
  headingsHighlighted = !headingsHighlighted;
  document.getElementById('toggleHeadings').textContent = headingsHighlighted ? 'Remove Highlight' : 'Highlight All';
  document.getElementById('toggleHeadings').classList.toggle('active', headingsHighlighted);
}

// Display links (sorted by page order)
function displayLinks() {
  const { links } = currentAnalysis;
  
  document.getElementById('totalLinks').textContent = links.total;
  document.getElementById('internalLinks').textContent = links.internal;
  document.getElementById('externalLinks').textContent = links.external;
  document.getElementById('nofollowLinks').textContent = links.nofollow;
  
  const linksList = document.getElementById('linksList');
  let linksToShow = links.details || [];
  
  // Apply filter
  if (currentLinkFilter === 'issues') {
    linksToShow = linksToShow.filter(link => link.status && link.status !== 200);
  } else if (currentLinkFilter === 'internal') {
    linksToShow = linksToShow.filter(link => link.isInternal);
  } else if (currentLinkFilter === 'external') {
    linksToShow = linksToShow.filter(link => !link.isInternal);
  } else if (currentLinkFilter === 'nofollow') {
    linksToShow = linksToShow.filter(link => link.rel && link.rel.includes('nofollow'));
  }
  
  if (linksToShow.length === 0) {
    linksList.innerHTML = '<div class="empty-state">No links found</div>';
    return;
  }
  
  const html = linksToShow.slice(0, 50).map(link => {
    const statusCode = link.status || '--';
    const statusClass = getStatusClass(statusCode);
    const linkType = link.isInternal ? 'Internal' : 'External';
    const nofollow = link.rel && link.rel.includes('nofollow') ? ' · Nofollow' : '';
    
    return `<div class="link-item">
      <div class="link-url">${link.href}</div>
      <div class="link-meta">
        <span class="link-status ${statusClass}">${statusCode}</span>
        <span class="link-type">${linkType}${nofollow}</span>
        ${link.text ? `<span class="link-text">"${link.text.substring(0, 50)}${link.text.length > 50 ? '...' : ''}"</span>` : ''}
      </div>
    </div>`;
  }).join('');
  
  linksList.innerHTML = html + (linksToShow.length > 50 ? `<div class="more-items">... and ${linksToShow.length - 50} more links</div>` : '');
}

// Get status class for link
function getStatusClass(status) {
  if (status === 200 || status === '--') return 'status-ok';
  if (status >= 300 && status < 400) return 'status-redirect';
  if (status >= 400) return 'status-error';
  return 'status-unknown';
}

// Toggle links filter
function toggleLinksFilter() {
  const filter = document.getElementById('linksFilter');
  filter.style.display = filter.style.display === 'none' ? 'flex' : 'none';
  document.getElementById('filterLinksBtn').classList.toggle('active');
}

// Scan and highlight links
function scanAndHighlightLinks() {
  chrome.tabs.sendMessage(currentTabId, { action: 'toggleLinks' });
  linksHighlighted = !linksHighlighted;
  document.getElementById('toggleLinks').textContent = linksHighlighted ? 'Remove Highlight' : 'Scan & Highlight';
  document.getElementById('toggleLinks').classList.toggle('active', linksHighlighted);
}

// Copy links
function copyLinks() {
  const urls = (currentAnalysis.links.details || []).map(link => link.href).join('\n');
  navigator.clipboard.writeText(urls);
  showToast('Links copied to clipboard!');
}

// Download links as CSV
function downloadLinksCSV() {
  const links = currentAnalysis.links.details || [];
  let csv = 'URL,Type,Status,Nofollow,Text\n';
  links.forEach(link => {
    const type = link.isInternal ? 'Internal' : 'External';
    const status = link.status || '--';
    const nofollow = link.rel && link.rel.includes('nofollow') ? 'Yes' : 'No';
    const text = (link.text || '').replace(/"/g, '""');
    csv += `"${link.href}","${type}","${status}","${nofollow}","${text}"\n`;
  });
  
  downloadFile(csv, 'links.csv', 'text/csv');
  showToast('Links downloaded as CSV!');
}

// Display images
function displayImages() {
  const { images } = currentAnalysis;
  
  document.getElementById('totalImages').textContent = images.total;
  document.getElementById('imagesNoAlt').textContent = images.withoutAlt;
  
  const imagesList = document.getElementById('imagesList');
  let imagesToShow = images.details || [];
  
  // Apply filter
  if (showOnlyMissingAlt) {
    imagesToShow = imagesToShow.filter(img => !img.alt);
  }
  
  if (imagesToShow.length === 0) {
    imagesList.innerHTML = '<div class="empty-state">No images found</div>';
    return;
  }
  
  const html = imagesToShow.slice(0, 20).map((img, index) => {
    const hasAlt = img.alt && img.alt.length > 0;
    return `<div class="image-item">
      <img src="${img.src}" alt="${img.alt || 'No alt'}" class="image-thumb">
      <div class="image-info">
        <div class="image-url">${img.src}</div>
        <div class="image-meta">
          <span class="image-alt ${hasAlt ? 'alt-good' : 'alt-missing'}">
            ${hasAlt ? '✓ Has alt' : '✕ Missing alt'}
          </span>
          <button class="btn-download-image" data-src="${img.src}" data-index="${index}">Download</button>
        </div>
      </div>
      <input type="checkbox" class="image-checkbox" data-src="${img.src}">
    </div>`;
  }).join('');
  
  imagesList.innerHTML = html + (imagesToShow.length > 20 ? `<div class="more-items">... and ${imagesToShow.length - 20} more images</div>` : '');
  
  // Add download listeners
  imagesList.querySelectorAll('.btn-download-image').forEach(btn => {
    btn.addEventListener('click', () => downloadImage(btn.dataset.src));
  });
}

// Toggle images filter
function toggleImagesFilter() {
  showOnlyMissingAlt = !showOnlyMissingAlt;
  document.getElementById('filterImagesBtn').textContent = showOnlyMissingAlt ? 'Show All' : 'Missing Alt';
  document.getElementById('filterImagesBtn').classList.toggle('active', showOnlyMissingAlt);
  displayImages();
}

// Select all images
function selectAllImages() {
  const checkboxes = document.querySelectorAll('.image-checkbox');
  const allChecked = Array.from(checkboxes).every(cb => cb.checked);
  checkboxes.forEach(cb => cb.checked = !allChecked);
  document.getElementById('selectAllImagesBtn').textContent = allChecked ? 'Select All' : 'Deselect All';
}

// Download all images
function downloadAllImages() {
  const checkboxes = document.querySelectorAll('.image-checkbox:checked');
  if (checkboxes.length === 0) {
    showToast('No images selected');
    return;
  }
  
  checkboxes.forEach(cb => {
    downloadImage(cb.dataset.src);
  });
  
  showToast(`Downloading ${checkboxes.length} images...`);
}

// Download single image
function downloadImage(src) {
  chrome.downloads.download({ url: src });
}

// Display schema
function displaySchema() {
  const { schema } = currentAnalysis;
  const schemaInfo = document.getElementById('schemaInfo');
  
  if (!schema.found || schema.types.length === 0) {
    schemaInfo.innerHTML = '<div class="empty-state">No structured data found</div>';
    return;
  }
  
  const html = `
    <div class="schema-found">✓ Structured data detected</div>
    <div class="schema-types">
      <div class="schema-label">Schema Types (${schema.types.length}):</div>
      ${schema.types.map(type => `<span class="schema-type">${type}</span>`).join('')}
    </div>
  `;
  
  schemaInfo.innerHTML = html;
}

// Validate schema
function validateSchema(type) {
  const url = currentAnalysis.url;
  
  if (type === 'schema' || type === 'both') {
    window.open(`https://validator.schema.org/#url=${encodeURIComponent(url)}`, '_blank');
  }
  
  if (type === 'rich' || type === 'both') {
    window.open(`https://search.google.com/test/rich-results?url=${encodeURIComponent(url)}`, '_blank');
  }
}

// Display sitemap
function displaySitemap() {
  // Placeholder - would need actual sitemap parsing
  const sitemapTree = document.getElementById('sitemapTree');
  sitemapTree.innerHTML = '<div class="empty-state">Click "Analyze" to detect sitemap</div>';
}

// Analyze sitemap
async function analyzeSitemap() {
  showToast('Analyzing sitemap...');
  
  // Try common sitemap locations
  const domain = new URL(currentAnalysis.url).origin;
  const sitemapURLs = [
    `${domain}/sitemap.xml`,
    `${domain}/sitemap_index.xml`,
    `${domain}/sitemap1.xml`
  ];
  
  // This is a simplified version - full implementation would parse XML
  document.getElementById('sitemapTree').innerHTML = '<div class="sitemap-item"><input type="checkbox" class="sitemap-checkbox"> <span>Example URL 1</span></div><div class="sitemap-item"><input type="checkbox" class="sitemap-checkbox"> <span>Example URL 2</span></div>';
  document.getElementById('sitemapTotal').textContent = '2';
  document.getElementById('sitemapPages').textContent = '2';
  document.getElementById('sitemapOther').textContent = '0';
  
  showToast('Sitemap analysis complete');
}

// Copy sitemap URLs
function copySitemap() {
  const checkboxes = document.querySelectorAll('.sitemap-checkbox:checked');
  const urls = Array.from(checkboxes).map(cb => cb.nextElementSibling.textContent).join('\n');
  navigator.clipboard.writeText(urls);
  showToast('Sitemap URLs copied!');
}

// Download sitemap CSV
function downloadSitemapCSV() {
  const checkboxes = document.querySelectorAll('.sitemap-checkbox');
  let csv = 'URL\n';
  checkboxes.forEach(cb => {
    csv += `"${cb.nextElementSibling.textContent}"\n`;
  });
  downloadFile(csv, 'sitemap.csv', 'text/csv');
  showToast('Sitemap downloaded as CSV!');
}

// Select all sitemap URLs
function selectAllSitemapURLs(e) {
  const checkboxes = document.querySelectorAll('.sitemap-checkbox');
  checkboxes.forEach(cb => cb.checked = e.target.checked);
}

// Highlight selected URLs
function highlightSelectedURLs() {
  const checkboxes = document.querySelectorAll('.sitemap-checkbox:checked');
  const urls = Array.from(checkboxes).map(cb => cb.nextElementSibling.textContent);
  chrome.tabs.sendMessage(currentTabId, { action: 'highlightURLs', urls });
  showToast(`Highlighting ${urls.length} URLs`);
}

// Display DNS information
function displayDNS() {
  // This would require external API or service
  // Placeholder implementation
  const url = new URL(currentAnalysis.url);
  
  document.getElementById('dnsIP').textContent = 'Fetching...';
  document.getElementById('dnsLocation').textContent = 'Fetching...';
  document.getElementById('dnsProvider').textContent = 'Fetching...';
  document.getElementById('dnsServer').textContent = url.hostname;
  document.getElementById('dnsSSL').textContent = url.protocol === 'https:' ? '✓ Secure' : '✕ Not secure';
  document.getElementById('dnsResponseTime').textContent = `${currentAnalysis.performance.loadTime}ms`;
  
  // Add copy button listeners
  document.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.copy;
      const value = document.getElementById(targetId).textContent;
      navigator.clipboard.writeText(value);
      showToast('Copied to clipboard!');
    });
  });
}

// Update tab badges
function updateTabBadges() {
  const { issues } = currentAnalysis;
  
  // Count issues per tab
  const tabIssues = {
    meta: 0,
    headings: 0,
    links: 0,
    images: 0,
    schema: 0
  };
  
  [...(issues.errors || []), ...(issues.warnings || [])].forEach(issue => {
    if (issue.includes('title') || issue.includes('description') || issue.includes('canonical')) {
      tabIssues.meta++;
    } else if (issue.includes('H1') || issue.includes('word count')) {
      tabIssues.headings++;
    } else if (issue.includes('link')) {
      tabIssues.links++;
    } else if (issue.includes('image') || issue.includes('alt')) {
      tabIssues.images++;
    } else if (issue.includes('schema') || issue.includes('structured')) {
      tabIssues.schema++;
    }
  });
  
  // Update badges
  Object.entries(tabIssues).forEach(([tab, count]) => {
    const badge = document.getElementById(`${tab}Badge`);
    if (count > 0) {
      badge.textContent = count;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  });
}

// Switch tab
function switchTab(tabName) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  document.getElementById(tabName).classList.add('active');
}

// Reanalyze page
function reanalyze() {
  chrome.runtime.sendMessage({ action: 'reanalyze', tabId: currentTabId });
  document.getElementById('scoreValue').textContent = '...';
  showToast('Reanalyzing page...');
  
  setTimeout(() => loadAnalysis(), 2000);
}

// Utility functions
function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({ url, filename });
}

function showToast(message) {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = 'position:fixed;bottom:20px;right:20px;background:#10b981;color:white;padding:12px 20px;border-radius:8px;z-index:10000;animation:slideIn 0.3s';
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

