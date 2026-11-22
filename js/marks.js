import {
  listRecords,
  createRecord,
  updateRecord
} from "./store.js";

import { escapeHTML, toast } from "./utils.js";

const EXAM_COLLECTION = "examinations";
const STUDENT_COLLECTION = "students";
const RESULT_COLLECTION = "results";

const $ = (id) => document.getElementById(id);
const safe = (value) => escapeHTML(String(value ?? ""));

function calculateGrade(marks, fullMarks, passMark) {
  const percentage = (marks / fullMarks) * 100;

  if (marks < passMark) {
    return { grade: "F", gpa: 0, percentage };
  }

  if (percentage >= 80) return { grade: "A+", gpa: 5, percentage };
  if (percentage >= 70) return { grade: "A", gpa: 4, percentage };
  if (percentage >= 60) return { grade: "A-", gpa: 3.5, percentage };
  if (percentage >= 50) return { grade: "B", gpa: 3, percentage };
  if (percentage >= 40) return { grade: "C", gpa: 2, percentage };
  if (percentage >= 33) return { grade: "D", gpa: 1, percentage };

  return { grade: "F", gpa: 0, percentage };
}

export async function showMarksManagement(root) {
  root.innerHTML = `
    <section class="card">
      <h2>📝 নম্বর এন্ট্রি ও ফলাফল</h2>
      <p>পরীক্ষা নির্বাচন করে শিক্ষার্থীদের বিষয়ভিত্তিক নম্বর সংরক্ষণ করুন।</p>

      <div class="form-grid">
        <div class="field">
          <label>পরীক্ষা নির্বাচন</label>
          <select id="marksExam">
            <option value="">লোড হচ্ছে...</option>
          </select>
        </div>

        <div class="field">
          <label>বিষয় নির্বাচন</label>
          <select id="marksSubject">
            <option value="">প্রথমে পরীক্ষা নির্বাচন করুন</option>
          </select>
        </div>
      </div>

      <button type="button" id="loadMarksBtn">শিক্ষার্থী তালিকা দেখুন</button>
      <p id="marksMessage" class="muted"></p>
    </section>

    <section class="card">
      <h3>শিক্ষার্থীদের নম্বর</h3>
      <div id="marksTable">
        <p class="muted">পরীক্ষা ও বিষয় নির্বাচন করুন।</p>
      </div>
    </section>
  `;

  const examSelect = $("marksExam");
  const subjectSelect = $("marksSubject");
  const table = $("marksTable");
  const message = $("marksMessage");

  let exams = [];
  let students = [];
  let results = [];

  try {
    [exams, students, results] = await Promise.all([
      listRecords(EXAM_COLLECTION),
      listRecords(STUDENT_COLLECTION),
      listRecords(RESULT_COLLECTION)
    ]);

    examSelect.innerHTML =
      `<option value="">পরীক্ষা নির্বাচন করুন</option>` +
      exams.map(exam => `
        <option value="${safe(exam.id)}">
          ${safe(exam.title || exam.name)}
        </option>
      `).join("");

  } catch (error) {
    examSelect.innerHTML = `<option value="">তথ্য লোড হয়নি</option>`;
    message.textContent = "তথ্য লোড করতে সমস্যা হয়েছে: " + error.message;
    return;
  }

  examSelect.addEventListener("change", () => {
    const exam = exams.find(x => x.id === examSelect.value);

    if (!exam) {
      subjectSelect.innerHTML =
        `<option value="">বিষয় নির্বাচন করুন</option>`;
      return;
    }

    subjectSelect.innerHTML =
      `<option value="">বিষয় নির্বাচন করুন</option>`;

    const subjects = exam.subjects || [];

    subjects.forEach(subject => {
      const name = typeof subject === "string"
        ? subject
        : subject.name;

      if (name) {
        subjectSelect.add(new Option(name, name));
      }
    });

    if (!subjects.length && exam.subjectName) {
      subjectSelect.add(
        new Option(exam.subjectName, exam.subjectName)
      );
    }
  });

  $("loadMarksBtn").addEventListener("click", () => {
    const exam = exams.find(x => x.id === examSelect.value);
    const subject = subjectSelect.value;

    if (!exam || !subject) {
      toast("পরীক্ষা ও বিষয় নির্বাচন করুন।");
      return;
    }

    const className = exam.className || "";
    const classId = exam.classId || "";

    const classStudents = students.filter(student => {
      if (classId && student.classId) {
        return student.classId === classId;
      }

      if (className && student.className) {
        return student.className === className;
      }

      return false;
    });

    if (!classStudents.length) {
      table.innerHTML =
        `<p class="muted">এই পরীক্ষার শ্রেণিতে কোনো শিক্ষার্থী পাওয়া যায়নি।</p>`;
      return;
    }

    const fullMarks = Number(exam.fullMark || 100);
    const passMark = Number(exam.passMark || 33);

    table.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ক্রম</th>
              <th>শিক্ষার্থীর নাম</th>
              <th>Student ID</th>
              <th>প্রাপ্ত নম্বর</th>
              <th>গ্রেড</th>
              <th>GPA</th>
              <th>অবস্থা</th>
            </tr>
          </thead>

          <tbody>
            ${classStudents.map((student, index) => {
              const old = results.find(r =>
                r.examId === exam.id &&
                r.studentId === student.id &&
                r.subject === subject
              );

              const obtained = old ? old.obtainedMarks : "";

              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${safe(student.name)}</td>
                  <td>${safe(student.studentCode || student.id)}</td>

                  <td>
                    <input
                      type="number"
                      class="marks-input"
                      data-student="${safe(student.id)}"
                      min="0"
                      max="${fullMarks}"
                      step="0.01"
                      value="${obtained}"
                      placeholder="0"
                      style="width:90px"
                    >
                  </td>

                  <td class="grade-cell">
                    ${old ? safe(old.grade) : "-"}
                  </td>

                  <td class="gpa-cell">
                    ${old ? safe(old.gpa) : "-"}
                  </td>

                  <td class="status-cell">
                    ${old ? safe(old.status || "সংরক্ষিত") : "অসংরক্ষিত"}
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      <button type="button" id="saveAllMarks" style="margin-top:15px">
        💾 সব নম্বর সংরক্ষণ করুন
      </button>
    `;

    $("saveAllMarks").addEventListener("click", async () => {
      const inputs = [...table.querySelectorAll(".marks-input")];

      const entries = inputs.map(input => {
        const value = input.value.trim();

        if (value === "") return null;

        const marks = Number(value);

        if (!Number.isFinite(marks) || marks < 0 || marks > fullMarks) {
          throw new Error("প্রাপ্ত নম্বর পূর্ণ নম্বরের মধ্যে হতে হবে।");
        }

        const student = classStudents.find(
          s => s.id === input.dataset.student
        );

        const gradeData = calculateGrade(
          marks,
          fullMarks,
          passMark
        );

        return {
          student,
          marks,
          gradeData
        };
      });

      try {
        const validEntries = entries.filter(Boolean);

        if (!validEntries.length) {
          toast("অন্তত একজন শিক্ষার্থীর নম্বর লিখুন।");
          return;
        }

        const button = $("saveAllMarks");
        button.disabled = true;
        button.textContent = "সংরক্ষণ হচ্ছে...";

        for (const entry of validEntries) {
          const { student, marks, gradeData } = entry;

          const existing = results.find(r =>
            r.examId === exam.id &&
            r.studentId === student.id &&
            r.subject === subject
          );

          const data = {
            examId: exam.id,
            examName: exam.title || exam.name || "",
            studentId: student.id,
            studentName: student.name || "",
            studentCode: student.studentCode || "",
            className: student.className || "",
            subject,
            fullMarks,
            passMark,
            obtainedMarks: marks,
            percentage: Number(gradeData.percentage.toFixed(2)),
            grade: gradeData.grade,
            gpa: gradeData.gpa,
            status: gradeData.grade === "F" ? "Fail" : "Pass",
            updatedAt: new Date().toISOString()
          };

          if (existing) {
            await updateRecord(RESULT_COLLECTION, existing.id, data);
          } else {
            const created = await createRecord(RESULT_COLLECTION, data);
            results.push({
              ...data,
              id: created?.id
            });
          }

          const row = inputs.find(
            input => input.dataset.student === student.id
          )?.closest("tr");

          if (row) {
            row.querySelector(".grade-cell").textContent = gradeData.grade;
            row.querySelector(".gpa-cell").textContent = gradeData.gpa;
            row.querySelector(".status-cell").textContent = "সংরক্ষিত";
          }
        }

        // Update local results after editing existing entries.
        results = await listRecords(RESULT_COLLECTION);

        toast("নম্বর সফলভাবে সংরক্ষণ হয়েছে।");

        button.disabled = false;
        button.textContent = "💾 সব নম্বর সংরক্ষণ করুন";

      } catch (error) {
        toast(error.message || "নম্বর সংরক্ষণ করা যায়নি।");

        const button = $("saveAllMarks");
        if (button) {
          button.disabled = false;
          button.textContent = "💾 সব নম্বর সংরক্ষণ করুন";
        }
      }
    });
  });
}
