const TeacherPortal = {
  render(state, user) {
    const myClasses = state.onlineClasses;
    const myExams = state.exams;

    return `
      <div class="space-y-6">
        <div class="coffer-card rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase text-cofferPurple">Teacher Portal • ${user.id}</span>
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">${user.name}</h1>
            <p class="text-sm text-slate-500">${user.subject || 'Faculty Member'}</p>
          </div>
          <span class="px-3.5 py-2 rounded-2xl bg-cofferLavender text-cofferPurple text-xs font-bold">
            ${state.students.length} ${state.lang === 'bn' ? 'শিক্ষার্থী সক্রিয়' : 'Active Students'}
          </span>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Create Exam -->
          <div class="coffer-card rounded-3xl p-6 space-y-4">
            <h3 class="font-bold text-lg">${state.lang === 'bn' ? 'নতুন পরীক্ষা / কুইজ তৈরি' : 'Create New Exam'}</h3>
            <form id="teacher-exam-form" class="space-y-3">
              <input name="title" required placeholder="Exam Title" class="w-full px-3.5 py-2.5 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 text-sm" />
              <div class="grid grid-cols-2 gap-3">
                <select name="studentClass" class="px-3.5 py-2.5 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 text-sm">
                  <option>Class 8</option><option>Class 9</option><option selected>Class 10</option><option>Class 11</option><option>Class 12</option>
                </select>
                <input name="obtainedMarks" type="number" max="100" min="0" value="90" required class="px-3.5 py-2.5 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 text-sm" />
              </div>
              <input name="question" placeholder="Exam Question / Prompt" class="w-full px-3.5 py-2.5 rounded-2xl border dark:bg-slate-900 dark:border-slate-700 text-sm" />
              <button type="submit" class="coffer-pill-active w-full py-2.5 rounded-2xl text-sm font-bold">
                ${state.lang === 'bn' ? 'পরীক্ষা প্রকাশ করুন' : 'Publish Exam'}
              </button>
            </form>
            <div class="space-y-2 pt-2">
              ${myExams
                .map((e) => {
                  const g = Store.calculateGrade(e.obtainedMarks, e.totalMarks || 100);
                  return `<div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs flex justify-between">
                    <span class="font-bold">${e.title} (${e.studentClass})</span>
                    <span>GPA ${g.gpa} (${g.grade})</span>
                  </div>`;
                })
                .join('')}
            </div>
          </div>

          <!-- Attendance & Absent Alert -->
          <div class="coffer-card rounded-3xl p-6 space-y-4">
            <h3 class="font-bold text-lg">${state.lang === 'bn' ? 'উপস্থিতি ও Absent Alert (WhatsApp)' : 'Attendance & Absent Alert'}</h3>
            <div class="space-y-2.5">
              ${state.students
                .map(
                  (s) => `
                <div class="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div>
                    <p class="font-bold text-sm">${s.name} <span class="text-xs text-slate-500">(${s.id} • ${s.studentClass})</span></p>
                    <p class="text-xs text-slate-500">Guardian: ${s.guardianPhone || s.phone}</p>
                  </div>
                  <a target="_blank" rel="noopener"
                     href="https://wa.me/${(s.guardianPhone || s.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Absent Alert: ' + s.name + ' (' + s.studentClass + ') was absent today at NextGen Academy.')}"
                     class="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500 text-white">
                    Absent Alert
                  </a>
                </div>
              `
                )
                .join('')}
            </div>

            <div class="pt-3 border-t border-slate-200 dark:border-slate-800">
              <h4 class="font-bold text-sm mb-2">${state.lang === 'bn' ? 'নির্ধারিত অনলাইন ক্লাস' : 'Scheduled Online Classes'}</h4>
              ${myClasses
                .map(
                  (c) => `
                <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs mb-2">
                  <span class="font-semibold">${c.topic} (${c.time})</span>
                  <a href="${c.link}" target="_blank" rel="noopener" class="px-3 py-1 rounded-lg bg-cofferPurple text-white font-bold">Start</a>
                </div>
              `
                )
                .join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
};
