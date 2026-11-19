const AdminPortal = {
  render(state, activeTab = 'overview') {
    const bn = state.lang === 'bn';
    const pendingCount = (state.admissions || []).filter((a) => a.status === 'Pending').length;
    const paidTotal = (state.fees || [])
      .filter((f) => f.status === 'Paid')
      .reduce((sum, f) => sum + Number(f.amount || 0), 0);

    const tabs = [
      { id: 'overview', label: bn ? 'ওভারভিউ' : 'Overview' },
      { id: 'admissions', label: bn ? 'ভর্তি আবেদন' : 'Admissions', badge: pendingCount },
      { id: 'students', label: bn ? 'শিক্ষার্থী ও ID' : 'Students & ID' },
      { id: 'teachers', label: bn ? 'শিক্ষকবৃন্দ' : 'Teachers' },
      { id: 'fees', label: bn ? 'ফি ও রিসিট' : 'Fees & Receipt' },
      { id: 'exams', label: bn ? 'পরীক্ষা ও GPA' : 'Exams & GPA' },
      { id: 'classes', label: bn ? 'অনলাইন ক্লাস' : 'Online Classes' },
      { id: 'notices', label: bn ? 'নোটিশ বোর্ড' : 'Notices', badge: (state.notices || []).length },
      { id: 'textbooks', label: bn ? 'পাঠ্যপুস্তক' : 'Textbooks' },
      { id: 'settings', label: bn ? 'সেটিংস ও ব্যাকআপ' : 'Settings & Backup' }
    ];

    let content = '';

    if (activeTab === 'overview') {
      content = `
        <div class="neu-card rounded-3xl p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-xl font-extrabold">${bn ? 'অ্যাডমিন কন্ট্রোল সেন্টার' : 'Admin Control Center'}</h2>
              <p class="text-xs text-slate-500">${state.academy.name} • ${state.academy.director}</p>
            </div>
            <button id="admin-quick-add-student" type="button" class="neu-btn-primary px-4 py-2 rounded-xl text-xs">+ ${bn ? 'নতুন শিক্ষার্থী' : 'Add Student'}</button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="neu-input rounded-2xl p-4">
              <p class="text-xs text-slate-500">${bn ? 'মোট শিক্ষার্থী' : 'Total Students'}</p>
              <p class="text-2xl font-extrabold mt-1">${state.students.length}</p>
            </div>
            <div class="neu-input rounded-2xl p-4">
              <p class="text-xs text-slate-500">${bn ? 'পেন্ডিং আবেদন' : 'Pending Admissions'}</p>
              <p class="text-2xl font-extrabold mt-1">${pendingCount}</p>
            </div>
            <div class="neu-input rounded-2xl p-4">
              <p class="text-xs text-slate-500">${bn ? 'সংগৃহীত ফি' : 'Collected Fees'}</p>
              <p class="text-2xl font-extrabold mt-1">৳${paidTotal}</p>
            </div>
          </div>
        </div>
      `;
    } else if (activeTab === 'admissions') {
      content = `
        <div class="neu-card rounded-3xl p-6 space-y-4">
          <h2 class="text-lg font-extrabold">${bn ? 'অনলাইন ভর্তি আবেদনসমূহ' : 'Online Admission Requests'}</h2>
          ${(state.admissions || [])
            .map(
              (a) => `
            <div class="neu-input rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="font-bold text-sm">${a.name} <span class="text-xs text-slate-500">(${a.id})</span></p>
                <p class="text-xs text-slate-500">${a.studentClass} • ${a.group} • ${a.batch} • Phone: ${a.phone} • Status: ${a.status}</p>
              </div>
              <div class="flex gap-2">
                ${a.status === 'Pending' ? `<button data-approve-admission="${a.id}" type="button" class="neu-btn-primary px-3.5 py-1.5 rounded-xl text-xs">${bn ? 'ভর্তি নিশ্চিত করুন' : 'Approve'}</button>` : ''}
                <button data-delete-admission="${a.id}" type="button" class="neu-btn px-3 py-1.5 rounded-xl text-xs text-rose-600">${bn ? 'মুছুন' : 'Delete'}</button>
              </div>
            </div>
          `
            )
            .join('') || `<p class="text-xs text-slate-500">No admissions found.</p>`}
        </div>
      `;
    } else if (activeTab === 'students') {
      content = `
        <div class="neu-card rounded-3xl p-6 space-y-4">
          <h2 class="text-lg font-extrabold">${bn ? 'শিক্ষার্থী তালিকা, কাস্টম ID ও ID Card' : 'Students, Custom ID & ID Card'}</h2>
          <form id="admin-add-student-form" class="grid grid-cols-1 sm:grid-cols-6 gap-2.5">
            <input name="customId" placeholder="Custom ID (e.g. STU-102)" class="neu-input" />
            <input name="name" required placeholder="${bn ? 'শিক্ষার্থীর নাম' : 'Student Name'}" class="neu-input" />
            <input name="phone" required placeholder="Phone" class="neu-input" />
            <select name="studentClass" class="neu-input text-xs"><option>Class 8</option><option>Class 9</option><option selected>Class 10</option><option>Class 11</option><option>Class 12</option></select>
            <select name="group" class="neu-input text-xs"><option>Science</option><option>Commerce</option><option>Arts</option><option>General</option></select>
            <button type="submit" class="neu-btn-primary px-4 py-2 rounded-xl text-xs">+ ${bn ? 'যুক্ত করুন' : 'Add'}</button>
          </form>
          <div class="space-y-2.5">
            ${(state.students || [])
              .map(
                (s) => `
              <div class="neu-input rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p class="font-bold text-sm">${s.id} — ${s.name}</p>
                  <p class="text-xs text-slate-500">${s.studentClass} • ${s.group} • ${s.batch} • Pass: ${s.password}</p>
                </div>
                <div class="flex gap-2">
                  <button data-print-id-card="${s.id}" type="button" class="neu-btn-primary px-3 py-1.5 rounded-xl text-xs">ID Card</button>
                  <button data-edit-student="${s.id}" type="button" class="neu-btn px-3 py-1.5 rounded-xl text-xs">Edit</button>
                  <button data-delete-student="${s.id}" type="button" class="neu-btn px-3 py-1.5 rounded-xl text-xs text-rose-600">Delete</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    } else if (activeTab === 'teachers') {
      content = `
        <div class="neu-card rounded-3xl p-6 space-y-4">
          <h2 class="text-lg font-extrabold">${bn ? 'শিক্ষক ব্যবস্থাপনা' : 'Teachers Management'}</h2>
          <form id="admin-add-teacher-form" class="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
            <input name="name" required placeholder="Teacher Name" class="neu-input" />
            <input name="subject" required placeholder="Subject" class="neu-input" />
            <input name="phone" required placeholder="Phone" class="neu-input" />
            <button type="submit" class="neu-btn-primary px-4 py-2 rounded-xl text-xs">+ Add Teacher</button>
          </form>
          <div class="space-y-2">
            ${(state.teachers || [])
              .map(
                (t) => `
              <div class="neu-input rounded-2xl p-3.5 flex items-center justify-between gap-2">
                <div>
                  <p class="font-bold text-sm">${t.id} — ${t.name}</p>
                  <p class="text-xs text-slate-500">${t.subject} • Phone: ${t.phone} • Pass: ${t.password}</p>
                </div>
                <button data-delete-teacher="${t.id}" type="button" class="neu-btn px-3 py-1.5 rounded-xl text-xs text-rose-600">Delete</button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    } else if (activeTab === 'fees') {
      content = `
        <div class="neu-card rounded-3xl p-6 space-y-4">
          <h2 class="text-lg font-extrabold">${bn ? 'ফি সংগ্রহ ও মানি রিসিট' : 'Fee Collection & Receipt'}</h2>
          <form id="admin-add-fee-form" class="grid grid-cols-1 sm:grid-cols-6 gap-2.5">
            <select name="studentId" class="neu-input text-xs">
              ${(state.students || []).map((s) => `<option value="${s.id}">${s.id} - ${s.name}</option>`).join('')}
            </select>
            <input name="month" required value="November 2026" class="neu-input" />
            <input name="amount" type="number" required value="2500" class="neu-input" />
            <select name="method" class="neu-input text-xs"><option>bKash</option><option>Nagad</option><option>Rocket</option><option>Cash</option></select>
            <input name="accountNo" placeholder="Account / Ref" class="neu-input" />
            <button type="submit" class="neu-btn-primary px-4 py-2 rounded-xl text-xs">+ Collect</button>
          </form>
          <div class="space-y-2">
            ${(state.fees || [])
              .map(
                (f) => `
              <div class="neu-input rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p class="font-bold text-sm">${f.receiptNo} — ${f.studentName} (${f.studentId}) • ৳${f.amount}</p>
                  <p class="text-xs text-slate-500">${f.month} • ${f.method} • Status: ${f.status}</p>
                </div>
                <div class="flex gap-2">
                  ${f.status !== 'Paid' ? `<button data-mark-paid="${f.id}" type="button" class="neu-btn px-3 py-1.5 rounded-xl text-xs">Mark Paid</button>` : ''}
                  <button data-print-receipt="${f.id}" type="button" class="neu-btn-primary px-3 py-1.5 rounded-xl text-xs">Print Receipt</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    } else if (activeTab === 'exams') {
      content = `
        <div class="neu-card rounded-3xl p-6 space-y-4">
          <h2 class="text-lg font-extrabold">${bn ? 'পরীক্ষা, ফলাফল ও GPA' : 'Exams, Marks & GPA'}</h2>
          <form id="admin-add-exam-form" class="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            <input name="title" required placeholder="Exam Title" class="neu-input" />
            <select name="studentClass" class="neu-input text-xs"><option>Class 8</option><option>Class 9</option><option selected>Class 10</option><option>Class 11</option><option>Class 12</option></select>
            <input name="obtainedMarks" type="number" max="100" min="0" required placeholder="Marks (out of 100)" class="neu-input" />
            <input name="answerKey" placeholder="Answer Key" class="neu-input" />
            <button type="submit" class="neu-btn-primary px-4 py-2 rounded-xl text-xs">+ Add Result</button>
          </form>
          <div class="space-y-2">
            ${(state.exams || [])
              .map((e) => {
                const g = Store.calculateGrade(e.obtainedMarks, e.totalMarks || 100);
                return `
                  <div class="neu-input rounded-2xl p-3.5 flex items-center justify-between gap-2">
                    <div>
                      <p class="font-bold text-sm">${e.title} (${e.studentClass})</p>
                      <p class="text-xs text-slate-500">Marks: ${e.obtainedMarks}/${e.totalMarks || 100} • GPA: <strong>${g.gpa}</strong> (${g.grade})</p>
                    </div>
                    <button data-delete-exam="${e.id}" type="button" class="neu-btn px-3 py-1.5 rounded-xl text-xs text-rose-600">Delete</button>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      `;
    } else if (activeTab === 'classes') {
      content = `
        <div class="neu-card rounded-3xl p-6 space-y-4">
          <h2 class="text-lg font-extrabold">${bn ? 'অনলাইন ক্লাস ব্যবস্থাপনা' : 'Online Classes'}</h2>
          <form id="admin-add-class-form" class="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            <input name="topic" required placeholder="Class Topic" class="neu-input" />
            <select name="studentClass" class="neu-input text-xs"><option>Class 8</option><option>Class 9</option><option selected>Class 10</option><option>Class 11</option><option>Class 12</option></select>
            <input name="time" required placeholder="Time (e.g. 08:00 PM)" class="neu-input" />
            <input name="link" type="url" required placeholder="https://meet.google.com/..." class="neu-input" />
            <button type="submit" class="neu-btn-primary px-4 py-2 rounded-xl text-xs">+ Add Class</button>
          </form>
          <div class="space-y-2">
            ${(state.onlineClasses || [])
              .map(
                (c) => `
              <div class="neu-input rounded-2xl p-3.5 flex items-center justify-between gap-2">
                <div>
                  <p class="font-bold text-sm">${c.topic}</p>
                  <p class="text-xs text-slate-500">${c.studentClass} • ${c.date} • ${c.time}</p>
                </div>
                <div class="flex gap-2">
                  <a href="${c.link}" target="_blank" rel="noopener" class="neu-btn-primary px-3 py-1.5 rounded-xl text-xs">Join</a>
                  <button data-delete-class="${c.id}" type="button" class="neu-btn px-3 py-1.5 rounded-xl text-xs text-rose-600">Delete</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    } else if (activeTab === 'notices') {
      content = `
        <div class="neu-card rounded-3xl p-6 space-y-4">
          <h2 class="text-lg font-extrabold">${bn ? 'নোটিশ বোর্ড' : 'Notice Board'}</h2>
          <form id="admin-add-notice-form" class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <input name="title" required placeholder="Notice Title" class="neu-input" />
            <input name="body" required placeholder="Notice Details" class="neu-input" />
            <button type="submit" class="neu-btn-primary px-4 py-2 rounded-xl text-xs">+ Publish Notice</button>
          </form>
          <div class="space-y-2">
            ${(state.notices || [])
              .map(
                (n) => `
              <div class="neu-input rounded-2xl p-3.5 flex items-center justify-between gap-2">
                <div>
                  <p class="font-bold text-sm">${n.title}</p>
                  <p class="text-xs text-slate-500">${n.body}</p>
                </div>
                <button data-delete-notice="${n.id}" type="button" class="neu-btn px-3 py-1.5 rounded-xl text-xs text-rose-600">Delete</button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    } else if (activeTab === 'textbooks') {
      content = `
        <div class="neu-card rounded-3xl p-6 space-y-3">
          <h2 class="text-lg font-extrabold">${bn ? 'পাঠ্যপুস্তক তালিকা' : 'Textbooks Directory'}</h2>
          ${(state.textbooks || [])
            .map(
              (b) => `
            <div class="neu-input rounded-2xl p-3.5 flex items-center justify-between">
              <span class="font-bold text-sm">${b.title} (${b.code})</span>
              <span class="text-xs text-slate-500">${b.studentClass} • ${b.group}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    } else {
      content = `
        <div class="neu-card rounded-3xl p-6 space-y-4">
          <h2 class="text-lg font-extrabold">${bn ? 'সেটিংস ও ব্যাকআপ' : 'Settings & Backup'}</h2>
          <div class="flex flex-wrap gap-3">
            <button id="theme-light-btn" type="button" class="neu-btn px-4 py-2 rounded-xl text-xs font-bold">Light Mode</button>
            <button id="theme-dark-btn" type="button" class="neu-btn px-4 py-2 rounded-xl text-xs font-bold">Dark Mode</button>
            <button id="export-json-btn" type="button" class="neu-btn-primary px-4 py-2 rounded-xl text-xs">Export JSON</button>
            <label class="neu-btn px-4 py-2 rounded-xl text-xs font-bold">
              Import JSON
              <input id="import-json-input" type="file" accept="application/json" class="hidden" />
            </label>
            <button id="reset-demo-btn" type="button" class="neu-btn px-4 py-2 rounded-xl text-xs font-bold text-rose-600">Reset Demo</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <aside class="lg:col-span-3 neu-card rounded-3xl p-4 space-y-1.5">
          <p class="px-3 py-1 text-xs font-extrabold uppercase text-blue-600">ADMIN MENU</p>
          ${tabs
            .map(
              (t) => `
            <button data-admin-tab="${t.id}" type="button" class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold ${activeTab === t.id ? 'neu-pill-active' : 'neu-btn'}">
              <span>${t.label}</span>
              ${typeof t.badge === 'number' ? `<span class="px-2 py-0.5 rounded-full text-[11px] neu-input">${t.badge}</span>` : ''}
            </button>
          `
            )
            .join('')}
        </aside>
        <section class="lg:col-span-9">${content}</section>
      </div>
    `;
  }
};
