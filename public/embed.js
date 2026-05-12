/**
 * StackAudit Embeddable Widget
 * Usage: <div id="stackaudit-widget"></div>
 *        <script src="https://stackaudit.dev/embed.js" async></script>
 */
(function () {
  'use strict';

  var WIDGET_URL = 'https://stackaudit.dev/widget';
  var CONTAINER_ID = 'stackaudit-widget';

  function init() {
    var container = document.getElementById(CONTAINER_ID);
    if (!container) {
      console.warn('[StackAudit] Widget container not found. Add <div id="stackaudit-widget"></div> to your page.');
      return;
    }

    var iframe = document.createElement('iframe');
    iframe.src = WIDGET_URL;
    iframe.style.width = '100%';
    iframe.style.maxWidth = '420px';
    iframe.style.height = '380px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '16px';
    iframe.style.overflow = 'hidden';
    iframe.style.display = 'block';
    iframe.style.margin = '0 auto';
    iframe.setAttribute('title', 'StackAudit - AI Spend Calculator');
    iframe.setAttribute('loading', 'lazy');
    iframe.setAttribute('allow', 'clipboard-write');

    container.innerHTML = '';
    container.appendChild(iframe);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
