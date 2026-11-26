(function(){
function effective(){var t=document.documentElement.dataset.theme||'system';return t==='system'?(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'):t;}
function sync(){var b=document.getElementById('gbTheme');if(!b)return;var light=effective()==='light';b.textContent=light?'CLARO':'ESCURO';b.setAttribute('aria-pressed',String(light));b.setAttribute('aria-label',light?'Ativar modo escuro':'Ativar modo claro');}
document.addEventListener('click',function(e){var b=e.target&&e.target.closest?e.target.closest('#gbTheme'):null;if(!b)return;var next=effective()==='light'?'dark':'light';document.documentElement.dataset.theme=next;try{localStorage.setItem('gb-theme',next);}catch(err){}sync();},true);
document.addEventListener('DOMContentLoaded',sync);sync();
})();