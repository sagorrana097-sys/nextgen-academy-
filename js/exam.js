import {
  listRecords,
  createRecord,
  updateRecord,
  deleteRecord
} from "./store.js";

import { escapeHTML, formatDate, toast } from "./utils.js";

const EXAMS = "examinations";
const STUDENTS = "students";
const CLASSES = "classes";
const SUBJECTS = "subjects";
const RESULTS = "results";

let exams = [];
let students = [];
let classes = [];
let subjects = [];
let results = [];

let rootElement;

const safe = value => escapeHTML(String(value ?? ""));

function getClassName(exam) {
  const cls = classes.find(c => c.id === exam.classId);
  return cls?.name || exam.className || "";
}

function getSubjectName(exam) {
  const subject = subjects.find(s => s.id === exam.subjectId);
  return subject?.name || exam.subjectName || "বিষয়";
}

function getExamStudents(exam) {
  const className = getClassName(exam);

  return students.filter(student => {
    if (exam.classId && student.classId) {
      return student.classId === exam.classId;
    }

    return Boolean(
      className &&
      student.className &&
      student.className === className
    );
  });
}

function calculateGrade(mark, fullMark, passMark) {
  const percentage = (mark / fullMark) * 100;

  if (mark < passMark) return { grade: "F", gpa: 0 };
  if (percentage >= 80) return { grade: "A+", gpa: 5 };
  if (percentage >= 70) return { grade: "A", gpa: 4 };
  if (percentage >= 60) return { grade: "A-", gpa: 3.5 };
  if (percentage >= 50) return { grade: "B", gpa: 3 };
  if (percentage >= 40) return { grade: "C", gpa: 2 };
  if (percentage >= 33) return { grade: "D", gpa: 1 };

  return { grade: "F", gpa: 0 };
}

async function loadData() {
  [exams, students, classes, subjects, results] = await Promise.all([
    listRecords(EXAMS),
    listRecords(STUDENTS),
    listRecords(CLASSES),
    listRecords(SUBJECTS),
    listRecords(RESULTS)
  ]);
}

export async function showMarksManagement(root) {
  rootElement = root;

  root.innerHTML = `
    <section class="card">
      <h2>📝 নম্বর এন্ট্রি ও ফলাফল</h2>
      <p class="muted">
        পরীক্ষা নির্বাচন করে শিক্ষার্থীদের প্রাপ্ত নম্বর লিখে ফলাফল সংরক্ষণ করুন।
      </p>

      <div class="form-group">
        <label>পরীক্ষা নির্বাচন করুন</label>
        <select id="marksExam">
          <option value="">পরীক্ষা নির্বাচন করুন</option>
          ${exams.map(exam => `
            <option value="${safe(exam.id)}">
              ${safe(exam.title)}
            </option>
          `).join("")}
        </select>
      </div>

      <div id="marksDetails"></div>
    </section>

    <section class="card">
      <h3>📊 সংরক্ষিত ফলাফল</h3>
      <div id="savedResults"></div>
    </section>
  `;

  try {
    await loadData();
    renderMarksPage();
  } catch (error) {
    console.error(error);
    root.innerHTML += `
      <p class="error">
        তথ্য লোড করা যায়নি: ${safe(error.message)}
      </p>
    `;
  }
}

function renderMarksPage() {
  const examSelect = rootElement.querySelector("#marksExam");

  examSelect.innerHTML = `
    <option value="">পরীক্ষা নির্বাচন করুন</option>
    ${exams.map(exam => `
      <option value="${safe(exam.id)}">${safe(exam.title)}</option>
    `).join("")}
  `;

  examSelect.addEventListener("change", () => {
    renderSelectedExam(examSelect.value);
  });

  renderSavedResults();
}

