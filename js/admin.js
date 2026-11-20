import {
  listRecords,
  createRecord,
  updateRecord
} from "./store.js";

import {
  escapeHTML,
  formatDate,
  toast
} from "./utils.js";

export async function renderAdmin(root, { user, profile }) {

  let currentPage = "dashboard";

  const pages = [
  ["dashboard", "▦", "ড্যাশবোর্ড"],
  ["courses", "📚", "কোর্স"],
  ["students", "👨‍🎓", "শিক্ষার্থী"],
  ["teachers", "👨‍🏫", "শিক্ষক"],
  ["batches", "🏫", "ব্যাচ"],
  ["attendance", "📅", "উপস্থিতি"],
  ["admissions", "📝", "ভর্তি আবেদন"],
  ["notices", "📢", "নোটিশ"]
];

  root.innerHTML = `
    <div class="app-shell role-admin">

      <aside class="sidebar">

        <div class="sidebar-brand">
          <span class="brand-mark">N</span>
          <div>
            <b>NextGen</b>
            <small>ACADEMY</small>
          </div>
        </div>

        <nav class="side-nav">
          <span class="nav-caption">ADMIN WORKSPACE</span>

          ${pages.map(([id, icon, name]) => `
            <a href="#${id}"
               class="nav-link ${id === "dashboard" ? "active" : ""}"
               data-page="${id}">
              ${icon} <span>${name}</span>
            </a>
          `).join("")}

        </nav>

        <div class="sidebar-bottom">
          <div class="profile-mini">
            <span class="avatar">
              ${escapeHTML((profile.name || "A")[0])}
            </span>
            <div>
              <b>${escapeHTML(profile.name || "Admin")}</b>
              <small>Administrator</small>
            </div>
          </div>

          <button id="logout-btn" class="btn btn-soft btn-block">
            ↪ লগআউট
          </button>
        </div>

      </aside>

      <main class="dashboard-main">

        <header class="topbar">
          <button id="mobile-menu-btn" class="btn btn-soft mobile-menu">
            ☰
          </button>

          <div class="topbar-title">Admin Dashboard</div>

          <div class="topbar-actions">
            <button id="theme-btn" class="icon-btn">◐</button>
            <span class="avatar">
              ${escapeHTML((profile.name || "A")[0])}
            </span>
          </div>
        </header>

        <div class="dashboard-content" id="admin-content">
          <p>লোড হচ্ছে...</p>
        </div>

      </main>
    </div>
  `;

  const content = root.querySelector("#admin-content");

  async function openPage(page) {

    currentPage = page;

    root.querySelectorAll("[data-page]").forEach(link => {
      link.classList.toggle(
        "active",
        link.dataset.page === page
      );
    });

    root.querySelector(".sidebar")?.classList.remove("open");

    try {

      if (page === "dashboard") {
        await showDashboard();
      }

      else if (page === "courses") {
        await showCourses();
      }

      else if (page === "students") {
        await showStudents();
      }

      else if (page === "admissions") {
        await showAdmissions();
      }
      else if (page === "teachers") {
  await showTeachers();
}

else if (page === "batches") {
  await showBatches();
}

else if (page === "attendance") {
  await showAttendance();
}
      else if (page === "notices") {
        await showNotices();
      }

   } catch (error) {
  console.error("Admin Page Error:", error);

  content.innerHTML = `
    <div class="error-panel">
      <h3>তথ্য লোড করা যায়নি</h3>
      <p>${escapeHTML(error.message || String(error))}</p>
      <p>সমস্যার কোড: ${escapeHTML(error.code || "Unknown")}</p>
    </div>
  `;
}
  }

  // Navigation
  root.querySelectorAll("[data-page]").forEach(link => {

    link.addEventListener("click", event => {
      event.preventDefault();
      openPage(link.dataset.page);
    });

  });

  // Dashboard
  async function showDashboard() {

    const [courses, students, admissions, notices] =
      await Promise.all([
        listRecords("courses"),
        listRecords("students"),
        listRecords("admissions"),
        listRecords("notices")
      ]);

    content.innerHTML = `
      <div class="welcome-row">
        <div>
          <span class="eyebrow">ADMIN OVERVIEW</span>
          <h1>স্বাগতম, ${escapeHTML(profile.name || "Admin")} 👋</h1>
          <p class="muted">
            আপনার একাডেমির সার্বিক কার্যক্রম দেখুন।
          </p>
        </div>

        <span class="pill">Administrator</span>
      </div>

      <div class="stats-grid">

        ${stat("📚", "মোট কোর্স", courses.length)}
        ${stat("👨‍🎓", "শিক্ষার্থী", students.length)}
        ${stat("📝", "ভর্তি আবেদন", admissions.length)}
        ${stat("📢", "নোটিশ", notices.length)}

      </div>

      <div class="content-grid">

        <section class="neu-card panel">
          <h2 class="section-title">সাম্প্রতিক ভর্তি আবেদন</h2>
          ${makeList(admissions, "name", "কোনো আবেদন নেই")}
          <button class="btn btn-primary" data-goto="admissions">
            সব আবেদন দেখুন
          </button>
        </section>

        <section class="neu-card panel">
          <h2 class="section-title">সাম্প্রতিক কোর্স</h2>
          ${makeList(courses, "title", "কোনো কোর্স নেই")}
          <button class="btn btn-primary" data-goto="courses">
            কোর্স দেখুন
          </button>
        </section>

      </div>
    `;

    content.querySelectorAll("[data-goto]").forEach(button => {
      button.onclick = () => openPage(button.dataset.goto);
    });
  }

  // Courses
  async function showCourses() {

    const courses = await listRecords("courses");

    content.innerHTML = `
      <h1>📚 কোর্স ব্যবস্থাপনা</h1>

      <section class="neu-card panel">

        <h2 class="section-title">নতুন কোর্স যোগ করুন</h2>

        <form id="course-form" class="form-stack">

          <label class="field">
            <span>কোর্সের নাম</span>
            <input name="title" required
              placeholder="যেমন: HSC পদার্থবিজ্ঞান">
          </label>

          <label class="field">
            <span>বর্ণনা</span>
            <textarea name="description" rows="3"></textarea>
          </label>

          <button class="btn btn-primary">
            কোর্স সংরক্ষণ করুন
          </button>

        </form>

      </section>

      <section class="neu-card panel">
        <h2 class="section-title">
          সকল কোর্স (${courses.length})
        </h2>

        ${makeList(courses, "title", "কোনো কোর্স যোগ করা হয়নি")}
      </section>
    `;

    content.querySelector("#course-form").onsubmit =
      async event => {

        event.preventDefault();

        const form = new FormData(event.currentTarget);

        try {

          await createRecord("courses", {
            title: form.get("title").trim(),
            description: form.get("description").trim(),
            createdBy: user.uid,
            active: true
          });

          toast("কোর্স যোগ হয়েছে।", "success");

          await showCourses();

        } catch (error) {
          console.error(error);
          toast("কোর্স যোগ করা যায়নি।", "error");
        }
      };
  }

  // Students
  async function showStudents() {

    const students = await listRecords("students");

    content.innerHTML = `
      <h1>👨‍🎓 শিক্ষার্থী ব্যবস্থাপনা</h1>

      <section class="neu-card panel">

        <h2 class="section-title">নতুন শিক্ষার্থী যোগ করুন</h2>

        <form id="student-form" class="form-stack">

          <label class="field">
            <span>শিক্ষার্থীর নাম</span>
            <input name="name" required>
          </label>

          <label class="field">
            <span>মোবাইল নম্বর</span>
            <input name="phone" required>
          </label>

          <label class="field">
            <span>ইমেইল</span>
            <input name="email" type="email">
          </label>

          <label class="field">
            <span>ক্লাস</span>
            <input name="className">
          </label>

          <button class="btn btn-primary">
            শিক্ষার্থী সংরক্ষণ করুন
          </button>

        </form>

      </section>

      <section class="neu-card panel">
        <h2 class="section-title">
          সকল শিক্ষার্থী (${students.length})
        </h2>

        <input id="student-search"
          placeholder="নাম দিয়ে শিক্ষার্থী খুঁজুন">

        <div id="student-list">
          ${studentList(students)}
        </div>

      </section>
    `;

    content.querySelector("#student-form").onsubmit =
      async event => {

        event.preventDefault();

        const form = new FormData(event.currentTarget);

        try {

          await createRecord("students", {
            name: form.get("name").trim(),
            phone: form.get("phone").trim(),
            email: form.get("email").trim(),
            className: form.get("className").trim(),
            createdBy: user.uid
          });

          toast("শিক্ষার্থী যোগ হয়েছে।", "success");

          await showStudents();

        } catch (error) {
          console.error(error);
          toast("শিক্ষার্থী যোগ করা যায়নি।", "error");
        }
      };

    content.querySelector("#student-search").oninput = event => {

      const search = event.target.value.toLowerCase();

      const filtered = students.filter(student =>
        (student.name || "").toLowerCase().includes(search)
      );

      content.querySelector("#student-list").innerHTML =
        studentList(filtered);
    };
  }

  // Admissions
  async function showAdmissions() {

    const admissions = await listRecords("admissions");

    content.innerHTML = `
      <h1>📝 ভর্তি আবেদন ব্যবস্থাপনা</h1>

      <section class="neu-card panel">

        <h2 class="section-title">
          মোট আবেদন: ${admissions.length}
        </h2>

        <div class="tablewrap">

          <table>
            <thead>
              <tr>
                <th>নাম</th>
                <th>ইমেইল</th>
                <th>ফোন</th>
                <th>কোর্স</th>
                <th>অবস্থা</th>
                <th>কার্যক্রম</th>
              </tr>
            </thead>

            <tbody>

              ${admissions.map(item => `
                <tr>
                  <td>${escapeHTML(item.name || "—")}</td>
                  <td>${escapeHTML(item.email || "—")}</td>
                  <td>${escapeHTML(item.phone || "—")}</td>
                  <td>${escapeHTML(item.course || "—")}</td>
                  <td>${escapeHTML(item.status || "pending")}</td>

                  <td>
                    ${
                      item.status === "approved"
                      ? "অনুমোদিত"
                      : `
                        <button
                          class="btn btn-primary"
                          data-approve="${item.id}">
                          অনুমোদন
                        </button>

                        <button
                          class="btn btn-soft"
                          data-reject="${item.id}">
                          বাতিল
                        </button>
                      `
                    }
                  </td>
                </tr>
              `).join("")}

            </tbody>
          </table>

        </div>

      </section>
    `;

    content.querySelectorAll("[data-approve]").forEach(button => {

      button.onclick = async () => {

        const id = button.dataset.approve;
        const application = admissions.find(x => x.id === id);

        if (!application || application.status === "approved") return;

        if (!confirm("এই ভর্তি আবেদন অনুমোদন করবেন?")) return;

        try {

          await updateRecord("admissions", id, {
            status: "processing"
          });

          await createRecord("students", {
            name: application.name || "",
            email: application.email || "",
            phone: application.phone || "",
            course: application.course || "",
            admissionId: id,
            createdBy: user.uid
          });

          await updateRecord("admissions", id, {
            status: "approved"
          });

          toast("ভর্তি আবেদন অনুমোদিত হয়েছে।", "success");

          await showAdmissions();

        } catch (error) {

          console.error(error);

          toast(
            "অনুমোদন সম্পন্ন হয়নি। আবেদনটির অবস্থা পরীক্ষা করুন।",
            "error"
          );
        }
      };
    });

    content.querySelectorAll("[data-reject]").forEach(button => {

      button.onclick = async () => {

        const id = button.dataset.reject;

        if (!confirm("আবেদনটি বাতিল করবেন?")) return;

        try {

          await updateRecord("admissions", id, {
            status: "rejected"
          });

          toast("আবেদন বাতিল করা হয়েছে।", "success");

          await showAdmissions();

        } catch (error) {
          console.error(error);
          toast("আবেদন বাতিল করা যায়নি।", "error");
        }
      };
    });
  }

  // Notices
  async function showNotices() {

    const notices = await listRecords("notices");

    content.innerHTML = `
      <h1>📢 নোটিশ ব্যবস্থাপনা</h1>

      <section class="neu-card panel">

        <form id="notice-form" class="form-stack">

          <label class="field">
            <span>নোটিশের শিরোনাম</span>
            <input name="title" required>
          </label>

          <label class="field">
            <span>নোটিশের বিস্তারিত</span>
            <textarea name="body" rows="4" required></textarea>
          </label>

          <button class="btn btn-primary">
            নোটিশ প্রকাশ করুন
          </button>

        </form>

      </section>

      <section class="neu-card panel">
        <h2 class="section-title">প্রকাশিত নোটিশ</h2>
        ${makeList(notices, "title", "কোনো নোটিশ নেই")}
      </section>
    `;

    content.querySelector("#notice-form").onsubmit =
      async event => {

        event.preventDefault();

        const form = new FormData(event.currentTarget);

        try {

          await createRecord("notices", {
            title: form.get("title").trim(),
            body: form.get("body").trim(),
            createdBy: user.uid
          });

          toast("নোটিশ প্রকাশিত হয়েছে।", "success");

          await showNotices();

        } catch (error) {
          console.error(error);
          toast("নোটিশ প্রকাশ করা যায়নি।", "error");
        }
      };
  }
  // TEACHER MANAGEMENT
async function showTeachers() {

  const teachers = await listRecords("teachers");

  content.innerHTML = `
    <h1>👨‍🏫 শিক্ষক ব্যবস্থাপনা</h1>

    <section class="neu-card panel">
      <h2 class="section-title">নতুন শিক্ষক যোগ করুন</h2>

      <form id="teacher-form" class="form-stack">

        <label class="field">
          <span>শিক্ষকের নাম</span>
          <input name="name" required>
        </label>

        <label class="field">
          <span>মোবাইল</span>
          <input name="phone">
        </label>

        <label class="field">
          <span>ইমেইল</span>
          <input name="email" type="email">
        </label>

        <label class="field">
          <span>বিষয়</span>
          <input name="subject">
        </label>

        <label class="field">
          <span>মাসিক বেতন</span>
          <input name="salary" type="number" min="0">
        </label>

        <button class="btn btn-primary">শিক্ষক সংরক্ষণ করুন</button>
      </form>
    </section>

    <section class="neu-card panel">
      <h2 class="section-title">শিক্ষক তালিকা (${teachers.length})</h2>
      ${makeList(teachers, "name", "কোনো শিক্ষক যোগ করা হয়নি")}
    </section>
  `;

  content.querySelector("#teacher-form").onsubmit = async event => {
    event.preventDefault();

    const f = new FormData(event.currentTarget);

    try {
      await createRecord("teachers", {
        name: f.get("name").trim(),
        phone: f.get("phone").trim(),
        email: f.get("email").trim(),
        subject: f.get("subject").trim(),
        salary: Number(f.get("salary")) || 0,
        createdBy: user.uid
      });

      toast("শিক্ষক যোগ হয়েছে।", "success");
      await showTeachers();

    } catch (error) {
      console.error(error);
      toast("শিক্ষক যোগ করা যায়নি।", "error");
    }
  };
}


// BATCH MANAGEMENT
async function showBatches() {

  const [batches, teachers] = await Promise.all([
    listRecords("batches"),
    listRecords("teachers")
  ]);

  content.innerHTML = `
    <h1>🏫 ব্যাচ ব্যবস্থাপনা</h1>

    <section class="neu-card panel">
      <h2 class="section-title">নতুন ব্যাচ তৈরি করুন</h2>

      <form id="batch-form" class="form-stack">

        <label class="field">
          <span>ব্যাচের নাম</span>
          <input name="name" required>
        </label>

        <label class="field">
          <span>শ্রেণি</span>
          <input name="className">
        </label>

        <label class="field">
          <span>বিভাগ</span>
          <select name="division">
            <option>General</option>
            <option>Science</option>
            <option>Humanities</option>
            <option>Business Studies</option>
          </select>
        </label>

        <label class="field">
          <span>শিক্ষক</span>
          <select name="teacherId">
            <option value="">শিক্ষক নির্বাচন করুন</option>
            ${teachers.map(t => `
              <option value="${escapeHTML(t.id)}">
                ${escapeHTML(t.name)}
              </option>
            `).join("")}
          </select>
        </label>

        <label class="field">
          <span>ক্লাসের সময়সূচি</span>
          <input name="schedule" placeholder="যেমন: সকাল ১০টা">
        </label>

        <button class="btn btn-primary">ব্যাচ সংরক্ষণ করুন</button>
      </form>
    </section>

    <section class="neu-card panel">
      <h2 class="section-title">ব্যাচ তালিকা (${batches.length})</h2>

      ${batches.length ? `
        <ul class="simple-list">
          ${batches.map(b => {
            const teacher = teachers.find(t => t.id === b.teacherId);

            return `
              <li>
                <span>
                  ${escapeHTML(b.name || "—")}
                  <small>
                    ${escapeHTML(b.className || "")}
                    · ${escapeHTML(b.division || "")}
                  </small>
                </span>
                <small>
                  ${escapeHTML(teacher?.name || "শিক্ষক নির্ধারিত নয়")}
                  <br>
                  ${escapeHTML(b.schedule || "")}
                </small>
              </li>
            `;
          }).join("")}
        </ul>
      ` : `<p class="muted">কোনো ব্যাচ তৈরি করা হয়নি।</p>`}
    </section>
  `;

  content.querySelector("#batch-form").onsubmit = async event => {
    event.preventDefault();

    const f = new FormData(event.currentTarget);

    try {
      await createRecord("batches", {
        name: f.get("name").trim(),
        className: f.get("className").trim(),
        division: f.get("division"),
        teacherId: f.get("teacherId"),
        schedule: f.get("schedule").trim(),
        createdBy: user.uid
      });

      toast("নতুন ব্যাচ তৈরি হয়েছে।", "success");
      await showBatches();

    } catch (error) {
      console.error(error);
      toast("ব্যাচ তৈরি করা যায়নি।", "error");
    }
  };
}


// ATTENDANCE MANAGEMENT
async function showAttendance() {

  const [students, attendance] = await Promise.all([
    listRecords("students"),
    listRecords("attendance")
  ]);

  const today = new Date().toLocaleDateString("en-CA");

  content.innerHTML = `
    <style>
      .attendance-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 16px;
        margin-top: 20px;
      }

      .attendance-card {
        background: var(--card-bg, #fff);
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        padding: 18px;
        box-shadow: 0 4px 14px rgba(0,0,0,.05);
      }

      .attendance-student-name {
        font-size: 17px;
        font-weight: 700;
        margin-bottom: 16px;
        display: block;
      }

      .attendance-options {
        display: flex;
        gap: 10px;
      }

      .attendance-options input {
        display: none;
      }

      .attendance-options label {
        flex: 1;
        text-align: center;
        padding: 11px 8px;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        background: #f1f5f9;
        color: #475569;
        border: 2px solid transparent;
        transition: .2s;
      }

      .attendance-options .present-option input:checked + label {
        background: #dcfce7;
        color: #15803d;
        border-color: #22c55e;
      }

      .attendance-options .absent-option input:checked + label {
        background: #fee2e2;
        color: #b91c1c;
        border-color: #ef4444;
      }

      .attendance-save-btn {
        width: 100%;
        margin-top: 22px;
      }
    </style>

    <h1>📅 উপস্থিতি ব্যবস্থাপনা</h1>

    <section class="neu-card panel">

      <div class="form-stack">

        <label class="field">
          <span>তারিখ নির্বাচন করুন</span>
          <input type="date" id="attendance-date" value="${today}">
        </label>

        <button class="btn btn-primary" id="load-attendance">
          শিক্ষার্থী তালিকা দেখুন
        </button>

      </div>

      <div id="attendance-students"></div>

    </section>
  `;

  const list = content.querySelector("#attendance-students");

  content.querySelector("#load-attendance").onclick = () => {

    const date = content.querySelector("#attendance-date").value;

    if (!date) {
      toast("তারিখ নির্বাচন করুন।", "error");
      return;
    }

    if (!students.length) {
      list.innerHTML = <p class="muted">কোনো শিক্ষার্থী পাওয়া যায়নি।</p>;
      return;
    }

    list.innerHTML = `
      <h2 class="section-title" style="margin-top:25px">
        👨‍🎓 শিক্ষার্থীদের উপস্থিতি (${students.length})
      </h2>

      <div class="attendance-grid">

        ${students.map((s, index) => {

          const old = attendance.find(a =>
            a.studentId === s.id && a.date === date
          );

          const status = old?.status || "present";

          return `
            <div class="attendance-card">

              <span class="attendance-student-name">
                ${index + 1}. ${escapeHTML(s.name || "—")}
              </span>

              <div class="attendance-options">

                <div class="present-option" style="flex:1">
                  <input
                    type="radio"
                    id="present-${s.id}"
                    name="status-${s.id}"
                    value="present"
                    data-student="${escapeHTML(s.id)}"
                    ${status === "present" ? "checked" : ""}
                  >
                  <label for="present-${s.id}">
                    ✓ উপস্থিত
                  </label>
                </div>

                <div class="absent-option" style="flex:1">
                  <input
                    type="radio"
                    id="absent-${s.id}"
                    name="status-${s.id}"
                    value="absent"
                    data-student="${escapeHTML(s.id)}"
                    ${status === "absent" ? "checked" : ""}
                  >
                  <label for="absent-${s.id}">
                    ✕ অনুপস্থিত
                  </label>
                </div>

              </div>
            </div>
          `;

        }).join("")}

      </div>

      <button class="btn btn-primary attendance-save-btn" id="save-attendance">
        💾 উপস্থিতি সংরক্ষণ করুন
      </button>
    `;

    list.querySelector("#save-attendance").onclick = async () => {

      try {

        const selects = list.querySelectorAll("[data-student]:checked");

        for (const select of selects) {

          const studentId = select.dataset.student;

          const old = attendance.find(a =>
            a.studentId === studentId && a.date === date
          );

          const data = {
            studentId,
            studentName: students.find(s => s.id === studentId)?.name || "",
            date,
            status: select.value,
            createdBy: user.uid
          };

          if (old) {
            await updateRecord("attendance", old.id, data);
          } else {
            await createRecord("attendance", data);
          }
        }

        toast("উপস্থিতি সংরক্ষণ হয়েছে।", "success");

        await showAttendance();

      } catch (error) {

        console.error(error);
        toast("উপস্থিতি সংরক্ষণ করা যায়নি।", "error");

      }
    };
  };
}
  function stat(icon, label, value) {
    return `
      <article class="neu-card stat-card">
        <div class="stat-icon">${icon}</div>
        <div>
          <strong>${value}</strong>
          <span>${label}</span>
        </div>
      </article>
    `;
  }

  function makeList(items, key, empty) {

    if (!items.length) {
      return `<p class="muted empty-state">${empty}</p>`;
    }

    return `
      <ul class="simple-list">
        ${items.map(item => `
          <li>
            <span>${escapeHTML(item[key] || "—")}</span>
            <small>${formatDate(item.createdAt)}</small>
          </li>
        `).join("")}
      </ul>
    `;
  }

  function studentList(items) {

    if (!items.length) {
      return `<p class="muted">কোনো শিক্ষার্থী পাওয়া যায়নি।</p>`;
    }

    return `
      <ul class="simple-list">
        ${items.map(student => `
          <li>
            <span>
              ${escapeHTML(student.name || "—")}
              <small>${escapeHTML(student.phone || "")}</small>
            </span>
            <small>${escapeHTML(student.className || "")}</small>
          </li>
        `).join("")}
      </ul>
    `;
  }

  await openPage("dashboard");
}
