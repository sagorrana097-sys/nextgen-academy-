const StudentPortal = {
  render(state, student) {
    const bn = state.lang === 'bn';
    const myFees = (state.fees || []).filter((f) => f.studentId === student.id);
    return `
      <div class="space-y-6">
        <div class="neu-card rounded-3xl p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-extrabold">${student.name} (${student.id})</h2>
            <p class="text-xs text-slate-500 mt-1">${student.studentClass} • ${student.group} • ${student.batch}</p>
          </div>
          <button data-print-id-card="${student.id}" type="button" class="neu-btn-primary px-4 py-2 rounded-xl text-xs">Print ID Card</button>
        </div>

        <div class="neu-card rounded-3xl p-6 space-y-3">
          <h3 class="text-lg font-extrabold">${bn ? 'আমার ফি ও রিসিটসমূহ' : 'My Fee Receipts'}</h3>
          ${myFees
            .map(
              (f) => `
            <div class="neu-input rounded-2xl p-3.5 flex items-center justify-between gap-2">
              <div>
                <p class="font-bold text-sm">${f.receiptNo} — ${f.month} • ৳${f.amount}</p>
                <p class="text-xs text-slate-500">${f.method} • Status: ${f.status}</p>
              </div>
              <button data-print-receipt="${f.id}" type="button" class="neu-btn-primary px-3.5 py-1.5 rounded-xl text-xs">Receipt</button>
            </div>
          `
            )
            .join('') || `<p class="text-xs text-slate-500">No fee records found.</p>`}
        </div>
      </div>
    `;
  }
};
