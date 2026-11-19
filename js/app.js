if (window.location.search && window.history && typeof window.history.replaceState === 'function') {
  window.history.replaceState({}, document.title, window.location.pathname);
}

let appState = typeof Store !== 'undefined' ? Store.load() : cloneDefaultState();
let currentAdminTab = 'overview';

function applyTheme() {
  document.documentElement.classList.toggle('dark', appState.theme === 'dark');
}

function openModal(title, html) {
  const backdrop = document.getElementById('modal-backdrop');
  if (!backdrop) return;
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  backdrop.classList.remove('hidden');
  backdrop.classList.add('flex');
}

function closeModal() {
  const backdrop = document.getElementById('modal-backdrop');
  if (!backdrop) return;
  backdrop.classList.add('hidden');
  backdrop.classList.remove('flex');
}

function triggerPrint(html) {
  const printArea = document.getElementById('print-area');
  if (!printArea) return;
  printArea.innerHTML = html;
  window.print();
}

function buildIdCardHtml(student) {
  return `
    <div class="max-w-sm mx-auto border-2 border-indigo-600 rounded-2xl p-5 bg-white text-slate-900">
      <div class="flex items-center justify-between border-b pb-2 mb-3">
        <div>
          <p class="text-xs font-bold uppercase text-indigo-600">${appState.academy.name}</p>
          <p class="text-[11px] text-slate-500">${appState.academy.address}</p>
        </div>
        <span class="px-2.5 py-1 text-xs font-bold rounded bg-indigo-100 text-indigo-700">${student.id}</span>
      </div>
      <div class="space-y-1 text-xs">
        <p><strong>Name:</strong> ${student.name}</p>
        <p><strong>Class & Group:</strong> ${student.studentClass} (${student.group})</p>
        <p><strong>Batch:</strong> ${student.batch}</p>
        <p><strong>Phone:</strong> ${student.phone}</p>
        <p><strong>Verify Code:</strong> ${student.verificationCode || 'NGA-VER-01'}</p>
      </div>
      <div class="mt-4 pt-3 border-t flex items-end justify-between text-[11px] text-slate-500">
        <div>
          <p>${appState.academy.phone}</p>
          <p>${appState.academy.email}</p>
        </div>
        <span class="font-semibold text-slate-800 border-t border-slate-400 pt-1">${appState.academy.director}</span>
      </div>
    </div>
  `;
}

function buildReceiptHtml(fee) {
  return `
    <div class="max-w-lg mx-auto border border-slate-300 rounded-2xl p-6 bg-white text-slate-900">
      <div class="flex items-center justify-between border-b pb-3 mb-4">
        <div>
          <h3 class="text-lg font-extrabold text-indigo-700">${appState.academy.name}</h3>
          <p class="text-xs text-slate-500">${appState.academy.address}</p>
          <p class="text-[11px] text-slate-500">Email: ${appState.academy.email} | Tel: ${appState.academy.phone}</p>
        </div>
        <div class="text-right text-xs">
          <p class="font-bold">Receipt: ${fee.receiptNo}</p>
          <p class="text-slate-500">Verify: ${fee.verificationCode}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-2 text-xs mb-4">
        <p><strong>Student:</strong> ${fee.studentName} (${fee.studentId})</p>
        <p><strong>Month:</strong> ${fee.month}</p>
        <p><strong>Method:</strong> ${fee.method}</p>
        <p><strong>Account/Ref:</strong> ${fee.accountNo || 'N/A'}</p>
        <p><strong>Status:</strong> ${fee.status}</p>
        <p><strong>Date:</strong> ${fee.date}</p>
      </div>
      <div class="p-3 rounded-xl bg-slate-100 flex items-center justify-between font-bold text-sm mb-5">
        <span>Total Paid Amount</span>
        <span>৳${fee.amount}</span>
      </div>
      <div class="flex justify-between items-end text-xs text-slate-500 pt-4 border-t">
        <span>${appState.academy.email}</span>
        <span class="font-semibold text-slate-800 border-t border-slate-400 pt-1">${appState.academy.director}</span>
      </div>
    </div>
  `;
}

