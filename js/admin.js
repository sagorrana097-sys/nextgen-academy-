const AdminPortal = {
  render(state, activeTab = 'overview') {
    const totalCollected = state.fees
      .filter((f) => f.status === 'Paid')
      .reduce((sum, f) => sum + Number(f.amount || 0), 0);
    const totalTarget = Math.max(
      totalCollected,
      state.fees.reduce((sum, f) => sum + Number(f.amount || 0), 0),
      10000
    );
    const progressPct = Math.min(100, Math.round((totalCollected / totalTarget) * 100));

    const navItems = [
      { id: 'overview', label: state.lang === 'bn' ? 'ওভারভিউ' : 'Overview' },
      { id: 'admissions', label: state.lang === 'bn' ? 'ভর্তি আবেদন' : 'Admissions', badge: state.admissions.filter((a) => a.status === 'Pending').length },
      { id: 'students', label: state.lang === 'bn' ? 'শিক্ষার্থী ও ID' : 'Students & ID' },
      { id: 'teachers', label: state.lang === 'bn' ? 'শিক্ষকবৃন্দ' : 'Teachers' },
      { id: 'fees', label: state.lang === 'bn' ? 'ফি ও রিসিট' : 'Fees & Receipt' },
      { id: 'exams', label: state.lang === 'bn' ? 'পরীক্ষা ও GPA' : 'Exams & GPA' },
      { id: 'classes', label: state.lang === 'bn' ? 'অনলাইন ক্লাস' : 'Online Classes' },
      { id: 'notices', label: state.lang === 'bn' ? 'নোটিশ বোর্ড' : 'Notices', badge: state.notices.length },
      { id: 'textbooks', label: state.lang === 'bn' ? 'পাঠ্যপুস্তক' : 'Textbooks' },
      { id: 'settings', label: state.lang === 'bn' ? 'সেটিংস ও ব্যাকআপ' : 'Settings & Backup' }
    ];

    return `
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside class="lg:col-span-3 coffer-card rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-6">
              <div>
                <p class="text-xs font-extrabold uppercase tracking-wider text-indigo-600 dark:text-violet-400">Coffer ERP</p>
                <h2 class="text-lg font-extrabold text-slate-900 dark:text-white">${state.academy.name}</h2>
              </div>
              <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-700 dark:bg-violet-950 dark:text-violet-300">ADMIN</span>
            </div>

            <nav class="space-y-1.5">
              ${navItems
                .map(
                  (item) => `
                <button data-admin-tab="${item.id}" type="button"
                  class="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm font-bold transition ${
                    activeTab === item.id
                      ? 'coffer-pill-active'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-indigo-50/80 dark:hover:bg-slate-800/80'
                  }">
                  <span>${item.label}</span>
                  ${
                    item.badge
                      ? `<span class="px-2 py-0.5 text-xs font-extrabold rounded-full ${
                          activeTab === item.id ? 'bg-white/25 text-white' : 'bg-indigo-100 text-indigo-700 dark:bg-slate-800 dark:text-violet-300'
                        }">${item.badge}</span>`
                      : ''
                  }
                </button>
              `
                )
                .join('')}
            </nav>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
            <p class="text-xs font-bold text-slate-500 mb-2">${state.lang === 'bn' ? 'ড্যাশবোর্ড থিম' : 'Dashboard Theme'}</p>
            <div class="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <button id="theme-light-btn" type="button" class="py-1.5 rounded-xl text-xs font-extrabold ${
                state.theme === 'light' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-300'
              }">Light</button>
              <button id="theme-dark-btn" type="button" class="py-1.5 rounded-xl text-xs font-extrabold ${
                state.theme === 'dark' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-300'
              }">Dark</button>
            </div>
          </div>
        </aside>

        <section class="lg:col-span-9 space-y-6">
          <div class="coffer-card rounded-3xl p-6">
            <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white">
                  ${state.lang === 'bn' ? 'অ্যাডমিন কন্ট্রোল সেন্টার' : 'Admin Control Center'}
                </h1>
                <p class="text-sm text-slate-500 dark:text-slate-400">
                  ${state.lang === 'bn' ? 'মাসিক ফি সংগ্রহ অগ্রগতি ও অ্যাকাডেমিক সারসংক্ষেপ' : 'Monthly fee collection progress & academic overview'}
                </p>
              </div>
              <button id="admin-quick-add-student" type="button" class="coffer-btn-primary px-4 py-2.5 rounded-2xl text-sm font-bold">
                + ${state.lang === 'bn' ? 'নতুন শিক্ষার্থী' : 'New Student'}
              </button>
            </div>
            <div class="w-full h-3.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div class="h-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 transition-all" style="width:${progressPct}%"></div>
            </div>
            <div class="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mt-2">
              <span>${state.lang === 'bn' ? 'সংগৃহীত ফি' : 'Collected'}: ৳${totalCollected}</span>
              <span>${progressPct}%</span>
            </div>
          </div>

          ${this.renderTabContent(state, activeTab)}
        </section>
      </div>
    `;
  },

  renderTabContent(state, tab) {
    if (tab === 'overview') {
      const stats = [
        { label: state.lang === 'bn' ? 'মোট শিক্ষার্থী' : 'Total Students', val: state.students.length },
        { label: state.lang === 'bn' ? 'মোট শিক্ষক' : 'Total Teachers', val: state.teachers.length },
        { label: state.lang === 'bn' ? 'অনলাইন ক্লাস' : 'Online Classes', val: state.onlineClasses.length },
        { label: state.lang === 'bn' ? 'পেন্ডিং আবেদন' : 'Pending Admissions', val: state.admissions.filter((a) => a.status === 'Pending').length }
      ];
      return `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${stats
            .map(
              (s) => `
            <div class="coffer-card rounded-3xl p-5">
              <p class="text-xs font-bold text-slate-500">${s.label}</p>
              <p class="text-3xl font-extrabold text-indigo-700 dark:text-violet-400 mt-2">${s.val}</p>
            </div>
          `
            )
            .join('')}
        </div>
        <div class="coffer-card rounded-3xl p-6">
          <h3 class="font-bold text-base mb-3">${state.lang === 'bn' ? 'সাম্প্রতিক নোটিশ' : 'Recent Notices'}</h3>
          <div class="space-y-3">
            ${state.notices
              .map(
                (n) => `
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="font-bold">${n.title}</p>
                  <p class="text-xs text-slate-500 mt-1">${n.body}</p>
                </div>
                <a target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(n.title + ' - ' + n.body)}"
                   class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700">WhatsApp</a>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'admissions') {
      return `
        <div class="coffer-card rounded-3xl p-6 space-y-4">
          <h3 class="text-lg font-bold">${state.lang === 'bn' ? 'অনলাইন ভর্তি আবেদনসমূহ' : 'Admission Inquiries'}</h3>
          <div class="space-y-3">
            ${state.admissions
              .map(
                (a) => `
              <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="font-bold">${a.name} <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">${a.studentClass} • ${a.group} • ${a.batch}</span></p>
                  <p class="text-xs text-slate-500 mt-1">Phone: ${a.phone} | Status: <strong>${a.status}</strong></p>
                </div>
                <div class="flex gap-2">
                  ${
                    a.status !== 'Approved'
                      ? `<button data-approve-admission="${a.id}" type="button" class="coffer-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold">${state.lang === 'bn' ? 'ভর্তি নিশ্চিত করুন' : 'Approve'}</button>`
                      : ''
                  }
                  <button data-delete-admission="${a.id}" type="button" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700">${state.lang === 'bn' ? 'মুছুন' : 'Delete'}</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'students') {
      return `
        <div class="coffer-card rounded-3xl p-6 space-y-5">
          <h3 class="text-lg font-bold">${state.lang === 'bn' ? 'শিক্ষার্থী তালিকা, কাস্টম ID ও ID Card' : 'Students, Custom ID & ID Card'}</h3>
          <form id="admin-add-student-form" class="grid grid-cols-1 md:grid-cols-6 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <input name="customId" placeholder="Custom ID (e.g. STU-105)" class="coffer-input" />
            <input name="name" required placeholder="${state.lang === 'bn' ? 'শিক্ষার্থীর নাম' : 'Student Name'}" class="coffer-input" />
            <input name="phone" required placeholder="Phone" class="coffer-input" />
            <select name="studentClass" class="coffer-input">
              <option>Class 8</option><option>Class 9</option><option selected>Class 10</option><option>Class 11</option><option>Class 12</option>
            </select>
            <select name="group" class="coffer-input">
              <option>Science</option><option>Commerce</option><option>Arts</option><option>General</option>
            </select>
            <button type="submit" class="coffer-btn-primary rounded-xl text-sm font-bold py-2.5">${state.lang === 'bn' ? 'যুক্ত করুন' : 'Add'}</button>
          </form>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  <th class="py-2.5">ID</th>
                  <th class="py-2.5">Name</th>
                  <th class="py-2.5">Class / Group / Batch</th>
                  <th class="py-2.5">Pass</th>
                  <th class="py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                ${state.students
                  .map(
                    (s) => `
                  <tr>
                    <td class="py-3 font-extrabold text-indigo-600 dark:text-violet-400">${s.id}</td>
                    <td class="py-3 font-semibold">${s.name}</td>
                    <td class="py-3 text-xs">${s.studentClass} • ${s.group} • ${s.batch}</td>
                    <td class="py-3 text-xs font-mono">${s.password}</td>
                    <td class="py-3 text-right space-x-1.5">
                      <button data-print-id-card="${s.id}" type="button" class="coffer-btn-secondary px-2.5 py-1 rounded-lg text-xs font-bold">ID Card</button>
                      <button data-edit-student="${s.id}" type="button" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-white">Edit</button>
                      <button data-delete-student="${s.id}" type="button" class="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-600 text-white">Delete</button>
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }

    if (tab === 'teachers') {
      return `
        <div class="coffer-card rounded-3xl p-6 space-y-5">
          <h3 class="text-lg font-bold">${state.lang === 'bn' ? 'শিক্ষক তালিকা' : 'Teachers Management'}</h3>
          <form id="admin-add-teacher-form" class="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <input name="name" required placeholder="${state.lang === 'bn' ? 'শিক্ষকের নাম' : 'Teacher Name'}" class="coffer-input" />
            <input name="subject" required placeholder="Subject" class="coffer-input" />
            <input name="phone" required placeholder="Phone" class="coffer-input" />
            <button type="submit" class="coffer-btn-primary rounded-xl text-sm font-bold py-2.5">${state.lang === 'bn' ? 'শিক্ষক যুক্ত করুন' : 'Add Teacher'}</button>
          </form>
          <div class="space-y-2.5">
            ${state.teachers
              .map(
                (t) => `
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <p class="font-bold">${t.name} <span class="text-xs text-indigo-600 dark:text-violet-400">(${t.id} / Pass: ${t.password})</span></p>
                  <p class="text-xs text-slate-500">${t.subject} • ${t.phone}</p>
                </div>
                <button data-delete-teacher="${t.id}" type="button" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white">Delete</button>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'fees') {
      return `
        <div class="coffer-card rounded-3xl p-6 space-y-5">
          <h3 class="text-lg font-bold">${state.lang === 'bn' ? 'ফি কালেকশন ও প্রিন্টযোগ্য মানি রিসিট' : 'Fees & Printable Money Receipts'}</h3>
          <form id="admin-add-fee-form" class="grid grid-cols-1 md:grid-cols-6 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <select name="studentId" class="coffer-input">
              ${state.students.map((s) => `<option value="${s.id}">${s.id} - ${s.name}</option>`).join('')}
            </select>
            <input name="month" value="November 2026" class="coffer-input" />
            <input name="amount" type="number" value="2500" required class="coffer-input" />
            <select name="method" class="coffer-input">
              <option>bKash</option><option>Nagad</option><option>Rocket</option><option>Card</option><option>Cash</option>
            </select>
            <input name="accountNo" placeholder="Account / Ref No" class="coffer-input" />
            <button type="submit" class="coffer-btn-primary rounded-xl text-sm font-bold py-2.5">${state.lang === 'bn' ? 'রিসিট তৈরি' : 'Save Fee'}</button>
          </form>

          <div class="space-y-3">
            ${state.fees
              .map(
                (f) => `
              <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="font-bold">${f.receiptNo} • ${f.studentName} (${f.studentId}) — ৳${f.amount}</p>
                  <p class="text-xs text-slate-500">${f.month} • ${f.method} (${f.accountNo || 'N/A'}) • Verify: ${f.verificationCode} • <strong>${f.status}</strong></p>
                </div>
                <div class="flex gap-2">
                  ${
                    f.status !== 'Paid'
                      ? `<button data-mark-paid="${f.id}" type="button" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white">Mark Paid</button>`
                      : ''
                  }
                  <button data-print-receipt="${f.id}" type="button" class="coffer-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold">Print Receipt</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'exams') {
      return `
        <div class="coffer-card rounded-3xl p-6 space-y-5">
          <h3 class="text-lg font-bold">${state.lang === 'bn' ? 'পরীক্ষা ও স্বয়ংক্রিয় GPA/গ্রেড' : 'Exams & Auto GPA/Grade'}</h3>
          <form id="admin-add-exam-form" class="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <input name="title" required placeholder="Exam Title" class="coffer-input" />
            <select name="studentClass" class="coffer-input">
              <option>Class 8</option><option>Class 9</option><option selected>Class 10</option><option>Class 11</option><option>Class 12</option>
            </select>
            <input name="obtainedMarks" type="number" max="100" min="0" value="85" required class="coffer-input" />
            <input name="answerKey" placeholder="Answer Key" value="20" class="coffer-input" />
            <button type="submit" class="coffer-btn-primary rounded-xl text-sm font-bold py-2.5">${state.lang === 'bn' ? 'পরীক্ষা যুক্ত' : 'Add Exam'}</button>
          </form>
          <div class="space-y-2.5">
            ${state.exams
              .map((ex) => {
                const g = Store.calculateGrade(ex.obtainedMarks, ex.totalMarks || 100);
                return `
                  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <p class="font-bold">${ex.title} <span class="text-xs text-slate-500">(${ex.studentClass})</span></p>
                      <p class="text-xs text-slate-500">Marks: ${ex.obtainedMarks}/${ex.totalMarks || 100} • GPA: <strong>${g.gpa}</strong> • Grade: <strong>${g.grade}</strong></p>
                    </div>
                    <button data-delete-exam="${ex.id}" type="button" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white">Delete</button>
                  </div>
                `;
              })
              .join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'classes') {
      return `
        <div class="coffer-card rounded-3xl p-6 space-y-5">
          <h3 class="text-lg font-bold">${state.lang === 'bn' ? 'অনলাইন ক্লাস শিডিউল ও WhatsApp শেয়ার' : 'Online Classes & WhatsApp Share'}</h3>
          <form id="admin-add-class-form" class="grid grid-cols-1 md:grid-cols-5 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <input name="topic" required placeholder="Class Topic" class="coffer-input" />
            <select name="studentClass" class="coffer-input">
              <option>Class 8</option><option>Class 9</option><option selected>Class 10</option><option>Class 11</option><option>Class 12</option>
            </select>
            <input name="time" value="08:00 PM" class="coffer-input" />
            <input name="link" required placeholder="https://meet.google.com/..." class="coffer-input" />
            <button type="submit" class="coffer-btn-primary rounded-xl text-sm font-bold py-2.5">${state.lang === 'bn' ? 'ক্লাস যুক্ত' : 'Add Class'}</button>
          </form>
          <div class="space-y-2.5">
            ${state.onlineClasses
              .map(
                (c) => `
              <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="font-bold">${c.topic} <span class="text-xs text-indigo-600 dark:text-violet-400">(${c.studentClass} • ${c.time})</span></p>
                  <p class="text-xs text-slate-500 break-all">${c.link}</p>
                </div>
                <div class="flex gap-2">
                  <a href="${c.link}" target="_blank" rel="noopener" class="coffer-btn-primary px-3 py-1.5 rounded-xl text-xs font-bold">Join</a>
                  <a href="https://wa.me/?text=${encodeURIComponent('Online Class (' + c.studentClass + '): ' + c.topic + ' at ' + c.time + ' -> ' + c.link)}" target="_blank" rel="noopener" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white">WhatsApp</a>
                  <button data-delete-class="${c.id}" type="button" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white">Delete</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'notices') {
      return `
        <div class="coffer-card rounded-3xl p-6 space-y-5">
          <h3 class="text-lg font-bold">${state.lang === 'bn' ? 'নোটিশ প্রকাশ ও WhatsApp শেয়ার' : 'Notices & WhatsApp Share'}</h3>
          <form id="admin-add-notice-form" class="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
            <input name="title" required placeholder="Notice Title" class="coffer-input" />
            <input name="body" required placeholder="Notice Details" class="coffer-input" />
            <button type="submit" class="coffer-btn-primary rounded-xl text-sm font-bold py-2.5">${state.lang === 'bn' ? 'নোটিশ প্রকাশ' : 'Publish Notice'}</button>
          </form>
          <div class="space-y-2.5">
            ${state.notices
              .map(
                (n) => `
              <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="font-bold">${n.title}</p>
                  <p class="text-xs text-slate-500 mt-1">${n.body}</p>
                </div>
                <div class="flex gap-2">
                  <a href="https://wa.me/?text=${encodeURIComponent(n.title + '\n' + n.body)}" target="_blank" rel="noopener" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white">WhatsApp</a>
                  <button data-delete-notice="${n.id}" type="button" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white">Delete</button>
                </div>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    if (tab === 'textbooks') {
      return `
        <div class="coffer-card rounded-3xl p-6 space-y-4">
          <h3 class="text-lg font-bold">${state.lang === 'bn' ? 'পাঠ্যপুস্তক তালিকা' : 'Textbooks & Study Guides'}</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${state.textbooks
              .map(
                (b) => `
              <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40">
                <span class="text-xs font-bold text-indigo-600 dark:text-violet-400">${b.studentClass} • ${b.group}</span>
                <p class="font-bold mt-1">${b.title}</p>
                <p class="text-xs text-slate-500 mt-1">Code: ${b.code}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="coffer-card rounded-3xl p-6 space-y-4">
        <h3 class="text-lg font-bold">${state.lang === 'bn' ? 'অ্যাকাডেমি সেটিংস ও JSON ব্যাকআপ/রিস্টোর' : 'Academy Settings & JSON Backup/Restore'}</h3>
        <div class="flex flex-wrap gap-3">
          <button id="export-json-btn" type="button" class="coffer-btn-primary px-4 py-2.5 rounded-2xl text-sm font-bold">
            ${state.lang === 'bn' ? 'JSON ব্যাকআপ ডাউনলোড' : 'Download JSON Backup'}
          </button>
          <label class="coffer-btn-secondary px-4 py-2.5 rounded-2xl text-sm font-bold cursor-pointer">
            ${state.lang === 'bn' ? 'JSON রিস্টোর করুন' : 'Restore JSON'}
            <input id="import-json-input" type="file" accept="application/json" class="hidden" />
          </label>
          <button id="reset-demo-btn" type="button" class="px-4 py-2.5 rounded-2xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-700">
            ${state.lang === 'bn' ? 'ডিফল্ট ডেটা রিসেট' : 'Reset Demo Data'}
          </button>
        </div>
      </div>
    `;
  }
};
