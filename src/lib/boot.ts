/**
 * Runs in <head> before first paint. Marks the document as scripted so intro
 * elements can start hidden — and if the motion system hasn't started within
 * four seconds (blocked script, very slow device), takes the mark away so the
 * page shows in its static, fully lit form instead of staying dark.
 */
export const BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(!d.classList.contains('motion-ready')){d.classList.remove('js');}},4000);})();`;

export const PRELOAD_FONTS = ["/fonts/cormorant-garamond-latin-300-normal.woff2", "/fonts/inter-latin-wght-normal.woff2"];