function verifyCredentials(userId, password) {
  const cleanId = String(userId || '').trim();
  const cleanPass = String(password || '').trim();

  if (typeof Auth !== 'undefined' && typeof Auth.login === 'function') {
    const res = Auth.login(cleanId, cleanPass);
    if (res && res.ok && res.user) return res.user;
  }

  if (cleanId.toLowerCase() === 'admin' && cleanPass === '1234') {
    return { id: 'admin', name: 'Super Admin', role: 'admin' };
  }

  const teacher = (appState.teachers || []).find(
    (t) => String(t.id || '').trim().toLowerCase() === cleanId.toLowerCase() && String(t.password || '').trim() === cleanPass
  );
  if (teacher) return { ...teacher, role: 'teacher' };

  const student = (appState.students || []).find(
    (s) => String(s.id || '').trim().toLowerCase() === cleanId.toLowerCase() && String(s.password || '').trim() === cleanPass
  );
  if (student) return { ...student, role: 'student' };

  return null;
}

function renderPublicSite() {
  const bn = appState.lang === 'bn';
  return `
    <div class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-7 coffer-card rounded-3xl p-7 space-y-4">
          <span class="inline-block px-3.5 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-700 dark:bg-violet-950 dark:text-violet-300">
            ${bn ? 'স্মার্ট অ্যাকাডেমিক ও ERP পোর্টাল' : 'Smart Academic & ERP Portal'}
          </span>
          <h1 class="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
            ${appState.academy.name}
          </h1>
          <p class="text-slate-600 dark:text-slate-300 text-sm md:text-base">
            ${bn ? appState.academy.taglineBn : appState.academy.taglineEn}
          </p>
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs md:text-sm space-y-1 text-slate-700 dark:text-slate-200">
            <p><strong>${bn ? 'পরিচালক:' : 'Director:'}</strong> ${appState.academy.director}</p>
            <p><strong>${bn ? 'ঠিকানা:' : 'Address:'}</strong> ${appState.academy.address}</p>
            <p><strong>${bn ? 'মোবাইল:' : 'Phone:'}</strong> ${appState.academy.phone}</p>
            <p><strong>${bn ? 'ইমেইল:' : 'Email:'}</strong> ${appState.academy.email}</p>
          </div>
          <div class="flex flex-wrap gap-3 pt-2">
            <button id="open-login-modal-btn" type="button" class="coffer-btn-primary px-5 py-2.5 rounded-2xl text-sm font-bold">
              ${bn ? 'পোর্টালে লগইন করুন' : 'Portal Login'}
            </button>
            <button id="open-recovery-modal-btn" type="button" class="coffer-btn-secondary px-5 py-2.5 rounded-2xl text-sm font-bold">
              ${bn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
            </button>
          </div>
          <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            Demo Credentials — Admin: <strong>admin / 1234</strong> • Teacher: <strong>TCH-01 / 123</strong> • Student: <strong>STU-101 / 123</strong>
          </div>
        </div>

        <div class="lg:col-span-5 coffer-card rounded-3xl p-6">
          <h2 class="text-lg font-extrabold mb-3 text-slate-900 dark:text-white">${bn ? 'অনলাইন ভর্তি আবেদন' : 'Online Admission'}</h2>
          <form id="public-admission-form" action="javascript:void(0)" method="post" class="space-y-3">
            <input name="name" required placeholder="${bn ? 'শিক্ষার্থীর পূর্ণ নাম' : 'Student Full Name'}" class="coffer-input" />
            <input name="phone" required placeholder="${bn ? 'মোবাইল নম্বর' : 'Mobile Number'}" class="coffer-input" />
            <div class="grid grid-cols-3 gap-2">
              <select name="studentClass" class="coffer-input text-xs">
                <option>Class 8</option><option>Class 9</option><option selected>Class 10</option><option>Class 11</option><option>Class 12</option>
              </select>
              <select name="group" class="coffer-input text-xs">
                <option>Science</option><option>Commerce</option><option>Arts</option><option>General</option>
              </select>
              <select name="batch" class="coffer-input text-xs">
                <option>Morning</option><option>Day</option><option>Evening</option>
              </select>
            </div>
            <button type="submit" class="coffer-btn-primary w-full py-2.5 rounded-2xl text-sm font-bold">
              ${bn ? 'আবেদন জমা দিন' : 'Submit Admission'}
            </button>
          </form>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="coffer-card rounded-3xl p-6 space-y-3">
          <h3 class="font-bold text-lg">${bn ? 'নোটিশ বোর্ড' : 'Notice Board'}</h3>
          ${(appState.notices || [])
            .map(
              (n) => `
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3">
              <div>
                <p class="font-bold text-sm">${n.title}</p>
                <p class="text-xs text-slate-500 mt-1">${n.body}</p>
              </div>
              <a href="https://wa.me/?text=${encodeURIComponent(n.title + ' - ' + n.body)}" target="_blank" rel="noopener" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white shrink-0">WhatsApp</a>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="coffer-card rounded-3xl p-6 space-y-3">
          <h3 class="font-bold text-lg">${bn ? 'চলমান অনলাইন ক্লাস' : 'Upcoming Online Classes'}</h3>
          ${(appState.onlineClasses || [])
            .map(
              (c) => `
            <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
              <div>
                <p class="font-bold text-sm">${c.topic}</p>
                <p class="text-xs text-slate-500">${c.studentClass} • ${c.date} • ${c.time}</p>
              </div>
              <a href="${c.link}" target="_blank" rel="noopener" class="coffer-btn-primary px-3.5 py-1.5 rounded-xl text-xs font-bold">Join</a>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    </div>
  `;
}

function renderFooter() {
  const bn = appState.lang === 'bn';
  return `
    <footer class="coffer-card rounded-3xl px-6 py-4 text-xs text-slate-600 dark:text-slate-300 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <div>
        <span class="font-extrabold text-slate-900 dark:text-white">${appState.academy.name}</span> — ${appState.academy.address}
      </div>
      <div class="flex flex-wrap gap-x-4 gap-y-1">
        <span>${bn ? 'পরিচালক:' : 'Director:'} <strong>${appState.academy.director}</strong></span>
        <span>${bn ? 'মোবাইল:' : 'Phone:'} <strong>${appState.academy.phone}</strong></span>
        <span>${bn ? 'ইমেইল:' : 'Email:'} <strong>${appState.academy.email}</strong></span>
      </div>
    </footer>
  `;
}

function bindActiveForms() {
  document.querySelectorAll('form').forEach((form) => {
    form.setAttribute('action', 'javascript:void(0)');
    form.setAttribute('method', 'post');
    form.onsubmit = function (ev) {
      if (ev) {
        ev.preventDefault();
        ev.stopPropagation();
      }
      processFormSubmission(form);
      return false;
    };

    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.onclick = function (ev) {
        if (ev) {
          ev.preventDefault();
          ev.stopPropagation();
        }
        processFormSubmission(form);
        return false;
      };
    }
  });
}

function renderApp() {
  applyTheme();
  if (typeof Store !== 'undefined' && typeof Store.save === 'function') {
    Store.save(appState);
  }

  const bn = appState.lang === 'bn';
  const root = document.getElementById('app');
  if (!root) return;

  let bodyHtml = '';
  if (!appState.currentUser) {
    bodyHtml = renderPublicSite();
  } else if (appState.currentUser.role === 'admin' && typeof AdminPortal !== 'undefined') {
    bodyHtml = AdminPortal.render(appState, currentAdminTab);
  } else if (appState.currentUser.role === 'teacher' && typeof TeacherPortal !== 'undefined') {
    bodyHtml = TeacherPortal.render(appState, appState.currentUser);
  } else if (appState.currentUser.role === 'student' && typeof StudentPortal !== 'undefined') {
    bodyHtml = StudentPortal.render(appState, appState.currentUser);
  } else {
    bodyHtml = `<div class="coffer-card rounded-3xl p-6 space-y-3">
      <h2 class="text-xl font-extrabold">Logged in as ${appState.currentUser.name} (${appState.currentUser.role})</h2>
      <p class="text-sm text-slate-500">Dashboard module ready.</p>
    </div>`;
  }

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-5 space-y-6">
      <header class="coffer-card rounded-3xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <button id="brand-home-btn" type="button" class="flex items-center gap-2.5 text-left">
          <span class="w-9 h-9 rounded-2xl coffer-pill-active flex items-center justify-center font-extrabold text-sm">NG</span>
          <div>
            <p class="font-extrabold text-sm md:text-base leading-none">${appState.academy.name}</p>
            <p class="text-[11px] text-slate-500 mt-0.5">${appState.academy.address}</p>
          </div>
        </button>

        <div class="flex items-center gap-2">
          <button id="lang-toggle-btn" type="button" class="coffer-btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-bold">
            ${bn ? 'English' : 'বাংলা'}
          </button>
          ${
            appState.currentUser
              ? `<button id="logout-btn" type="button" class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700">
                   ${bn ? 'লগআউট' : 'Logout'}
                 </button>`
              : `<button id="header-login-btn" type="button" class="coffer-btn-primary px-4 py-1.5 rounded-xl text-xs font-bold">
                   ${bn ? 'লগইন' : 'Login'}
                 </button>`
          }
        </div>
      </header>

      ${bodyHtml}

      ${renderFooter()}
    </div>
  `;

  bindActiveForms();
}

function showLoginModal() {
  const bn = appState.lang === 'bn';
  openModal(
    bn ? 'পোর্টাল লগইন' : 'Portal Login',
    `
      <form id="login-modal-form" action="javascript:void(0)" method="post" class="space-y-3">
        <div>
          <label class="block text-xs font-bold mb-1">${bn ? 'ইউজার ID' : 'User ID'}</label>
          <input id="login-userid-input" name="userId" required placeholder="admin / TCH-01 / STU-101" class="coffer-input" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-1">${bn ? 'পাসওয়ার্ড' : 'Password'}</label>
          <input id="login-password-input" name="password" type="password" required placeholder="1234" class="coffer-input" />
        </div>
        <div id="login-error-msg" class="text-xs font-bold text-rose-600 hidden"></div>
        <div class="flex items-center justify-between pt-2">
          <button id="modal-forgot-btn" type="button" class="text-xs font-bold text-indigo-600 hover:underline">
            ${bn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
          </button>
          <button id="login-submit-btn" type="submit" class="coffer-btn-primary px-5 py-2 rounded-2xl text-sm font-bold">
            ${bn ? 'প্রবেশ করুন' : 'Sign In'}
          </button>
        </div>
      </form>
    `
  );
  bindActiveForms();
}

function showRecoveryModal() {
  const bn = appState.lang === 'bn';
  openModal(
    bn ? 'পাসওয়ার্ড পুনরুদ্ধার' : 'Password Recovery',
    `
      <form id="recovery-modal-form" action="javascript:void(0)" method="post" class="space-y-3">
        <p class="text-xs text-slate-500">${bn ? 'আপনার Student/Teacher ID অথবা মোবাইল নম্বর লিখুন।' : 'Enter your Student/Teacher ID or phone number.'}</p>
        <input id="recovery-query-input" name="query" required placeholder="e.g. STU-101 or 01811223344" class="coffer-input" />
        <div id="recovery-result" class="text-xs font-semibold"></div>
        <button id="recovery-submit-btn" type="submit" class="coffer-btn-primary px-5 py-2 rounded-2xl text-sm font-bold">
          ${bn ? 'পাসওয়ার্ড খুঁজুন' : 'Find Password'}
        </button>
      </form>
    `
  );
  bindActiveForms();
}

function processFormSubmission(form) {
  if (!form) return;

  if (form.id === 'login-modal-form') {
    const idInput = document.getElementById('login-userid-input');
    const passInput = document.getElementById('login-password-input');
    const errBox = document.getElementById('login-error-msg');
    const user = verifyCredentials(idInput ? idInput.value : '', passInput ? passInput.value : '');
    if (user) {
      appState.currentUser = user;
      currentAdminTab = 'overview';
      closeModal();
      renderApp();
    } else if (errBox) {
      errBox.textContent = appState.lang === 'bn' ? 'ভুল ইউজার ID বা পাসওয়ার্ড! (Admin: admin / 1234)' : 'Invalid ID or Password! (Admin: admin / 1234)';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (form.id === 'recovery-modal-form') {
    const qVal = document.getElementById('recovery-query-input')?.value || '';
    const found = typeof Auth !== 'undefined' && typeof Auth.recoverPassword === 'function' ? Auth.recoverPassword(qVal) : null;
    const out = document.getElementById('recovery-result');
    if (out) {
      if (found) {
        out.innerHTML = `<div class="p-3 rounded-xl bg-emerald-50 text-emerald-700">Name: ${found.name} | ID: <strong>${found.id}</strong> | Password: <strong>${found.password}</strong></div>`;
      } else {
        out.innerHTML = `<div class="p-3 rounded-xl bg-rose-50 text-rose-700">No account found.</div>`;
      }
    }
    return;
  }

  const fd = new FormData(form);

  if (form.id === 'public-admission-form') {
    const newId = 'STU-' + (100 + (appState.students || []).length + (appState.admissions || []).length + 1);
    const newPass = String(Math.floor(1000 + Math.random() * 9000));
    const admission = {
      id: 'ADM-' + Math.floor(100 + Math.random() * 900),
      name: String(fd.get('name') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      studentClass: fd.get('studentClass'),
      group: fd.get('group'),
      batch: fd.get('batch'),
      status: 'Pending',
      createdAt: new Date().toISOString().slice(0, 10)
    };
    appState.admissions.unshift(admission);
    renderApp();
    openModal(
      'Admission Submitted',
      `<div class="space-y-2">
        <p class="font-semibold text-emerald-600">Application received for ${admission.name}.</p>
        <p><strong>Reference ID:</strong> ${newId}</p>
        <p><strong>Password:</strong> ${newPass}</p>
      </div>`
    );
    return;
  }

  if (form.id === 'admin-add-student-form') {
    const customId = String(fd.get('customId') || '').trim() || 'STU-' + (100 + appState.students.length + 1);
    const phone = String(fd.get('phone') || '').trim();
    const name = String(fd.get('name') || '').trim();
    if (!name) return;
    appState.students.unshift({
      id: customId,
      password: String(Math.floor(1000 + Math.random() * 9000)),
      name,
      phone,
      guardianPhone: phone,
      studentClass: fd.get('studentClass'),
      group: fd.get('group'),
      batch: 'Morning',
      feeStatus: 'Due',
      feeAmount: 2000,
      paymentMethod: 'bKash',
      paymentAccount: phone,
      receiptNo: 'RCP-' + Math.floor(1000 + Math.random() * 9000),
      verificationCode: 'NGA-VER-' + Math.floor(1000 + Math.random() * 9000)
    });
    renderApp();
    return;
  }

  if (form.id === 'edit-student-form') {
    const st = appState.students.find((s) => s.id === form.dataset.studentId);
    if (st) {
      st.name = String(fd.get('name') || '').trim();
      st.phone = String(fd.get('phone') || '').trim();
      st.studentClass = String(fd.get('studentClass') || '').trim();
      st.group = String(fd.get('group') || '').trim();
    }
    closeModal();
    renderApp();
    return;
  }

  if (form.id === 'admin-add-teacher-form') {
    appState.teachers.push({
      id: 'TCH-0' + (appState.teachers.length + 1),
      password: '123',
      name: String(fd.get('name') || '').trim(),
      subject: String(fd.get('subject') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      batch: 'All'
    });
    renderApp();
    return;
  }

  if (form.id === 'admin-add-fee-form') {
    const sid = fd.get('studentId');
    const st = appState.students.find((s) => s.id === sid);
    appState.fees.unshift({
      id: 'FEE-' + Date.now(),
      studentId: sid,
      studentName: st ? st.name : sid,
      studentClass: st ? st.studentClass : 'Class 10',
      month: String(fd.get('month') || '').trim(),
      amount: Number(fd.get('amount') || 0),
      method: fd.get('method'),
      accountNo: String(fd.get('accountNo') || '').trim(),
      status: 'Paid',
      receiptNo: 'RCP-' + Math.floor(1000 + Math.random() * 9000),
      verificationCode: 'NGA-VER-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().slice(0, 10)
    });
    renderApp();
    return;
  }

  if (form.id === 'admin-add-exam-form' || form.id === 'teacher-exam-form') {
    appState.exams.unshift({
      id: 'EXM-' + Date.now(),
      title: String(fd.get('title') || '').trim(),
      studentClass: fd.get('studentClass'),
      group: 'General',
      totalMarks: 100,
      obtainedMarks: Number(fd.get('obtainedMarks') || 0),
      date: new Date().toISOString().slice(0, 10),
      question: String(fd.get('question') || '').trim(),
      answerKey: String(fd.get('answerKey') || '').trim()
    });
    renderApp();
    return;
  }

  if (form.id === 'admin-add-class-form') {
    appState.onlineClasses.unshift({
      id: 'CLS-' + Date.now(),
      topic: String(fd.get('topic') || '').trim(),
      studentClass: fd.get('studentClass'),
      group: 'General',
      teacherName: 'Faculty',
      date: new Date().toISOString().slice(0, 10),
      time: String(fd.get('time') || '').trim(),
      link: String(fd.get('link') || '').trim()
    });
    renderApp();
    return;
  }

  if (form.id === 'admin-add-notice-form') {
    appState.notices.unshift({
      id: 'NTC-' + Date.now(),
      title: String(fd.get('title') || '').trim(),
      body: String(fd.get('body') || '').trim(),
      date: new Date().toISOString().slice(0, 10)
    });
    renderApp();
  }
}

document.addEventListener('click', (e) => {
  const target = e.target.closest('button, a, label');
  if (!target) {
    if (e.target.id === 'modal-backdrop') closeModal();
    return;
  }

  if (target.id === 'modal-close-btn') {
    closeModal();
    return;
  }

  if (target.id === 'lang-toggle-btn') {
    appState.lang = appState.lang === 'bn' ? 'en' : 'bn';
    renderApp();
    return;
  }

  if (target.id === 'theme-light-btn') {
    appState.theme = 'light';
    renderApp();
    return;
  }

  if (target.id === 'theme-dark-btn') {
    appState.theme = 'dark';
    renderApp();
    return;
  }

  if (target.id === 'open-login-modal-btn' || target.id === 'header-login-btn') {
    showLoginModal();
    return;
  }

  if (target.id === 'open-recovery-modal-btn' || target.id === 'modal-forgot-btn') {
    showRecoveryModal();
    return;
  }

  if (target.id === 'logout-btn') {
    appState.currentUser = null;
    renderApp();
    return;
  }

  if (target.id === 'brand-home-btn' && !appState.currentUser) {
    renderApp();
    return;
  }

  if (target.dataset.adminTab) {
    currentAdminTab = target.dataset.adminTab;
    renderApp();
    return;
  }

  if (target.id === 'admin-quick-add-student') {
    currentAdminTab = 'students';
    renderApp();
    return;
  }

  if (target.dataset.approveAdmission) {
    const adm = appState.admissions.find((a) => a.id === target.dataset.approveAdmission);
    if (adm) {
      adm.status = 'Approved';
      const newId = 'STU-' + (100 + appState.students.length + 1);
      const newPass = String(Math.floor(1000 + Math.random() * 9000));
      const newStudent = {
        id: newId,
        password: newPass,
        name: adm.name,
        phone: adm.phone,
        guardianPhone: adm.phone,
        studentClass: adm.studentClass,
        group: adm.group,
        batch: adm.batch,
        feeStatus: 'Due',
        feeAmount: 2000,
        paymentMethod: 'bKash',
        paymentAccount: adm.phone,
        receiptNo: 'RCP-' + Math.floor(1000 + Math.random() * 9000),
        verificationCode: 'NGA-VER-' + Math.floor(1000 + Math.random() * 9000)
      };
      appState.students.unshift(newStudent);
      renderApp();
      openModal(
        'Student Admitted',
        `<div class="space-y-2">
          <p class="font-bold text-emerald-600">Admission Approved!</p>
          <p><strong>Student ID:</strong> ${newId}</p>
          <p><strong>Password:</strong> ${newPass}</p>
        </div>`
      );
    }
    return;
  }

  if (target.dataset.deleteAdmission) {
    appState.admissions = appState.admissions.filter((a) => a.id !== target.dataset.deleteAdmission);
    renderApp();
    return;
  }

  if (target.dataset.deleteStudent) {
    appState.students = appState.students.filter((s) => s.id !== target.dataset.deleteStudent);
    renderApp();
    return;
  }

  if (target.dataset.editStudent) {
    const st = appState.students.find((s) => s.id === target.dataset.editStudent);
    if (st) {
      openModal(
        `Edit Student (${st.id})`,
        `
          <form id="edit-student-form" action="javascript:void(0)" method="post" data-student-id="${st.id}" class="space-y-3">
            <input name="name" value="${st.name}" required class="coffer-input" />
            <input name="phone" value="${st.phone}" required class="coffer-input" />
            <div class="grid grid-cols-2 gap-2">
              <input name="studentClass" value="${st.studentClass}" class="coffer-input" />
              <input name="group" value="${st.group}" class="coffer-input" />
            </div>
            <button type="submit" class="coffer-btn-primary px-4 py-2 rounded-xl text-sm font-bold">Save Changes</button>
          </form>
        `
      );
      bindActiveForms();
    }
    return;
  }

  if (target.dataset.printIdCard) {
    const st = appState.students.find((s) => s.id === target.dataset.printIdCard);
    if (st) triggerPrint(buildIdCardHtml(st));
    return;
  }

  if (target.dataset.markPaid) {
    const fee = appState.fees.find((f) => f.id === target.dataset.markPaid);
    if (fee) {
      fee.status = 'Paid';
      renderApp();
    }
    return;
  }

  if (target.dataset.printReceipt) {
    const fee = appState.fees.find((f) => f.id === target.dataset.printReceipt);
    if (fee) triggerPrint(buildReceiptHtml(fee));
    return;
  }

  if (target.dataset.deleteTeacher) {
    appState.teachers = appState.teachers.filter((t) => t.id !== target.dataset.deleteTeacher);
    renderApp();
    return;
  }

  if (target.dataset.deleteExam) {
    appState.exams = appState.exams.filter((e) => e.id !== target.dataset.deleteExam);
    renderApp();
    return;
  }

  if (target.dataset.deleteClass) {
    appState.onlineClasses = appState.onlineClasses.filter((c) => c.id !== target.dataset.deleteClass);
    renderApp();
    return;
  }

  if (target.dataset.deleteNotice) {
    appState.notices = appState.notices.filter((n) => n.id !== target.dataset.deleteNotice);
    renderApp();
    return;
  }

  if (target.id === 'export-json-btn') {
    const blob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nextgen-academy-backup.json';
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  if (target.id === 'reset-demo-btn') {
    appState = typeof Store !== 'undefined' ? Store.reset() : cloneDefaultState();
    renderApp();
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'import-json-input' && e.target.files?.[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        appState = { ...DEFAULT_STATE, ...parsed };
        renderApp();
      } catch {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(e.target.files[0]);
  }
});

document.addEventListener(
  'submit',
  (e) => {
    const form = e.target;
    if (!form || form.tagName !== 'FORM') return;
    e.preventDefault();
    e.stopPropagation();
    processFormSubmission(form);
  },
  true
);

renderApp();
