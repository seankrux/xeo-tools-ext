// XEO SEO Checker v2.0 - Background Script

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    performAnalysis(tabId, tab.url);
  }
});

// Listen for tab activation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab.url && tab.url.startsWith('http')) {
    updateIcon(activeInfo.tabId);
  }
});

// Listen for navigation
chrome.webNavigation.onCompleted.addListener((details) => {
  if (details.frameId === 0) {
    performAnalysis(details.tabId, details.url);
  }
});

// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'reanalyze') {
    chrome.tabs.get(request.tabId, (tab) => {
      performAnalysis(request.tabId, tab.url);
    });
  }
  return true;
});

// Perform SEO analysis
async function performAnalysis(tabId, url) {
  try {
    if (!url || !url.startsWith('http')) {
      updateIconState(tabId, 'unsupported');
      return;
    }
    
    updateIconState(tabId, 'analyzing');
    
    // Inject and execute analysis
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: analyzePageContent
    });
    
    if (results && results[0] && results[0].result) {
      const analysis = results[0].result;
      analysis.url = url;
      analysis.timestamp = Date.now();
      
      // Calculate score
      analysis.score = calculateSEOScore(analysis);
      
      // Generate issues
      analysis.issues = generateIssues(analysis);
      
      // Store analysis
      const key = `analysis_${tabId}`;
      await chrome.storage.local.set({ [key]: analysis });
      
      // Update icon based on score
      updateIconBasedOnScore(tabId, analysis.score, analysis.issues);
    }
  } catch (error) {
    // Analysis failed for this tab
    updateIconState(tabId, 'error');
  }
}

// Analyze page content (injected function)
function analyzePageContent() {
  const data = {
    overview: {},
    content: {},
    links: {},
    images: {},
    schema: {},
    performance: {}
  };
  
  // Overview
  const title = document.title || '';
  const description = document.querySelector('meta[name="description"]')?.content || '';
  const canonical = document.querySelector('link[rel="canonical"]')?.href || '';
  const robots = document.querySelector('meta[name="robots"]')?.content || '';
  
  data.overview = {
    title,
    titleLength: title.length,
    description,
    descriptionLength: description.length,
    canonical,
    robots
  };
  
  // Content - collect headings in page order
  const allHeadingsInOrder = [];
  document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h, globalIndex) => {
    allHeadingsInOrder.push({
      level: h.tagName.toLowerCase(),
      text: h.textContent.trim(),
      globalIndex
    });
  });
  
  // Also group by level for backward compatibility
  const headings = { h1: [], h2: [], h3: [], h4: [], h5: [], h6: [] };
  allHeadingsInOrder.forEach(h => {
    headings[h.level].push({ text: h.text, globalIndex: h.globalIndex });
  });
  
  const bodyText = document.body.innerText || '';
  const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;
  
  data.content = {
    headings,
    allHeadingsInOrder,
    wordCount
  };
  
  // Links
  const links = [];
  const currentDomain = window.location.hostname;
  let internal = 0;
  let external = 0;
  let nofollow = 0;
  
  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.href;
    const isInternal = link.hostname === currentDomain;
    const rel = link.rel || '';
    const isNofollow = rel.includes('nofollow');
    
    if (isInternal) internal++;
    else external++;
    if (isNofollow) nofollow++;
    
    links.push({
      href,
      text: link.textContent.trim().substring(0, 100),
      isInternal,
      rel
    });
  });
  
  data.links = {
    total: links.length,
    internal,
    external,
    nofollow,
    details: links
  };
  
  // Images
  const images = [];
  let withoutAlt = 0;
  
  document.querySelectorAll('img').forEach(img => {
    const alt = img.alt || '';
    if (!alt) withoutAlt++;
    
    images.push({
      src: img.src,
      alt
    });
  });
  
  data.images = {
    total: images.length,
    withoutAlt,
    details: images
  };
  
  // Schema
  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  const types = [];
  
  scripts.forEach(script => {
    try {
      const json = JSON.parse(script.textContent);
      if (json['@type']) {
        types.push(json['@type']);
      } else if (json['@graph']) {
        json['@graph'].forEach(item => {
          if (item['@type']) types.push(item['@type']);
        });
      }
    } catch (e) {
      // Invalid JSON
    }
  });
  
  data.schema = {
    found: types.length > 0,
    types: [...new Set(types)]
  };
  
  // Performance
  const timing = performance.timing;
  const loadTime = timing.loadEventEnd - timing.navigationStart;
  const domReady = timing.domContentLoadedEventEnd - timing.navigationStart;
  
  data.performance = {
    loadTime,
    domReady
  };
  
  return data;
}

