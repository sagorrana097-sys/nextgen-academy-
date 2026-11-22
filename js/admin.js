import { renderCentralSettings } from "./settings.js";
import { showExamManagement } from "./exam.js";

import {
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord,
  getAcademySettings,
  saveAcademySettings
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
    ["academic", "🎓", "Class & Subject"],
    ["exams", "📝", "পরীক্ষা ব্যবস্থাপনা"],
    ["attendance", "📅", "উপস্থিতি"],
    ["admissions", "📝", "ভর্তি আবেদন"],
    ["notices", "📢", "নোটিশ"],
    ["settings", "⚙️", "Academy Settings"],
    ["central-settings", "⚙️", "সকল সেটিংস"]
  ];


  root.innerHTML = `
    <div class="app-shell role-admin">

      <aside class="sidebar">

        <div class="sidebar-brand">
          <span class="brand-mark">N</span>

          <div class="brand-lockup">
            <b class="academy-brand-name">NextGen Academy</b>
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


  // NAVIGATION

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

      else if (page === "academic") {
        await showAcademicManagement();
      }

      else if (page === "exams") {
        await showExamManagement(content);
      }

      else if (page === "attendance") {
        await showAttendance();
      }

      else if (page === "notices") {
        await showNotices();
      }

      else if (page === "settings") {
        await showAcademySettings();
      }

      else if (page === "central-settings") {
        await renderCentralSettings(content);
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


  // NAVIGATION EVENTS

  root.querySelectorAll("[data-page]").forEach(link => {

    link.addEventListener("click", event => {
      event.preventDefault();
      openPage(link.dataset.page);
    });

  });


  // DASHBOARD

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


  // COURSE MANAGEMENT

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


  // STUDENT MANAGEMENT

  async function showStudents() {

    const [students, classes] = await Promise.all([
      listRecords("students"),
      listRecords("classes")
    ]);

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

            <select name="classId">
              <option value="">ক্লাস নির্বাচন করুন</option>

              ${classes.map(c => `
                <option value="${escapeHTML(c.id)}">
                  ${escapeHTML(c.name || "")}
                </option>
              `).join("")}

            </select>
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

        const classId = form.get("classId");

        const selectedClass = classes.find(c => c.id === classId);

        try {

          await createRecord("students", {

            name: form.get("name").trim(),

            phone: form.get("phone").trim(),

            email: form.get("email").trim(),

            classId: classId || "",

            className: selectedClass?.name || "",

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


  // ADMISSION MANAGEMENT

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


  // NOTICE MANAGEMENT

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

    const [teachers, subjects] = await Promise.all([
      listRecords("teachers"),
      listRecords("subjects")
    ]);

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

            <select name="subjectId">

              <option value="">বিষয় নির্বাচন করুন</option>

              ${subjects.map(s => `
                <option value="${escapeHTML(s.id)}">
                  ${escapeHTML(s.name || "")}
                </option>
              `).join("")}

            </select>

          </label>


          <label class="field">
            <span>মাসিক বেতন</span>
            <input name="salary" type="number" min="0">
          </label>


          <button class="btn btn-primary">
            শিক্ষক সংরক্ষণ করুন
          </button>

        </form>

      </section>


      <section class="neu-card panel">

        <h2 class="section-title">
          শিক্ষক তালিকা (${teachers.length})
        </h2>

        ${makeList(teachers, "name", "কোনো শিক্ষক যোগ করা হয়নি")}

      </section>
    `;


    content.querySelector("#teacher-form").onsubmit =
      async event => {

        event.preventDefault();

        const f = new FormData(event.currentTarget);

        const subjectId = f.get("subjectId");

        const subject = subjects.find(s => s.id === subjectId);

        try {

          await createRecord("teachers", {

            name: f.get("name").trim(),

            phone: f.get("phone").trim(),

            email: f.get("email").trim(),

            subjectId: subjectId || "",

            subject: subject?.name || "",

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

    const [batches, teachers, classes] = await Promise.all([

      listRecords("batches"),

      listRecords("teachers"),

      listRecords("classes")

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

            <select name="classId">

              <option value="">ক্লাস নির্বাচন করুন</option>

              ${classes.map(c => `
                <option value="${escapeHTML(c.id)}">
                  ${escapeHTML(c.name || "")}
                </option>
              `).join("")}

            </select>

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


          <button class="btn btn-primary">
            ব্যাচ সংরক্ষণ করুন
          </button>

        </form>

      </section>


      <section class="neu-card panel">

        <h2 class="section-title">
          ব্যাচ তালিকা (${batches.length})
        </h2>


        ${batches.length ? `

          <ul class="simple-list">

            ${batches.map(b => {

              const teacher = teachers.find(t => t.id === b.teacherId);

              const classItem = classes.find(c => c.id === b.classId);

              return `

                <li>

                  <span>
                    ${escapeHTML(b.name || "—")}

                    <small>
                      ${escapeHTML(classItem?.name || b.className || "")}
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

        ` : `

          <p class="muted">কোনো ব্যাচ তৈরি করা হয়নি।</p>

        `}

      </section>
    `;


    content.querySelector("#batch-form").onsubmit =
      async event => {

        event.preventDefault();

        const f = new FormData(event.currentTarget);

        const classId = f.get("classId");

        const selectedClass = classes.find(c => c.id === classId);

        try {

          await createRecord("batches", {

            name: f.get("name").trim(),

            classId: classId || "",

            className: selectedClass?.name || "",

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


  // CLASS & SUBJECT MANAGEMENT

  async function showAcademicManagement() {

    let activeTab = "classes";

    content.innerHTML = `
      <h1>🎓 Class & Subject Management</h1>

      <p class="muted">
        এখান থেকে প্রতিষ্ঠানের ক্লাস ও বিষয় পরিচালনা করুন।
      </p>


      <section class="neu-card panel">

        <div class="academic-tabs">

          <button class="btn btn-primary" data-tab="classes">
            📚 ক্লাস ব্যবস্থাপনা
          </button>

          <button class="btn btn-soft" data-tab="subjects">
            📖 বিষয় ব্যবস্থাপনা
          </button>

        </div>

        <div id="academic-tab-content"></div>

      </section>
    `;


    const tabContent = content.querySelector("#academic-tab-content");


    content.querySelectorAll("[data-tab]").forEach(button => {

      button.onclick = async () => {

        activeTab = button.dataset.tab;

        content.querySelectorAll("[data-tab]").forEach(btn => {

          btn.classList.toggle(
            "btn-primary",
            btn.dataset.tab === activeTab
          );

          btn.classList.toggle(
            "btn-soft",
            btn.dataset.tab !== activeTab
          );

        });

        await renderAcademicTab();

      };

    });


    async function renderAcademicTab() {

      if (activeTab === "classes") {

        await renderClasses();

      } else {

        await renderSubjects();

      }

    }


    async function renderClasses() {

      const classes = await listRecords("classes");
      const subjects = await listRecords("subjects");

      tabContent.innerHTML = `

        <h2 class="section-title">
          ক্লাস তৈরি ও পরিচালনা
        </h2>


        <form id="class-form" class="form-stack">

          <input type="hidden" name="editId">


          <label class="field">
            <span>ক্লাসের নাম</span>

            <input name="name"
              required
              placeholder="যেমন: Class Six">
          </label>


          <label class="field">
            <span>ক্লাস কোড</span>

            <input name="code"
              placeholder="যেমন: C06">
          </label>


          <label class="field">
            <span>বর্ণনা</span>

            <textarea name="description" rows="2"></textarea>
          </label>


          <label class="field">
            <span>অবস্থা</span>

            <select name="active">
              <option value="true">সক্রিয়</option>
              <option value="false">নিষ্ক্রিয়</option>
            </select>

          </label>


          <div style="display:flex;gap:10px;flex-wrap:wrap">

            <button type="submit" class="btn btn-primary">
              💾 ক্লাস সংরক্ষণ করুন
            </button>

            <button type="reset" class="btn btn-soft">
              নতুন করে লিখুন
            </button>

          </div>

        </form>


        <hr style="margin:25px 0">


        <h3>সকল ক্লাস (${classes.length})</h3>


        ${classes.length ? `

          <div class="tablewrap">

            <table>

              <thead>
                <tr>
                  <th>নাম</th>
                  <th>কোড</th>
                  <th>বিষয় সংখ্যা</th>
                  <th>অবস্থা</th>
                  <th>কার্যক্রম</th>
                </tr>
              </thead>


              <tbody>

                ${classes.map(c => {

                  const count = subjects.filter(s =>
                    (s.classIds || []).includes(c.id)
                  ).length;

                  return `

                    <tr>

                      <td>${escapeHTML(c.name || "")}</td>

                      <td>${escapeHTML(c.code || "—")}</td>

                      <td>${count}</td>

                      <td>
                        ${c.active === false ? "নিষ্ক্রিয়" : "সক্রিয়"}
                      </td>

                      <td>

                        <button
                          class="btn btn-soft"
                          data-edit-class="${c.id}">
                          সম্পাদনা
                        </button>

                        <button
                          class="btn btn-soft"
                          data-delete-class="${c.id}">
                          মুছুন
                        </button>

                      </td>

                    </tr>

                  `;

                }).join("")}

              </tbody>

            </table>

          </div>

        ` : `

          <p class="muted">এখনো কোনো ক্লাস তৈরি করা হয়নি।</p>

        `}

      `;


      const form = tabContent.querySelector("#class-form");


      form.onsubmit = async event => {

        event.preventDefault();

        const f = new FormData(form);
        const editId = f.get("editId");

        const data = {
          name: f.get("name").trim(),
          code: f.get("code").trim(),
          description: f.get("description").trim(),
          active: f.get("active") === "true",
          createdBy: user.uid
        };


        try {

          if (editId) {
            await updateRecord("classes", editId, data);
            toast("ক্লাস আপডেট হয়েছে।", "success");
          } else {
            await createRecord("classes", data);
            toast("নতুন ক্লাস তৈরি হয়েছে।", "success");
          }

          await renderClasses();

        } catch (error) {
          console.error(error);
          toast("ক্লাস সংরক্ষণ করা যায়নি।", "error");
        }

      };


      tabContent.querySelectorAll("[data-edit-class]").forEach(button => {

        button.onclick = () => {

          const item = classes.find(c =>
            c.id === button.dataset.editClass
          );

          if (!item) return;

          form.elements.editId.value = item.id;
          form.elements.name.value = item.name || "";
          form.elements.code.value = item.code || "";
          form.elements.description.value = item.description || "";
          form.elements.active.value =
            item.active === false ? "false" : "true";

          form.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        };

      });


      tabContent.querySelectorAll("[data-delete-class]").forEach(button => {

        button.onclick = async () => {

          const id = button.dataset.deleteClass;

          const linkedSubjects = subjects.filter(s =>
            (s.classIds || []).includes(id)
          );

          if (linkedSubjects.length) {
            toast(
              "এই ক্লাসের সঙ্গে বিষয় যুক্ত আছে। আগে বিষয়গুলো থেকে ক্লাসটি সরান।",
              "error"
            );
            return;
          }

          if (!confirm("এই ক্লাসটি মুছে ফেলবেন?")) return;

          try {
            await deleteRecord("classes", id);
            toast("ক্লাস মুছে ফেলা হয়েছে।", "success");
            await renderClasses();
          } catch (error) {
            console.error(error);
            toast("ক্লাস মুছে ফেলা যায়নি।", "error");
          }

        };

      });

    }


    async function renderSubjects() {

      const [subjects, classes] = await Promise.all([
        listRecords("subjects"),
        listRecords("classes")
      ]);


      tabContent.innerHTML = `

        <h2 class="section-title">
          বিষয় তৈরি ও পরিচালনা
        </h2>


        <form id="subject-form" class="form-stack">

          <input type="hidden" name="editId">


          <label class="field">
            <span>বিষয়ের নাম</span>

            <input name="name"
              required
              placeholder="যেমন: Mathematics">
          </label>


          <label class="field">
            <span>বিষয় কোড</span>

            <input name="code"
              placeholder="যেমন: MAT">
          </label>


          <div class="field">

            <span>যেসব ক্লাসে বিষয়টি পড়ানো হবে</span>

            <div class="subject-class-options">

              ${classes.length ? classes.map(c => `

                <label style="
                  display:flex;
                  align-items:center;
                  gap:10px;
                  margin:8px 0;
                ">

                  <input
                    type="checkbox"
                    name="classIds"
                    value="${escapeHTML(c.id)}"
                  >

                  <span>${escapeHTML(c.name || "")}</span>

                </label>

              `).join("") : `

                <p class="muted">
                  আগে Class Management থেকে ক্লাস তৈরি করুন।
                </p>

              `}

            </div>

          </div>


          <label class="field">
            <span>অবস্থা</span>

            <select name="active">
              <option value="true">সক্রিয়</option>
              <option value="false">নিষ্ক্রিয়</option>
            </select>

          </label>


          <div style="display:flex;gap:10px;flex-wrap:wrap">

            <button type="submit" class="btn btn-primary">
              💾 বিষয় সংরক্ষণ করুন
            </button>

            <button type="reset" class="btn btn-soft">
              নতুন করে লিখুন
            </button>

          </div>

        </form>


        <hr style="margin:25px 0">


        <h3>সকল বিষয় (${subjects.length})</h3>


        ${subjects.length ? `

          <div class="tablewrap">

            <table>

              <thead>
                <tr>
                  <th>বিষয়</th>
                  <th>কোড</th>
                  <th>ক্লাস</th>
                  <th>অবস্থা</th>
                  <th>কার্যক্রম</th>
                </tr>
              </thead>


              <tbody>

                ${subjects.map(s => {

                  const linkedClasses = classes.filter(c =>
                    (s.classIds || []).includes(c.id)
                  );

                  return `

                    <tr>

                      <td>${escapeHTML(s.name || "")}</td>

                      <td>${escapeHTML(s.code || "—")}</td>

                      <td>
                        ${linkedClasses.length
                          ? linkedClasses.map(c =>
                              escapeHTML(c.name)
                            ).join(", ")
                          : "ক্লাস নির্ধারিত নয়"
                        }
                      </td>

                      <td>
                        ${s.active === false ? "নিষ্ক্রিয়" : "সক্রিয়"}
                      </td>

                      <td>

                        <button
                          class="btn btn-soft"
                          data-edit-subject="${s.id}">
                          সম্পাদনা
                        </button>

                        <button
                          class="btn btn-soft"
                          data-delete-subject="${s.id}">
                          মুছুন
                        </button>

                      </td>

                    </tr>

                  `;

                }).join("")}

              </tbody>

            </table>

          </div>

        ` : `

          <p class="muted">এখনো কোনো বিষয় তৈরি করা হয়নি।</p>

        `}

      `;


      const form = tabContent.querySelector("#subject-form");


      form.onsubmit = async event => {

        event.preventDefault();

        const f = new FormData(form);
        const editId = f.get("editId");
        const classIds = f.getAll("classIds");

        const data = {
          name: f.get("name").trim(),
          code: f.get("code").trim(),
          classIds,
          active: f.get("active") === "true",
          createdBy: user.uid
        };


        try {

          if (editId) {
            await updateRecord("subjects", editId, data);
            toast("বিষয় আপডেট হয়েছে।", "success");
          } else {
            await createRecord("subjects", data);
            toast("নতুন বিষয় তৈরি হয়েছে।", "success");
          }

          await renderSubjects();

        } catch (error) {
          console.error(error);
          toast("বিষয় সংরক্ষণ করা যায়নি।", "error");
        }

      };


      tabContent.querySelectorAll("[data-edit-subject]").forEach(button => {

        button.onclick = () => {

          const item = subjects.find(s =>
            s.id === button.dataset.editSubject
          );

          if (!item) return;

          form.elements.editId.value = item.id;
          form.elements.name.value = item.name || "";
          form.elements.code.value = item.code || "";
          form.elements.active.value =
            item.active === false ? "false" : "true";

          form.querySelectorAll('[name="classIds"]').forEach(checkbox => {
            checkbox.checked =
              (item.classIds || []).includes(checkbox.value);
          });

          form.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

        };

      });


      tabContent.querySelectorAll("[data-delete-subject]").forEach(button => {

        button.onclick = async () => {

          const id = button.dataset.deleteSubject;

          if (!confirm("এই বিষয়টি মুছে ফেলবেন?")) return;

          try {
            await deleteRecord("subjects", id);
            toast("বিষয় মুছে ফেলা হয়েছে।", "success");
            await renderSubjects();
          } catch (error) {
            console.error(error);
            toast("বিষয় মুছে ফেলা যায়নি।", "error");
          }

        };

      });

    }


    await renderAcademicTab();

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


        <div class="attendance-report-section">

          <hr style="margin:25px 0">

          <h2 class="section-title">📊 উপস্থিতির রিপোর্ট</h2>

          <label class="field">
            <span>রিপোর্টের তারিখ নির্বাচন করুন</span>
            <input type="date" id="report-date" value="${today}">
          </label>


          <button class="btn btn-primary" id="show-attendance-report">
            রিপোর্ট দেখুন
          </button>


          <div id="attendance-report-result"></div>

        </div>

      </section>

    `;


    const list = content.querySelector("#attendance-students");


    content.querySelector("#show-attendance-report").onclick = () => {

      const date = content.querySelector("#report-date").value;
      const result = content.querySelector("#attendance-report-result");

      if (!date) {
        toast("রিপোর্টের তারিখ নির্বাচন করুন।", "error");
        return;
      }

      const presentStudents = students.filter(student =>
        attendance.some(a =>
          a.studentId === student.id &&
          a.date === date &&
          a.status === "present"
        )
      );

      const absentStudents = students.filter(student =>
        attendance.some(a =>
          a.studentId === student.id &&
          a.date === date &&
          a.status === "absent"
        )
      );

      const totalMarked =
        presentStudents.length + absentStudents.length;

      const unmarked = students.length - totalMarked;

      result.innerHTML = `

        <div class="stats-grid" style="margin-top:20px">

          ${stat("👨‍🎓", "মোট শিক্ষার্থী", students.length)}
          ${stat("✅", "উপস্থিত", presentStudents.length)}
          ${stat("❌", "অনুপস্থিত", absentStudents.length)}
          ${stat("⏳", "হিসাব হয়নি", unmarked)}

        </div>


        <section class="neu-card panel" style="margin-top:20px">
          <h3>✅ উপস্থিত শিক্ষার্থীরা</h3>

          ${presentStudents.length
            ? makeList(presentStudents, "name", "")
            : `<p class="muted">কেউ উপস্থিত নেই।</p>`
          }
        </section>


        <section class="neu-card panel" style="margin-top:20px">
          <h3>❌ অনুপস্থিত শিক্ষার্থীরা</h3>

          ${absentStudents.length
            ? makeList(absentStudents, "name", "")
            : `<p class="muted">কেউ অনুপস্থিত নেই।</p>`
          }
        </section>

      `;

    };


    content.querySelector("#load-attendance").onclick = () => {

      const date = content.querySelector("#attendance-date").value;

      if (!date) {
        toast("তারিখ নির্বাচন করুন।", "error");
        return;
      }

      if (!students.length) {
        list.innerHTML = `
          <p class="muted">কোনো শিক্ষার্থী পাওয়া যায়নি।</p>
        `;
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
              studentName:
                students.find(s => s.id === studentId)?.name || "",
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


  // ACADEMY SETTINGS

  async function showAcademySettings() {

    const settings = await getAcademySettings();

    content.innerHTML = `

      <h1>⚙️ Academy Settings</h1>


      <section class="neu-card panel">

        <h2 class="section-title">১. প্রতিষ্ঠান পরিচিতি</h2>


        <form id="academy-settings-form" class="form-stack">


          <label class="field">
            <span>একাডেমির নাম</span>

            <input name="academyName"
              value="${escapeHTML(settings.academyName || "")}"
              required>
          </label>


          <label class="field">
            <span>স্লোগান</span>

            <input name="tagline"
              value="${escapeHTML(settings.tagline || "")}">
          </label>


          <label class="field">
            <span>প্রতিষ্ঠানের লোগো URL</span>

            <input name="logoUrl"
              type="url"
              value="${escapeHTML(settings.logoUrl || "")}"
              placeholder="https://example.com/logo.png">
          </label>


          <div>

            <img id="logo-preview"
              src="${escapeHTML(settings.logoUrl || "")}"
              alt="Academy Logo"
              style="
                max-width:140px;
                max-height:100px;
                object-fit:contain;
                display:${settings.logoUrl ? "block" : "none"};
              ">

          </div>


          <label class="field">
            <span>মোবাইল নম্বর</span>

            <input name="phone"
              value="${escapeHTML(settings.phone || "")}">
          </label>


          <label class="field">
            <span>ইমেইল</span>

            <input name="email"
              type="email"
              value="${escapeHTML(settings.email || "")}">
          </label>


          <label class="field">
            <span>ওয়েবসাইট</span>

            <input name="website"
              type="url"
              value="${escapeHTML(settings.website || "")}">
          </label>


          <label class="field">
            <span>প্রতিষ্ঠানের ঠিকানা</span>

            <textarea name="address">${escapeHTML(settings.address || "")}</textarea>
          </label>


          <hr>


          <h2 class="section-title">২. Branding ও Design</h2>


          <label class="field">
            <span>প্রধান রং (Primary Color)</span>

            <input type="color" name="primaryColor"
              value="${escapeHTML(settings.primaryColor || "#2563eb")}">
          </label>


          <label class="field">
            <span>সহায়ক রং (Secondary Color)</span>

            <input type="color" name="secondaryColor"
              value="${escapeHTML(settings.secondaryColor || "#0f172a")}">
          </label>


          <label class="field">
            <span>ওয়েবসাইটের Theme</span>

            <select name="theme">

              <option value="light" ${settings.theme !== "dark" ? "selected" : ""}>
                Light
              </option>

              <option value="dark" ${settings.theme === "dark" ? "selected" : ""}>
                Dark
              </option>

            </select>

          </label>


          <label class="field">
            <span>ওয়েবসাইটের Font</span>

            <select name="fontFamily">

              <option value="Hind Siliguri"
                ${settings.fontFamily === "Hind Siliguri" ? "selected" : ""}>
                Hind Siliguri
              </option>

              <option value="Noto Sans Bengali"
                ${settings.fontFamily === "Noto Sans Bengali" ? "selected" : ""}>
                Noto Sans Bengali
              </option>

              <option value="Arial"
                ${settings.fontFamily === "Arial" ? "selected" : ""}>
                Arial
              </option>

            </select>

          </label>


          <button type="submit" class="btn btn-primary">
            💾 সেটিংস সংরক্ষণ করুন
          </button>


        </form>

      </section>

    `;


    const form = content.querySelector("#academy-settings-form");
    const logoInput = form.querySelector('[name="logoUrl"]');
    const preview = content.querySelector("#logo-preview");

    logoInput.oninput = () => {
      const url = logoInput.value.trim();
      preview.src = url;
      preview.style.display = url ? "block" : "none";
    };

    form.onsubmit = async event => {

      event.preventDefault();

      const button = form.querySelector('button[type="submit"]');

      button.disabled = true;
      button.textContent = "সংরক্ষণ হচ্ছে...";

      try {

        const data = Object.fromEntries(
          new FormData(form).entries()
        );

        await saveAcademySettings(data);

        toast("প্রতিষ্ঠানের তথ্য সংরক্ষণ করা হয়েছে।", "success");

        await showAcademySettings();

      } catch (error) {

        console.error(error);

        toast("সেটিংস সংরক্ষণ করা যায়নি।", "error");

        button.disabled = false;
        button.textContent = "💾 সেটিংস সংরক্ষণ করুন";

      }

    };

  }


  // COMMON HELPERS

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
      return `
        <p class="muted empty-state">${empty}</p>
      `;
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
      return `
        <p class="muted">কোনো শিক্ষার্থী পাওয়া যায়নি।</p>
      `;
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
