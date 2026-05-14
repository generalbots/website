(function() {
'use strict';

var currentLang = 'en';
var translations = {};
var supportedLangs = ['en','pt','es','fr','de','ja','zh-cn'];

function detectLang() {
  var path = window.location.pathname.toLowerCase();
  var parts = path.split('/');
  if (parts.length > 1 && supportedLangs.indexOf(parts[1]) !== -1) {
    return parts[1];
  }
  var cookie = document.cookie.match(/gb_lang=([^;]+)/);
  if (cookie) return cookie[1];
  var browser = (navigator.language || navigator.userLanguage || 'en').substring(0,2);
  if (supportedLangs.indexOf(browser) !== -1) return browser;
  return 'en';
}

function loadLang(lang, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', '/lang/' + lang + '.json?v=' + (+new Date()), true);
  xhr.onload = function() {
    if (xhr.status === 200) {
      try {
        translations = JSON.parse(xhr.responseText);
        currentLang = lang;
        document.cookie = 'gb_lang=' + lang + ';path=/;max-age=31536000';
        applyTranslations();
        if (callback) callback();
      } catch(e) {
        console.warn('i18n: failed to parse ' + lang, e);
        if (lang !== 'en') loadLang('en', callback);
      }
    } else {
      console.warn('i18n: failed to load ' + lang);
      if (lang !== 'en') loadLang('en', callback);
    }
  };
  xhr.onerror = function() {
    if (lang !== 'en') loadLang('en', callback);
  };
  xhr.send();
}

function applyTranslations() {
  var els = document.querySelectorAll('[data-i18n]');
  for (var i = 0; i < els.length; i++) {
    var key = els[i].getAttribute('data-i18n');
    var text = translations[key];
    if (text) {
      if (els[i].tagName === 'INPUT' || els[i].tagName === 'TEXTAREA') {
        els[i].setAttribute('placeholder', text);
      } else if (els[i].tagName === 'IMG') {
        els[i].setAttribute('alt', text);
      } else {
        els[i].textContent = text;
      }
    }
  }
  // Update HTML lang attribute
  document.documentElement.lang = currentLang;
}

function switchLang(lang) {
  if (lang === currentLang) return;
  loadLang(lang, function() {
    var path = window.location.pathname;
    var parts = path.split('/');
    if (supportedLangs.indexOf(parts[1]) !== -1) {
      parts[1] = lang;
    } else {
      parts.splice(1, 0, lang);
    }
    var newPath = parts.join('/') || '/' + lang + '/';
    window.history.replaceState({}, '', newPath);
  });
}

// Flag icons for language switcher
var flagEmojis = {
  'en': '\ud83c\uddfa\ud83c\uddf8',
  'pt': '\ud83c\udde7\ud83c\uddf7',
  'es': '\ud83c\uddea\ud83c\uddf8',
  'fr': '\ud83c\uddeb\ud83c\uddf7',
  'de': '\ud83c\udde9\ud83c\uddea',
  'ja': '\ud83c\uddaf\ud83c\uddf5',
  'zh-cn': '\ud83c\udde8\ud83c\uddf3'
};

// Initialize on DOM ready
function init() {
  var detected = detectLang();
  loadLang(detected);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Expose for inline use
window.__switchLang = switchLang;
window.__currentLang = function() { return currentLang; };

})();
