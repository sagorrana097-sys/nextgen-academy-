const Auth = {
  login(userId, password) {
    const cleanId = (userId || '').trim();
    const cleanPass = (password || '').trim();

    if (cleanId.toLowerCase() === 'admin' && cleanPass === '1234') {
      return { ok: true, user: { id: 'admin', name: 'Super Admin', role: 'admin' } };
    }

    const state = Store.load();
    const teacher = state.teachers.find(
      (t) => t.id.toLowerCase() === cleanId.toLowerCase() && t.password === cleanPass
    );
    if (teacher) {
      return { ok: true, user: { ...teacher, role: 'teacher' } };
    }

    const student = state.students.find(
      (s) => s.id.toLowerCase() === cleanId.toLowerCase() && s.password === cleanPass
    );
    if (student) {
      return { ok: true, user: { ...student, role: 'student' } };
    }

    return { ok: false };
  },

  recoverPassword(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) return null;
    const state = Store.load();

    if (q === 'admin') {
      return { role: 'Admin', id: 'admin', password: '1234', name: 'Super Admin' };
    }
    const st = state.students.find(
      (s) => s.id.toLowerCase() === q || (s.phone || '').toLowerCase() === q
    );
    if (st) {
      return { role: 'Student', id: st.id, password: st.password, name: st.name };
    }
    const tc = state.teachers.find(
      (t) => t.id.toLowerCase() === q || (t.phone || '').toLowerCase() === q
    );
    if (tc) {
      return { role: 'Teacher', id: tc.id, password: tc.password, name: tc.name };
    }
    return null;
  }
};
