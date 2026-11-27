(function(){
var LANGS=["pt", "en", "es", "fr", "de", "ja", "zh-cn", "it", "ko", "ru"];
var DICT={}, LANG='pt', INDEX=null;
var DONE=new WeakSet(), STARTED=false, REVEAL=null;
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
  var v=value(d,key); if(v===null)return;
  if(el.dataset.i18nHtml!==undefined)el.innerHTML=v; else el.textContent=v;
  attrs(el,d);
}
function applyTo(root){
  if(!root||!root.querySelectorAll)return;
  var list=root.querySelectorAll('[data-i18n]');
  if(root.dataset&&root.dataset.i18n&&!DONE.has(root))list=[root].concat(Array.prototype.slice.call(list));
  list.forEach(function(el){
   if(DONE.has(el))return;
   var k=el.dataset.i18n; if(!k)return;
   text(el,k,DICT); DONE.add(el);
  });
}
async function loadIndex(){
  if(INDEX)return;
  try{INDEX=await (await fetch('/lang/_index.json')).json();}catch(e){INDEX={};}
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
   if(!p||p.closest('[data-i18n],[data-i18n-html],script,style,option,select'))return;
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
async function apply(lang){
  if(LANGS.indexOf(lang)<0)lang='pt';
  try{
   var base=await (await fetch('/lang/'+lang+'.json')).json();
   var d=base,slug=document.body.dataset.blogSlug;
   if(slug&&slug!=='blog'){try{var post=await (await fetch('/lang/blog/'+slug+'/'+lang+'.json')).json();d=Object.assign({},base,post);}catch(e){}}
   DICT=d; LANG=lang; DONE=new WeakSet();
   await loadIndex();
   autoWrap(document.documentElement);
   applyTo(document.documentElement);
   document.documentElement.lang=(lang==='pt'?'pt-BR':lang);
   try{localStorage.setItem('gb-lang',lang);}catch(e){}
   var sel=document.getElementById('gbLang'); if(sel)sel.value=lang;
   revealWhenReady();
  }catch(e){console.warn('[i18n]',e);reveal();}
}
window.gbSetLang=apply;
// Delegated listener survives React/DC re-rendering of the header select.
document.addEventListener('change',function(e){
  if(e.target&&e.target.id==='gbLang')apply(e.target.value);
},true);
// The homepage (and other x-dc pages) mount content after DOMContentLoaded.
// Re-apply translations to any elements added later and to replacements.
function observe(){
  if(!window.MutationObserver)return;
  var mo=new MutationObserver(function(muts){
   if(!Object.keys(DICT).length)return;
   muts.forEach(function(m){
    m.addedNodes.forEach(function(n){
     if(n.nodeType!==1)return;
     autoWrap(n);
     applyTo(n);
     n.querySelectorAll&&n.querySelectorAll('[data-i18n]').forEach(function(el){if(!DONE.has(el)){text(el,el.dataset.i18n,DICT);DONE.add(el);}});
    });
   });
  });
  mo.observe(document.documentElement,{childList:true,subtree:true});
}
function start(){
  if(STARTED)return; STARTED=true;
  var sel=document.getElementById('gbLang'); if(sel)sel.value=detect();
  apply(detect());
  var t=document.getElementById('toTop'); if(t)t.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
  observe();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);
else start();
// Never leave the page hidden if a dictionary request fails.
setTimeout(function(){if(REVEAL){clearInterval(REVEAL);REVEAL=null;}reveal();},10000);
})();
