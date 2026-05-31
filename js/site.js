/* site.js — General Bots 2027 */

/* ===================== Theme ===================== */
(function(){
  var SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  var MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';

  function getPreferred(){
    var s = localStorage.getItem('gb-theme');
    if(s) return s;
    return window.matchMedia('(prefers-color-scheme:light)').matches ? 'light' : 'dark';
  }

  function set(t){
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('gb-theme', t);
    updateBtn(t);
  }

  function updateBtn(t){
    var btn = document.getElementById('theme-toggle');
    if(!btn) return;
    btn.innerHTML = t === 'dark' ? SUN : MOON;
    btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function toggle(){
    var cur = document.documentElement.getAttribute('data-theme') || 'dark';
    var next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.classList.add('theme-transitioning');
    set(next);
    setTimeout(function(){ document.documentElement.classList.remove('theme-transitioning'); }, 500);
  }

  // Init immediately to prevent flash
  set(getPreferred());

  window.__toggleTheme = toggle;
  window.__setTheme = set;
  window.__updateThemeBtn = function(){ updateBtn(document.documentElement.getAttribute('data-theme') || 'dark'); };
})();

/* ===================== i18n ===================== */
(function(){
  var currentLang = 'en';
  var translations = {};
  var supportedLangs = ['en','pt','es','fr','de','ja','zh-cn'];

  function loadCached(lang){
    try{
      var cached = localStorage.getItem('gb_translations_' + lang);
      if(cached){
        translations = JSON.parse(cached);
        currentLang = lang;
        applyTranslations();
        return true;
      }
    }catch(e){}
    return false;
  }

  function saveCache(lang, data){
    try{ localStorage.setItem('gb_translations_' + lang, JSON.stringify(data)); }catch(e){}
  }

  function detectLang(){
    var path = window.location.pathname.toLowerCase();
    var parts = path.split('/');
    if(parts.length > 1 && supportedLangs.indexOf(parts[1]) !== -1) return parts[1];
    var cookie = document.cookie.match(/gb_lang=([^;]+)/);
    if(cookie) return cookie[1];
    var browser = (navigator.language || navigator.userLanguage || 'en').substring(0,2);
    if(supportedLangs.indexOf(browser) !== -1) return browser;
    return 'en';
  }

  function getLangPrefix(){
    var path = window.location.pathname.toLowerCase();
    var parts = path.split('/');
    if(parts.length > 1 && supportedLangs.indexOf(parts[1]) !== -1) return '/' + parts[1];
    return '';
  }

  function localizeLinks(){
    var prefix = getLangPrefix();
    if(!prefix || prefix === '/en') return;
    var links = document.querySelectorAll('a[href]');
    for(var i = 0; i < links.length; i++){
      var link = links[i];
      var href = link.getAttribute('href');
      if(!href || href.match(/^https?:\/\//) || href.startsWith('#') || href.startsWith(prefix) || href.match(/^\/(css|js|lang|img|icons|assets)\//)) continue;
      if(href.startsWith('/')) link.setAttribute('href', prefix + href);
      else if(!href.includes(':')) link.setAttribute('href', prefix + '/' + href);
    }
  }

  function loadLang(lang, callback){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/lang/' + lang + '.json?v=' + (+new Date()), true);
    xhr.onload = function(){
      if(xhr.status === 200){
        try{
          translations = JSON.parse(xhr.responseText);
          currentLang = lang;
          saveCache(lang, translations);
          document.cookie = 'gb_lang=' + lang + ';path=/;max-age=31536000';
          applyTranslations();
          if(document.getElementById('lang-flags')) injectFlags();
          if(callback) callback();
        }catch(e){
          console.warn('i18n: parse fail ' + lang, e);
          if(lang !== 'en') loadLang('en', callback);
        }
      }else{
        if(lang !== 'en') loadLang('en', callback);
      }
    };
    xhr.onerror = function(){ if(lang !== 'en') loadLang('en', callback); };
    xhr.send();
  }

  function applyTranslations(){
    if(!translations || Object.keys(translations).length === 0) return;
    var els = document.querySelectorAll('[data-i18n]');
    for(var i = 0; i < els.length; i++){
      var key = els[i].getAttribute('data-i18n');
      var text = translations[key];
      if(text){
        if(els[i].tagName === 'INPUT' || els[i].tagName === 'TEXTAREA') els[i].setAttribute('placeholder', text);
        else if(els[i].tagName === 'IMG') els[i].setAttribute('alt', text);
        else els[i].textContent = text;
      }
    }
    document.documentElement.lang = currentLang;
    document.documentElement.classList.add('i18n-ready');
  }

  function switchLang(lang){
    if(lang === currentLang) return;
    var path = window.location.pathname;
    var search = window.location.search || '';
    var hash = window.location.hash || '';
    var parts = path.split('/');
    if(parts.length > 1 && supportedLangs.indexOf(parts[1]) !== -1){
      path = '/' + lang + path.substring(parts[1].length + 1);
    }else{
      path = '/' + lang + path;
    }
    window.location.href = path + search + hash;
  }

  var flagLabels = {
    'en':'EN','pt':'PT','es':'ES',
    'fr':'FR','de':'DE','ja':'JA','zh-cn':'ZH'
  };

  function injectFlags(){
    var container = document.getElementById('lang-flags');
    if(!container) return;
    container.innerHTML = '';
    for(var i = 0; i < supportedLangs.length; i++){
      var lang = supportedLangs[i];
      var a = document.createElement('a');
      a.href = '#';
      a.title = lang;
      var isActive = lang === currentLang;
      a.style.cssText = 'font-size:.6875rem;font-weight:700;cursor:pointer;transition:opacity .15s;text-decoration:none;margin:0 .0625rem;padding:.125rem .25rem;border-radius:.25rem;opacity:' + (isActive ? '1' : '.45');
      a.onmouseover = function(){this.style.opacity=1};
      a.onmouseout = function(){if(this.getAttribute('data-lang')!==currentLang)this.style.opacity=.45};
      a.setAttribute('data-lang', lang);
      a.onclick = (function(l){return function(e){e.preventDefault();switchLang(l);}})(lang);
      a.textContent = flagLabels[lang] || lang.toUpperCase();
      container.appendChild(a);
    }
  }

  window.__switchLang = switchLang;
  window.__applyTranslations = applyTranslations;
  window.__injectFlags = injectFlags;
  window.__localizeLinks = localizeLinks;
  window.__currentLang = function(){ return currentLang; };

  var detectedLang = detectLang();
  if(!loadCached(detectedLang)) loadLang(detectedLang, function(){ setTimeout(localizeLinks, 100); });
  else { localizeLinks(); loadLang(detectedLang); }

  var _flagsInjected = false;
  (function retryInject(){
    if(_flagsInjected) return;
    if(document.getElementById('lang-flags')){
      _flagsInjected = true;
      injectFlags();
      localizeLinks();
    }else{
      setTimeout(retryInject, 200);
    }
  })();
})();

/* ===================== Header ===================== */
function initHeader(){
  var mobileToggle = document.getElementById('mobile-menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if(mobileToggle && mobileMenu){
    mobileToggle.onclick = function(){
      var isOpen = !mobileMenu.classList.contains('hidden');
      if(isOpen){
        mobileMenu.classList.add('hidden');
      }else{
        mobileMenu.classList.remove('hidden');
      }
      var icon = mobileToggle.querySelector('.menu-icon');
      var closeIcon = mobileToggle.querySelector('.close-icon');
      if(icon && closeIcon){
        icon.classList.toggle('hidden');
        closeIcon.classList.toggle('hidden');
      }
    };
  }

  document.querySelectorAll('.mobile-nav-link').forEach(function(link){
    link.addEventListener('click', function(){
      if(mobileMenu) mobileMenu.classList.add('hidden');
      var icon = mobileToggle ? mobileToggle.querySelector('.menu-icon') : null;
      var closeIcon = mobileToggle ? mobileToggle.querySelector('.close-icon') : null;
      if(icon) icon.classList.remove('hidden');
      if(closeIcon) closeIcon.classList.add('hidden');
    });
  });

  var header = document.querySelector('.site-header');
  if(header){
    var shrunk = false;
    window.addEventListener('scroll', function(){
      var should = window.scrollY > 60;
      if(should !== shrunk){
        shrunk = should;
        header.classList.toggle('header-shrunk', should);
      }
    }, {passive:true});
  }

  // Init theme toggle button
  if(window.__updateThemeBtn) window.__updateThemeBtn();
}

/* ===================== Scroll Reveal ===================== */
function initReveal(){
  if(!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('visible'); });
    return;
  }
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:0.08, rootMargin:'0px 0px -40px 0px'});

  document.querySelectorAll('.reveal').forEach(function(el){
    observer.observe(el);
  });
}

