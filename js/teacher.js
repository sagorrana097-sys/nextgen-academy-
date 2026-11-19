const TeacherPortal = {
  render(state, teacher) {
    const bn = state.lang === 'bn';
    return `
      <div class="space-y-6">
        <div class="neu-card rounded-3xl p-6">
          <h2 class="text-xl font-extrabold">${teacher.name} (${teacher.id})</h2>
          <p class="text-xs text-slate-500 mt-1">${bn ? 'বিষয়:' : 'Subject:'} ${teacher.subject} • ${bn ? 'ব্যাচ:' : 'Batch:'} ${teacher.batch}</p>
        </div>

        <div class="neu-card rounded-3xl p-6 space-y-4">
          <h3 class="text-lg font-extrabold">${bn ? 'পরীক্ষার নম্বর ও GPA এন্ট্রি' : 'Exam Marks & GPA Entry'}</h3>
          <form id="teacher-exam-form" class="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            <input name="title" required placeholder="Exam Title" class="neu-input" />
            <select name="studentClass" class="neu-input text-xs"><option>Class 8</option><option>Class 9</option><option selected>Class 10</option><option>Class 11</option><option>Class 12</option></select>
            <input name="obtainedMarks" type="number" max="100" min="0" required placeholder="Marks" class="neu-input" />
            <input name="answerKey" placeholder="Answer Key" class="neu-input" />
            <button type="submit" class="neu-btn-primary px-4 py-2 rounded-xl text-xs">+ Save Result</button>
          </form>
        </div>
      </div>
    `;
  }
};
