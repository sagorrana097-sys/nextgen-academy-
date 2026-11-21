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


