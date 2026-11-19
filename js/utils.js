export const $ = (selector, root=document) => root.querySelector(selector);
export const $$ = (selector, root=document) => [...root.querySelectorAll(selector)];
export function escapeHTML(value=""){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
export function toast(message,type="info"){const region=$("#toast-region");if(!region){alert(message);return;}const item=document.createElement("div");item.className=`toast toast-${type}`;item.textContent=message;region.append(item);setTimeout(()=>item.remove(),3500);}
export function formatDate(value){if(!value)return "—";const date=value.toDate?value.toDate():new Date(value);return new Intl.DateTimeFormat("bn-BD",{day:"numeric",month:"short",year:"numeric"}).format(date);}
export function setTheme(theme){document.documentElement.dataset.theme=theme;localStorage.setItem("nga-theme",theme);}
export function initTheme(){setTheme(localStorage.getItem("nga-theme")||"light");}
export function initials(name="N"){return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase();}
