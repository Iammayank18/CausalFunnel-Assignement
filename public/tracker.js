(function() {
  // Disable tracking if loaded inside the Heatmap dashboard iframe
  if (window.name === 'causalfunnel-heatmap') return;

  // Dynamically determine the backend URL based on where this script is loaded from
  const scriptTag = document.currentScript;
  const backendUrl = scriptTag && scriptTag.src ? new URL(scriptTag.src).origin : 'http://localhost:3000';
  const TRACKING_URL = `${backendUrl}/api/events`;
  
  // Initialize or retrieve session_id
  let sessionId = localStorage.getItem('causalfunnel_session_id');
  if (!sessionId) {
    sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    localStorage.setItem('causalfunnel_session_id', sessionId);
  }

  let eventQueue = [];
  const BATCH_SIZE = 10;
  const FLUSH_INTERVAL = 5000; // 5 seconds

  function sendEvents() {
    if (eventQueue.length === 0) return;
    
    const eventsToSend = [...eventQueue];
    eventQueue = []; // clear queue

    // Use sendBeacon if available for better reliability on page unload
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify({ events: eventsToSend })], { type: 'application/json' });
      navigator.sendBeacon(TRACKING_URL, blob);
    } else {
      fetch(TRACKING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: eventsToSend })
      }).catch(console.error);
    }
  }

  function trackEvent(eventType, metadata = {}) {
    eventQueue.push({
      session_id: sessionId,
      event_type: eventType,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      ...metadata
    });

    if (eventQueue.length >= BATCH_SIZE) {
      sendEvents();
    }
  }

  // 1. Track Page View
  trackEvent('page_view');

  // 2. Track Clicks (with basic throttle/debounce to prevent spam)
  let lastClickTime = 0;
  const CLICK_THROTTLE_MS = 200;

  document.addEventListener('click', function(e) {
    const now = Date.now();
    if (now - lastClickTime < CLICK_THROTTLE_MS) return;
    lastClickTime = now;

    trackEvent('click', {
      x: e.pageX,
      y: e.pageY,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight
    });
  });

  // Flush queue periodically
  setInterval(sendEvents, FLUSH_INTERVAL);

  // Flush queue on tab close or navigation
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      sendEvents();
    }
  });
})();
