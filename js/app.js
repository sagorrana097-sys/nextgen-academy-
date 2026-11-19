if (window.location.search && window.history && typeof window.history.replaceState === 'function') {
  window.history.replaceState({}, document.title, window.location.pathname);
}

let appState = Store.load();
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
  const a = appState.academy;
  return `
    <div class="max-w-sm mx-auto border-2 border-slate-700 rounded-2xl p-5 bg-white text-slate-900">
      <div class="flex items-center justify-between border-b pb-2 mb-3">
        <div>
          <p class="text-xs font-bold uppercase text-blue-700">${a.name}</p>
          <p class="text-[11px] text-slate-500">${a.address}</p>
        </div>
        <span class="px-2.5 py-1 text-xs font-bold rounded bg-slate-200 text-slate-800">${student.id}</span>
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
          <p>${a.phone}</p>
          <p>${a.email}</p>
        </div>
        <span class="font-semibold text-slate-800 border-t border-slate-400 pt-1">${a.director}</span>
      </div>
    </div>
  `;
}

function buildReceiptHtml(fee) {
  const a = appState.academy;
  return `
    <div class="max-w-lg mx-auto border border-slate-300 rounded-2xl p-6 bg-white text-slate-900">
      <div class="flex items-center justify-between border-b pb-3 mb-4">
        <div>
          <h3 class="text-lg font-extrabold text-blue-700">${a.name}</h3>
          <p class="text-xs text-slate-500">${a.address}</p>
          <p class="text-[11px] text-slate-500">Email: ${a.email} | Tel: ${a.phone}</p>
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
        <span>${a.email}</span>
        <span class="font-semibold text-slate-800 border-t border-slate-400 pt-1">${a.director}</span>
      </div>
    </div>
  `;
}

