import {
  getAcademySettings,
  saveAcademySettings
} from "./store.js";

import { escapeHTML, toast } from "./utils.js";


// Boolean Settings
const BOOLEAN_FIELDS = [
  "admissionOpen",
  "attendanceEnabled",
  "gradingEnabled",
  "noticeEnabled",
  "onlineClassEnabled",
  "classRecordingEnabled",
  "showAcademyLogo",
  "showStudentPhoto",
  "showStudentRoll",
  "showGrade",
  "showGPA",
  "showMeritPosition",
  "routineEnabled",
  "certificateEnabled",
  "idCardEnabled",
  "homeworkEnabled",
  "homeworkSubmissionEnabled",
  "homeworkLateSubmission",
  "studyMaterialsEnabled",
  "allowPDF",
  "allowVideo",
  "smsEnabled",
  "emailEnabled",
  "libraryEnabled",
  "holidayCalendarEnabled",
  "parentPortalEnabled",
  "guardianRequired",
  "transportEnabled",
  "employeeManagementEnabled",
  "payrollEnabled",
  "incomeExpenseEnabled",
  "scholarshipEnabled",
  "disciplineEnabled",
  "complaintEnabled",
  "activityLogEnabled",
  "dataExportEnabled",
  "twoFactorEnabled",
  "dashboardCustomizationEnabled"
];


// Number Settings
const NUMBER_FIELDS = [
  "admissionFee",
  "lateTime",
  "passMark",
  "fullMark",
  "monthlyFee",
  "noticeExpiryDays",
  "periodDuration",
  "libraryBorrowDays",
  "maxBooksPerStudent",
  "transportMonthlyFee",
  "salaryPaymentDate",
  "defaultScholarshipPercent"
];


// List Settings
const ARRAY_FIELDS = [
  "classes",
  "divisions",
  "subjects",
  "terms",
  "examTypes",
  "requiredDocuments",
  "paymentMethods",
  "exportFormats"
];


