(function() {
var flags = [
  {lang:'en', flag:'\ud83c\uddfa\ud83c\uddf8', title:'English'},
  {lang:'pt', flag:'\ud83c\udde7\ud83c\uddf7', title:'Portugu\u00eas'},
  {lang:'es', flag:'\ud83c\uddea\ud83c\uddf8', title:'Espa\u00f1ol'},
  {lang:'fr', flag:'\ud83c\uddeb\ud83c\uddf7', title:'Fran\u00e7ais'},
  {lang:'de', flag:'\ud83c\udde9\ud83c\uddea', title:'Deutsch'},
  {lang:'ja', flag:'\ud83c\uddaf\ud83c\uddf5', title:'\u65e5\u672c\u8a9e'},
  {lang:'zh-cn', flag:'\ud83c\udde8\ud83c\uddf3', title:'\u7b80\u4f53\u4e2d\u6587'}
];

function injectFlags() {
  var container = document.getElementById('lang-flags');
  if (!container) {
    // Try again in 500ms (HTMX might still be loading the header)
    setTimeout(injectFlags, 500);
    return;
  }
  for (var i = 0; i < flags.length; i++) {
    var f = flags[i];
    var a = document.createElement('a');
    a.href = '#';
    a.title = f.title;
    a.style.cssText = 'font-size:1rem;cursor:pointer;opacity:.5;transition:opacity .15s;text-decoration:none;margin:0 .0625rem';
    a.onmouseover = function(){this.style.opacity=1};
    a.onmouseout = function(){this.style.opacity=.5};
    a.onclick = (function(lang) {
      return function(e) {
        e.preventDefault();
        if (window.__switchLang) window.__switchLang(lang);
      };
    })(f.lang);
    a.textContent = f.flag;
    container.appendChild(a);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectFlags);
} else {
  injectFlags();
}
})();
