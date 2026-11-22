import {
listRecords,
createRecord,
updateRecord,
deleteRecord
} from "./store.js";

import {
escapeHTML,
formatDate,
toast
} from "./utils.js";

const EXAM_COLLECTION = "examinations";

export async function showExamManagement(root) {
root.innerHTML = `
<div class="page-heading">
<div>
<h1>পরীক্ষা ব্যবস্থাপনা</h1>
<p class="muted">পরীক্ষা তৈরি ও পরিচালনা করুন।</p>
</div>
</div>

<section class="neu-card panel">
  <h2 class="section-title" id="exam-form-title">নতুন পরীক্ষা তৈরি</h2>

  <form id="exam-form" class="form-grid">
    <input type="hidden" name="examId">

    <label class="field">
      <span>পরীক্ষার নাম *</span>
      <input name="title" required placeholder="যেমন: অর্ধবার্ষিক পরীক্ষা">
    </label>

    <label class="field">
      <span>পরীক্ষার ধরন *</span>
      <select name="examType" required>
        <option value="">নির্বাচন করুন</option>
        <option value="সাময়িক">সাময়িক</option>
        <option value="অর্ধবার্ষিক">অর্ধবার্ষিক</option>
        <option value="বার্ষিক">বার্ষিক</option>
        <option value="মডেল টেস্ট">মডেল টেস্ট</option>
        <option value="নির্বাচনী">নির্বাচনী</option>
        <option value="অন্যান্য">অন্যান্য</option>
      </select>
    </label>

    <label class="field">
      <span>Class *</span>
      <select name="classId" id="exam-class" required>
        <option value="">Class নির্বাচন করুন</option>
      </select>
    </label>

    <label class="field">
      <span>Subject *</span>
      <select name="subjectId" id="exam-subject" required>
        <option value="">Subject নির্বাচন করুন</option>
      </select>
    </label>

    <label class="field">
      <span>পূর্ণমান *</span>
      <input type="number" name="fullMark" min="1" required>
    </label>

    <label class="field">
      <span>পাস নম্বর *</span>
      <input type="number" name="passMark" min="0" required>
    </label>

    <label class="field">
      <span>পরীক্ষার তারিখ *</span>
      <input type="date" name="examDate" required>
    </label>

    <label class="field">
      <span>শিক্ষাবর্ষ</span>
      <input type="number" name="academicYear" min="2000" max="2100"
             value="${new Date().getFullYear()}">
    </label>

    <label class="field">
      <span>অবস্থা</span>
      <select name="status">
        <option value="active">চলমান</option>
        <option value="completed">সম্পন্ন</option>
      </select>
    </label>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary" id="exam-save-btn">
        পরীক্ষা সংরক্ষণ করুন
      </button>
      <button type="button" class="btn btn-soft" id="exam-cancel-btn"
              hidden>
        বাতিল
      </button>
    </div>
  </form>
</section>

<section class="neu-card panel">
  <h2 class="section-title">পরীক্ষার তালিকা</h2>
  <div id="exam-list">
    <p class="muted">তথ্য লোড হচ্ছে...</p>
  </div>
</section>

`;

const form = root.querySelector("#exam-form");
const classSelect = root.querySelector("#exam-class");
const subjectSelect = root.querySelector("#exam-subject");
const examList = root.querySelector("#exam-list");
const saveButton = root.querySelector("#exam-save-btn");
const cancelButton = root.querySelector("#exam-cancel-btn");

let classes = [];
let subjects = [];
let exams = [];

try {
[classes, subjects] = await Promise.all([
listRecords("classes"),
listRecords("subjects")
]);

classSelect.innerHTML =
  `<option value="">Class নির্বাচন করুন</option>` +
  classes.map(item => `
    <option value="${escapeHTML(item.id)}">
      ${escapeHTML(item.name || item.title || "Unnamed Class")}
    </option>
  `).join("");

renderSubjects();
await loadExams();

} catch (error) {
console.error(error);
toast("পরীক্ষার তথ্য লোড করা যায়নি।", "error");
examList.innerHTML =
"<p class="muted">তথ্য লোড করা যায়নি।</p>";
}

classSelect.addEventListener("change", renderSubjects);

function renderSubjects() {
const classId = classSelect.value;

const filtered = subjects.filter(subject => {
  if (!classId) return true;

  const ids = Array.isArray(subject.classIds)
    ? subject.classIds
    : [];

  return ids.length === 0 || ids.includes(classId);
});

subjectSelect.innerHTML =
  `<option value="">Subject নির্বাচন করুন</option>` +
  filtered.map(subject => `
    <option value="${escapeHTML(subject.id)}">
      ${escapeHTML(subject.name || subject.title || "Unnamed Subject")}
    </option>
  `).join("");

}

async function loadExams() {
exams = await listRecords(EXAM_COLLECTION);
renderExamList();
}

function renderExamList() {
if (!exams.length) {
examList.innerHTML =
"<p class="muted empty-state">এখনো কোনো পরীক্ষা তৈরি করা হয়নি।</p>";
return;
}

examList.innerHTML = `
  <div class="table-responsive">
    <table class="data-table">
      <thead>
        <tr>
          <th>পরীক্ষার নাম</th>
          <th>Class</th>
          <th>Subject</th>
          <th>পূর্ণমান</th>
          <th>পাস নম্বর</th>
          <th>তারিখ</th>
          <th>অবস্থা</th>
          <th>কার্যক্রম</th>
        </tr>
      </thead>

      <tbody>
        ${exams.map(exam => {
          const cls = classes.find(x => x.id === exam.classId);
          const subject = subjects.find(x => x.id === exam.subjectId);

          return `
            <tr>
              <td>${escapeHTML(exam.title || "—")}</td>
              <td>${escapeHTML(cls?.name || cls?.title || "—")}</td>
              <td>${escapeHTML(subject?.name || subject?.title || "—")}</td>
              <td>${Number(exam.fullMark || 0)}</td>
              <td>${Number(exam.passMark || 0)}</td>
              <td>${escapeHTML(exam.examDate || "—")}</td>
              <td>${exam.status === "completed" ? "সম্পন্ন" : "চলমান"}</td>
              <td>
                <button class="btn btn-soft btn-sm"
                  data-edit="${escapeHTML(exam.id)}">
                  Edit
                </button>
                <button class="btn btn-danger btn-sm"
                  data-delete="${escapeHTML(exam.id)}">
                  Delete
                </button>
              </td>
            </tr>
          `;
        }).join("")}
      </tbody>
    </table>
  </div>
`;

}

form.addEventListener("submit", async event => {
event.preventDefault();

const data = Object.fromEntries(new FormData(form).entries());

const fullMark = Number(data.fullMark);
const passMark = Number(data.passMark);

if (fullMark <= 0 || passMark < 0 || passMark > fullMark) {
  toast("পূর্ণমান ও পাস নম্বর সঠিকভাবে দিন।", "error");
  return;
}

const selectedClass = classes.find(x => x.id === data.classId);
const selectedSubject = subjects.find(x => x.id === data.subjectId);

if (!selectedClass || !selectedSubject) {
  toast("Class ও Subject নির্বাচন করুন।", "error");
  return;
}

const examId = data.examId;
delete data.examId;

const payload = {
  ...data,
  fullMark,
  passMark,
  academicYear: Number(data.academicYear),
  className: selectedClass.name || selectedClass.title || "",
  subjectName: selectedSubject.name || selectedSubject.title || ""
};

saveButton.disabled = true;

try {
  if (examId) {
    await updateRecord(EXAM_COLLECTION, examId, payload);
    toast("পরীক্ষার তথ্য আপডেট হয়েছে।", "success");
  } else {
    await createRecord(EXAM_COLLECTION, payload);
    toast("নতুন পরীক্ষা তৈরি হয়েছে।", "success");
  }

  resetForm();
  await loadExams();

} catch (error) {
  console.error(error);
  toast("পরীক্ষার তথ্য সংরক্ষণ করা যায়নি।", "error");
} finally {
  saveButton.disabled = false;
}

});

examList.addEventListener("click", async event => {
const editButton = event.target.closest("[data-edit]");
const deleteButton = event.target.closest("[data-delete]");

if (editButton) {
  const exam = exams.find(x => x.id === editButton.dataset.edit);
  if (!exam) return;

  form.elements.examId.value = exam.id;
  form.elements.title.value = exam.title || "";
  form.elements.examType.value = exam.examType || "";
  classSelect.value = exam.classId || "";

  renderSubjects();
  subjectSelect.value = exam.subjectId || "";

  form.elements.fullMark.value = exam.fullMark ?? "";
  form.elements.passMark.value = exam.passMark ?? "";
  form.elements.examDate.value = exam.examDate || "";
  form.elements.academicYear.value = exam.academicYear || "";
  form.elements.status.value = exam.status || "active";

  root.querySelector("#exam-form-title").textContent =
    "পরীক্ষার তথ্য সম্পাদনা";

  saveButton.textContent = "পরিবর্তন সংরক্ষণ করুন";
  cancelButton.hidden = false;

  form.scrollIntoView({ behavior: "smooth" });
}

if (deleteButton) {
  const id = deleteButton.dataset.delete;

  if (!confirm("আপনি কি এই পরীক্ষাটি মুছে ফেলতে চান?")) {
    return;
  }

  try {
    await deleteRecord(EXAM_COLLECTION, id);
    toast("পরীক্ষা মুছে ফেলা হয়েছে।", "success");
    await loadExams();
  } catch (error) {
    console.error(error);
    toast("পরীক্ষা মুছে ফেলা যায়নি।", "error");
  }
}

});

cancelButton.addEventListener("click", resetForm);

function resetForm() {
form.reset();
form.elements.examId.value = "";
form.elements.academicYear.value = new Date().getFullYear();

root.querySelector("#exam-form-title").textContent =
  "নতুন পরীক্ষা তৈরি";

saveButton.textContent = "পরীক্ষা সংরক্ষণ করুন";
cancelButton.hidden = true;

renderSubjects();

}
}
