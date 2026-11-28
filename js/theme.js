(function(){
function effective(){var t=document.documentElement.dataset.theme||'system';return t==='system'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):t;}
window.gbEffectiveTheme=effective;
function translate(key,fallback){return window.gbTranslate?window.gbTranslate(key,fallback):fallback;}
function syncPrism(){var el=document.querySelector('gb-prism-hero');if(!el)return;var e=effective();if(e==='light'){el.setAttribute('theme','light');}else{el.removeAttribute('theme');}}
function sync(){
  var b=document.getElementById('gbTheme'),e=effective(),light=e==='light';
  if(b){
    if(!b.hasAttribute('data-icons')){b.textContent=light?translate('gb.theme.light','Claro'):translate('gb.theme.dark','Escuro');}
    b.setAttribute('aria-pressed',String(light));
    var label=translate('gb.theme.label','Modo claro');
    b.setAttribute('aria-label',label);
    b.setAttribute('title',label);
  }
  syncPrism();
  window.dispatchEvent(new CustomEvent('gb-theme',{detail:{theme:e}}));
}
document.addEventListener('click',function(e){
  var b=e.target&&e.target.closest?e.target.closest('#gbTheme'):null;
  if(!b)return;
  var next=effective()==='light'?'dark':'light';
  var apply=function(){
    document.documentElement.dataset.theme=next;
    try{localStorage.setItem('gb-theme',next);}catch(err){}
    sync();
  };
  if(!window.GBFlood){apply();return;}
  if(window.GBFlood.busy())return;
  var rect=b.getBoundingClientRect();
  window.GBFlood.swap({
    theme:next,
    label:'//'+translate('gb.theme.name','Tema')+' > //'+translate('gb.theme.'+next,next==='light'?'Claro':'Escuro'),
    x:(rect.left+rect.width/2)/innerWidth,
    y:(rect.top+rect.height/2)/innerHeight
  },apply);
},true);
if(window.matchMedia){window.matchMedia('(prefers-color-scheme: light)').addEventListener('change',sync);}
document.addEventListener('DOMContentLoaded',sync);sync();
window.addEventListener('gb-language',sync);
new MutationObserver(function(){syncPrism();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
})();
