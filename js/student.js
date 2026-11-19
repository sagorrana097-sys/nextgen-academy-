const StudentPortal = {
  render(state, user) {
    const studentData = state.students.find((s) => s.id === user.id) || user;
    const myFees = state.fees.filter((f) => f.studentId === studentData.id);
    const classExams = state.exams.filter((e) => e.studentClass === studentData.studentClass);
    const classClasses = state.onlineClasses.filter((c) => c.studentClass === studentData.studentClass);
    const classBooks = state.textbooks.filter((b) => b.studentClass === studentData.studentClass);

    return `
      <div class="space-y-6">
        <div class="coffer-card rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span class="text-xs font-bold uppercase text-cofferPurple">Student Portal • ${studentData.id}</span>
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">${studentData.name}</h1>
            <p class="text-sm text-slate-500">${studentData.studentClass} • ${studentData.group} • ${studentData.batch} Batch</p>
          </div>
          <div class="flex gap-2">
            <button data-print-id-card="${studentData.id}" type="button" class="coffer-pill-active px-4 py-2.5 rounded-2xl text-sm font-bold">
              ${state.lang === 'bn' ? 'ID Card প্রিন্ট' : 'Print ID Card'}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Online Classes -->
          <div class="coffer-card rounded-3xl p-6 space-y-3">
            <h3 class="font-bold text-lg">${state.lang === 'bn' ? 'আমার অনলাইন ক্লাস' : 'My Online Classes'}</h3>
            ${
              classClasses.length
                ? classClasses
                    .map(
                      (c) => `
                  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between gap-3">
                    <div>
                      <p class="font-bold text-sm">${c.topic}</p>
                      <p class="text-xs text-slate-500">${c.date} • ${c.time}</p>
                    </div>
                    <a href="${c.link}" target="_blank" rel="noopener" class="px-3.5 py-2 rounded-xl text-xs font-bold bg-cofferPurple text-white">Join Class</a>
                  </div>
                `
                    )
                    .join('')
                : `<p class="text-sm text-slate-500">${state.lang === 'bn' ? 'কোনো অনলাইন ক্লাস নেই।' : 'No online classes scheduled.'}</p>`
            }
          </div>

          <!-- Fees & Money Receipts -->
          <div class="coffer-card rounded-3xl p-6 space-y-3">
            <h3 class="font-bold text-lg">${state.lang === 'bn' ? 'ফি স্ট্যাটাস ও মানি রিসিট' : 'Fees & Money Receipts'}</h3>
            ${
              myFees.length
                ? myFees
                    .map(
                      (f) => `
                  <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <p class="font-bold text-sm">${f.month} — ৳${f.amount}</p>
                      <p class="text-xs text-slate-500">${f.method} • ${f.receiptNo} • <strong>${f.status}</strong></p>
                    </div>
                    <button data-print-receipt="${f.id}" type="button" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-100 text-indigo-700">Receipt</button>
                  </div>
                `
                    )
                    .join('')
                : `<p class="text-sm text-slate-500">${state.lang === 'bn' ? 'কোনো ফি রেকর্ড নেই।' : 'No fee records found.'}</p>`
            }
          </div>

          <!-- Exams & GPA -->
          <div class="coffer-card rounded-3xl p-6 space-y-3">
            <h3 class="font-bold text-lg">${state.lang === 'bn' ? 'পরীক্ষা ও ফলাফল (GPA)' : 'Exams & GPA'}</h3>
            ${classExams
              .map((ex) => {
                const g = Store.calculateGrade(ex.obtainedMarks, ex.totalMarks || 100);
                return `
                  <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                    <p class="font-bold text-sm">${ex.title}</p>
                    <p class="text-xs text-slate-500 mt-1">Marks: ${ex.obtainedMarks}/${ex.totalMarks || 100} • GPA: <strong>${g.gpa}</strong> (${g.grade})</p>
                  </div>
                `;
              })
              .join('')}
          </div>

          <!-- Textbooks & Notices -->
          <div class="coffer-card rounded-3xl p-6 space-y-3">
            <h3 class="font-bold text-lg">${state.lang === 'bn' ? 'পাঠ্যপুস্তক ও নোটিশ' : 'Textbooks & Notices'}</h3>
            ${classBooks
              .map(
                (b) => `
              <div class="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm">
                <p class="font-bold">${b.title}</p>
                <p class="text-xs text-slate-500">${b.studentClass} • ${b.group} • Code: ${b.code}</p>
              </div>
            `
              )
              .join('')}
          </div>
        </div>
      </div>
    `;
  }
};
