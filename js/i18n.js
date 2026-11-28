(function(){
var LANGS=["pt", "en", "es", "fr", "de", "ja", "zh-cn", "it", "ko", "ru"];
var DICT={}, LANG='pt', INDEX=null;
var DONE=new WeakSet(), STARTED=false, REVEAL=null;
var request=0, pendingLang=null;
var catalogVersion=window.gbCatalogVersion||'';
function detect(){
  var p=new URLSearchParams(location.search).get('lang');
  if(p&&LANGS.indexOf(p)>=0)return p;
  // A locale path prefix (/it, /en, …) wins over the remembered language so
  // opening /it always selects Italian, regardless of a previous selection.
  var path=(location.pathname.split('/')[1]||'').toLowerCase();
  if(path==='pt-br')path='pt';
  if(LANGS.indexOf(path)>=0)return path;
  var s=null;try{s=localStorage.getItem('gb-lang');}catch(e){}
  return s&&LANGS.indexOf(s)>=0?s:'pt';
}
function value(d,key){var v=d[key];if(v===undefined||v===null||v==='')return null;return Array.isArray(v)?v.join(' '):String(v);}
function attrs(el,d){
  var spec=el.dataset.i18nAttr; if(!spec)return;
  spec.split(',').forEach(function(pair){
   if(!pair.trim())return;
   var p=pair.split(':'), name=p[0].trim(), key=p.length>1?p.slice(1).join(':').trim():el.dataset.i18n;
   var v=value(d,key); if(v!==null)el.setAttribute(name,v);
  });
}
function text(el,key,d){
  var v=key&&value(d,key);
  if(v){
   if(el.dataset.i18nHtml!==undefined)el.innerHTML=v; else el.textContent=v;
  }
  attrs(el,d);
}
function applyTo(root){
  if(!root||!root.querySelectorAll)return;
  var selector='[data-i18n],[data-i18n-attr]';
  var list=Array.from(root.querySelectorAll(selector));
  if(root.matches&&root.matches(selector))list.unshift(root);
  list.forEach(function(el){
   if(DONE.has(el))return;
   text(el,el.dataset.i18n,DICT); DONE.add(el);
  });
}
async function loadIndex(){
  if(INDEX)return;
  try{INDEX=await (await fetch('/lang/_index.json'+catalogVersion)).json();}catch(e){INDEX={};}
}
// Dynamic text rendered by x-dc components has no static data-i18n attributes.
// Wrap any text node whose exact source string is in the translation index.
function autoWrap(root){
  if(!INDEX||!root||!root.querySelectorAll)return;
  var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null,false), nodes=[];
  while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(function(node){
   var v=node.nodeValue.trim(), key=INDEX[v];
   if(!key||!DICT[key])return;
   var p=node.parentElement;
   if(!p||p.closest('[data-i18n],[data-i18n-html],[data-i18n-rendered],script,style,option,select'))return;
   var span=document.createElement('span');
   span.setAttribute('data-i18n',key);
   span.textContent=node.nodeValue;
   node.parentNode.replaceChild(span,node);
   text(span,key,DICT); DONE.add(span);
  });
}
// The page starts hidden via html[data-i18n-loading] (set in <head>) so the
// source language is never flashed. Static pages reveal after translation;
// x-dc pages wait for the runtime to mount its first nodes, then reveal.
function reveal(){try{document.documentElement.removeAttribute('data-i18n-loading');}catch(e){}}
function scheduleReveal(){
  if(REVEAL)clearTimeout(REVEAL);
  REVEAL=setTimeout(reveal,120);
}
function revealWhenReady(){
  if(!document.querySelector('x-dc')){scheduleReveal();return;}
  if(document.querySelector('[data-dc-tpl]')){
    autoWrap(document.documentElement);
    applyTo(document.documentElement);
    scheduleReveal();
    return;
  }
  if(!REVEAL)REVEAL=setInterval(function(){
    if(document.querySelector('[data-dc-tpl]')){
      clearInterval(REVEAL);REVEAL=null;revealWhenReady();
    }
  },80);
}
async function apply(lang,change){
  if(LANGS.indexOf(lang)<0)lang='pt';
  var id=++request;
  pendingLang=lang;
  try{
   var response=await fetch('/lang/'+lang+'.json'+catalogVersion);
   if(!response.ok)throw new Error('Cannot load locale '+lang);
   var base=await response.json();
   var d=base,slug=document.body.dataset.blogSlug;
   if(slug&&slug!=='blog'){try{var post=await (await fetch('/lang/blog/'+slug+'/'+lang+'.json')).json();d=Object.assign({},base,post);}catch(e){}}
   await loadIndex();
   if(id!==request)return;
   var commit=function(){
    if(id!==request)return;
    DICT=d; LANG=lang; DONE=new WeakSet();
    autoWrap(document.documentElement);
    applyTo(document.documentElement);
    document.documentElement.lang=(lang==='pt'?'pt-BR':lang);
    try{localStorage.setItem('gb-lang',lang);}catch(e){}
    window.dispatchEvent(new Event('gb-language'));
    revealWhenReady();
   };
   if(change&&window.GBFlood&&lang!==LANG){
    if(window.GBFlood.busy())await window.GBFlood.whenIdle();
    if(id!==request)return;
    await window.GBFlood.swap({
     theme:window.gbEffectiveTheme(),
     label:'//'+value(d,'auto.009433886003')+' > //'+lang.toUpperCase(),
     x:change.x,y:change.y
    },commit);
   }else commit();
  }catch(e){if(id===request){console.warn('[i18n]',e);reveal();}}
  finally{if(id===request){pendingLang=null;syncSelect();}}
}
window.gbSetLang=apply;
window.gbTranslate=function(key,fallback){return value(DICT,key)||fallback;};
window.gbTranslateSource=function(source){
  var key=INDEX&&INDEX[source.trim()];
  var translated=key&&value(DICT,key);
  return translated?source.replace(source.trim(),function(){return translated;}):source;
};
// The homepage runtime re-renders the header after translations are applied,
// resetting the select to its first option. Keep it on the active locale.
function syncSelect(){
  var sel=document.getElementById('gbLang');
  var selected=pendingLang||LANG;
  if(sel&&sel.value!==selected)sel.value=selected;
}
// Delegated listener survives React/DC re-rendering of the header select.
document.addEventListener('change',function(e){
  if(e.target&&e.target.id==='gbLang'){
   var rect=e.target.getBoundingClientRect();
   apply(e.target.value,{x:(rect.left+rect.width/2)/innerWidth,y:(rect.top+rect.height/2)/innerHeight});
  }
},true);
// The homepage (and other x-dc pages) mount content after DOMContentLoaded.
// Re-apply translations to any elements added later and to replacements.
function observe(){
  if(!window.MutationObserver)return;
  var mo=new MutationObserver(function(muts){
   if(!Object.keys(DICT).length)return;
   syncSelect();
   muts.forEach(function(m){
    m.addedNodes.forEach(function(n){
     if(n.nodeType!==1)return;
     autoWrap(n);
     applyTo(n);
    });
   });
  });
  mo.observe(document.documentElement,{childList:true,subtree:true});
}
function start(){
  if(STARTED)return; STARTED=true;
  var initial=detect();
  var sel=document.getElementById('gbLang'); if(sel)sel.value=initial;
  LANG=initial;
  apply(initial);
  var t=document.getElementById('toTop'); if(t)t.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
  observe();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
// Never leave the page hidden if a dictionary request fails.
setTimeout(function(){if(REVEAL){clearInterval(REVEAL);REVEAL=null;}reveal();},10000);
})();
