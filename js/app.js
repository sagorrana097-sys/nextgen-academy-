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
          <form id="public-admission-form" class="space-y-3">
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
            <p class="text-[11px] text-slate-500 mt-0.5">${bn ? 'বাংলা / English ERP' : 'Bilingual ERP System'}</p>
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
    </div>
  `;
}

function showLoginModal() {
  const bn = appState.lang === 'bn';
  openModal(
    bn ? 'পোর্টাল লগইন' : 'Portal Login',
    `
      <form id="login-modal-form" class="space-y-3">
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
}

function handleLoginSubmit(event) {
  if (event) event.preventDefault();
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

  if (target.id === 'login-submit-btn') {
    handleLoginSubmit(e);
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

  if (target.id === 'logout-btn') {
    appState.currentUser = null;
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

document.addEventListener('submit', (e) => {
  const form = e.target;
  if (form && form.id === 'login-modal-form') {
    handleLoginSubmit(e);
    return;
  }

  if (form && form.id === 'public-admission-form') {
    e.preventDefault();
    const fd = new FormData(form);
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
  }
});

renderApp();
