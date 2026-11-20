import {listRecords,createRecord,updateRecord} from "./store.js";
import {escapeHTML,formatDate,toast} from "./utils.js";

export async function renderAdmin(root,{user,profile}){

const [courses,students,notices,admissions]=await Promise.all([
listRecords("courses"),
listRecords("students"),
listRecords("notices"),
listRecords("admissions")
]);

root.innerHTML=shell("admin",profile,`

 <div class="welcome-row">
  <div>
   <span class="eyebrow">ADMIN OVERVIEW</span>
   <h1>স্বাগতম, ${escapeHTML(profile.name||"Admin")} 👋</h1>
   <p class="muted">আপনার একাডেমির সার্বিক কার্যক্রম এক নজরে দেখুন।</p>
  </div>
  <span class="pill">Administrator</span>
 </div> <div class="stats-grid">
  ${stat("📚","মোট কোর্স",courses.length)}
  ${stat("👨‍🎓","শিক্ষার্থী",students.length)}
  ${stat("📢","নোটিশ",notices.length)}
  ${stat("📝","ভর্তি আবেদন",admissions.length)}
 </div> <div class="content-grid">  <section class="neu-card panel">
   <div class="panel-heading">
    <h2 class="section-title">দ্রুত কাজ</h2>
   </div>   <form id="course-form" class="form-stack compact">
    <label class="field">
     <span>নতুন কোর্সের নাম</span>
     <input name="title" required placeholder="যেমন: HSC পদার্থবিজ্ঞান">
    </label><label class="field">
 <span>বর্ণনা</span>
 <textarea name="description" rows="2"></textarea>
</label>

<button class="btn btn-primary">কোর্স যোগ করুন</button>

   </form>   <hr class="soft-divider">   <form id="notice-form" class="form-stack compact">
    <label class="field">
     <span>নতুন নোটিশ</span>
     <input name="title" required placeholder="নোটিশের শিরোনাম">
    </label><label class="field">
 <span>বিস্তারিত</span>
 <textarea name="body" rows="2" required></textarea>
</label>

<button class="btn btn-soft">নোটিশ প্রকাশ করুন</button>

   </form>
  </section>  <section class="neu-card panel">
   <h2 class="section-title">সাম্প্রতিক কোর্স</h2>
   ${list(courses.slice(0,5),"title","কোনো কোর্স যোগ করা হয়নি")}
  </section>  <section class="neu-card panel">
   <h2 class="section-title">সাম্প্রতিক নোটিশ</h2>
   ${list(notices.slice(0,5),"title","এখনো কোনো নোটিশ নেই")}
  </section> </div> <section class="neu-card panel admission-panel">
  <div class="panel-heading">
   <div>
    <h2 class="section-title">ভর্তি আবেদন ব্যবস্থাপনা</h2>
    <p class="muted">শিক্ষার্থীদের আবেদন দেখুন ও পরিচালনা করুন।</p>
   </div>
   <span class="pill">${admissions.length} টি আবেদন</span>
  </div>${admissionList(admissions)}

 </section> <dialog id="admission-dialog" class="admission-dialog">
  <div id="admission-details"></div>
  <button type="button" id="close-admission" class="btn btn-soft btn-block">
   বন্ধ করুন
  </button>
 </dialog>`);

// Course creation
root.querySelector("#course-form").addEventListener("submit",async e=>{
e.preventDefault();

const f=new FormData(e.currentTarget);

try{
await createRecord("courses",{
title:f.get("title").trim(),
description:f.get("description").trim(),
createdBy:user.uid,
active:true
});

toast("কোর্স যোগ হয়েছে।","success");
await renderAdmin(root,{user,profile});

}catch(err){
console.error(err);
toast("কোর্স যোগ করা যায়নি।","error");
}
});

// Notice creation
root.querySelector("#notice-form").addEventListener("submit",async e=>{
e.preventDefault();

const f=new FormData(e.currentTarget);

try{
await createRecord("notices",{
title:f.get("title").trim(),
body:f.get("body").trim(),
createdBy:user.uid
});

toast("নোটিশ প্রকাশিত হয়েছে।","success");
await renderAdmin(root,{user,profile});

}catch(err){
console.error(err);
toast("নোটিশ প্রকাশ করা যায়নি।","error");
}
});

// Admission details and actions
const dialog=root.querySelector("#admission-dialog");
const details=root.querySelector("#admission-details");

root.querySelector("#close-admission").addEventListener("click",()=>{
dialog.close();
});

root.querySelectorAll("[data-action]").forEach(button=>{

button.addEventListener("click",async()=>{

const id=button.dataset.id;
const action=button.dataset.action;

const admission=admissions.find(a=>a.id===id);

if(!admission)return;

if(action==="details"){

details.innerHTML=`
 <h2 class="section-title">আবেদনের বিস্তারিত</h2>

 <div class="form-stack">
  <p><b>শিক্ষার্থীর নাম:</b> ${escapeHTML(admission.name||"—")}</p>
  <p><b>ইমেইল:</b> ${escapeHTML(admission.email||"—")}</p>
  <p><b>মোবাইল:</b> ${escapeHTML(admission.phone||"—")}</p>
  <p><b>কোর্স:</b> ${escapeHTML(admission.course||"—")}</p>
  <p><b>আবেদনের তারিখ:</b> ${formatDate(admission.createdAt)}</p>
  <p><b>অবস্থা:</b> ${statusLabel(admission.status)}</p>
 </div>
`;

dialog.showModal();
return;

}

if(admission.status!=="pending"){
toast("এই আবেদনের সিদ্ধান্ত আগেই দেওয়া হয়েছে।","error");
return;
}

const approved=action==="approve";

const message=approved
?"আপনি কি এই শিক্ষার্থীর আবেদন অনুমোদন করতে চান?"
:"আপনি কি এই আবেদন বাতিল করতে চান?";

if(!confirm(message))return;

button.disabled=true;

try{

if(approved){

 // Create student record from approved application
 await createRecord("students",{
  uid:admission.uid,
  name:admission.name||"",
  email:admission.email||"",
  phone:admission.phone||"",
  course:admission.course||"",
  status:"active",
  admissionId:admission.id
 });

 await updateRecord("admissions",id,{
  status:"approved",
  approvedBy:user.uid,
  approvedAt:new Date()
 });

 toast("আবেদন অনুমোদিত হয়েছে এবং শিক্ষার্থী তালিকায় যুক্ত হয়েছে।","success");

}else{

 await updateRecord("admissions",id,{
  status:"rejected",
  rejectedBy:user.uid,
  rejectedAt:new Date()
 });

 toast("আবেদন বাতিল করা হয়েছে।","success");
}

await renderAdmin(root,{user,profile});

}catch(err){

console.error(err);
toast("আবেদনের তথ্য আপডেট করা যায়নি। বিস্তারিত Console-এ দেখুন।","error");
button.disabled=false;

}

});

});

}

