import { renderCentralSettings } from "./settings.js";
import { showMarksManagement as showExamManagement } from "./exam.js";

import {
  listRecords,
  createRecord,
  createStudentRecord,
  approveAdmission,
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
    ["dashboard", "â–¦", "à¦¡à§à¦¯à¦¾à¦¶à¦¬à§‹à¦°à§à¦¡"],
    ["courses", "ðŸ“š", "à¦•à§‹à¦°à§à¦¸"],
    ["students", "ðŸ‘¨â€ðŸŽ“", "à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€"],
    ["teachers", "ðŸ‘¨â€ðŸ«", "à¦¶à¦¿à¦•à§à¦·à¦•"],
    ["batches", "ðŸ«", "à¦¬à§à¦¯à¦¾à¦š"],
    ["academic", "ðŸŽ“", "Class & Subject"],
    ["exams", "ðŸ“", "à¦ªà¦°à§€à¦•à§à¦·à¦¾ à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾"],
    ["attendance", "ðŸ“…", "à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿"],
    ["admissions", "ðŸ“", "à¦­à¦°à§à¦¤à¦¿ à¦†à¦¬à§‡à¦¦à¦¨"],
    ["notices", "ðŸ“¢", "à¦¨à§‹à¦Ÿà¦¿à¦¶"],
    ["settings", "âš™ï¸", "Academy Settings"],
    ["central-settings", "âš™ï¸", "à¦¸à¦•à¦² à¦¸à§‡à¦Ÿà¦¿à¦‚à¦¸"]
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
            â†ª à¦²à¦—à¦†à¦‰à¦Ÿ
          </button>

        </div>

      </aside>


      <main class="dashboard-main">

        <header class="topbar">

          <button id="mobile-menu-btn" class="btn btn-soft mobile-menu">
            â˜°
          </button>

          <div class="topbar-title">Admin Dashboard</div>

          <div class="topbar-actions">
            <button id="theme-btn" class="icon-btn">â—</button>

            <span class="avatar">
              ${escapeHTML((profile.name || "A")[0])}
            </span>
          </div>

        </header>

        <div class="dashboard-content" id="admin-content">
          <p>à¦²à§‹à¦¡ à¦¹à¦šà§à¦›à§‡...</p>
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
          <h3>à¦¤à¦¥à§à¦¯ à¦²à§‹à¦¡ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿</h3>
          <p>${escapeHTML(error.message || String(error))}</p>
          <p>à¦¸à¦®à¦¸à§à¦¯à¦¾à¦° à¦•à§‹à¦¡: ${escapeHTML(error.code || "Unknown")}</p>
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

          <h1>à¦¸à§à¦¬à¦¾à¦—à¦¤à¦®, ${escapeHTML(profile.name || "Admin")} ðŸ‘‹</h1>

          <p class="muted">
            à¦†à¦ªà¦¨à¦¾à¦° à¦à¦•à¦¾à¦¡à§‡à¦®à¦¿à¦° à¦¸à¦¾à¦°à§à¦¬à¦¿à¦• à¦•à¦¾à¦°à§à¦¯à¦•à§à¦°à¦® à¦¦à§‡à¦–à§à¦¨à¥¤
          </p>
        </div>

        <span class="pill">Administrator</span>

      </div>


      <div class="stats-grid">

        ${stat("ðŸ“š", "à¦®à§‹à¦Ÿ à¦•à§‹à¦°à§à¦¸", courses.length)}
        ${stat("ðŸ‘¨â€ðŸŽ“", "à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€", students.length)}
        ${stat("ðŸ“", "à¦­à¦°à§à¦¤à¦¿ à¦†à¦¬à§‡à¦¦à¦¨", admissions.length)}
        ${stat("ðŸ“¢", "à¦¨à§‹à¦Ÿà¦¿à¦¶", notices.length)}

      </div>


      <div class="content-grid">

        <section class="neu-card panel">

          <h2 class="section-title">à¦¸à¦¾à¦®à§à¦ªà§à¦°à¦¤à¦¿à¦• à¦­à¦°à§à¦¤à¦¿ à¦†à¦¬à§‡à¦¦à¦¨</h2>

          ${makeList(admissions, "name", "à¦•à§‹à¦¨à§‹ à¦†à¦¬à§‡à¦¦à¦¨ à¦¨à§‡à¦‡")}

          <button class="btn btn-primary" data-goto="admissions">
            à¦¸à¦¬ à¦†à¦¬à§‡à¦¦à¦¨ à¦¦à§‡à¦–à§à¦¨
          </button>

        </section>


        <section class="neu-card panel">

          <h2 class="section-title">à¦¸à¦¾à¦®à§à¦ªà§à¦°à¦¤à¦¿à¦• à¦•à§‹à¦°à§à¦¸</h2>

          ${makeList(courses, "title", "à¦•à§‹à¦¨à§‹ à¦•à§‹à¦°à§à¦¸ à¦¨à§‡à¦‡")}

          <button class="btn btn-primary" data-goto="courses">
            à¦•à§‹à¦°à§à¦¸ à¦¦à§‡à¦–à§à¦¨
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
      <h1>ðŸ“š à¦•à§‹à¦°à§à¦¸ à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾</h1>

      <section class="neu-card panel">

        <h2 class="section-title">à¦¨à¦¤à§à¦¨ à¦•à§‹à¦°à§à¦¸ à¦¯à§‹à¦— à¦•à¦°à§à¦¨</h2>

        <form id="course-form" class="form-stack">

          <label class="field">
            <span>à¦•à§‹à¦°à§à¦¸à§‡à¦° à¦¨à¦¾à¦®</span>

            <input name="title" required
              placeholder="à¦¯à§‡à¦®à¦¨: HSC à¦ªà¦¦à¦¾à¦°à§à¦¥à¦¬à¦¿à¦œà§à¦žà¦¾à¦¨">
          </label>


          <label class="field">
            <span>à¦¬à¦°à§à¦£à¦¨à¦¾</span>

            <textarea name="description" rows="3"></textarea>
          </label>


          <button class="btn btn-primary">
            à¦•à§‹à¦°à§à¦¸ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à§à¦¨
          </button>

        </form>

      </section>


      <section class="neu-card panel">

        <h2 class="section-title">
          à¦¸à¦•à¦² à¦•à§‹à¦°à§à¦¸ (${courses.length})
        </h2>

        ${makeList(courses, "title", "à¦•à§‹à¦¨à§‹ à¦•à§‹à¦°à§à¦¸ à¦¯à§‹à¦— à¦•à¦°à¦¾ à¦¹à§Ÿà¦¨à¦¿")}

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

          toast("à¦•à§‹à¦°à§à¦¸ à¦¯à§‹à¦— à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");

          await showCourses();

        } catch (error) {

          console.error(error);

          toast("à¦•à§‹à¦°à§à¦¸ à¦¯à§‹à¦— à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤", "error");

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
      <h1>ðŸ‘¨â€ðŸŽ“ à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€ à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾</h1>
      <section class="neu-card panel">
        <h2 class="section-title">à¦¨à¦¤à§à¦¨ à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€ à¦¯à§‹à¦— à¦•à¦°à§à¦¨</h2>
        <form id="student-form" class="form-stack">
          <label class="field">
            <span>à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€à¦° à¦¨à¦¾à¦®</span>
            <input name="name" required>
          </label>
          <label class="field">
            <span>à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦¨à¦®à§à¦¬à¦°</span>
            <input name="phone" required>
          </label>
          <label class="field">
            <span>à¦‡à¦®à§‡à¦‡à¦²</span>
            <input name="email" type="email">
          </label>
          <label class="field">
            <span>à¦•à§à¦²à¦¾à¦¸</span>
            <select name="classId">
              <option value="">à¦•à§à¦²à¦¾à¦¸ à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨</option>
              ${classes.map(c => `
                <option value="${escapeHTML(c.id)}">${escapeHTML(c.name || "")}</option>
              `).join("")}
            </select>
          </label>
          <button type="submit" class="btn btn-primary">à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à§à¦¨</button>
        </form>
      </section>

      <section class="neu-card panel">
        <h2 class="section-title">à¦¸à¦•à¦² à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€ (${students.length})</h2>
        <input id="student-search" placeholder="à¦¨à¦¾à¦® à¦¬à¦¾ Student ID à¦¦à¦¿à§Ÿà§‡ à¦–à§à¦à¦œà§à¦¨">
        <div id="student-list">${studentList(students)}</div>
      </section>
    `;

    content.querySelector("#student-form").onsubmit = async event => {
      event.preventDefault();
      const formElement = event.currentTarget;
      const form = new FormData(formElement);
      const submitButton = formElement.querySelector('button[type="submit"]');
      const classId = form.get("classId");
      const selectedClass = classes.find(c => c.id === classId);

      submitButton.disabled = true;
      submitButton.textContent = "à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦¹à¦šà§à¦›à§‡...";

      try {
        const student = await createStudentRecord({
          name: String(form.get("name") || "").trim(),
          phone: String(form.get("phone") || "").trim(),
          email: String(form.get("email") || "").trim(),
          classId: classId || "",
          className: selectedClass?.name || "",
          createdBy: user.uid
        });

        toast(`à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€ à¦¯à§‹à¦— à¦¹à§Ÿà§‡à¦›à§‡à¥¤ Student ID: ${student.studentCode}`, "success");
        await showStudents();
      } catch (error) {
        console.error("Student creation failed:", error);
        toast("à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€ à¦¯à§‹à¦— à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤ " + (error.message || ""), "error");
        submitButton.disabled = false;
        submitButton.textContent = "à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à§à¦¨";
      }
    };

    content.querySelector("#student-search").oninput = event => {
      const search = event.target.value.trim().toLowerCase();
      const filtered = students.filter(student =>
        (student.name || "").toLowerCase().includes(search) ||
        (student.studentCode || "").toLowerCase().includes(search) ||
        (student.phone || "").toLowerCase().includes(search)
      );
      content.querySelector("#student-list").innerHTML = studentList(filtered);
    };
  }


  // ADMISSION MANAGEMENT

  async function showAdmissions() {
    const admissions = await listRecords("admissions");

    content.innerHTML = `
      <h1>ðŸ“ à¦­à¦°à§à¦¤à¦¿ à¦†à¦¬à§‡à¦¦à¦¨ à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾</h1>
      <section class="neu-card panel">
        <h2 class="section-title">à¦®à§‹à¦Ÿ à¦†à¦¬à§‡à¦¦à¦¨: ${admissions.length}</h2>
        <div class="tablewrap">
          <table>
            <thead>
              <tr>
                <th>à¦¨à¦¾à¦®</th><th>à¦‡à¦®à§‡à¦‡à¦²</th><th>à¦«à§‹à¦¨</th>
                <th>à¦•à§‹à¦°à§à¦¸</th><th>à¦…à¦¬à¦¸à§à¦¥à¦¾</th><th>à¦•à¦¾à¦°à§à¦¯à¦•à§à¦°à¦®</th>
              </tr>
            </thead>
            <tbody>
              ${admissions.map(item => `
                <tr>
                  <td>${escapeHTML(item.name || "â€”")}</td>
                  <td>${escapeHTML(item.email || "â€”")}</td>
                  <td>${escapeHTML(item.phone || "â€”")}</td>
                  <td>${escapeHTML(item.course || "â€”")}</td>
                  <td>${escapeHTML(item.status || "pending")}</td>
                  <td>
                    ${item.status === "approved"
                      ? `à¦…à¦¨à§à¦®à§‹à¦¦à¦¿à¦¤${item.studentCode ? `<br><small>${escapeHTML(item.studentCode)}</small>` : ""}`
                      : `
                        <button type="button" class="btn btn-primary" data-approve="${escapeHTML(item.id)}">à¦…à¦¨à§à¦®à§‹à¦¦à¦¨</button>
                        <button type="button" class="btn btn-soft" data-reject="${escapeHTML(item.id)}">à¦¬à¦¾à¦¤à¦¿à¦²</button>
                      `}
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
        const application = admissions.find(item => item.id === id);
        if (!application || application.status === "approved") return;
        if (!confirm(`â€œ${application.name || "à¦à¦‡ à¦†à¦¬à§‡à¦¦à¦¨"}â€ à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦•à¦°à§‡ à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€ à¦¹à¦¿à¦¸à§‡à¦¬à§‡ à¦¯à§à¦•à§à¦¤ à¦•à¦°à¦¬à§‡à¦¨?`)) return;

        button.disabled = true;
        button.textContent = "à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦¹à¦šà§à¦›à§‡...";
        try {
          const result = await approveAdmission(id, user.uid);
          const code = result?.studentCode || result?.student?.studentCode || "";
          toast(
            code ? `à¦­à¦°à§à¦¤à¦¿ à¦…à¦¨à§à¦®à§‹à¦¦à¦¿à¦¤à¥¤ Student ID: ${code}` : "à¦­à¦°à§à¦¤à¦¿ à¦†à¦¬à§‡à¦¦à¦¨ à¦…à¦¨à§à¦®à§‹à¦¦à¦¿à¦¤ à¦¹à§Ÿà§‡à¦›à§‡à¥¤",
            "success"
          );
          await showAdmissions();
        } catch (error) {
          console.error("Admission approval failed:", error);
          toast("à¦­à¦°à§à¦¤à¦¿ à¦…à¦¨à§à¦®à§‹à¦¦à¦¨ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤ " + (error.message || ""), "error");
          button.disabled = false;
          button.textContent = "à¦…à¦¨à§à¦®à§‹à¦¦à¦¨";
        }
      };
    });

    content.querySelectorAll("[data-reject]").forEach(button => {
      button.onclick = async () => {
        const id = button.dataset.reject;
        if (!confirm("à¦à¦‡ à¦­à¦°à§à¦¤à¦¿ à¦†à¦¬à§‡à¦¦à¦¨à¦Ÿà¦¿ à¦¬à¦¾à¦¤à¦¿à¦² à¦•à¦°à¦¬à§‡à¦¨?")) return;
        button.disabled = true;
        try {
          await updateRecord("admissions", id, {
            status: "rejected",
            reviewedBy: user.uid,
            reviewedAt: new Date().toISOString()
          });
          toast("à¦­à¦°à§à¦¤à¦¿ à¦†à¦¬à§‡à¦¦à¦¨ à¦¬à¦¾à¦¤à¦¿à¦² à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");
          await showAdmissions();
        } catch (error) {
          console.error("Admission rejection failed:", error);
          toast("à¦†à¦¬à§‡à¦¦à¦¨ à¦¬à¦¾à¦¤à¦¿à¦² à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤ " + (error.message || ""), "error");
          button.disabled = false;
        }
      };
    });
  }


  // NOTICE MANAGEMENT

  async function showNotices() {

    const notices = await listRecords("notices");

    content.innerHTML = `
      <h1>ðŸ“¢ à¦¨à§‹à¦Ÿà¦¿à¦¶ à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾</h1>

      <section class="neu-card panel">

        <form id="notice-form" class="form-stack">

          <label class="field">
            <span>à¦¨à§‹à¦Ÿà¦¿à¦¶à§‡à¦° à¦¶à¦¿à¦°à§‹à¦¨à¦¾à¦®</span>
            <input name="title" required>
          </label>


          <label class="field">
            <span>à¦¨à§‹à¦Ÿà¦¿à¦¶à§‡à¦° à¦¬à¦¿à¦¸à§à¦¤à¦¾à¦°à¦¿à¦¤</span>
            <textarea name="body" rows="4" required></textarea>
          </label>


          <button class="btn btn-primary">
            à¦¨à§‹à¦Ÿà¦¿à¦¶ à¦ªà§à¦°à¦•à¦¾à¦¶ à¦•à¦°à§à¦¨
          </button>

        </form>

      </section>


      <section class="neu-card panel">

        <h2 class="section-title">à¦ªà§à¦°à¦•à¦¾à¦¶à¦¿à¦¤ à¦¨à§‹à¦Ÿà¦¿à¦¶</h2>

        ${makeList(notices, "title", "à¦•à§‹à¦¨à§‹ à¦¨à§‹à¦Ÿà¦¿à¦¶ à¦¨à§‡à¦‡")}

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

          toast("à¦¨à§‹à¦Ÿà¦¿à¦¶ à¦ªà§à¦°à¦•à¦¾à¦¶à¦¿à¦¤ à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");

          await showNotices();

        } catch (error) {

          console.error(error);

          toast("à¦¨à§‹à¦Ÿà¦¿à¦¶ à¦ªà§à¦°à¦•à¦¾à¦¶ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤", "error");

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
      <h1>ðŸ‘¨â€ðŸ« à¦¶à¦¿à¦•à§à¦·à¦• à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾</h1>

      <section class="neu-card panel">

        <h2 class="section-title">à¦¨à¦¤à§à¦¨ à¦¶à¦¿à¦•à§à¦·à¦• à¦¯à§‹à¦— à¦•à¦°à§à¦¨</h2>

        <form id="teacher-form" class="form-stack">

          <label class="field">
            <span>à¦¶à¦¿à¦•à§à¦·à¦•à§‡à¦° à¦¨à¦¾à¦®</span>
            <input name="name" required>
          </label>


          <label class="field">
            <span>à¦®à§‹à¦¬à¦¾à¦‡à¦²</span>
            <input name="phone">
          </label>


          <label class="field">
            <span>à¦‡à¦®à§‡à¦‡à¦²</span>
            <input name="email" type="email">
          </label>


          <label class="field">
            <span>à¦¬à¦¿à¦·à§Ÿ</span>

            <select name="subjectId">

              <option value="">à¦¬à¦¿à¦·à§Ÿ à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨</option>

              ${subjects.map(s => `
                <option value="${escapeHTML(s.id)}">
                  ${escapeHTML(s.name || "")}
                </option>
              `).join("")}

            </select>

          </label>


          <label class="field">
            <span>à¦®à¦¾à¦¸à¦¿à¦• à¦¬à§‡à¦¤à¦¨</span>
            <input name="salary" type="number" min="0">
          </label>


          <button class="btn btn-primary">
            à¦¶à¦¿à¦•à§à¦·à¦• à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à§à¦¨
          </button>

        </form>

      </section>


      <section class="neu-card panel">

        <h2 class="section-title">
          à¦¶à¦¿à¦•à§à¦·à¦• à¦¤à¦¾à¦²à¦¿à¦•à¦¾ (${teachers.length})
        </h2>

        ${makeList(teachers, "name", "à¦•à§‹à¦¨à§‹ à¦¶à¦¿à¦•à§à¦·à¦• à¦¯à§‹à¦— à¦•à¦°à¦¾ à¦¹à§Ÿà¦¨à¦¿")}

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

          toast("à¦¶à¦¿à¦•à§à¦·à¦• à¦¯à§‹à¦— à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");

          await showTeachers();

        } catch (error) {

          console.error(error);

          toast("à¦¶à¦¿à¦•à§à¦·à¦• à¦¯à§‹à¦— à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤", "error");

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
      <h1>ðŸ« à¦¬à§à¦¯à¦¾à¦š à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾</h1>

      <section class="neu-card panel">

        <h2 class="section-title">à¦¨à¦¤à§à¦¨ à¦¬à§à¦¯à¦¾à¦š à¦¤à§ˆà¦°à¦¿ à¦•à¦°à§à¦¨</h2>

        <form id="batch-form" class="form-stack">

          <label class="field">
            <span>à¦¬à§à¦¯à¦¾à¦šà§‡à¦° à¦¨à¦¾à¦®</span>
            <input name="name" required>
          </label>


          <label class="field">
            <span>à¦¶à§à¦°à§‡à¦£à¦¿</span>

            <select name="classId">

              <option value="">à¦•à§à¦²à¦¾à¦¸ à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨</option>

              ${classes.map(c => `
                <option value="${escapeHTML(c.id)}">
                  ${escapeHTML(c.name || "")}
                </option>
              `).join("")}

            </select>

          </label>


          <label class="field">
            <span>à¦¬à¦¿à¦­à¦¾à¦—</span>

            <select name="division">
              <option>General</option>
              <option>Science</option>
              <option>Humanities</option>
              <option>Business Studies</option>
            </select>

          </label>


          <label class="field">
            <span>à¦¶à¦¿à¦•à§à¦·à¦•</span>

            <select name="teacherId">

              <option value="">à¦¶à¦¿à¦•à§à¦·à¦• à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨</option>

              ${teachers.map(t => `
                <option value="${escapeHTML(t.id)}">
                  ${escapeHTML(t.name)}
                </option>
              `).join("")}

            </select>

          </label>


          <label class="field">
            <span>à¦•à§à¦²à¦¾à¦¸à§‡à¦° à¦¸à¦®à§Ÿà¦¸à§‚à¦šà¦¿</span>
            <input name="schedule" placeholder="à¦¯à§‡à¦®à¦¨: à¦¸à¦•à¦¾à¦² à§§à§¦à¦Ÿà¦¾">
          </label>


          <button class="btn btn-primary">
            à¦¬à§à¦¯à¦¾à¦š à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à§à¦¨
          </button>

        </form>

      </section>


      <section class="neu-card panel">

        <h2 class="section-title">
          à¦¬à§à¦¯à¦¾à¦š à¦¤à¦¾à¦²à¦¿à¦•à¦¾ (${batches.length})
        </h2>


        ${batches.length ? `

          <ul class="simple-list">

            ${batches.map(b => {

              const teacher = teachers.find(t => t.id === b.teacherId);

              const classItem = classes.find(c => c.id === b.classId);

              return `

                <li>

                  <span>
                    ${escapeHTML(b.name || "â€”")}

                    <small>
                      ${escapeHTML(classItem?.name || b.className || "")}
                      Â· ${escapeHTML(b.division || "")}
                    </small>

                  </span>

                  <small>
                    ${escapeHTML(teacher?.name || "à¦¶à¦¿à¦•à§à¦·à¦• à¦¨à¦¿à¦°à§à¦§à¦¾à¦°à¦¿à¦¤ à¦¨à§Ÿ")}
                    <br>
                    ${escapeHTML(b.schedule || "")}
                  </small>

                </li>

              `;

            }).join("")}

          </ul>

        ` : `

          <p class="muted">à¦•à§‹à¦¨à§‹ à¦¬à§à¦¯à¦¾à¦š à¦¤à§ˆà¦°à¦¿ à¦•à¦°à¦¾ à¦¹à§Ÿà¦¨à¦¿à¥¤</p>

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

          toast("à¦¨à¦¤à§à¦¨ à¦¬à§à¦¯à¦¾à¦š à¦¤à§ˆà¦°à¦¿ à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");

          await showBatches();

        } catch (error) {

          console.error(error);

          toast("à¦¬à§à¦¯à¦¾à¦š à¦¤à§ˆà¦°à¦¿ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤", "error");

        }

      };

  }


  // CLASS & SUBJECT MANAGEMENT

  async function showAcademicManagement() {

    let activeTab = "classes";

    content.innerHTML = `
      <h1>ðŸŽ“ Class & Subject Management</h1>

      <p class="muted">
        à¦à¦–à¦¾à¦¨ à¦¥à§‡à¦•à§‡ à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨à§‡à¦° à¦•à§à¦²à¦¾à¦¸ à¦“ à¦¬à¦¿à¦·à§Ÿ à¦ªà¦°à¦¿à¦šà¦¾à¦²à¦¨à¦¾ à¦•à¦°à§à¦¨à¥¤
      </p>


      <section class="neu-card panel">

        <div class="academic-tabs">

          <button class="btn btn-primary" data-tab="classes">
            ðŸ“š à¦•à§à¦²à¦¾à¦¸ à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾
          </button>

          <button class="btn btn-soft" data-tab="subjects">
            ðŸ“– à¦¬à¦¿à¦·à§Ÿ à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾
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
          à¦•à§à¦²à¦¾à¦¸ à¦¤à§ˆà¦°à¦¿ à¦“ à¦ªà¦°à¦¿à¦šà¦¾à¦²à¦¨à¦¾
        </h2>


        <form id="class-form" class="form-stack">

          <input type="hidden" name="editId">


          <label class="field">
            <span>à¦•à§à¦²à¦¾à¦¸à§‡à¦° à¦¨à¦¾à¦®</span>

            <input name="name"
              required
              placeholder="à¦¯à§‡à¦®à¦¨: Class Six">
          </label>


          <label class="field">
            <span>à¦•à§à¦²à¦¾à¦¸ à¦•à§‹à¦¡</span>

            <input name="code"
              placeholder="à¦¯à§‡à¦®à¦¨: C06">
          </label>


          <label class="field">
            <span>à¦¬à¦°à§à¦£à¦¨à¦¾</span>

            <textarea name="description" rows="2"></textarea>
          </label>


          <label class="field">
            <span>à¦…à¦¬à¦¸à§à¦¥à¦¾</span>

            <select name="active">
              <option value="true">à¦¸à¦•à§à¦°à¦¿à§Ÿ</option>
              <option value="false">à¦¨à¦¿à¦·à§à¦•à§à¦°à¦¿à§Ÿ</option>
            </select>

          </label>


          <div style="display:flex;gap:10px;flex-wrap:wrap">

            <button type="submit" class="btn btn-primary">
              ðŸ’¾ à¦•à§à¦²à¦¾à¦¸ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à§à¦¨
            </button>

            <button type="reset" class="btn btn-soft">
              à¦¨à¦¤à§à¦¨ à¦•à¦°à§‡ à¦²à¦¿à¦–à§à¦¨
            </button>

          </div>

        </form>


        <hr style="margin:25px 0">


        <h3>à¦¸à¦•à¦² à¦•à§à¦²à¦¾à¦¸ (${classes.length})</h3>


        ${classes.length ? `

          <div class="tablewrap">

            <table>

              <thead>
                <tr>
                  <th>à¦¨à¦¾à¦®</th>
                  <th>à¦•à§‹à¦¡</th>
                  <th>à¦¬à¦¿à¦·à§Ÿ à¦¸à¦‚à¦–à§à¦¯à¦¾</th>
                  <th>à¦…à¦¬à¦¸à§à¦¥à¦¾</th>
                  <th>à¦•à¦¾à¦°à§à¦¯à¦•à§à¦°à¦®</th>
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

                      <td>${escapeHTML(c.code || "â€”")}</td>

                      <td>${count}</td>

                      <td>
                        ${c.active === false ? "à¦¨à¦¿à¦·à§à¦•à§à¦°à¦¿à§Ÿ" : "à¦¸à¦•à§à¦°à¦¿à§Ÿ"}
                      </td>

                      <td>

                        <button
                          class="btn btn-soft"
                          data-edit-class="${c.id}">
                          à¦¸à¦®à§à¦ªà¦¾à¦¦à¦¨à¦¾
                        </button>

                        <button
                          class="btn btn-soft"
                          data-delete-class="${c.id}">
                          à¦®à§à¦›à§à¦¨
                        </button>

                      </td>

                    </tr>

                  `;

                }).join("")}

              </tbody>

            </table>

          </div>

        ` : `

          <p class="muted">à¦à¦–à¦¨à§‹ à¦•à§‹à¦¨à§‹ à¦•à§à¦²à¦¾à¦¸ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à¦¾ à¦¹à§Ÿà¦¨à¦¿à¥¤</p>

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
            toast("à¦•à§à¦²à¦¾à¦¸ à¦†à¦ªà¦¡à§‡à¦Ÿ à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");
          } else {
            await createRecord("classes", data);
            toast("à¦¨à¦¤à§à¦¨ à¦•à§à¦²à¦¾à¦¸ à¦¤à§ˆà¦°à¦¿ à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");
          }

          await renderClasses();

        } catch (error) {
          console.error(error);
          toast("à¦•à§à¦²à¦¾à¦¸ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤", "error");
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
              "à¦à¦‡ à¦•à§à¦²à¦¾à¦¸à§‡à¦° à¦¸à¦™à§à¦—à§‡ à¦¬à¦¿à¦·à§Ÿ à¦¯à§à¦•à§à¦¤ à¦†à¦›à§‡à¥¤ à¦†à¦—à§‡ à¦¬à¦¿à¦·à§Ÿà¦—à§à¦²à§‹ à¦¥à§‡à¦•à§‡ à¦•à§à¦²à¦¾à¦¸à¦Ÿà¦¿ à¦¸à¦°à¦¾à¦¨à¥¤",
              "error"
            );
            return;
          }

          if (!confirm("à¦à¦‡ à¦•à§à¦²à¦¾à¦¸à¦Ÿà¦¿ à¦®à§à¦›à§‡ à¦«à§‡à¦²à¦¬à§‡à¦¨?")) return;

          try {
            await deleteRecord("classes", id);
            toast("à¦•à§à¦²à¦¾à¦¸ à¦®à§à¦›à§‡ à¦«à§‡à¦²à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");
            await renderClasses();
          } catch (error) {
            console.error(error);
            toast("à¦•à§à¦²à¦¾à¦¸ à¦®à§à¦›à§‡ à¦«à§‡à¦²à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤", "error");
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
          à¦¬à¦¿à¦·à§Ÿ à¦¤à§ˆà¦°à¦¿ à¦“ à¦ªà¦°à¦¿à¦šà¦¾à¦²à¦¨à¦¾
        </h2>


        <form id="subject-form" class="form-stack">

          <input type="hidden" name="editId">


          <label class="field">
            <span>à¦¬à¦¿à¦·à§Ÿà§‡à¦° à¦¨à¦¾à¦®</span>

            <input name="name"
              required
              placeholder="à¦¯à§‡à¦®à¦¨: Mathematics">
          </label>


          <label class="field">
            <span>à¦¬à¦¿à¦·à§Ÿ à¦•à§‹à¦¡</span>

            <input name="code"
              placeholder="à¦¯à§‡à¦®à¦¨: MAT">
          </label>


          <div class="field">

            <span>à¦¯à§‡à¦¸à¦¬ à¦•à§à¦²à¦¾à¦¸à§‡ à¦¬à¦¿à¦·à§Ÿà¦Ÿà¦¿ à¦ªà§œà¦¾à¦¨à§‹ à¦¹à¦¬à§‡</span>

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
                  à¦†à¦—à§‡ Class Management à¦¥à§‡à¦•à§‡ à¦•à§à¦²à¦¾à¦¸ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à§à¦¨à¥¤
                </p>

              `}

            </div>

          </div>


          <label class="field">
            <span>à¦…à¦¬à¦¸à§à¦¥à¦¾</span>

            <select name="active">
              <option value="true">à¦¸à¦•à§à¦°à¦¿à§Ÿ</option>
              <option value="false">à¦¨à¦¿à¦·à§à¦•à§à¦°à¦¿à§Ÿ</option>
            </select>

          </label>


          <div style="display:flex;gap:10px;flex-wrap:wrap">

            <button type="submit" class="btn btn-primary">
              ðŸ’¾ à¦¬à¦¿à¦·à§Ÿ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à§à¦¨
            </button>

            <button type="reset" class="btn btn-soft">
              à¦¨à¦¤à§à¦¨ à¦•à¦°à§‡ à¦²à¦¿à¦–à§à¦¨
            </button>

          </div>

        </form>


        <hr style="margin:25px 0">


        <h3>à¦¸à¦•à¦² à¦¬à¦¿à¦·à§Ÿ (${subjects.length})</h3>


        ${subjects.length ? `

          <div class="tablewrap">

            <table>

              <thead>
                <tr>
                  <th>à¦¬à¦¿à¦·à§Ÿ</th>
                  <th>à¦•à§‹à¦¡</th>
                  <th>à¦•à§à¦²à¦¾à¦¸</th>
                  <th>à¦…à¦¬à¦¸à§à¦¥à¦¾</th>
                  <th>à¦•à¦¾à¦°à§à¦¯à¦•à§à¦°à¦®</th>
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

                      <td>${escapeHTML(s.code || "â€”")}</td>

                      <td>
                        ${linkedClasses.length
                          ? linkedClasses.map(c =>
                              escapeHTML(c.name)
                            ).join(", ")
                          : "à¦•à§à¦²à¦¾à¦¸ à¦¨à¦¿à¦°à§à¦§à¦¾à¦°à¦¿à¦¤ à¦¨à§Ÿ"
                        }
                      </td>

                      <td>
                        ${s.active === false ? "à¦¨à¦¿à¦·à§à¦•à§à¦°à¦¿à§Ÿ" : "à¦¸à¦•à§à¦°à¦¿à§Ÿ"}
                      </td>

                      <td>

                        <button
                          class="btn btn-soft"
                          data-edit-subject="${s.id}">
                          à¦¸à¦®à§à¦ªà¦¾à¦¦à¦¨à¦¾
                        </button>

                        <button
                          class="btn btn-soft"
                          data-delete-subject="${s.id}">
                          à¦®à§à¦›à§à¦¨
                        </button>

                      </td>

                    </tr>

                  `;

                }).join("")}

              </tbody>

            </table>

          </div>

        ` : `

          <p class="muted">à¦à¦–à¦¨à§‹ à¦•à§‹à¦¨à§‹ à¦¬à¦¿à¦·à§Ÿ à¦¤à§ˆà¦°à¦¿ à¦•à¦°à¦¾ à¦¹à§Ÿà¦¨à¦¿à¥¤</p>

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
            toast("à¦¬à¦¿à¦·à§Ÿ à¦†à¦ªà¦¡à§‡à¦Ÿ à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");
          } else {
            await createRecord("subjects", data);
            toast("à¦¨à¦¤à§à¦¨ à¦¬à¦¿à¦·à§Ÿ à¦¤à§ˆà¦°à¦¿ à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");
          }

          await renderSubjects();

        } catch (error) {
          console.error(error);
          toast("à¦¬à¦¿à¦·à§Ÿ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤", "error");
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

          if (!confirm("à¦à¦‡ à¦¬à¦¿à¦·à§Ÿà¦Ÿà¦¿ à¦®à§à¦›à§‡ à¦«à§‡à¦²à¦¬à§‡à¦¨?")) return;

          try {
            await deleteRecord("subjects", id);
            toast("à¦¬à¦¿à¦·à§Ÿ à¦®à§à¦›à§‡ à¦«à§‡à¦²à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");
            await renderSubjects();
          } catch (error) {
            console.error(error);
            toast("à¦¬à¦¿à¦·à§Ÿ à¦®à§à¦›à§‡ à¦«à§‡à¦²à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤", "error");
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


      <h1>ðŸ“… à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿ à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾</h1>


      <section class="neu-card panel">

        <div class="form-stack">

          <label class="field">
            <span>à¦¤à¦¾à¦°à¦¿à¦– à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨</span>
            <input type="date" id="attendance-date" value="${today}">
          </label>


          <button class="btn btn-primary" id="load-attendance">
            à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€ à¦¤à¦¾à¦²à¦¿à¦•à¦¾ à¦¦à§‡à¦–à§à¦¨
          </button>

        </div>


        <div id="attendance-students"></div>


        <div class="attendance-report-section">

          <hr style="margin:25px 0">

          <h2 class="section-title">ðŸ“Š à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿à¦° à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ</h2>

          <label class="field">
            <span>à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿà§‡à¦° à¦¤à¦¾à¦°à¦¿à¦– à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨</span>
            <input type="date" id="report-date" value="${today}">
          </label>


          <button class="btn btn-primary" id="show-attendance-report">
            à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿ à¦¦à§‡à¦–à§à¦¨
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
        toast("à¦°à¦¿à¦ªà§‹à¦°à§à¦Ÿà§‡à¦° à¦¤à¦¾à¦°à¦¿à¦– à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨à¥¤", "error");
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

          ${stat("ðŸ‘¨â€ðŸŽ“", "à¦®à§‹à¦Ÿ à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€", students.length)}
          ${stat("âœ…", "à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤", presentStudents.length)}
          ${stat("âŒ", "à¦…à¦¨à§à¦ªà¦¸à§à¦¥à¦¿à¦¤", absentStudents.length)}
          ${stat("â³", "à¦¹à¦¿à¦¸à¦¾à¦¬ à¦¹à§Ÿà¦¨à¦¿", unmarked)}

        </div>


        <section class="neu-card panel" style="margin-top:20px">
          <h3>âœ… à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤ à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€à¦°à¦¾</h3>

          ${presentStudents.length
            ? makeList(presentStudents, "name", "")
            : `<p class="muted">à¦•à§‡à¦‰ à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤ à¦¨à§‡à¦‡à¥¤</p>`
          }
        </section>


        <section class="neu-card panel" style="margin-top:20px">
          <h3>âŒ à¦…à¦¨à§à¦ªà¦¸à§à¦¥à¦¿à¦¤ à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€à¦°à¦¾</h3>

          ${absentStudents.length
            ? makeList(absentStudents, "name", "")
            : `<p class="muted">à¦•à§‡à¦‰ à¦…à¦¨à§à¦ªà¦¸à§à¦¥à¦¿à¦¤ à¦¨à§‡à¦‡à¥¤</p>`
          }
        </section>

      `;

    };


    content.querySelector("#load-attendance").onclick = () => {

      const date = content.querySelector("#attendance-date").value;

      if (!date) {
        toast("à¦¤à¦¾à¦°à¦¿à¦– à¦¨à¦¿à¦°à§à¦¬à¦¾à¦šà¦¨ à¦•à¦°à§à¦¨à¥¤", "error");
        return;
      }

      if (!students.length) {
        list.innerHTML = `
          <p class="muted">à¦•à§‹à¦¨à§‹ à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤</p>
        `;
        return;
      }

      list.innerHTML = `

        <h2 class="section-title" style="margin-top:25px">
          ðŸ‘¨â€ðŸŽ“ à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€à¦¦à§‡à¦° à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿ (${students.length})
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
                  ${index + 1}. ${escapeHTML(s.name || "â€”")}
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
                      âœ“ à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤
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
                      âœ• à¦…à¦¨à§à¦ªà¦¸à§à¦¥à¦¿à¦¤
                    </label>

                  </div>

                </div>

              </div>

            `;

          }).join("")}

        </div>


        <button class="btn btn-primary attendance-save-btn" id="save-attendance">
          ðŸ’¾ à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à§à¦¨
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

          toast("à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");
          await showAttendance();

        } catch (error) {
          console.error(error);
          toast("à¦‰à¦ªà¦¸à§à¦¥à¦¿à¦¤à¦¿ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤", "error");
        }

      };

    };

  }


  // ACADEMY SETTINGS

  async function showAcademySettings() {

    const settings = await getAcademySettings();

    content.innerHTML = `

      <h1>âš™ï¸ Academy Settings</h1>


      <section class="neu-card panel">

        <h2 class="section-title">à§§. à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨ à¦ªà¦°à¦¿à¦šà¦¿à¦¤à¦¿</h2>


        <form id="academy-settings-form" class="form-stack">


          <label class="field">
            <span>à¦à¦•à¦¾à¦¡à§‡à¦®à¦¿à¦° à¦¨à¦¾à¦®</span>

            <input name="academyName"
              value="${escapeHTML(settings.academyName || "")}"
              required>
          </label>


          <label class="field">
            <span>à¦¸à§à¦²à§‹à¦—à¦¾à¦¨</span>

            <input name="tagline"
              value="${escapeHTML(settings.tagline || "")}">
          </label>


          <label class="field">
            <span>à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨à§‡à¦° à¦²à§‹à¦—à§‹ URL</span>

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
            <span>à¦®à§‹à¦¬à¦¾à¦‡à¦² à¦¨à¦®à§à¦¬à¦°</span>

            <input name="phone"
              value="${escapeHTML(settings.phone || "")}">
          </label>


          <label class="field">
            <span>à¦‡à¦®à§‡à¦‡à¦²</span>

            <input name="email"
              type="email"
              value="${escapeHTML(settings.email || "")}">
          </label>


          <label class="field">
            <span>à¦“à§Ÿà§‡à¦¬à¦¸à¦¾à¦‡à¦Ÿ</span>

            <input name="website"
              type="url"
              value="${escapeHTML(settings.website || "")}">
          </label>


          <label class="field">
            <span>à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨à§‡à¦° à¦ à¦¿à¦•à¦¾à¦¨à¦¾</span>

            <textarea name="address">${escapeHTML(settings.address || "")}</textarea>
          </label>


          <hr>


          <h2 class="section-title">à§¨. Branding à¦“ Design</h2>


          <label class="field">
            <span>à¦ªà§à¦°à¦§à¦¾à¦¨ à¦°à¦‚ (Primary Color)</span>

            <input type="color" name="primaryColor"
              value="${escapeHTML(settings.primaryColor || "#2563eb")}">
          </label>


          <label class="field">
            <span>à¦¸à¦¹à¦¾à§Ÿà¦• à¦°à¦‚ (Secondary Color)</span>

            <input type="color" name="secondaryColor"
              value="${escapeHTML(settings.secondaryColor || "#0f172a")}">
          </label>


          <label class="field">
            <span>à¦“à§Ÿà§‡à¦¬à¦¸à¦¾à¦‡à¦Ÿà§‡à¦° Theme</span>

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
            <span>à¦“à§Ÿà§‡à¦¬à¦¸à¦¾à¦‡à¦Ÿà§‡à¦° Font</span>

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
            ðŸ’¾ à¦¸à§‡à¦Ÿà¦¿à¦‚à¦¸ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à§à¦¨
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
      button.textContent = "à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦¹à¦šà§à¦›à§‡...";

      try {

        const data = Object.fromEntries(
          new FormData(form).entries()
        );

        await saveAcademySettings(data);

        toast("à¦ªà§à¦°à¦¤à¦¿à¦·à§à¦ à¦¾à¦¨à§‡à¦° à¦¤à¦¥à§à¦¯ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à¦¾ à¦¹à§Ÿà§‡à¦›à§‡à¥¤", "success");

        await showAcademySettings();

      } catch (error) {

        console.error(error);

        toast("à¦¸à§‡à¦Ÿà¦¿à¦‚à¦¸ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤", "error");

        button.disabled = false;
        button.textContent = "ðŸ’¾ à¦¸à§‡à¦Ÿà¦¿à¦‚à¦¸ à¦¸à¦‚à¦°à¦•à§à¦·à¦£ à¦•à¦°à§à¦¨";

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
            <span>${escapeHTML(item[key] || "â€”")}</span>
            <small>${formatDate(item.createdAt)}</small>
          </li>
        `).join("")}
      </ul>
    `;

  }


  function studentList(items) {
    if (!items.length) {
      return `<p class="muted empty-state">à¦•à§‹à¦¨à§‹ à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€ à¦ªà¦¾à¦“à§Ÿà¦¾ à¦¯à¦¾à§Ÿà¦¨à¦¿à¥¤</p>`;
    }
    return `
      <div class="tablewrap">
        <table>
          <thead>
            <tr><th>Student ID</th><th>à¦¨à¦¾à¦®</th><th>à¦®à§‹à¦¬à¦¾à¦‡à¦²</th><th>à¦•à§à¦²à¦¾à¦¸</th></tr>
          </thead>
          <tbody>
            ${items.map(student => `
              <tr>
                <td><strong>${escapeHTML(student.studentCode || "ID à¦¨à§‡à¦‡")}</strong></td>
                <td>${escapeHTML(student.name || "â€”")}</td>
                <td>${escapeHTML(student.phone || "â€”")}</td>
                <td>${escapeHTML(student.className || "â€”")}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  await openPage("dashboard");

}
