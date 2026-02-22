// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import ChatWidget from './components/ChatWidget/index.jsx';

// CSS will be injected by the build plugin
import './widget.css';

const WIDGET_ID = 'oodles-erp-widget-root';

function getConfig() {
  // Method 1: From script data attributes
  const scripts = document.querySelectorAll('script[data-oodles-widget]');
  const script = scripts[scripts.length - 1]; // Get the last one (most recent)
  
  if (script) {
    return {
      clientId: script.getAttribute('data-client-id') || 'default',
      apiBase: script.getAttribute('data-api-base') || 'https://api.oodleserp.com',
      position: script.getAttribute('data-position') || 'bottom-right',
      primaryColor: script.getAttribute('data-primary-color') || '#00c2ff',
    };
  }

  // Method 2: From global config object
  if (window.OodlesWidgetConfig) {
    return {
      clientId: window.OodlesWidgetConfig.clientId || 'default',
      apiBase: window.OodlesWidgetConfig.apiBase || 'https://api.oodleserp.com',
      position: window.OodlesWidgetConfig.position || 'bottom-right',
      primaryColor: window.OodlesWidgetConfig.primaryColor || '#00c2ff',
    };
  }

  console.warn('[OodlesWidget] No configuration found. Using defaults.');
  return {
    clientId: 'default',
    apiBase: 'https://api.oodleserp.com',
    position: 'bottom-right',
    primaryColor: '#00c2ff',
  };
}

function getPositionStyles(position) {
  const base = 'position:fixed;z-index:2147483647;pointer-events:none;';
  switch (position) {
    case 'bottom-left':
      return `${base}bottom:0;left:0;`;
    case 'top-right':
      return `${base}top:0;right:0;`;
    case 'top-left':
      return `${base}top:0;left:0;`;
    default: // bottom-right
      return `${base}bottom:0;right:0;`;
  }
}

function createWidgetStyles(config) {
  return `
    :host {
      all: initial;
      --ow-primary: ${config.primaryColor};
      --ow-primary-dark: #0077ff;
      --ow-bg: #0a1628;
      --ow-bg-light: #112240;
      --ow-text: #e8f4fd;
      --ow-text-muted: #7a9bb5;
    }
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #1a3354; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--ow-primary); }
    
    @keyframes ow-bounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
      40% { transform: translateY(-5px); opacity: 1; }
    }
    @keyframes ow-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes ow-blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes ow-slide-up {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes ow-scale-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    
    #ow-container {
      pointer-events: auto;
    }
  `;
}

function mountWidget() {
  // Prevent double mounting
  if (document.getElementById(WIDGET_ID)) {
    console.warn('[OodlesWidget] Widget already mounted.');
    return;
  }

  const config = getConfig();
  
  // Store config globally for components to access
  window.__OODLES_CONFIG__ = config;

  // Create host element
  const host = document.createElement('div');
  host.id = WIDGET_ID;
  host.style.cssText = getPositionStyles(config.position);
  document.body.appendChild(host);

  // Create Shadow DOM
  const shadow = host.attachShadow({ mode: 'open' });

  // Load Google Fonts
  const fontLink = document.createElement('link');
  fontLink.rel = 'stylesheet';
  fontLink.href = 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap';
  shadow.appendChild(fontLink);

  // Add widget styles
  const style = document.createElement('style');
  style.textContent = createWidgetStyles(config);
  shadow.appendChild(style);

  // Create container for React
  const container = document.createElement('div');
  container.id = 'ow-container';
  shadow.appendChild(container);

  // Mount React app
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <ChatWidget config={config} />
    </React.StrictMode>
  );

  // Expose API for external control
  window.OodlesWidget = {
    open: () => window.dispatchEvent(new CustomEvent('oodles:open')),
    close: () => window.dispatchEvent(new CustomEvent('oodles:close')),
    toggle: () => window.dispatchEvent(new CustomEvent('oodles:toggle')),
    destroy: () => {
      root.unmount();
      host.remove();
      delete window.OodlesWidget;
      delete window.__OODLES_CONFIG__;
    },
  };

  console.log('[OodlesWidget] Mounted successfully', config);
}

// Auto-mount when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountWidget);
} else {
  mountWidget();
}