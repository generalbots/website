(function(){
function effective(){var t=document.documentElement.dataset.theme||'system';return t==='system'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):t;}
function syncPrism(){var el=document.querySelector('gb-prism-hero');if(!el)return;var e=effective();if(e==='light'){el.setAttribute('theme','light');}else{el.removeAttribute('theme');}}
function sync(){
  var b=document.getElementById('gbTheme'),e=effective(),light=e==='light';
  if(b){
    if(!b.hasAttribute('data-icons')){b.textContent=light?'CLARO':'ESCURO';}
    b.setAttribute('aria-pressed',String(light));
    b.setAttribute('aria-label',light?'Ativar modo escuro':'Ativar modo claro');
  }
  syncPrism();
  window.dispatchEvent(new CustomEvent('gb-theme',{detail:{theme:e}}));
}
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('#gbTheme'):null;if(!b)return;var next=effective()==='light'?'dark':'light';document.documentElement.dataset.theme=next;try{localStorage.setItem('gb-theme',next);}catch(err){}sync();},true);
if(window.matchMedia){window.matchMedia('(prefers-color-scheme: light)').addEventListener('change',sync);}
document.addEventListener('DOMContentLoaded',sync);sync();
new MutationObserver(function(){syncPrism();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();
