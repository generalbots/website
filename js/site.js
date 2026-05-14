/* site.js — General Bots website */

/* ===================== i18n ===================== */
(function(){
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
        console.warn('i18n: parse fail ' + lang, e);
        if (lang !== 'en') loadLang('en', callback);
      }
    } else {
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

var flagEmojis = {
  'en': '\ud83c\uddfa\ud83c\uddf8',
  'pt': '\ud83c\udde7\ud83c\uddf7',
  'es': '\ud83c\uddea\ud83c\uddf8',
  'fr': '\ud83c\uddeb\ud83c\uddf7',
  'de': '\ud83c\udde9\ud83c\uddea',
  'ja': '\ud83c\uddaf\ud83c\uddf5',
  'zh-cn': '\ud83c\udde8\ud83c\uddf3'
};

function injectFlags() {
  var container = document.getElementById('lang-flags');
  if (!container) return;
  for (var i = 0; i < supportedLangs.length; i++) {
    var lang = supportedLangs[i];
    var a = document.createElement('a');
    a.href = '#';
    a.title = lang;
    a.style.cssText = 'font-size:1rem;cursor:pointer;opacity:.5;transition:opacity .15s;text-decoration:none;margin:0 .0625rem';
    a.onmouseover = function(){this.style.opacity=1};
    a.onmouseout = function(){this.style.opacity=.5};
    a.onclick = (function(l){return function(e){e.preventDefault();switchLang(l);}})(lang);
    a.textContent = flagEmojis[lang] || lang;
    container.appendChild(a);
  }
}

window.__switchLang = switchLang;
window.__applyTranslations = applyTranslations;
window.__currentLang = function() { return currentLang; };

/* Init i18n on DOM ready */
var detectedLang = detectLang();
loadLang(detectedLang);
/* injectFlags when #lang-flags appears (header loaded via HTMX) */
(function retryInject() {
  if (document.getElementById('lang-flags')) {
    injectFlags();
  } else {
    setTimeout(retryInject, 200);
  }
})();

})();

/* ===================== Header ===================== */
function initHeader() {
  var mobileToggle = document.getElementById('mobile-menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.onclick = function () {
      mobileMenu.classList.toggle('hidden');
      var icon = mobileToggle.querySelector('.menu-icon');
      var closeIcon = mobileToggle.querySelector('.close-icon');
      if (icon && closeIcon) {
        icon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
      }
    };
  }

  document.querySelectorAll('.mobile-nav-link').forEach(function (link) {
    link.addEventListener('click', function () {
      if (mobileMenu) mobileMenu.classList.add('hidden');
      var icon = mobileToggle ? mobileToggle.querySelector('.menu-icon') : null;
      var closeIcon = mobileToggle ? mobileToggle.querySelector('.close-icon') : null;
      if (icon) icon.classList.remove('hidden');
      if (closeIcon) closeIcon.classList.add('hidden');
    });
  });

  var header = document.querySelector('.nav-header') || document.querySelector('.site-header');
  if (header) {
    var shrunk = false;
    window.addEventListener('scroll', function () {
      var shouldShrink = window.scrollY > 60;
      if (shouldShrink !== shrunk) {
        shrunk = shouldShrink;
        header.classList.toggle('header-shrunk', shouldShrink);
      }
    }, { passive: true });
  }
}

/* ===================== Scroll Reveal ===================== */
function initReveal() {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.reveal').forEach(function (el) {
    el.style.opacity = '0';
    observer.observe(el);
  });
}

/* ===================== 3rd Party ===================== */
function initThirdParty() {
  var gc = document.createElement('script');
  gc.async = true;
  gc.src = '//gc.zgo.at/count.js';
  gc.setAttribute('data-goatcounter', 'https://generalbots-pragmatismo.goatcounter.com/count');
  document.body.appendChild(gc);
}

/* ===================== Init ===================== */
document.addEventListener('DOMContentLoaded', function () {
  initHeader();
  initReveal();
  initThirdParty();
});

document.body.addEventListener('htmx:afterSwap', function (e) {
  if (e.detail && e.detail.pathInfo && e.detail.pathInfo.requestPath &&
    e.detail.pathInfo.requestPath.indexOf('/partials/') !== -1) {
    initHeader();
    var container = document.getElementById('lang-flags');
    if (container) {
      container.innerHTML = '';
      injectFlags();
    }
    if (window.__applyTranslations) window.__applyTranslations();
  }
});