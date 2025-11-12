// Settings Page Script

const defaultSettings = {
  theme: 'dark',
  autoAnalyze: true,
  cacheEnabled: true,
  cacheDuration: 3600,
  autoHighlightHeadings: false,
  autoHighlightLinks: false
};

// Load settings on page load
document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();
  setupEventListeners();
});

// Load settings from storage
async function loadSettings() {
  const settings = await chrome.storage.local.get('settings');
  const currentSettings = settings.settings || defaultSettings;
  
  // Apply settings to form
  document.getElementById('theme').value = currentSettings.theme;
  document.getElementById('autoAnalyze').checked = currentSettings.autoAnalyze;
  document.getElementById('cacheEnabled').checked = currentSettings.cacheEnabled;
  document.getElementById('cacheDuration').value = currentSettings.cacheDuration;
  document.getElementById('autoHighlightHeadings').checked = currentSettings.autoHighlightHeadings;
  document.getElementById('autoHighlightLinks').checked = currentSettings.autoHighlightLinks;
}

// Setup event listeners
function setupEventListeners() {
  document.getElementById('saveBtn').addEventListener('click', saveSettings);
  document.getElementById('resetBtn').addEventListener('click', resetSettings);
}

// Save settings
async function saveSettings() {
  const settings = {
    theme: document.getElementById('theme').value,
    autoAnalyze: document.getElementById('autoAnalyze').checked,
    cacheEnabled: document.getElementById('cacheEnabled').checked,
    cacheDuration: parseInt(document.getElementById('cacheDuration').value),
    autoHighlightHeadings: document.getElementById('autoHighlightHeadings').checked,
    autoHighlightLinks: document.getElementById('autoHighlightLinks').checked
  };
  
  await chrome.storage.local.set({ settings, theme: settings.theme });
  
  showSuccessMessage('Settings saved successfully!');
}

// Reset to defaults
async function resetSettings() {
  if (confirm('Reset all settings to defaults?')) {
    await chrome.storage.local.set({ settings: defaultSettings, theme: defaultSettings.theme });
    await loadSettings();
    showSuccessMessage('Settings reset to defaults');
  }
}

// Show success message
function showSuccessMessage(message) {
  const div = document.createElement('div');
  div.className = 'success-message';
  div.textContent = message;
  document.body.appendChild(div);
  
  setTimeout(() => {
    div.remove();
  }, 3000);
}