function renderPublicSite() {
  const bn = appState.lang === 'bn';
  const a = appState.academy;
  return `
    <div class="space-y-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-6 neu-card rounded-3xl p-7 space-y-4">
          <div class="w-12 h-12 rounded-full neu-card flex items-center justify-center text-blue-600 font-extrabold text-base">NG</div>
          <h1 class="text-3xl md:text-4xl font-extrabold leading-tight">${a.name}</h1>
          <p class="text-sm md:text-base text-slate-600 dark:text-slate-300">${bn ? a.taglineBn : a.taglineEn}</p>
          <div class="p-4 rounded-2xl neu-input text-xs md:text-sm space-y-1">
            <p><strong>${bn ? 'পরিচালক:' : 'Director:'}</strong> ${a.director}</p>
            <p><strong>${bn ? 'ঠিকানা:' : 'Address:'}</strong> ${a.address}</p>
            <p><strong>${bn ? 'মোবাইল:' : 'Phone:'}</strong> ${a.phone}</p>
            <p><strong>${bn ? 'ইমেইল:' : 'Email:'}</strong> ${a.email}</p>
          </div>
          <div class="flex flex-wrap gap-3 pt-2">
            <button id="open-login-modal-btn" type="button" class="neu-btn-primary px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider">
              ${bn ? 'পোর্টাল লগইন' : 'Portal Login'}
            </button>
            <button id="open-recovery-modal-btn" type="button" class="neu-btn px-5 py-2.5 rounded-xl text-xs font-bold">
              ${bn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
            </button>
          </div>
          <div class="p-3.5 rounded-2xl neu-input text-xs">
            Demo — Admin: <strong>admin / 1234</strong> • Teacher: <strong>TCH-01 / 123</strong> • Student: <strong>STU-101 / 123</strong>
          </div>
        </div>

        <div class="lg:col-span-6 neu-card rounded-3xl p-7">
          <div class="flex flex-col items-center text-center mb-5">
            <div class="w-12 h-12 rounded-full neu-card flex items-center justify-center text-blue-600 font-bold text-lg mb-2">✎</div>
            <h2 class="text-xl font-extrabold">${bn ? 'অনলাইন ভর্তি আবেদন' : 'Create Admission'}</h2>
            <p class="text-xs text-slate-500 mt-0.5">${bn ? 'আপনার তথ্য দিয়ে আবেদন সম্পন্ন করুন' : 'Start your admission journey with us'}</p>
          </div>
          <form id="public-admission-form" action="javascript:void(0)" method="post" class="space-y-3.5">
            <input name="name" required placeholder="${bn ? 'শিক্ষার্থীর পূর্ণ নাম' : 'Full Name'}" class="neu-input" />
            <input name="phone" required placeholder="${bn ? 'মোবাইল নম্বর' : 'Mobile Number'}" class="neu-input" />
            <div class="grid grid-cols-3 gap-2.5">
              <select name="studentClass" class="neu-input text-xs"><option>Class 8</option><option>Class 9</option><option selected>Class 10</option><option>Class 11</option><option>Class 12</option></select>
              <select name="group" class="neu-input text-xs"><option>Science</option><option>Commerce</option><option>Arts</option><option>General</option></select>
              <select name="batch" class="neu-input text-xs"><option>Morning</option><option>Day</option><option>Evening</option></select>
            </div>
            <button type="submit" class="neu-btn-primary w-full py-3 rounded-xl text-xs uppercase tracking-wider mt-2">
              ${bn ? 'আবেদন জমা দিন' : 'SUBMIT ADMISSION'}
            </button>
          </form>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="neu-card rounded-3xl p-6 space-y-3">
          <h3 class="font-bold text-lg">${bn ? 'নোটিশ বোর্ড' : 'Notice Board'}</h3>
          ${(appState.notices || [])
            .map(
              (n) => `
            <div class="p-4 rounded-2xl neu-input flex items-start justify-between gap-3">
              <div>
                <p class="font-bold text-sm">${n.title}</p>
                <p class="text-xs text-slate-500 mt-1">${n.body}</p>
              </div>
              <a href="https://wa.me/?text=${encodeURIComponent(n.title + ' - ' + n.body)}" target="_blank" rel="noopener" class="neu-btn px-3 py-1.5 rounded-xl text-xs font-bold shrink-0">WhatsApp</a>
            </div>
          `
            )
            .join('')}
        </div>

        <div class="neu-card rounded-3xl p-6 space-y-3">
          <h3 class="font-bold text-lg">${bn ? 'চলমান অনলাইন ক্লাস' : 'Upcoming Online Classes'}</h3>
          ${(appState.onlineClasses || [])
            .map(
              (c) => `
            <div class="p-4 rounded-2xl neu-input flex items-center justify-between gap-3">
              <div>
                <p class="font-bold text-sm">${c.topic}</p>
                <p class="text-xs text-slate-500">${c.studentClass} • ${c.date} • ${c.time}</p>
              </div>
              <a href="${c.link}" target="_blank" rel="noopener" class="neu-btn-primary px-4 py-1.5 rounded-xl text-xs">Join</a>
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
  const a = appState.academy;
  return `
    <footer class="neu-card rounded-3xl px-6 py-4 text-xs flex flex-col md:flex-row md:items-center md:justify-between gap-2">
      <div><span class="font-extrabold">${a.name}</span> — ${a.address}</div>
      <div class="flex flex-wrap gap-x-4 gap-y-1">
        <span>${bn ? 'পরিচালক:' : 'Director:'} <strong>${a.director}</strong></span>
        <span>${bn ? 'মোবাইল:' : 'Phone:'} <strong>${a.phone}</strong></span>
        <span>${bn ? 'ইমেইল:' : 'Email:'} <strong>${a.email}</strong></span>
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
  Store.save(appState);

  const bn = appState.lang === 'bn';
  const root = document.getElementById('app');
  if (!root) return;

  let bodyHtml = '';
  if (!appState.currentUser) {
    bodyHtml = renderPublicSite();
  } else if (appState.currentUser.role === 'admin') {
    bodyHtml = AdminPortal.render(appState, currentAdminTab);
  } else if (appState.currentUser.role === 'teacher') {
    bodyHtml = TeacherPortal.render(appState, appState.currentUser);
  } else if (appState.currentUser.role === 'student') {
    bodyHtml = StudentPortal.render(appState, appState.currentUser);
  }

  root.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 py-5 space-y-6">
      <header class="neu-card rounded-3xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <button id="brand-home-btn" type="button" class="flex items-center gap-3 text-left">
          <span class="w-10 h-10 rounded-full neu-card flex items-center justify-center font-extrabold text-sm text-blue-600">NG</span>
          <div>
            <p class="font-extrabold text-sm md:text-base leading-none">${appState.academy.name}</p>
            <p class="text-[11px] text-slate-500 mt-0.5">${appState.academy.address}</p>
          </div>
        </button>

        <div class="flex items-center gap-2.5">
          <button id="lang-toggle-btn" type="button" class="neu-btn px-3.5 py-1.5 rounded-xl text-xs font-bold">
            ${bn ? 'English' : 'বাংলা'}
          </button>
          ${
            appState.currentUser
              ? `<button id="logout-btn" type="button" class="neu-btn px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-600">${bn ? 'লগআউট' : 'Logout'}</button>`
              : `<button id="header-login-btn" type="button" class="neu-btn-primary px-4 py-1.5 rounded-xl text-xs">${bn ? 'লগইন' : 'Login'}</button>`
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
      <form id="login-modal-form" action="javascript:void(0)" method="post" class="space-y-4">
        <div>
          <label class="block text-xs font-bold mb-1.5">${bn ? 'ইউজার ID' : 'User ID'}</label>
          <input id="login-userid-input" name="userId" required placeholder="admin / TCH-01 / STU-101" class="neu-input" />
        </div>
        <div>
          <label class="block text-xs font-bold mb-1.5">${bn ? 'পাসওয়ার্ড' : 'Password'}</label>
          <div class="relative">
            <input id="login-password-input" name="password" type="password" required placeholder="1234" class="neu-input pr-11" />
            <button id="toggle-pass-eye-btn" type="button" aria-label="Toggle Password" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 px-1.5 py-1">👁</button>
          </div>
        </div>
        <div id="login-error-msg" class="text-xs font-bold text-rose-600 hidden"></div>
        <div class="flex items-center justify-between pt-2">
          <button id="modal-forgot-btn" type="button" class="text-xs font-bold text-blue-600 hover:underline">
            ${bn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
          </button>
          <button id="login-submit-btn" type="submit" class="neu-btn-primary px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider">
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
        <input id="recovery-query-input" name="query" required placeholder="e.g. STU-101 or 01811223344" class="neu-input" />
        <div id="recovery-result" class="text-xs font-semibold"></div>
        <button id="recovery-submit-btn" type="submit" class="neu-btn-primary px-5 py-2 rounded-xl text-xs uppercase tracking-wider">
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
    const idVal = document.getElementById('login-userid-input')?.value || '';
    const passVal = document.getElementById('login-password-input')?.value || '';
    const errBox = document.getElementById('login-error-msg');
    const res = Auth.login(idVal, passVal);
    if (res.ok && res.user) {
      appState.currentUser = res.user;
      currentAdminTab = 'overview';
      closeModal();
      renderApp();
    } else if (errBox) {
      errBox.textContent = appState.lang === 'bn' ? 'ভুল ইউজার ID বা পাসওয়ার্ড! (Admin: admin / 1234)' : 'Invalid ID or Password!';
      errBox.classList.remove('hidden');
    }
    return;
  }

  if (form.id === 'recovery-modal-form') {
    const qVal = document.getElementById('recovery-query-input')?.value || '';
    const found = Auth.recoverPassword(qVal);
    const out = document.getElementById('recovery-result');
    if (out) {
      out.innerHTML = found
        ? `<div class="p-3 rounded-xl neu-input text-emerald-700 dark:text-emerald-400">Name: ${found.name} | ID: <strong>${found.id}</strong> | Password: <strong>${found.password}</strong></div>`
        : `<div class="p-3 rounded-xl neu-input text-rose-600">No account found.</div>`;
    }
    return;
  }

  const fd = new FormData(form);

  if (form.id === 'public-admission-form') {
    const newId = 'STU-' + (100 + appState.students.length + appState.admissions.length + 1);
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
        <p class="font-semibold text-emerald-700 dark:text-emerald-400">Application received for ${admission.name}.</p>
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

  if (target.id === 'toggle-pass-eye-btn') {
    const passInput = document.getElementById('login-password-input');
    if (passInput) passInput.type = passInput.type === 'password' ? 'text' : 'password';
    return;
  }

  if (target.id === 'modal-close-btn') return closeModal();
  if (target.id === 'lang-toggle-btn') { appState.lang = appState.lang === 'bn' ? 'en' : 'bn'; return renderApp(); }
  if (target.id === 'theme-light-btn') { appState.theme = 'light'; return renderApp(); }
  if (target.id === 'theme-dark-btn') { appState.theme = 'dark'; return renderApp(); }
  if (target.id === 'open-login-modal-btn' || target.id === 'header-login-btn') return showLoginModal();
  if (target.id === 'open-recovery-modal-btn' || target.id === 'modal-forgot-btn') return showRecoveryModal();
  if (target.id === 'logout-btn') { appState.currentUser = null; return renderApp(); }
  if (target.id === 'brand-home-btn' && !appState.currentUser) return renderApp();
  if (target.dataset.adminTab) { currentAdminTab = target.dataset.adminTab; return renderApp(); }
  if (target.id === 'admin-quick-add-student') { currentAdminTab = 'students'; return renderApp(); }

  if (target.dataset.approveAdmission) {
    const adm = appState.admissions.find((a) => a.id === target.dataset.approveAdmission);
    if (adm) {
      adm.status = 'Approved';
      const newId = 'STU-' + (100 + appState.students.length + 1);
      const newPass = String(Math.floor(1000 + Math.random() * 9000));
      appState.students.unshift({
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
      });
      renderApp();
      openModal('Student Admitted', `<p class="font-bold text-emerald-700 dark:text-emerald-400">Admission Approved!</p><p><strong>Student ID:</strong> ${newId}</p><p><strong>Password:</strong> ${newPass}</p>`);
    }
    return;
  }

  if (target.dataset.deleteAdmission) { appState.admissions = appState.admissions.filter((a) => a.id !== target.dataset.deleteAdmission); return renderApp(); }
  if (target.dataset.deleteStudent) { appState.students = appState.students.filter((s) => s.id !== target.dataset.deleteStudent); return renderApp(); }

  if (target.dataset.editStudent) {
    const st = appState.students.find((s) => s.id === target.dataset.editStudent);
    if (st) {
      openModal(
        `Edit Student (${st.id})`,
        `<form id="edit-student-form" action="javascript:void(0)" method="post" data-student-id="${st.id}" class="space-y-3">
          <input name="name" value="${st.name}" required class="neu-input" />
          <input name="phone" value="${st.phone}" required class="neu-input" />
          <div class="grid grid-cols-2 gap-2">
            <input name="studentClass" value="${st.studentClass}" class="neu-input" />
            <input name="group" value="${st.group}" class="neu-input" />
          </div>
          <button type="submit" class="neu-btn-primary px-4 py-2 rounded-xl text-xs">Save Changes</button>
        </form>`
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
    if (fee) { fee.status = 'Paid'; renderApp(); }
    return;
  }

  if (target.dataset.printReceipt) {
    const fee = appState.fees.find((f) => f.id === target.dataset.printReceipt);
    if (fee) triggerPrint(buildReceiptHtml(fee));
    return;
  }

  if (target.dataset.deleteTeacher) { appState.teachers = appState.teachers.filter((t) => t.id !== target.dataset.deleteTeacher); return renderApp(); }
  if (target.dataset.deleteExam) { appState.exams = appState.exams.filter((e) => e.id !== target.dataset.deleteExam); return renderApp(); }
  if (target.dataset.deleteClass) { appState.onlineClasses = appState.onlineClasses.filter((c) => c.id !== target.dataset.deleteClass); return renderApp(); }
  if (target.dataset.deleteNotice) { appState.notices = appState.notices.filter((n) => n.id !== target.dataset.deleteNotice); return renderApp(); }

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
    appState = Store.reset();
    renderApp();
  }
});

document.addEventListener('change', (e) => {
  if (e.target.id === 'import-json-input' && e.target.files?.[0]) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        appState = { ...DEFAULT_STATE, ...JSON.parse(reader.result), academy: { ...ACADEMY_PROFILE } };
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