function renderSelectedExam(examId) {
  const box = rootElement.querySelector("#marksDetails");

  if (!examId) {
    box.innerHTML = "";
    return;
  }

  const exam = exams.find(item => item.id === examId);

  if (!exam) {
    box.innerHTML = `<p>পরীক্ষার তথ্য পাওয়া যায়নি।</p>`;
    return;
  }

  const examStudents = getExamStudents(exam);
  const fullMark = Number(exam.fullMark || 100);
  const passMark = Number(exam.passMark || 33);

  box.innerHTML = `
    <hr>
    <h3>${safe(exam.title)}</h3>
    <p>
      শ্রেণি: ${safe(getClassName(exam))}<br>
      বিষয়: ${safe(getSubjectName(exam))}<br>
      পূর্ণমান: ${fullMark} |
      পাস নম্বর: ${passMark}
    </p>

    ${
      examStudents.length
        ? `
          <form id="marksForm">
            <div class="table-wrap" style="overflow-x:auto">
              <table>
                <thead>
                  <tr>
                    <th>শিক্ষার্থী</th>
                    <th>Student ID</th>
                    <th>প্রাপ্ত নম্বর</th>
                    <th>গ্রেড</th>
                  </tr>
                </thead>
                <tbody>
                  ${examStudents.map(student => {
                    const existing = results.find(r =>
                      r.examId === exam.id &&
                      r.studentId === student.id
                    );

                    const mark = existing?.obtainedMarks ?? "";

                    return `
                      <tr>
                        <td>${safe(student.name)}</td>
                        <td>${safe(student.studentCode || student.id)}</td>
                        <td>
                          <input
                            type="number"
                            class="student-mark"
                            data-student-id="${safe(student.id)}"
                            value="${safe(mark)}"
                            min="0"
                            max="${fullMark}"
                            step="0.01"
                            required
                            style="width:100px"
                          >
                        </td>
                        <td class="grade-preview">
                          ${existing ? safe(existing.grade) : "—"}
                        </td>
                      </tr>
                    `;
                  }).join("")}
                </tbody>
              </table>
            </div>

            <button type="submit">💾 নম্বর সংরক্ষণ করুন</button>
          </form>
        `
        : `
          <p class="muted">
            এই পরীক্ষার শ্রেণিতে কোনো শিক্ষার্থী পাওয়া যায়নি।
            শিক্ষার্থীর classId/className পরীক্ষা করে দেখুন।
          </p>
        `
    }
  `;

  const form = box.querySelector("#marksForm");

  if (form) {
    form.addEventListener("submit", event => {
      saveMarks(event, exam, examStudents);
    });
  }
}

async function saveMarks(event, exam, examStudents) {
  event.preventDefault();

  const fullMark = Number(exam.fullMark || 100);
  const passMark = Number(exam.passMark || 33);

  const inputs = [
    ...rootElement.querySelectorAll(".student-mark")
  ];

  try {
    for (const input of inputs) {
      const studentId = input.dataset.studentId;
      const student = examStudents.find(s => s.id === studentId);
      const mark = Number(input.value);

      if (!Number.isFinite(mark) || mark < 0 || mark > fullMark) {
        toast(`নম্বর ০ থেকে ${fullMark}-এর মধ্যে হতে হবে।`);
        input.focus();
        return;
      }

      const gradeInfo = calculateGrade(mark, fullMark, passMark);
      const percentage = (mark / fullMark) * 100;

      const data = {
        examId: exam.id,
        examName: exam.title,
        studentId,
        studentName: student?.name || "",
        studentCode: student?.studentCode || "",
        className: getClassName(exam),
        subjectId: exam.subjectId || "",
        subject: getSubjectName(exam),
        fullMarks: fullMark,
        passMark,
        obtainedMarks: mark,
        percentage: Number(percentage.toFixed(2)),
        grade: gradeInfo.grade,
        gpa: gradeInfo.gpa
      };

      const existing = results.find(r =>
        r.examId === exam.id &&
        r.studentId === studentId
      );

      if (existing) {
        await updateRecord(RESULTS, existing.id, data);
      } else {
        await createRecord(RESULTS, data);
      }
    }

    await loadData();
    renderSavedResults();
    renderSelectedExam(exam.id);

    toast("ফলাফল সফলভাবে সংরক্ষণ হয়েছে।");
  } catch (error) {
    console.error(error);
    toast("ফলাফল সংরক্ষণ করা যায়নি: " + error.message);
  }
}

function renderSavedResults() {
  const box = rootElement.querySelector("#savedResults");

  if (!results.length) {
    box.innerHTML = `<p class="muted">এখনো কোনো ফলাফল সংরক্ষণ করা হয়নি।</p>`;
    return;
  }

  box.innerHTML = `
    <div class="table-wrap" style="overflow-x:auto">
      <table>
        <thead>
          <tr>
            <th>পরীক্ষা</th>
            <th>শিক্ষার্থী</th>
            <th>বিষয়</th>
            <th>নম্বর</th>
            <th>গ্রেড</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(result => `
            <tr>
              <td>${safe(result.examName)}</td>
              <td>${safe(result.studentName)}</td>
              <td>${safe(result.subject)}</td>
              <td>${safe(result.obtainedMarks)} / ${safe(result.fullMarks)}</td>
              <td><strong>${safe(result.grade)}</strong></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}