/* ===================== Animated Counters ===================== */
function initCounters(){
  if(!('IntersectionObserver' in window)) return;
  var counters = document.querySelectorAll('[data-count]');
  if(!counters.length) return;

  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting){
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, {threshold:0.3});

  counters.forEach(function(el){ observer.observe(el); });

  function animateCounter(el){
    var target = parseInt(el.getAttribute('data-count'), 10);
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var duration = 1200;
    var start = 0;
    var startTime = null;

    function step(ts){
      if(!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      var current = Math.floor(eased * target);
      el.textContent = prefix + current + suffix;
      if(progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target + suffix;
    }
    requestAnimationFrame(step);
  }
}

/* ===================== 3rd Party ===================== */
function initThirdParty(){
  var gc = document.createElement('script');
  gc.async = true;
  gc.src = '//gc.zgo.at/count.js';
  gc.setAttribute('data-goatcounter', 'https://generalbots-pragmatismo.goatcounter.com/count');
  document.body.appendChild(gc);
}

/* ===================== Init ===================== */
document.addEventListener('DOMContentLoaded', function(){
  initHeader();
  initReveal();
  initCounters();
  initThirdParty();
});

document.body.addEventListener('htmx:afterSwap', function(e){
  if(e.detail && e.detail.pathInfo && e.detail.pathInfo.requestPath &&
     e.detail.pathInfo.requestPath.indexOf('/partials/') !== -1){
    initHeader();
    var container = document.getElementById('lang-flags');
    if(container){
      container.innerHTML = '';
      if(window.__injectFlags) window.__injectFlags();
    }
    if(window.__applyTranslations) window.__applyTranslations();
    if(window.__localizeLinks) window.__localizeLinks();
  }
  setTimeout(function(){
    if(window.__applyTranslations) window.__applyTranslations();
    initReveal();
    initCounters();
  }, 50);
});