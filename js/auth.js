const Auth = {
  login(userId, password) {
    const id = String(userId || '').trim();
    const pass = String(password || '').trim();

    if (id.toLowerCase() === 'admin' && pass === '1234') {
      return { ok: true, user: { id: 'admin', name: 'Super Admin', role: 'admin' } };
    }

    const state = typeof Store !== 'undefined' ? Store.load() : cloneDefaultState();
    const teacher = (state.teachers || []).find(
      (t) => String(t.id).toLowerCase() === id.toLowerCase() && String(t.password) === pass
    );
    if (teacher) return { ok: true, user: { ...teacher, role: 'teacher' } };

    const student = (state.students || []).find(
      (s) => String(s.id).toLowerCase() === id.toLowerCase() && String(s.password) === pass
    );
    if (student) return { ok: true, user: { ...student, role: 'student' } };

    return { ok: false, message: 'Invalid ID or Password' };
  },

  recoverPassword(query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return null;
    if (q === 'admin') return { role: 'Admin', id: 'admin', password: '1234', name: 'Super Admin' };

    const state = typeof Store !== 'undefined' ? Store.load() : cloneDefaultState();
    const st = (state.students || []).find(
      (s) => String(s.id).toLowerCase() === q || String(s.phone).toLowerCase() === q
    );
    if (st) return { role: 'Student', id: st.id, password: st.password, name: st.name };

    const tc = (state.teachers || []).find(
      (t) => String(t.id).toLowerCase() === q || String(t.phone).toLowerCase() === q
    );
    if (tc) return { role: 'Teacher', id: tc.id, password: tc.password, name: tc.name };

    return null;
  }
};
