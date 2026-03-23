// XEO SEO Checker v2.0 - Content Script

let headingsHighlighted = false;
let linksHighlighted = false;
let allHeadings = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleHeadings') {
    toggleHeadingsHighlight();
  } else if (request.action === 'toggleLinks') {
    toggleLinksHighlight();
  } else if (request.action === 'jumpToHeading') {
    jumpToHeading(request.level, request.index);
  } else if (request.action === 'jumpToHeadingByIndex') {
    jumpToHeadingByGlobalIndex(request.globalIndex);
  } else if (request.action === 'highlightURLs') {
    highlightSpecificURLs(request.urls);
  }
  return true;
});

function toggleHeadingsHighlight() {
  if (headingsHighlighted) {
    removeHeadingsHighlight();
  } else {
    highlightHeadings();
  }
  headingsHighlighted = !headingsHighlighted;
}

function highlightHeadings() {
  removeHeadingsHighlight();
  
  const headingLevels = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
  const colors = {
    h1: '#10b981',
    h2: '#f59e0b',
    h3: '#eab308',
    h4: '#3b82f6',
    h5: '#8b5cf6',
    h6: '#ec4899'
  };
  
  allHeadings = [];
  
  headingLevels.forEach(level => {
    const headings = document.querySelectorAll(level);
    headings.forEach((heading, index) => {
      heading.classList.add('sg-seo-heading-highlighted');
      heading.setAttribute('data-sg-heading-level', level);
      heading.setAttribute('data-sg-heading-index', index);
      heading.style.outline = `3px solid ${colors[level]}`;
      heading.style.outlineOffset = '2px';
      heading.style.position = 'relative';
      
      const label = document.createElement('span');
      label.className = 'sg-seo-heading-label';
      label.textContent = level.toUpperCase();
      label.style.cssText = `
        position: absolute;
        top: -12px;
        left: -3px;
        background: ${colors[level]};
        color: white;
        padding: 2px 6px;
        font-size: 10px;
        font-weight: 700;
        border-radius: 3px;
        z-index: 999999;
        font-family: monospace;
      `;
      heading.insertBefore(label, heading.firstChild);
      
      allHeadings.push({ element: heading, level, index });
    });
  });
}

function removeHeadingsHighlight() {
  document.querySelectorAll('.sg-seo-heading-highlighted').forEach(heading => {
    heading.classList.remove('sg-seo-heading-highlighted');
    heading.style.outline = '';
    heading.style.outlineOffset = '';
    const label = heading.querySelector('.sg-seo-heading-label');
    if (label) label.remove();
  });
  allHeadings = [];
}

function jumpToHeadingByGlobalIndex(globalIndex) {
  const allHeadingsOnPage = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const heading = allHeadingsOnPage[globalIndex];
  
  if (heading) {
    const originalOutline = heading.style.outline;
    const originalBackground = heading.style.background;
    
    heading.style.outline = '5px solid #6366f1';
    heading.style.outlineOffset = '3px';
    heading.style.background = 'rgba(99, 102, 241, 0.2)';
    heading.style.transition = 'all 0.3s';
    
    heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
      heading.style.outline = originalOutline || '';
      heading.style.background = originalBackground || '';
    }, 2000);
  }
}

function jumpToHeading(level, index) {
  const heading = document.querySelector(`${level}[data-sg-heading-index="${index}"]`) ||
                  document.querySelectorAll(level)[index];
  
  if (heading) {
    const originalOutline = heading.style.outline;
    heading.style.outline = '5px solid #6366f1';
    heading.style.outlineOffset = '3px';
    heading.style.transition = 'outline 0.3s';
    
    heading.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    setTimeout(() => {
      heading.style.outline = originalOutline || '';
    }, 1500);
  }
}

function toggleLinksHighlight() {
  if (linksHighlighted) {
    removeLinksHighlight();
  } else {
    highlightLinks();
  }
  linksHighlighted = !linksHighlighted;
}

function highlightLinks() {
  removeLinksHighlight();
  
  const links = document.querySelectorAll('a[href]');
  const currentDomain = window.location.hostname;
  
  links.forEach(link => {
    const href = link.href;
    
    if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      return;
    }
    
    const isInternal = link.hostname === currentDomain;
    const isNofollow = link.rel && link.rel.includes('nofollow');
    
    link.classList.add('sg-seo-link-highlighted');
    
    let color = '#10b981';
    let borderStyle = 'solid';
    
    if (isNofollow) {
      color = '#f59e0b';
    }
    
    if (!isInternal) {
      borderStyle = 'dashed';
    }
    
    link.style.outline = `2px ${borderStyle} ${color}`;
    link.style.outlineOffset = '1px';
    
    const label = document.createElement('span');
    label.className = 'sg-seo-link-label';
    label.textContent = isInternal ? 'INT' : 'EXT';
    if (isNofollow) label.textContent += ' NF';
    label.style.cssText = `
      position: absolute;
      background: ${color};
      color: white;
      padding: 1px 4px;
      font-size: 9px;
      font-weight: 700;
      border-radius: 2px;
      z-index: 999999;
      margin-left: 3px;
      font-family: monospace;
    `;
    link.style.position = 'relative';
    link.appendChild(label);
  });
}

function removeLinksHighlight() {
  document.querySelectorAll('.sg-seo-link-highlighted').forEach(link => {
    link.classList.remove('sg-seo-link-highlighted');
    link.style.outline = '';
    link.style.outlineOffset = '';
    const label = link.querySelector('.sg-seo-link-label');
    if (label) label.remove();
  });
}

function highlightSpecificURLs(urls) {
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    if (urls.includes(link.href)) {
      link.style.outline = '3px solid #6366f1';
      link.style.outlineOffset = '2px';
      link.style.background = 'rgba(99, 102, 241, 0.1)';
    }
  });
}

