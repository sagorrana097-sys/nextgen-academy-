import {
  getAcademySettings,
  saveAcademySettings
} from "./store.js";

import { escapeHTML, toast } from "./utils.js";

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
}
];

export async function renderCentralSettings(content) {
  const settings = await getAcademySettings();

  content.innerHTML = `
    <h1>⚙️ সকল সেটিংস</h1>
    <p class="muted">
      এক জায়গা থেকে একাডেমির বিভিন্ন সেটিং নিয়ন্ত্রণ করুন।
    </p>

    <form id="central-settings-form" class="form-stack">
      ${SETTINGS_GROUPS.map(group => `
        <section class="neu-card panel">
          <h2 class="section-title">
            ${group.title}
          </h2>

          ${group.fields.map(([key, label, fallback]) => {
            const value = settings[key] ?? fallback;

            return `
              <label class="field">
                <span>${label}</span>
                <input
                  name="${key}"
                  value="${escapeHTML(String(value))}"
                  ${key === "admissionOpen" ||
                    key === "attendanceEnabled" ||
                    key === "gradingEnabled" ||
                    key === "noticeEnabled"
                    ? 'placeholder="true অথবা false"'
                    : ""}
                >
              </label>
            `;
          }).join("")}
        </section>
      `).join("")}

      <button class="btn btn-primary" type="submit">
        সকল সেটিংস সংরক্ষণ করুন
      </button>
    </form>
  `;

  content.querySelector("#central-settings-form").onsubmit =
    async event => {
      event.preventDefault();

      const form = new FormData(event.currentTarget);
      const data = {};

      for (const group of SETTINGS_GROUPS) {
        for (const [key] of group.fields) {
          let value = String(form.get(key) ?? "").trim();

          if ([
            "admissionOpen",
            "attendanceEnabled",
            "gradingEnabled",
            "noticeEnabled"
          ].includes(key)) {
            value = value.toLowerCase() === "true";
          } else if ([
            "admissionFee",
            "lateTime",
            "passMark",
            "fullMark",
            "monthlyFee",
            "noticeExpiryDays"
          ].includes(key)) {
            value = Number(value) || 0;
          } else if ([
            "classes",
            "divisions",
            "subjects",
            "terms",
            "examTypes",
            "requiredDocuments",
            "paymentMethods"
          ].includes(key)) {
            value = value.split(",")
              .map(item => item.trim())
              .filter(Boolean);
          }

          data[key] = value;
        }
      }

      try {
        await saveAcademySettings(data);
        toast("সকল সেটিংস সংরক্ষিত হয়েছে।", "success");
      } catch (error) {
        console.error(error);
        toast("সেটিংস সংরক্ষণ করা যায়নি।", "error");
      }
    };
}