// All Settings Groups
const SETTINGS_GROUPS = [

  {
    id: "academic",
    title: "🎓 শিক্ষা কার্যক্রম",
    fields: [
      ["academicYear", "বর্তমান শিক্ষাবর্ষ", "২০২৬–২০২৭"],
      ["classes", "শ্রেণির তালিকা", "ষষ্ঠ, সপ্তম, অষ্টম, নবম, দশম"],
      ["divisions", "বিভাগ/গ্রুপ", "বিজ্ঞান, মানবিক, ব্যবসায় শিক্ষা"],
      ["subjects", "বিষয়ের তালিকা", "বাংলা, ইংরেজি, গণিত"],
      ["terms", "শিক্ষাকাল/টার্ম", "প্রথম, দ্বিতীয়"],
      ["examTypes", "পরীক্ষার ধরন", "মাসিক, অর্ধবার্ষিক, বার্ষিক"]
    ]
  },

  {
    id: "admission",
    title: "📝 ভর্তি সেটিংস",
    fields: [
      ["admissionOpen", "ভর্তি চালু", "true"],
      ["admissionFee", "ভর্তি ফি", "0"],
      ["requiredDocuments", "প্রয়োজনীয় কাগজপত্র", "জন্মনিবন্ধন, ছবি"]
    ]
  },

  {
    id: "attendance",
    title: "📅 উপস্থিতি সেটিংস",
    fields: [
      ["attendanceEnabled", "উপস্থিতি চালু", "true"],
      ["lateTime", "দেরিতে উপস্থিতির সময় (মিনিট)", "15"]
    ]
  },

  {
    id: "exam",
    title: "📊 পরীক্ষা ও ফলাফল",
    fields: [
      ["passMark", "পাস নম্বর (%)", "33"],
      ["fullMark", "পূর্ণমান", "100"],
      ["gradingEnabled", "গ্রেডিং চালু", "true"]
    ]
  },

  {
    id: "fees",
    title: "💰 ফি ও পেমেন্ট",
    fields: [
      ["monthlyFee", "মাসিক বেতন", "0"],
      ["currency", "মুদ্রা", "BDT"],
      ["paymentMethods", "পেমেন্ট মাধ্যম", "Cash, bKash, Nagad"]
    ]
  },

  {
    id: "notifications",
    title: "📢 বিজ্ঞপ্তি সেটিংস",
    fields: [
      ["noticeEnabled", "নোটিশ চালু", "true"],
      ["noticeExpiryDays", "নোটিশের মেয়াদ (দিন)", "30"]
    ]
  },

  {
    id: "website",
    title: "🌐 ওয়েবসাইট সেটিংস",
    fields: [
      ["siteTitle", "ওয়েবসাইটের শিরোনাম", "NextGen Academy"],
      ["contactPhone", "যোগাযোগের ফোন", ""],
      ["contactEmail", "যোগাযোগের ইমেইল", ""],
      ["footerText", "Footer Text", ""]
    ]
  },

  {
    id: "onlineClass",
    title: "🎥 Online Class Settings",
    fields: [
      ["onlineClassEnabled", "অনলাইন ক্লাস চালু", "true"],
      ["onlinePlatform", "ক্লাস প্ল্যাটফর্ম", "Google Meet"],
      ["defaultMeetingLink", "ডিফল্ট ক্লাস লিংক", ""],
      ["classRecordingEnabled", "ক্লাস রেকর্ডিং চালু", "false"],
      ["onlineClassNotice", "অনলাইন ক্লাস নির্দেশনা", ""]
    ]
  },

  {
    id: "resultSheet",
    title: "📄 Result Sheet & Marksheet Settings",
    fields: [
      ["resultSheetTitle", "রেজাল্ট শিটের শিরোনাম", "Academic Result Sheet"],
      ["showAcademyLogo", "লোগো দেখান", "true"],
      ["showStudentPhoto", "শিক্ষার্থীর ছবি দেখান", "true"],
      ["showStudentRoll", "রোল নম্বর দেখান", "true"],
      ["showGrade", "গ্রেড দেখান", "true"],
      ["showGPA", "GPA দেখান", "true"],
      ["showMeritPosition", "মেধাক্রম দেখান", "true"],
      ["resultFooter", "রেজাল্ট শিটের Footer", ""],
      ["principalSignature", "প্রধান শিক্ষকের স্বাক্ষরের নাম", ""]
    ]
  },

  {
    id: "routine",
    title: "🗓️ Routine Settings",
    fields: [
      ["routineEnabled", "রুটিন চালু", "true"],
      ["schoolStartTime", "ক্লাস শুরুর সময়", "09:00"],
      ["schoolEndTime", "ক্লাস শেষের সময়", "15:00"],
      ["periodDuration", "প্রতি ক্লাসের সময় (মিনিট)", "45"]
    ]
  },

  {
    id: "certificate",
    title: "🏅 Certificate Settings",
    fields: [
      ["certificateEnabled", "সনদ তৈরি চালু", "true"],
      ["certificateTitle", "সনদের শিরোনাম", "প্রশংসাপত্র"],
      ["certificateFooter", "সনদের নিচের লেখা", ""],
      ["certificateAuthority", "অনুমোদনকারীর পদবি", "প্রধান শিক্ষক"]
    ]
  },

  {
    id: "idCard",
    title: "🪪 ID Card Settings",
    fields: [
      ["idCardEnabled", "আইডি কার্ড চালু", "true"],
      ["idCardTitle", "আইডি কার্ডের শিরোনাম", "Student ID Card"],
      ["idCardValidity", "কার্ডের মেয়াদ", "১ বছর"]
    ]
  },

  {
    id: "homework",
    title: "📚 Homework Settings",
    fields: [
      ["homeworkEnabled", "হোমওয়ার্ক চালু", "true"],
      ["homeworkSubmissionEnabled", "অনলাইন জমা চালু", "true"],
      ["homeworkLateSubmission", "দেরিতে জমা অনুমোদন", "false"]
    ]
  },

  {
    id: "studyMaterials",
    title: "📖 Study Materials Settings",
    fields: [
      ["studyMaterialsEnabled", "শিক্ষাসামগ্রী চালু", "true"],
      ["allowPDF", "PDF আপলোড চালু", "true"],
      ["allowVideo", "ভিডিও লিংক চালু", "true"]
    ]
  },

  {
    id: "communication",
    title: "✉️ SMS & Email Settings",
    fields: [
      ["smsEnabled", "SMS বিজ্ঞপ্তি চালু", "false"],
      ["emailEnabled", "ইমেইল বিজ্ঞপ্তি চালু", "false"],
      ["notificationEmail", "বিজ্ঞপ্তির ইমেইল", ""]
    ]
  },

  {
    id: "general",
    title: "🌐 General Settings",
    fields: [
      ["language", "ভাষা", "বাংলা"],
      ["dateFormat", "তারিখের ফরম্যাট", "DD-MM-YYYY"],
      ["timezone", "টাইমজোন", "Asia/Dhaka"],
      ["academicSession", "শিক্ষাকাল", "২০২৬–২০২৭"]
    ]
  },

  {
    id: "library",
    title: "📚 Library Settings",
    fields: [
      ["libraryEnabled", "লাইব্রেরি চালু", "true"],
      ["libraryBorrowDays", "বই ধার নেওয়ার মেয়াদ (দিন)", "14"],
      ["maxBooksPerStudent", "একজন শিক্ষার্থীর সর্বোচ্চ বই", "3"],
      ["libraryRules", "লাইব্রেরির নিয়মাবলি", ""]
    ]
  },

  {
    id: "holiday",
    title: "🗓️ Holiday Calendar",
    fields: [
      ["holidayCalendarEnabled", "ছুটির ক্যালেন্ডার চালু", "true"],
      ["holidayNotice", "ছুটির নির্দেশনা", ""]
    ]
  },

  {
    id: "parent",
    title: "👨‍👩‍👧 Parent & Guardian Settings",
    fields: [
      ["parentPortalEnabled", "অভিভাবক পোর্টাল চালু", "true"],
      ["guardianRequired", "অভিভাবকের তথ্য বাধ্যতামূলক", "true"],
      ["parentPortalNotice", "অভিভাবকদের জন্য নির্দেশনা", ""]
    ]
  },

  {
    id: "transport",
    title: "🚌 Transport Settings",
    fields: [
      ["transportEnabled", "পরিবহন ব্যবস্থা চালু", "true"],
      ["transportMonthlyFee", "মাসিক পরিবহন ফি", "0"],
      ["transportRoutes", "বাসের রুটসমূহ", ""],
      ["transportRules", "পরিবহনের নিয়মাবলি", ""]
    ]
  },

  {
    id: "employee",
    title: "👨‍🏫 Employee & Payroll Settings",
    fields: [
      ["employeeManagementEnabled", "কর্মচারী ব্যবস্থাপনা চালু", "true"],
      ["payrollEnabled", "বেতন ব্যবস্থাপনা চালু", "true"],
      ["salaryPaymentDate", "বেতন প্রদানের তারিখ", "5"],
      ["payrollNote", "বেতন সংক্রান্ত নির্দেশনা", ""]
    ]
  },

  {
    id: "finance",
    title: "💰 Income & Expense Settings",
    fields: [
      ["incomeExpenseEnabled", "আয়-ব্যয় ব্যবস্থাপনা চালু", "true"],
      ["financialYear", "আর্থিক বছর", "2026-2027"],
      ["financeNote", "হিসাব সংক্রান্ত নির্দেশনা", ""]
    ]
  },

  {
    id: "scholarship",
    title: "🎓 Scholarship & Discount Settings",
    fields: [
      ["scholarshipEnabled", "বৃত্তি চালু", "true"],
      ["defaultScholarshipPercent", "ডিফল্ট বৃত্তি (%)", "0"],
      ["scholarshipRules", "বৃত্তির নিয়মাবলি", ""]
    ]
  },

  {
    id: "discipline",
    title: "⚖️ Discipline & Complaint Settings",
    fields: [
      ["disciplineEnabled", "শৃঙ্খলা ব্যবস্থাপনা চালু", "true"],
      ["complaintEnabled", "অভিযোগ ব্যবস্থা চালু", "true"],
      ["disciplineRules", "শৃঙ্খলার নিয়মাবলি", ""],
      ["complaintContact", "অভিযোগের যোগাযোগ", ""]
    ]
  },

  {
    id: "activity",
    title: "📊 Activity Log & Data Export",
    fields: [
      ["activityLogEnabled", "Activity Log চালু", "true"],
      ["dataExportEnabled", "Data Export চালু", "true"],
      ["exportFormats", "Export Format", "PDF, Excel, CSV"]
    ]
  },

  {
    id: "security",
    title: "🔐 Account Security & Dashboard",
    fields: [
      ["twoFactorEnabled", "Two Factor Authentication", "false"],
      ["dashboardCustomizationEnabled", "Dashboard Customization", "true"],
      ["loginNotice", "লগইন নির্দেশনা", ""],
      ["dashboardWelcome", "Dashboard Welcome Message", ""]
    ]
  }

];


