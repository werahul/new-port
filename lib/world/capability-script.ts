/**
 * PRE-PAINT CAPABILITY STAMP
 *
 * The hero's geometry — a four-to-six screen scroll descent, a sticky viewport
 * frame, a directional scrim — only makes sense when the 3D world is going to
 * run. Deciding that in a `useEffect` means the first paint is always the wrong
 * layout, and every visitor watches the page jump from one screen to six.
 *
 * So the decision is made here instead, in a blocking inline script in <head>,
 * before the first paint. It writes two things:
 *
 *   html[data-world="cinematic" | "flat"]   ← LAYOUT. Stable for the page's life.
 *   window.__worldCap = { webgl, tier, reduced }
 *
 * `data-world` is deliberately *not* a readiness flag. Whether the canvas has
 * actually produced a frame is a separate, later question, published as
 * `html[data-world-status]` by the React tree. Conflating the two is what made
 * the hero go blank when the world failed to start.
 *
 * The probe context is handed straight back with WEBGL_lose_context. The old
 * implementation left it alive on every call — twice under Strict Mode — which
 * burned real GPU contexts and made the renderer's own `getContext` measurably
 * more likely to fail on the very first visit.
 */

export type Tier = 'high' | 'medium' | 'low'

export interface WorldCapability {
  webgl: boolean
  tier: Tier
  reduced: boolean
}

declare global {
  interface Window {
    __worldCap?: WorldCapability
  }
}

/**
 * The tiering rules, as a source string so the inline script and the module
 * that reads it can never disagree. Errs downward: a phone that could have
 * handled `medium` losing a few particles costs nothing, a laptop dropping
 * frames costs the whole impression.
 */
export const WORLD_CAPABILITY_SCRIPT = `(function(){
var d=document.documentElement;
try{
var mq=function(q){return !!(window.matchMedia&&window.matchMedia(q).matches)};
var cap={webgl:false,tier:'low',reduced:mq('(prefers-reduced-motion: reduce)')};
if(!cap.reduced){
var gl=null;
try{var c=document.createElement('canvas');gl=c.getContext('webgl2')||c.getContext('webgl')}catch(e){}
if(gl){
cap.webgl=true;
var r='';
try{var g=gl.getExtension('WEBGL_debug_renderer_info');if(g){r=String(gl.getParameter(g.UNMASKED_RENDERER_WEBGL)||'')}}catch(e){}
try{var l=gl.getExtension('WEBGL_lose_context');if(l){l.loseContext()}}catch(e){}
var n=navigator.hardwareConcurrency||4,m=navigator.deviceMemory,w=window.innerWidth;
var soft=/swiftshader|llvmpipe|software/i.test(r);
cap.tier=(soft||n<=2||(m!==undefined&&m<=2))?'low':(mq('(pointer: coarse)')||w<900)?'low':(w<1280||n<=4||(m!==undefined&&m<=4))?'medium':'high'
}}
window.__worldCap=cap;
d.setAttribute('data-world',cap.webgl&&!cap.reduced?'cinematic':'flat')
}catch(e){d.setAttribute('data-world','flat')}
})();`