function stat(icon,label,value){
return `

 <article class="neu-card stat-card">
  <div class="stat-icon">${icon}</div>
  <div>
   <strong>${value}</strong>
   <span>${label}</span>
  </div>
 </article>`;
}function list(items,key,empty){
return items.length
?"<ul class="simple-list"> ${items.map(x=>"
<li>
<span>${escapeHTML(x[key]||"—")}</span>
<small>${formatDate(x.createdAt)}</small>
</li>
`).join("")}

  </ul>`
 :`<p class="muted empty-state">${empty}</p>`;
}function statusLabel(status){

const labels={
pending:"🟡 Pending",
approved:"🟢 Approved",
rejected:"🔴 Rejected"
};

return labels[status]||"🟡 Pending";
}

function admissionList(admissions){

if(!admissions.length){
return "<p class="muted empty-state">কোনো ভর্তি আবেদন পাওয়া যায়নি।</p>";
}

return `

 <div class="admission-list">${admissions.map(a=>`

  <article class="admission-item">   <div class="admission-info">
    <h3>${escapeHTML(a.name||"নাম পাওয়া যায়নি")}</h3>
    <p>${escapeHTML(a.course||"কোর্স উল্লেখ নেই")}</p>
    <small>${formatDate(a.createdAt)}</small>
    <p class="admission-status">${statusLabel(a.status)}</p>
   </div>   <div class="admission-actions"><button class="btn btn-soft"
 data-action="details"
 data-id="${escapeHTML(a.id)}">
 বিস্তারিত
</button>

${(!a.status||a.status==="pending")?`

 <button class="btn btn-primary"
  data-action="approve"
  data-id="${escapeHTML(a.id)}">
  Approve
 </button>

 <button class="btn btn-soft"
  data-action="reject"
  data-id="${escapeHTML(a.id)}">
  Reject
 </button>

`:""}

   </div>  </article>`).join("")}

 </div>`;
}function shell(role,profile,content){

return `

 <div class="app-shell role-${role}">  <aside class="sidebar">   <div class="sidebar-brand">
    <span class="brand-mark">N</span>
    <div><b>NextGen</b><small>ACADEMY</small></div>
   </div>   <nav class="side-nav">
    <span class="nav-caption">WORKSPACE</span>
    <a class="nav-link active" href="#">▦ <span>ড্যাশবোর্ড</span></a>
    <a class="nav-link" href="#courses">▤ <span>কোর্স</span></a>
    <a class="nav-link" href="#students">♙ <span>শিক্ষার্থী</span></a>
    <a class="nav-link" href="#notices">◉ <span>নোটিশ</span></a>
   </nav>   <div class="sidebar-bottom">
    <div class="profile-mini">
     <span class="avatar">${escapeHTML((profile.name||"A")[0])}</span>
     <div>
      <b>${escapeHTML(profile.name||"Admin")}</b>
      <small>Administrator</small>
     </div>
    </div><button id="logout-btn" class="btn btn-soft btn-block">
 ↪ লগআউট
</button>

   </div>  </aside>  <main class="dashboard-main">   <header class="topbar">
    <button id="mobile-menu-btn" class="btn btn-soft mobile-menu">☰</button>
    <div class="topbar-title">Admin Dashboard</div>
    <div class="topbar-actions">
     <button id="theme-btn" class="icon-btn" aria-label="থিম পরিবর্তন">◐</button>
     <span class="avatar">${escapeHTML((profile.name||"A")[0])}</span>
    </div>
   </header>   <div class="dashboard-content">${content}</div>  </main>
 </div>`;
}