// Convert a field value to its saved data type
function getFieldValue(form, key) {

  if (BOOLEAN_FIELDS.includes(key)) {
    return form.has(key);
  }

  const rawValue = String(form.get(key) ?? "").trim();

  if (NUMBER_FIELDS.includes(key)) {

    if (rawValue === "") {
      return 0;
    }

    const numberValue = Number(rawValue);

    if (!Number.isFinite(numberValue)) {
      throw new Error("সঠিক সংখ্যা লিখুন: " + key);
    }

    return numberValue;
  }

  if (ARRAY_FIELDS.includes(key)) {
    return rawValue
      .split(",")
      .map(item => item.trim())
      .filter(Boolean);
  }

  return rawValue;
}


// Render Central Settings
export async function renderCentralSettings(content) {

  try {

    const settings = await getAcademySettings();

    content.innerHTML = `
      <h1>⚙️ সকল সেটিংস</h1>

      <p class="muted">
        প্রতিটি বিভাগের সেটিংস আলাদাভাবে পরিবর্তন ও সংরক্ষণ করুন।
      </p>

      <div id="central-settings-container">

        ${SETTINGS_GROUPS.map(group => `

          <section class="neu-card panel settings-group">

            <form
              class="central-settings-form"
              data-group="${group.id}"
            >

              <h2 class="section-title">
                ${group.title}
              </h2>

              <div class="settings-fields">

                ${group.fields.map(([key, label, fallback]) => {

                  const value = settings[key] ?? fallback;

                  if (BOOLEAN_FIELDS.includes(key)) {

                    const checked =
                      value === true || value === "true";

                    return `
                      <label class="field settings-toggle">
                        <span>${label}</span>

                        <input
                          type="checkbox"
                          name="${key}"
                          ${checked ? "checked" : ""}
                        >
                      </label>
                    `;
                  }

                  const displayValue = Array.isArray(value)
                    ? value.join(", ")
                    : String(value);

                  return `
                    <label class="field">
                      <span>${label}</span>

                      <input
                        name="${key}"
                        type="${NUMBER_FIELDS.includes(key) ? "number" : "text"}"
                        value="${escapeHTML(displayValue)}"
                      >
                    </label>
                  `;

                }).join("")}

              </div>

              <div class="settings-save-area">

                <button
                  class="btn btn-primary settings-save-btn"
                  type="submit"
                >
                  💾 ${group.title} সংরক্ষণ করুন
                </button>

              </div>

            </form>

          </section>

        `).join("")}

      </div>
    `;


    // প্রতিটি বিভাগের জন্য আলাদা Save Event
    const forms = content.querySelectorAll(
      ".central-settings-form"
    );

    forms.forEach(formElement => {

      formElement.addEventListener("submit", async event => {

        event.preventDefault();

        const button = formElement.querySelector(
          ".settings-save-btn"
        );

        const groupId = formElement.dataset.group;

        const group = SETTINGS_GROUPS.find(
          item => item.id === groupId
        );

        if (!group || button.disabled) {
          return;
        }

        const form = new FormData(formElement);
        const data = {};

        try {

          // শুধু নির্বাচিত বিভাগের তথ্য সংগ্রহ
          for (const [key] of group.fields) {
            data[key] = getFieldValue(form, key);
          }

        } catch (error) {

          toast(error.message, "error");
          return;

        }


        // শুধু এই বিভাগের তথ্য Firestore-এ Save
        try {

          button.disabled = true;
          button.textContent = "⏳ সংরক্ষণ হচ্ছে...";

          await saveAcademySettings(data);

          toast(
            group.title + " সফলভাবে সংরক্ষিত হয়েছে।",
            "success"
          );

          button.textContent = "✅ সংরক্ষিত হয়েছে";

        } catch (error) {

          console.error(
            "Settings Save Error:",
            error
          );

          toast(
            "সেটিংস সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।",
            "error"
          );

          button.textContent = "❌ আবার চেষ্টা করুন";

        } finally {

          button.disabled = false;

          setTimeout(() => {

            if (button.isConnected) {

              button.textContent =
                "💾 " + group.title + " সংরক্ষণ করুন";

            }

          }, 2000);

        }

      });

    });

  } catch (error) {

    console.error(
      "Settings Load Error:",
      error
    );

    content.innerHTML = `
      <section class="neu-card panel">
        <h2>⚠️ সেটিংস লোড করা যায়নি</h2>

        <p>
          ইন্টারনেট সংযোগ ও Firebase permissions পরীক্ষা করুন।
        </p>
      </section>
    `;

  }

}

