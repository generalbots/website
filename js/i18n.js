(function(){
var LANGS=["pt", "en", "es", "fr", "de", "ja", "zh-cn"];
function detect(){var p=new URLSearchParams(location.search).get('lang');if(p&&LANGS.indexOf(p)>=0)return p;var s=localStorage.getItem('gb-lang');return s&&LANGS.indexOf(s)>=0?s:(navigator.language||'pt').split('-')[0].toLowerCase();}
function text(el,key,dict){if(!key||!dict[key])return;if(el.dataset.i18nHtml!==undefined)el.innerHTML=dict[key];else el.textContent=dict[key];}
async function apply(lang){
 if(LANGS.indexOf(lang)<0)lang='pt';
 try{
  var base=await (await fetch('/lang/'+lang+'.json')).json();
  var d=base,slug=document.body.dataset.blogSlug;
  if(slug){try{var post=await (await fetch('/lang/blog/'+slug+'/'+lang+'.json')).json();d=Object.assign({},base,post);}catch(e){}}
  document.querySelectorAll('[data-i18n]').forEach(function(el){text(el,el.dataset.i18n,d);});
  document.documentElement.lang=(lang==='pt'?'pt-BR':lang);
  localStorage.setItem('gb-lang',lang);
  var sel=document.getElementById('gbLang'); if(sel)sel.value=lang;
 }catch(e){console.warn('[i18n]',e);}
}
window.gbSetLang=apply;
document.addEventListener('DOMContentLoaded',function(){
 var sel=document.getElementById('gbLang'); if(sel){sel.value=detect();sel.addEventListener('change',function(){apply(this.value);});}
 apply(detect());
 var t=document.getElementById('toTop'); if(t)t.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
});
})();