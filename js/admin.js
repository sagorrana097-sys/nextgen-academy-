import {listRecords,createRecord} from "./store.js";
import {escapeHTML,formatDate,toast} from "./utils.js";
export async function renderAdmin(root,{user,profile}){
 const [courses,students,notices,admissions]=await Promise.all([listRecords("courses"),listRecords("students"),listRecords("notices"),listRecords("admissions")]);
 root.innerHTML=shell("admin",profile,`
 <div class="welcome-row"><div><span class="eyebrow">ADMIN OVERVIEW</span><h1>স্বাগতম, ${escapeHTML(profile.name||"Admin")} 👋</h1><p class="muted">আপনার একাডেমির সার্বিক কার্যক্রম এক নজরে দেখুন।</p></div><span class="pill">Administrator</span></div>
 <div class="stats-grid">
 ${stat("📚","মোট কোর্স",courses.length)}${stat("👨‍🎓","শিক্ষার্থী",students.length)}${stat("📢","নোটিশ",notices.length)}${stat("📝","ভর্তি আবেদন",admissions.length)}
 </div>
 <div class="content-grid">
  <section class="neu-card panel"><div class="panel-heading"><h2 class="section-title">দ্রুত কাজ</h2></div>
   <form id="course-form" class="form-stack compact"><label class="field"><span>নতুন কোর্সের নাম</span><input name="title" required placeholder="যেমন: HSC পদার্থবিজ্ঞান"></label><label class="field"><span>বর্ণনা</span><textarea name="description" rows="2" placeholder="কোর্স সম্পর্কে সংক্ষেপে"></textarea></label><button class="btn btn-primary">কোর্স যোগ করুন</button></form>
   <hr class="soft-divider">
   <form id="notice-form" class="form-stack compact"><label class="field"><span>নতুন নোটিশ</span><input name="title" required placeholder="নোটিশের শিরোনাম"></label><label class="field"><span>বিস্তারিত</span><textarea name="body" rows="2" required placeholder="নোটিশ লিখুন"></textarea></label><button class="btn btn-soft">নোটিশ প্রকাশ করুন</button></form>
  </section>
  <section class="neu-card panel"><h2 class="section-title">সাম্প্রতিক কোর্স</h2>${list(courses.slice(0,5),"title","কোনো কোর্স যোগ করা হয়নি")}</section>
  <section class="neu-card panel"><h2 class="section-title">সাম্প্রতিক নোটিশ</h2>${list(notices.slice(0,5),"title","এখনো কোনো নোটিশ নেই")}</section>
  <section class="neu-card panel"><h2 class="section-title">ভর্তি আবেদন</h2>${list(admissions.slice(0,5),"name","কোনো আবেদন পাওয়া যায়নি")}</section>
 </div>`);
 root.querySelector("#course-form").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{await createRecord("courses",{title:f.get("title").trim(),description:f.get("description").trim(),createdBy:user.uid,active:true});toast("কোর্স যোগ হয়েছে।","success");await renderAdmin(root,{user,profile});}catch(err){console.error(err);toast("কোর্স যোগ করা যায়নি।","error");}});
 root.querySelector("#notice-form").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{await createRecord("notices",{title:f.get("title").trim(),body:f.get("body").trim(),createdBy:user.uid});toast("নোটিশ প্রকাশিত হয়েছে।","success");await renderAdmin(root,{user,profile});}catch(err){console.error(err);toast("নোটিশ প্রকাশ করা যায়নি।","error");}});
}
function stat(icon,label,value){return `<article class="neu-card stat-card"><div class="stat-icon">${icon}</div><div><strong>${value}</strong><span>${label}</span></div></article>`;}
function list(items,key,empty){return items.length?`<ul class="simple-list">${items.map(x=>`<li><span>${escapeHTML(x[key]||"—")}</span><small>${formatDate(x.createdAt)}</small></li>`).join("")}</ul>`:`<p class="muted empty-state">${empty}</p>`;}
function shell(role,profile,content){return `<div class="app-shell role-${role}"><aside class="sidebar"><div class="sidebar-brand"><span class="brand-mark">N</span><div><b>NextGen</b><small>ACADEMY</small></div></div><nav class="side-nav"><span class="nav-caption">WORKSPACE</span><a class="nav-link active" href="#">▦ <span>ড্যাশবোর্ড</span></a><a class="nav-link" href="#courses">▤ <span>কোর্স</span></a><a class="nav-link" href="#students">♙ <span>শিক্ষার্থী</span></a><a class="nav-link" href="#notices">◉ <span>নোটিশ</span></a></nav><div class="sidebar-bottom"><div class="profile-mini"><span class="avatar">${escapeHTML((profile.name||"A")[0])}</span><div><b>${escapeHTML(profile.name||"Admin")}</b><small>Administrator</small></div></div><button id="logout-btn" class="btn btn-soft btn-block">↪ লগআউট</button></div></aside><main class="dashboard-main"><header class="topbar"><button id="mobile-menu-btn" class="btn btn-soft mobile-menu">☰</button><div class="topbar-title">Admin Dashboard</div><div class="topbar-actions"><button id="theme-btn" class="icon-btn" aria-label="থিম পরিবর্তন">◐</button><span class="avatar">${escapeHTML((profile.name||"A")[0])}</span></div></header><div class="dashboard-content">${content}</div></main></div>`;}
