(function () {
  "use strict";

  const INGEST_URL = "/api/telemetry/ingest";

  function uuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  if (!sessionStorage.getItem("_tel_sid")) {
    sessionStorage.setItem("_tel_sid", uuid());
  }
  var sessionId = sessionStorage.getItem("_tel_sid");

  // ── Helpers ─────────────────────────────────────────────────────────
  function getBrowser() {
    var ua = navigator.userAgent;
    if (ua.indexOf("Firefox") > -1) return "Firefox";
    if (ua.indexOf("Edg") > -1) return "Edge";
    if (ua.indexOf("Chrome") > -1) return "Chrome";
    if (ua.indexOf("Safari") > -1) return "Safari";
    if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) return "Opera";
    return "Unknown";
  }

  function getResolution() {
    return screen.width + "x" + screen.height;
  }

  function send(payload) {
    payload.sessionId = sessionId;
    payload.browser = getBrowser();
    payload.resolution = getResolution();
    payload.timestamp = Date.now();

    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          INGEST_URL,
          new Blob([JSON.stringify(payload)], { type: "application/json" })
        );
      } else {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", INGEST_URL, true);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(payload));
      }
    } catch (e) {
      // silently fail – telemetry should never break the host page
    }
  }

  // ── 1. Page View ───────────────────────────────────────────────────
  send({
    type: "pageview",
    url: window.location.href,
    data: { referrer: document.referrer || "(direct)" },
  });

  // ── 2. Performance (Time to Interactive) ────────────────────────────
  function sendPerformance() {
    var entries = performance.getEntriesByType("navigation");
    if (entries && entries.length) {
      var nav = entries[0];
      send({
        type: "performance",
        url: window.location.href,
        data: {
          tti: Math.round(nav.domInteractive - nav.startTime),
          domContentLoaded: Math.round(
            nav.domContentLoadedEventEnd - nav.startTime
          ),
          loadComplete: Math.round(nav.loadEventEnd - nav.startTime),
        },
      });
    }
  }

  // Wait until the page is fully loaded before capturing perf metrics
  if (document.readyState === "complete") {
    setTimeout(sendPerformance, 0);
  } else {
    window.addEventListener("load", function () {
      // Small delay to ensure loadEventEnd is populated
      setTimeout(sendPerformance, 100);
    });
  }

  // ── 3. Interactions (click tracking) ───────────────────────────────
  document.addEventListener(
    "click",
    function (e) {
      var target = e.target.closest("[data-track]");
      if (!target) return;

      send({
        type: "click",
        url: window.location.href,
        data: {
          label: target.getAttribute("data-track"),
          tagName: target.tagName,
          text: (target.innerText || "").substring(0, 120),
        },
      });
    },
    true
  );
})();