// Calculate SEO score (0-100)
function calculateSEOScore(analysis) {
  let score = 100;
  
  // Title (15 points)
  if (!analysis.overview.title) {
    score -= 15;
  } else if (analysis.overview.titleLength < 30 || analysis.overview.titleLength > 60) {
    score -= 7;
  }
  
  // Description (10 points)
  if (!analysis.overview.description) {
    score -= 10;
  } else if (analysis.overview.descriptionLength < 120 || analysis.overview.descriptionLength > 160) {
    score -= 5;
  }
  
  // H1 (15 points)
  const h1Count = (analysis.content.headings.h1 || []).length;
  if (h1Count === 0) {
    score -= 15;
  } else if (h1Count > 1) {
    score -= 10;
  }
  
  // Content (20 points)
  if (analysis.content.wordCount < 300) {
    score -= 15;
  } else if (analysis.content.wordCount < 500) {
    score -= 10;
  } else if (analysis.content.wordCount < 1000) {
    score -= 5;
  }
  
  // Images (10 points)
  if (analysis.images.total > 0) {
    const altRatio = 1 - (analysis.images.withoutAlt / analysis.images.total);
    score -= Math.round((1 - altRatio) * 10);
  }
  
  // Internal links (10 points)
  if (analysis.links.internal === 0) {
    score -= 10;
  } else if (analysis.links.internal < 3) {
    score -= 5;
  }
  
  // External links (5 points)
  if (analysis.links.external === 0) {
    score -= 5;
  }
  
  // Schema (5 points)
  if (!analysis.schema.found) {
    score -= 5;
  }
  
  // Load time (10 points)
  if (analysis.performance.loadTime > 5000) {
    score -= 10;
  } else if (analysis.performance.loadTime > 3000) {
    score -= 7;
  } else if (analysis.performance.loadTime > 1000) {
    score -= 3;
  }
  
  // Canonical (5 points)
  if (!analysis.overview.canonical) {
    score -= 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Generate issues list
function generateIssues(analysis) {
  const errors = [];
  const warnings = [];
  
  // Title
  if (!analysis.overview.title) {
    errors.push('Missing title tag');
  } else if (analysis.overview.titleLength < 30) {
    warnings.push('Title is too short (< 30 characters)');
  } else if (analysis.overview.titleLength > 60) {
    warnings.push('Title is too long (> 60 characters)');
  }
  
  // Description
  if (!analysis.overview.description) {
    errors.push('Missing meta description');
  } else if (analysis.overview.descriptionLength < 120) {
    warnings.push('Meta description is too short (< 120 characters)');
  } else if (analysis.overview.descriptionLength > 160) {
    warnings.push('Meta description is too long (> 160 characters)');
  }
  
  // H1
  const h1Count = (analysis.content.headings.h1 || []).length;
  if (h1Count === 0) {
    errors.push('Missing H1 heading');
  } else if (h1Count > 1) {
    warnings.push(`Multiple H1 headings found (${h1Count})`);
  }
  
  // Content
  if (analysis.content.wordCount < 300) {
    errors.push(`Low word count (${analysis.content.wordCount} words)`);
  } else if (analysis.content.wordCount < 500) {
    warnings.push(`Word count could be higher (${analysis.content.wordCount} words)`);
  }
  
  // Images
  if (analysis.images.withoutAlt > 0) {
    warnings.push(`${analysis.images.withoutAlt} image(s) missing alt text`);
  }
  
  // Links
  if (analysis.links.internal === 0) {
    warnings.push('No internal links found');
  }
  
  if (analysis.links.external === 0) {
    warnings.push('No external links found');
  }
  
  // Schema
  if (!analysis.schema.found) {
    warnings.push('No structured data found');
  }
  
  // Canonical
  if (!analysis.overview.canonical) {
    warnings.push('Missing canonical URL');
  }
  
  // Performance
  if (analysis.performance.loadTime > 3000) {
    warnings.push(`Slow load time (${analysis.performance.loadTime}ms)`);
  }
  
  return { errors, warnings };
}

// Update icon based on score
function updateIconBasedOnScore(tabId, score, issues) {
  let iconColor = 'green';
  
  const errorCount = (issues.errors || []).length;
  const warningCount = (issues.warnings || []).length;
  const totalIssues = errorCount + warningCount;
  
  if (score < 50 || errorCount > 0) {
    iconColor = 'red';
  } else if (score < 70 || warningCount > 0) {
    iconColor = 'yellow';
  }
  
  // Set icon
  chrome.action.setIcon({
    tabId: tabId,
    path: {
      16: `icons/icon-${iconColor}-16.png`,
      32: `icons/icon-${iconColor}-32.png`,
      48: `icons/icon-${iconColor}-48.png`,
      128: `icons/icon-${iconColor}-128.png`
    }
  });
  
  // Set badge
  if (totalIssues > 0) {
    chrome.action.setBadgeText({
      tabId: tabId,
      text: totalIssues.toString()
    });
    
    chrome.action.setBadgeBackgroundColor({
      tabId: tabId,
      color: errorCount > 0 ? '#ef4444' : '#f59e0b'
    });
  } else {
    chrome.action.setBadgeText({ tabId: tabId, text: '' });
  }
}

// Update icon state
function updateIconState(tabId, state) {
  const icons = {
    analyzing: 'gray',
    error: 'gray',
    unsupported: 'gray'
  };
  
  const iconColor = icons[state] || 'gray';
  
  chrome.action.setIcon({
    tabId: tabId,
    path: {
      16: `icons/icon-${iconColor}-16.png`,
      32: `icons/icon-${iconColor}-32.png`,
      48: `icons/icon-${iconColor}-48.png`,
      128: `icons/icon-${iconColor}-128.png`
    }
  });
  
  if (state === 'analyzing') {
    chrome.action.setBadgeText({ tabId: tabId, text: '...' });
    chrome.action.setBadgeBackgroundColor({ tabId: tabId, color: '#71717a' });
  }
}

// Update icon when switching tabs
async function updateIcon(tabId) {
  const key = `analysis_${tabId}`;
  const result = await chrome.storage.local.get(key);
  
  if (result[key]) {
    updateIconBasedOnScore(tabId, result[key].score, result[key].issues);
  } else {
    updateIconState(tabId, 'gray');
  }
}

