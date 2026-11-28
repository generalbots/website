// <gb-prism-hero> · port of GB-Hero-compacto (PrismShader + glass gear) as a plain web component.
(() => {
  if (customElements.get('gb-prism-hero')) return;
  const BASE = 'assets/hero/';
  const REST = { x: 0.92, y: 0.12 };
  const EASE = 0.075, MAX_DPR = 2;

  const VERT = 'attribute vec2 a_position;void main(){gl_Position=vec4(a_position,0.0,1.0);}';
  const FRAG = `precision highp float;
uniform vec2 u_resolution;uniform vec2 u_pointer;uniform vec2 u_origin;uniform float u_time;uniform float u_dpr;uniform float u_intensity;uniform float u_light;uniform float u_spread;
float hash12(vec2 p){vec3 p3=fract(vec3(p.xyx)*0.1031);p3+=dot(p3,p3.yzx+33.33);return fract((p3.x+p3.y)*p3.z);}
float valueNoise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash12(i),hash12(i+vec2(1.0,0.0)),f.x),mix(hash12(i+vec2(0.0,1.0)),hash12(i+vec2(1.0,1.0)),f.x),f.y);}
float bellNoise(vec2 px){float d=hash12(px+vec2(17.0,31.0))+hash12(px+vec2(47.0,13.0))+hash12(px+vec2(71.0,59.0))+hash12(px+vec2(101.0,7.0));return (d-2.0)*0.5;}
float grainF(vec2 px,float t){float fr=floor(t*8.0);vec2 fp=floor(px*1.15);vec2 gc=floor((px+vec2(0.75,1.25))/2.35);
 return bellNoise(fp)*0.58+bellNoise(fp+vec2(fr*19.0,fr*31.0))*0.12+bellNoise(gc+vec2(43.0,89.0))*0.22+(valueNoise(px*0.19+vec2(23.0,61.0))*2.0-1.0)*0.08;}
vec3 spectrum(float t){t=clamp(t,0.0,1.0);vec3 v=vec3(0.34,0.03,0.95);vec3 b=vec3(0.02,0.18,1.0);vec3 c=vec3(0.0,0.86,1.0);vec3 g=vec3(0.08,1.0,0.16);vec3 y=vec3(1.0,0.96,0.0);vec3 o=vec3(1.0,0.32,0.0);vec3 r=vec3(1.0,0.015,0.0);
 if(t<0.17)return mix(v,b,t/0.17);if(t<0.34)return mix(b,c,(t-0.17)/0.17);if(t<0.51)return mix(c,g,(t-0.34)/0.17);if(t<0.68)return mix(g,y,(t-0.51)/0.17);if(t<0.84)return mix(y,o,(t-0.68)/0.16);return mix(o,r,(t-0.84)/0.16);}
void main(){vec2 uv=gl_FragCoord.xy/u_resolution.xy;float aspect=u_resolution.x/u_resolution.y;
 vec2 p=vec2((uv.x-0.5)*aspect,uv.y-0.5);vec2 prism=vec2((u_origin.x-0.5)*aspect,u_origin.y-0.5);vec2 pointer=vec2((u_pointer.x-0.5)*aspect,u_pointer.y-0.5);
 vec3 color=vec3(0.0);float alpha=0.0;vec2 pd=pointer-prism;vec2 dir=length(pd)>0.025?normalize(pd):normalize(vec2(0.93,-0.38));
 vec2 perp=vec2(-dir.y,dir.x);vec2 local=p-prism;float along=dot(local,dir);float across=dot(local,perp);float maxL=max(aspect,1.0)*1.42;
 vec2 wd=-dir;float wa=dot(local,wd);float wx=dot(local,vec2(-wd.y,wd.x));
 float wm=smoothstep(0.002,0.026,wa)*(1.0-smoothstep(maxL*0.9,maxL,wa));
 float inc=(exp(-abs(wx)*790.0)+exp(-abs(wx)*88.0)*0.42)*wm*smoothstep(0.02,0.14,distance(p,prism))*u_intensity;
 color+=vec3(0.78,0.82,1.0)*inc;alpha+=inc*0.9;
 float width=0.008+along*0.205*u_spread;float bm=smoothstep(0.004,0.036,along)*(1.0-smoothstep(maxL*0.88,maxL,along));
 float feather=max(0.003,width*0.16);float em=1.0-smoothstep(width-feather,width,abs(across));float band=across/max(width,0.001)*0.5+0.5;float na=across/max(width,0.001);
 vec3 sc=spectrum(band);float luma=dot(sc,vec3(0.2126,0.7152,0.0722));float mid=1.0-abs(luma*2.0-1.0);
 float gr=grainF(gl_FragCoord.xy/max(u_dpr,1.0),u_time);float emu=max(0.92,1.0+gr*mix(0.035,0.06,mid));
 float dens=0.99+valueNoise(vec2(along*60.0,na*6.0))*0.02;
 vec3 spec=sc*(0.82+0.18*exp(-abs(na)*2.4))*emu*dens;float ba=bm*em*(0.67+min(along,0.8)*0.28)*u_intensity;
 color+=spec*ba*1.55;alpha+=ba;
 float outD=max(0.0,abs(across)-width*0.85);float halo=bm*exp(-outD/(width*0.45+0.012))*(1.0-em*0.6)*smoothstep(0.02,0.2,along)*u_intensity;
 vec3 hc=spectrum(clamp(band,0.0,1.0));color+=hc*halo*0.55;alpha+=halo*0.32;
 float inner=bm*em*exp(-abs(na)*1.2)*0.35*u_intensity;color+=spec*inner;
 vec2 cp=gl_FragCoord.xy/max(u_dpr,1.0);vec2 gq=mod(cp+vec2(4.5),18.0)-9.0;
 float arm=2.4,th=0.42;
 float hx=(1.0-smoothstep(th,th+0.7,abs(gq.y)))*(1.0-smoothstep(arm,arm+0.7,abs(gq.x)));
 float vy=(1.0-smoothstep(th,th+0.7,abs(gq.x)))*(1.0-smoothstep(arm,arm+0.7,abs(gq.y)));
 float plusM=max(hx,vy);
 float soft=1.0-smoothstep(0.35,1.0,abs(na));soft*=soft;
 float reveal=bm*soft*smoothstep(0.06,0.4,along)*(0.6+0.4*exp(-abs(na)*1.6));
 float lit=plusM*reveal*u_intensity;
 color+=mix(sc,vec3(1.0),0.45)*lit*0.85;alpha+=lit*0.5;
 float cg=exp(-length(local)*31.0)*0.68*u_intensity;color+=vec3(1.0,0.98,0.92)*cg;alpha+=cg;
 if(u_light>0.5){
 vec3 c=vec3(0.0);float o=0.0;
 float hl=clamp(halo*0.6,0.0,1.0);c=hc*hl;o=hl;
 float sb=clamp(ba*1.1+inner*0.5,0.0,1.0);vec3 scol=clamp(spec*1.05,0.0,1.0);c=scol*sb+c*(1.0-sb);o=sb+o*(1.0-sb);
 float dots=clamp(lit*0.8,0.0,1.0);vec3 dc=mix(sc,vec3(1.0),0.55);c=dc*dots+c*(1.0-dots);o=dots+o*(1.0-dots);
 float bs=clamp(exp(-abs(wx)*45.0)*wm*smoothstep(0.02,0.14,distance(p,prism))*u_intensity*0.5,0.0,1.0);float gt=fract(wa*0.45-u_time*0.035);vec3 bgc=mix(gt<0.88?spectrum(gt/0.88):mix(spectrum(1.0),spectrum(0.0),smoothstep(0.0,1.0,(gt-0.88)/0.12)),vec3(1.0),0.5);bs*=0.6;c=bgc*bs+c*(1.0-bs);o=bs+o*(1.0-bs);
 float bw=clamp(inc*1.1,0.0,1.0);c=vec3(1.0)*bw+c*(1.0-bw);o=bw+o*(1.0-bw);
 float cgw=clamp(cg,0.0,1.0);c=vec3(1.0)*cgw+c*(1.0-cgw);o=cgw+o*(1.0-cgw);
 gl_FragColor=vec4(c,clamp(o,0.0,0.97));}else{gl_FragColor=vec4(color,clamp(alpha,0.0,0.94));}}`;

  const A = (id, p) => (window.__resources && window.__resources[id]) || p;
  const CSS = () => `
:host{position:absolute;inset:0;display:block;overflow:hidden;isolation:isolate;background:#05060a;--px:0;--py:0}
.l{position:absolute;inset:0;width:100%;height:100%}
.tex{z-index:0;background:#05060a}
.tex::after{content:'';position:absolute;inset:0;background:url('${A('hFundo', BASE + 'fundo.jpg')}') center/cover;opacity:var(--texop,.8)}
canvas{z-index:1;display:block}
.optic{position:absolute;z-index:9;left:var(--cx,50%);top:var(--cy,50%);width:var(--size,min(42vw,600px));aspect-ratio:1;transform:translate(-50%,-50%);pointer-events:none;
 --st:13.25%;--sl:15.29%;--sw:62.67%;--sh:62.3%}
.pat{z-index:2;pointer-events:none;background-image:radial-gradient(circle,rgba(255,255,255,.32) 1px,transparent 1.6px),linear-gradient(rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:72px 72px,72px 72px,72px 72px;background-position:-36px -36px,-0.5px -0.5px,-0.5px -0.5px;
 -webkit-mask-image:radial-gradient(ellipse 75% 85% at 55% 45%,rgba(0,0,0,.95) 0%,rgba(0,0,0,.7) 35%,rgba(0,0,0,.3) 65%,transparent 92%);mask-image:radial-gradient(ellipse 75% 85% at 55% 45%,rgba(0,0,0,.95) 0%,rgba(0,0,0,.7) 35%,rgba(0,0,0,.3) 65%,transparent 92%)}
.pp{z-index:2;pointer-events:none;background-image:radial-gradient(circle,rgba(255,255,255,.7) 1px,transparent 1.6px),linear-gradient(rgba(255,255,255,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.12) 1px,transparent 1px);background-size:72px 72px,72px 72px,72px 72px;background-position:-36px -36px,-0.5px -0.5px,-0.5px -0.5px;opacity:var(--pa,0);-webkit-mask-image:radial-gradient(circle at var(--pcx,58%) var(--pcy,45%),transparent calc(var(--pr,0px) - 140px),#000 var(--pr,0px),transparent calc(var(--pr,0px) + 60px));mask-image:radial-gradient(circle at var(--pcx,58%) var(--pcy,45%),transparent calc(var(--pr,0px) - 140px),#000 var(--pr,0px),transparent calc(var(--pr,0px) + 60px))}
@media (prefers-reduced-motion:reduce){.pp{display:none}}
.disc{position:absolute;z-index:1;left:20%;top:20%;width:60%;height:60%;
 background:rgba(10,10,14,.18);backdrop-filter:blur(22px) saturate(1.1);-webkit-backdrop-filter:blur(22px) saturate(1.1);
 -webkit-mask:url('${A('hCogF', 'assets/gb-cog-fill.png')}') center/contain no-repeat;mask:url('${A('hCogF', 'assets/gb-cog-fill.png')}') center/contain no-repeat;animation:gbSpin 18s linear infinite;will-change:transform}
@media (prefers-reduced-motion:reduce){.disc{animation:none}}
.gw{position:absolute;z-index:1;top:calc(var(--st) - var(--sh)*.1);left:calc(var(--sl) - var(--sw)*.1);width:calc(var(--sw)*1.2);height:calc(var(--sh)*1.2)}
.glass,.sheen{position:absolute;inset:0;display:block;
 -webkit-mask:url('${A('hMask', BASE + 'gear-mask.svg')}') center/83.333% 83.333% no-repeat;mask:url('${A('hMask', BASE + 'gear-mask.svg')}') center/83.333% 83.333% no-repeat}
.glass{background:rgb(214 228 255/.1);backdrop-filter:blur(13px) saturate(1.85) contrast(1.14) brightness(1.06);-webkit-backdrop-filter:blur(13px) saturate(1.85) contrast(1.14) brightness(1.06)}
.gw.refr .glass{background:none;backdrop-filter:url(#gbref);-webkit-backdrop-filter:url(#gbref)}
.sheen{z-index:1;mix-blend-mode:screen;background:radial-gradient(circle at calc(34% + var(--px)*7%) calc(26% + var(--py)*7%),rgb(255 255 255/.26),transparent 46%),linear-gradient(145deg,rgb(255 255 255/.1),rgb(122 153 210/.04) 52%,rgb(255 255 255/.1))}
img{position:absolute;display:block;max-width:none;pointer-events:none;user-select:none}
.gear{z-index:2;top:var(--st);left:var(--sl);width:var(--sw);height:var(--sh);object-fit:cover;filter:contrast(1.08) brightness(.96)}
.gear.hi{z-index:3;opacity:.52;mix-blend-mode:screen;filter:brightness(1.18) contrast(1.32) saturate(.82)}
.flare{z-index:4;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:screen;transform:translate(calc(3.37% + var(--px)*-2px),calc(2.75% + var(--py)*-1.5px))}
.flw{position:absolute;left:50%;top:49.4%;width:166.667%;aspect-ratio:1;transform:translate(-50%,-50%);pointer-events:none}
.flw .flare{transform-origin:49.04% 49.03%}
@media (prefers-reduced-motion:reduce){.flw .flare{animation:none}}
.flw .flare{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;mix-blend-mode:screen;
 translate:calc(0.96% + var(--fx,0)*18px) calc(0.97% + var(--fy,0)*12px);
 -webkit-mask-image:radial-gradient(circle at 49.04% 49.03%,#000 0%,#000 26%,transparent 62%);mask-image:radial-gradient(circle at 49.04% 49.03%,#000 0%,#000 26%,transparent 62%)}
.ring{position:absolute;z-index:3;left:19.176%;top:19.176%;width:61.648%;height:61.648%;background:#ffffff;will-change:transform}
.ring.o{-webkit-mask:url('${A('hStrO', 'assets/gb-cog-stroke-o.png')}') center/100% 100% no-repeat;mask:url('${A('hStrO', 'assets/gb-cog-stroke-o.png')}') center/100% 100% no-repeat;animation:gbSpin 18s linear infinite}
.ring.i{-webkit-mask:url('${A('hStrI', 'assets/gb-cog-stroke-i.png')}') center/100% 100% no-repeat;mask:url('${A('hStrI', 'assets/gb-cog-stroke-i.png')}') center/100% 100% no-repeat}
@media (prefers-reduced-motion:reduce){.ring{animation:none}}
.spin-i{position:absolute;z-index:7;left:20%;top:20%;width:60%;height:60%;pointer-events:none}
@media (prefers-reduced-motion:reduce){.spin-i{animation:none}}
.g2{position:absolute;z-index:2;left:67.65%;top:51.3%;width:42.1%;height:42.1%;
 background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .1 0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E") 0 0/140px 140px,#000000;
 backdrop-filter:none;-webkit-backdrop-filter:none;
 -webkit-mask:url('${A('hSmG', 'assets/gb-cog-small-g.svg')}') center/contain no-repeat;mask:url('${A('hSmG', 'assets/gb-cog-small-g.svg')}') center/contain no-repeat;
 transform:rotate(7.5deg);animation:gbSpinG2 12s linear infinite;will-change:transform}
.g2.line{background:rgba(255,255,255,.1);backdrop-filter:none;-webkit-backdrop-filter:none;
 -webkit-mask:url('${A('hSmL', 'assets/gb-cog-small-line2.svg')}') center/contain no-repeat;mask:url('${A('hSmL', 'assets/gb-cog-small-line2.svg')}') center/contain no-repeat}
:host([twin="0"]) .g2,:host([twin="false"]) .g2{display:none}
@media (max-width:760px){.g2{left:65.545%;top:49.195%;width:46.31%;height:46.31%;-webkit-mask-size:90.909% 90.909%;mask-size:90.909% 90.909%}.g2.line{display:none}}
@keyframes gbSpinG2{from{transform:rotate(7.5deg)}to{transform:rotate(-352.5deg)}}
@media (prefers-reduced-motion:reduce){.g2{animation:none}}
.origin{position:absolute;left:50%;top:49.4%;width:1px;height:1px}
.vig{z-index:8;pointer-events:none;background:radial-gradient(circle at 50% 47%,transparent 18%,rgb(0 0 0/.18) 58%,rgb(0 0 0/.55) 115%)}
.cog{position:absolute;z-index:2;left:20%;top:20%;width:60%;height:60%;
 background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E") 0 0/120px 120px,linear-gradient(140deg,rgba(255,255,255,.55) 0%,rgba(255,255,255,.16) 42%,rgba(255,255,255,.08) 60%,rgba(255,255,255,.34) 100%);
 backdrop-filter:blur(22px) saturate(1.3) brightness(1.12);-webkit-backdrop-filter:blur(22px) saturate(1.3) brightness(1.12);will-change:transform}
.cog.o{-webkit-mask:url('${A('hCogO', 'assets/gb-cog-outer.png')}') center/contain no-repeat;mask:url('${A('hCogO', 'assets/gb-cog-outer.png')}') center/contain no-repeat;animation:gbSpin 18s linear infinite}
.cog.i{-webkit-mask:url('${A('hCogI', 'assets/gb-cog-inner.png')}') center/contain no-repeat;mask:url('${A('hCogI', 'assets/gb-cog-inner.png')}') center/contain no-repeat}
@keyframes gbSpin{to{transform:rotate(360deg)}}@keyframes gbSpinR{to{transform:rotate(-360deg)}}
@media (prefers-reduced-motion:reduce){.cog{animation:none}}
:host([theme="light"]){background:#eeeeec}
:host([theme="light"]) .tex{background:#eeeeec}
:host([theme="light"]) .tex::after{display:block;background:url('${A('hFundoL', BASE + 'fundo-claro.jpg')}') center/cover;opacity:1;filter:brightness(.965)}
:host([theme="light"]) .pat{z-index:2;pointer-events:none;background-image:radial-gradient(circle,rgba(0,0,0,.5) 1px,transparent 1.6px),linear-gradient(rgba(0,0,0,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.09) 1px,transparent 1px);background-size:72px 72px,72px 72px,72px 72px;background-position:-36px -36px,-0.5px -0.5px,-0.5px -0.5px;
 -webkit-mask-image:radial-gradient(ellipse 75% 85% at 55% 45%,rgba(0,0,0,.95) 0%,rgba(0,0,0,.7) 35%,rgba(0,0,0,.3) 65%,transparent 92%);mask-image:radial-gradient(ellipse 75% 85% at 55% 45%,rgba(0,0,0,.95) 0%,rgba(0,0,0,.7) 35%,rgba(0,0,0,.3) 65%,transparent 92%)}
:host([theme="light"]) .pp{z-index:2;pointer-events:none;background-image:radial-gradient(circle,rgba(0,0,0,.7) 1px,transparent 1.6px),linear-gradient(rgba(0,0,0,.12) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.12) 1px,transparent 1px);background-size:72px 72px,72px 72px,72px 72px;background-position:-36px -36px,-0.5px -0.5px,-0.5px -0.5px;opacity:var(--pa,0);-webkit-mask-image:radial-gradient(circle at var(--pcx,58%) var(--pcy,45%),transparent calc(var(--pr,0px) - 140px),#000 var(--pr,0px),transparent calc(var(--pr,0px) + 60px));mask-image:radial-gradient(circle at var(--pcx,58%) var(--pcy,45%),transparent calc(var(--pr,0px) - 140px),#000 var(--pr,0px),transparent calc(var(--pr,0px) + 60px))}
:host([theme="light"]) .flw{top:52.4%}
:host([theme="light"]) .disc{background:rgba(255,255,255,.55);backdrop-filter:blur(10px) saturate(1.1);-webkit-backdrop-filter:blur(10px) saturate(1.1)}
:host([theme="light"]) .cog{background:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .22 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E") 0 0/60px 60px,#171717;backdrop-filter:none;-webkit-backdrop-filter:none}
:host([theme="light"]) .gear.hi{opacity:0}
:host([theme="light"]) .ring{background:#3a3a3a}
:host([theme="light"]) .g2:not(.line){background-color:#fafafa}
:host([theme="light"]) .g2.line{background:rgba(0,0,0,.28)}
:host([theme="light"]) .vig{background:radial-gradient(circle at 50% 47%,transparent 22%,rgb(235 235 233/.2) 62%,rgb(235 235 233/.6) 115%)}
`;

  class GbPrismHero extends HTMLElement {
    static get observedAttributes() { return ['intensity', 'spread', 'speed', 'size', 'cx', 'cy', 'texture']; }
    constructor() {
      super();
      const r = this.attachShadow({ mode: 'open' });
      r.innerHTML = `<style>${CSS()}</style><div class="l tex"></div><canvas class="l"></canvas><div class="l pat"></div><div class="l pp"></div>
<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="gbref" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feImage preserveAspectRatio="none" result="map"/>
<feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="rp"/>
<feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="gp"/>
<feDisplacementMap in="SourceGraphic" in2="map" scale="0" xChannelSelector="R" yChannelSelector="G" result="bp"/>
<feColorMatrix in="rp" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rc"/>
<feColorMatrix in="gp" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gc"/>
<feColorMatrix in="bp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bc"/>
<feBlend in="rc" in2="gc" mode="screen" result="rg"/><feBlend in="rg" in2="bc" mode="screen" result="disp"/>
<feGaussianBlur in="disp" stdDeviation="1" result="fr"/><feColorMatrix in="fr" type="saturate" values="1.42" result="sat"/>
<feComponentTransfer in="sat"><feFuncR type="linear" slope="1.08" intercept="0.015"/><feFuncG type="linear" slope="1.08" intercept="0.015"/><feFuncB type="linear" slope="1.1" intercept="0.022"/></feComponentTransfer>
</filter></defs></svg>
<div class="optic"><span class="disc"></span><div class="gw" style="display:none"></div><div class="g2"></div><div class="g2 line"></div><div class="cog o"></div><div class="cog i"></div><div class="ring o"></div><div class="ring i"></div><div class="spin-i"><span class="origin"></span><div class="flw"><img class="flare" src="${A('hFlare', BASE + 'flare.png')}" alt=""></div></div></div><div class="l vig"></div>`;
      this.canvas = r.querySelector('canvas'); this.gw = r.querySelector('.gw'); this.flt = r.querySelector('#gbref'); this.optic = r.querySelector('.optic'); this.originEl = r.querySelector('.origin');
      this.ptr = { x: 0.96, y: 0.94, active: false };
    }
    num(n, d) { const v = parseFloat(this.getAttribute(n)); return isFinite(v) ? v : d; }
    attributeChangedCallback() { this.layout(); }
    layout() {
      const s = this.getAttribute('size'), cx = this.getAttribute('cx'), cy = this.getAttribute('cy'), tx = this.getAttribute('texture');
      if (tx != null && tx !== '') this.style.setProperty('--texop', tx);
      [this.optic].forEach(el => { if (!el) return; if (s) el.style.setProperty('--size', s); if (cx) el.style.setProperty('--cx', cx); if (cy) el.style.setProperty('--cy', cy); });
    }
    connectedCallback() {
      this.layout();
      const target = window;
      this.onMove = e => {
        const b = this.getBoundingClientRect(); if (!b.width) return;
        const x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
        const overCard = e.composedPath ? e.composedPath().some(n => n && n.dataset && n.dataset.heroCard != null) : false;
        const inside = x >= 0 && x <= 1 && y >= 0 && y <= 1 && !overCard;
        if (inside) this.lastMove = performance.now();
        this.ptr.active = inside;
        if (inside) { this.ptr.x = x; this.ptr.y = y; this.style.setProperty('--px', (x - .5) * 2); this.style.setProperty('--py', (y - .5) * 2); } else { this.style.setProperty('--px', 0); this.style.setProperty('--py', 0); }
      };
      this.onLeave = () => { this.ptr.active = false; this.style.setProperty('--px', 0); this.style.setProperty('--py', 0); };
      target.addEventListener('pointermove', this.onMove, { passive: true }); document.addEventListener('pointerleave', this.onLeave);
      this.tgt = target;
      this.ro = new ResizeObserver(() => { this.startGL(); this.scaleFilter(); }); this.ro.observe(this);
      requestAnimationFrame(() => this.startGL());
    }
    disconnectedCallback() {
      this.tgt && (this.tgt.removeEventListener('pointermove', this.onMove), document.removeEventListener('pointerleave', this.onLeave));
      cancelAnimationFrame(this.raf); this.io && this.io.disconnect(); this.ro && this.ro.disconnect(); this.gl = null;
    }
    async buildMap() {
      if (this.mapDone) return; this.mapDone = true;
      const ua = navigator.userAgent;
      if (/firefox|fxios/i.test(ua) || (/applewebkit/i.test(ua) && !/chrome|chromium|crios|edg/i.test(ua))) return;
      const im = await new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = A('hMask', BASE + 'gear-mask.svg'); }).catch(() => null);
      if (!im) return;
      const S = 512, pad = .1, inner = S / (1 + 2 * pad), off = (S - inner) / 2;
      const cv = document.createElement('canvas'); cv.width = cv.height = S;
      const cx = cv.getContext('2d', { willReadFrequently: true }); cx.drawImage(im, off, off, inner, inner);
      const d = cx.getImageData(0, 0, S, S).data, N = S * S, BIG = 1e20;
      const inside = new Uint8Array(N); for (let i = 0; i < N; i++) inside[i] = d[i * 4 + 3] > 127 ? 1 : 0;
      const dt1 = (f, o, v, z, n) => { let k = 0; v[0] = 0; z[0] = -BIG; z[1] = BIG;
        for (let q = 1; q < n; q++) { let s2 = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); while (s2 <= z[k]) { k--; s2 = (f[q] + q * q - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); } k++; v[k] = q; z[k] = s2; z[k + 1] = BIG; }
        k = 0; for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; o[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; } };
      const sqdt = seed => { const g = new Float64Array(N); for (let i = 0; i < N; i++) g[i] = seed[i] ? 0 : BIG;
        const f = new Float64Array(S), o = new Float64Array(S), z = new Float64Array(S + 1), v = new Int32Array(S);
        for (let x = 0; x < S; x++) { for (let y = 0; y < S; y++) f[y] = g[y * S + x]; dt1(f, o, v, z, S); for (let y = 0; y < S; y++) g[y * S + x] = o[y]; }
        for (let y = 0; y < S; y++) { for (let x = 0; x < S; x++) f[x] = g[y * S + x]; dt1(f, o, v, z, S); for (let x = 0; x < S; x++) g[y * S + x] = o[x]; }
        return g; };
      const outside = new Uint8Array(N); for (let i = 0; i < N; i++) outside[i] = inside[i] ? 0 : 1;
      const tO = sqdt(outside), tI = sqdt(inside), bev = .11 * S;
      let th = new Float64Array(N);
      for (let i = 0; i < N; i++) { const dist = inside[i] ? Math.sqrt(tO[i]) : -Math.sqrt(tI[i]); const t = dist / bev; th[i] = t <= 0 ? 0 : t >= 1 ? 1 : 1 - (1 - t) * (1 - t); }
      const blur = (src, r) => { const cur = src.slice(), tmp = new Float64Array(N), w = r * 2 + 1;
        for (let p = 0; p < 2; p++) { for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { let sm = 0; for (let k = -r; k <= r; k++) sm += cur[y * S + Math.min(S - 1, Math.max(0, x + k))]; tmp[y * S + x] = sm / w; }
          for (let x = 0; x < S; x++) for (let y = 0; y < S; y++) { let sm = 0; for (let k = -r; k <= r; k++) sm += tmp[Math.min(S - 1, Math.max(0, y + k)) * S + x]; cur[y * S + x] = sm / w; } }
        return cur; };
      th = blur(th, 2);
      const gx = new Float64Array(N), gy = new Float64Array(N); let peak = 0;
      for (let y = 0; y < S; y++) { const up = Math.max(0, y - 1) * S, dn = Math.min(S - 1, y + 1) * S;
        for (let x = 0; x < S; x++) { const a = (th[y * S + Math.min(S - 1, x + 1)] - th[y * S + Math.max(0, x - 1)]) * .5, b = (th[dn + x] - th[up + x]) * .5; gx[y * S + x] = a; gy[y * S + x] = b; peak = Math.max(peak, Math.abs(a), Math.abs(b)); } }
      const nm = peak ? .5 / peak : 0, out = new Uint8ClampedArray(N * 4);
      for (let i = 0; i < N; i++) { out[i * 4] = Math.round((.5 + gx[i] * nm) * 255); out[i * 4 + 1] = Math.round((.5 + gy[i] * nm) * 255); out[i * 4 + 2] = 128; out[i * 4 + 3] = 255; }
      const tc = document.createElement('canvas'); tc.width = tc.height = S; tc.getContext('2d').putImageData(new ImageData(out, S, S), 0, 0);
      const url = tc.toDataURL('image/png');
      const fe = this.flt.querySelector('feImage'); fe.setAttribute('href', url); fe.setAttributeNS('http://www.w3.org/1999/xlink', 'href', url);
      this.mapReady = true; this.scaleFilter(); this.gw.classList.add('refr');
    }
    scaleFilter() {
      if (!this.mapReady) return;
      const w = this.gw.getBoundingClientRect().width; if (!w) return;
      const sc = w * .075, ds = this.flt.querySelectorAll('feDisplacementMap');
      ds[0].setAttribute('scale', sc * 1.075); ds[1].setAttribute('scale', sc); ds[2].setAttribute('scale', sc * .925);
      this.flt.querySelector('feGaussianBlur').setAttribute('stdDeviation', Math.max(.4, w * .0065));
    }
    startGL() {
      if (this.gl || !this.isConnected) return;
      const c = this.canvas;
      if (!c.clientWidth || !c.clientHeight) return;
      const gl = c.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
      if (!gl) { requestAnimationFrame(() => this.startGL()); return; }
      this.gl = gl;
      const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(o)); return o; };
      const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr);
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const U = n => gl.getUniformLocation(pr, n), pos = gl.getAttribLocation(pr, 'a_position');
      const u = { res: U('u_resolution'), ptr: U('u_pointer'), org: U('u_origin'), t: U('u_time'), dpr: U('u_dpr'), i: U('u_intensity'), s: U('u_spread'), l: U('u_light') };
      const rm = matchMedia('(prefers-reduced-motion: reduce)');
      const p = { x: REST.x, y: REST.y }, o = { x: .5, y: .5 };
      let clock = 0, prev = 0, vis = true;
      const frame = now => {
        const dt = prev ? Math.min((now - prev) / 1000, .1) : 0; prev = now;
        const dpr = Math.min(devicePixelRatio || 1, MAX_DPR);
        const w = Math.round(c.clientWidth * dpr), h = Math.round(c.clientHeight * dpr);
        if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
        const cb = c.getBoundingClientRect(), ab = this.originEl.getBoundingClientRect();
        if (cb.width) { o.x = (ab.left - cb.left) / cb.width; o.y = 1 - (ab.top - cb.top) / cb.height; }
        if (!rm.matches) clock += dt * this.num('speed', 1);
        const asp = c.width / Math.max(1, c.height), wrap = v => Math.atan2(Math.sin(v), Math.cos(v));
        if (!rm.matches) this.rot = (this.rot || 0) + dt * this.num('speed', 1);
        const rc = this.rot || 0;
        let target = -0.388 + Math.sin(rc * 0.17) * 0.12 + Math.sin(rc * 0.43 + 1.3) * 0.04;
        if (this.ang == null) this.ang = target;
        const following = this.ptr.active && performance.now() - (this.lastMove || 0) < 1400;
        if (following) {
          const dx = (this.ptr.x - o.x) * asp, dy = (1 - this.ptr.y) - o.y;
          target = Math.hypot(dx, dy) > 0.07 ? Math.atan2(dy, dx) : this.ang;
        } else {
          this.idleW = (this.idleW ?? 0) + (0.05 - (this.idleW ?? 0)) * 0.01;
          target = this.ang + this.idleW * (1 + Math.sin(rc * 0.37) * 0.3);
        }
        if (following) this.idleW = (this.idleW ?? 0) * 0.9;
        const diff = wrap(target - this.ang), maxStep = 1.8 * Math.max(dt, 1 / 120);
        const step = diff * 0.055;
        this.ang = wrap(this.ang + Math.max(-maxStep, Math.min(maxStep, step)));
        { const tx = this.ptr.active ? (this.ptr.x - .5) * 2 : 0, ty = this.ptr.active ? (this.ptr.y - .5) * 2 : 0;
          this.fx = (this.fx || 0) + (tx - (this.fx || 0)) * 0.05; this.fy = (this.fy || 0) + (ty - (this.fy || 0)) * 0.05;
          if (!this.flw) this.flw = this.shadowRoot.querySelector('.flw');
          if (this.flw) { this.flw.style.setProperty('--fx', this.fx.toFixed(4)); this.flw.style.setProperty('--fy', this.fy.toFixed(4)); } }
        p.x = o.x + Math.cos(this.ang) * 0.3 / asp; p.y = o.y + Math.sin(this.ang) * 0.3;
        { if (!this.pp) this.pp = this.shadowRoot.querySelector('.pp');
          if (this.pp) { const T = 5.2, ph = ((performance.now() / 1000) % T) / T, W = this.clientWidth, H = this.clientHeight, oc = this.optic || (this.optic = this.shadowRoot.querySelector('.optic'));
            const ob = oc.getBoundingClientRect(), hb = this.getBoundingClientRect(), cx = ob.left - hb.left + ob.width / 2, cy = ob.top - hb.top + ob.height / 2;
            const maxR = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)), e = 1 - Math.pow(1 - ph, 2.2);
            this.pp.style.setProperty('--pcx', cx.toFixed(1) + 'px'); this.pp.style.setProperty('--pcy', cy.toFixed(1) + 'px');
            this.pp.style.setProperty('--pr', (ob.width * 0.32 + e * maxR).toFixed(1) + 'px');
            this.pp.style.setProperty('--pa', (Math.min(1, ph / 0.08) * Math.pow(1 - ph, 1.3)).toFixed(3)); } }
        const breath = 1 + Math.sin(clock * 0.31) * 0.035 + Math.sin(clock * 0.77) * 0.015;
        gl.viewport(0, 0, c.width, c.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.useProgram(pr);
        gl.enableVertexAttribArray(pos); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(u.res, c.width, c.height); gl.uniform2f(u.ptr, p.x, p.y); gl.uniform2f(u.org, o.x, o.y);
        gl.uniform1f(u.t, clock); gl.uniform1f(u.dpr, dpr); gl.uniform1f(u.i, this.num('intensity', 1)); gl.uniform1f(u.l, this.getAttribute('theme') === 'light' ? 1 : 0); gl.uniform1f(u.s, this.num('spread', 1) * breath);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        if (vis) this.raf = requestAnimationFrame(frame);
      };
      const sync = () => { cancelAnimationFrame(this.raf); if (vis && !document.hidden) { prev = 0; this.raf = requestAnimationFrame(frame); } };
      this.io = new IntersectionObserver(es => { const b = c.getBoundingClientRect(); vis = es[es.length - 1].isIntersecting || (b.bottom > 0 && b.top < innerHeight); sync(); });
      this.io.observe(c); document.addEventListener('visibilitychange', sync); sync();
    }
  }
  customElements.define('gb-prism-hero', GbPrismHero);
})();
