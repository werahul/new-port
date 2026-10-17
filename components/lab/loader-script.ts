/**
 * Raises the intro loader before the first paint (see loader.tsx): only with
 * JavaScript running, motion welcome, no #section in the address, and
 * once per session. If the loader component never boots, it comes down by
 * itself after fifteen seconds.
 *
 * A plain module, not a client one, so server pages can inline the string.
 */
export const loaderScript = `(function(){try{var l=document.querySelector('[data-lab]');if(!l)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;if(location.hash)return;try{if(sessionStorage.getItem('lab:entered'))return}catch(e){return}l.setAttribute('data-loading','');setTimeout(function(){if(!window.__labLoader)l.removeAttribute('data-loading')},15000)}catch(e){}})()`
