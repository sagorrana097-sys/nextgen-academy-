import { getAcademySettings } from "./store.js";

import { APP_CONFIG } from "./config.js";

import {
  $,
  $$,
  initTheme,
  toast,
  escapeHTML,
  initials
} from "./utils.js";

import {
  signUp,
  signIn,
  signOutUser,
  watchAuth,
  getUserProfile
} from "./auth.js";

import { renderAdmin } from "./admin.js";
import { renderTeacher } from "./teacher.js";
import { renderStudent } from "./student.js";


// Theme Initialization
initTheme();


// Role Pages
const rolePages = {
  admin: "admin.html",
  teacher: "teacher.html",
  student: "student.html"
};


// Current Page
const path = location.pathname.split("/").pop() || "index.html";

const requiredRole = document.body.dataset.requiredRole;


// Apply Branding
applyAcademyBranding();


// Authentication Routing
if (path === "index.html" || path === "") {

  setupAuthPage();

  watchAuth(async user => {

    if (!user) return;

    try {

      const profile = await getUserProfile(user.uid);

      if (profile?.role) {

        location.replace(
          rolePages[profile.role] || "student.html"
        );

      }

    } catch (error) {

      console.error("Login Routing Error:", error);

    }

  });

} else {

  watchAuth(async user => {

    if (!user) {

      location.replace("index.html");
      return;

    }

    try {

      const profile = await getUserProfile(user.uid);

      if (!profile) {

        toast(
          "আপনার প্রোফাইল পাওয়া যায়নি।",
          "error"
        );

        await signOutUser();

        return;

      }

      if (profile.role !== requiredRole) {

        location.replace(
          rolePages[profile.role] || "index.html"
        );

        return;

      }

      const root = $("#dashboard-root");

      const render = {
        admin: renderAdmin,
        teacher: renderTeacher,
        student: renderStudent
      }[requiredRole];

      if (!render) {

        throw new Error("অবৈধ User Role");

      }

      await render(root, {
        user,
        profile
      });

      await applyAcademyBranding();

      bindGlobalControls(user, profile);

    } catch (error) {

      console.error("Dashboard Error:", error);

      $("#dashboard-root").innerHTML = `
        <div class="error-panel">
          ড্যাশবোর্ড লোড করা যায়নি।
          ইন্টারনেট ও Firebase সেটিংস পরীক্ষা করুন।
        </div>
      `;

    }

  });

}



// Authentication Page
function setupAuthPage() {

  const form = $("#auth-form");

  if (!form) return;

  let mode = "login";


  // Login / Signup Tabs
  $$("[data-auth-tab]").forEach(button => {

    button.addEventListener("click", () => {

      mode = button.dataset.authTab;

      $$("[data-auth-tab]").forEach(item => {

        item.classList.toggle(
          "active",
          item === button
        );

      });


      $("#name-field").classList.toggle(
        "hidden",
        mode !== "signup"
      );

      $("#confirm-field").classList.toggle(
        "hidden",
        mode !== "signup"
      );


      $("#auth-title").textContent =
        mode === "login"
          ? "অ্যাকাউন্টে প্রবেশ করুন"
          : "নতুন অ্যাকাউন্ট তৈরি করুন";


      $("#auth-subtitle").textContent =
        mode === "login"
          ? "আপনার শেখার জগতে ফিরে আসুন"
          : "NextGen Academy-তে স্বাগতম";


      $("#auth-submit").innerHTML =
        mode === "login"
          ? 'লগইন করুন <span>→</span>'
          : 'অ্যাকাউন্ট তৈরি করুন <span>→</span>';


      $("#auth-message").textContent = "";

    });

  });



  // Password Visibility
  $(".password-toggle")?.addEventListener("click", () => {

    const input = $("#password");

    input.type =
      input.type === "password"
        ? "text"
        : "password";

  });



  // Form Submit
  form.addEventListener("submit", async event => {

    event.preventDefault();

    const message = $("#auth-message");

    const button = $("#auth-submit");

    message.className = "form-message";

    message.textContent = "";

    button.disabled = true;

    button.textContent = "অপেক্ষা করুন…";


    const email = $("#email").value.trim();

    const password = $("#password").value;


    try {

      if (mode === "signup") {

        const name = $("#full-name").value.trim();

        if (!name) {

          throw new Error("আপনার পূর্ণ নাম লিখুন।");

        }

        if (password !== $("#confirm-password").value) {

          throw new Error("দুটি পাসওয়ার্ড এক হয়নি।");

        }

        await signUp({
          name,
          email,
          password
        });

        message.classList.add("success");

        message.textContent =
          "অ্যাকাউন্ট তৈরি হয়েছে। ড্যাশবোর্ডে নেওয়া হচ্ছে…";

        setTimeout(() => {

          location.replace("student.html");

        }, 500);

      } else {

        await signIn(email, password);

        message.classList.add("success");

        message.textContent = "লগইন সফল হয়েছে…";

      }

    } catch (error) {

      message.textContent = friendlyError(error);

      button.disabled = false;

      button.innerHTML =
        mode === "login"
          ? 'লগইন করুন <span>→</span>'
          : 'অ্যাকাউন্ট তৈরি করুন <span>→</span>';

    }

  });

}



// Friendly Authentication Errors
function friendlyError(error) {

  const code = error?.code || "";

  const map = {

    "auth/invalid-email":
      "ইমেইল ঠিকানা সঠিক নয়।",

    "auth/user-not-found":
      "এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।",

    "auth/wrong-password":
      "পাসওয়ার্ড সঠিক নয়।",

    "auth/invalid-credential":
      "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",

    "auth/email-already-in-use":
      "এই ইমেইলে আগে থেকেই অ্যাকাউন্ট আছে।",

    "auth/weak-password":
      "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।",

    "auth/too-many-requests":
      "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।"

  };

  return map[code] ||
    error.message ||
    "কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।";

}



// Global Dashboard Controls
function bindGlobalControls(user, profile) {

  $("#logout-btn")?.addEventListener("click", async () => {

    await signOutUser();

    location.replace("index.html");

  });


  $("#theme-btn")?.addEventListener("click", () => {

    const next =
      document.documentElement.dataset.theme === "dark"
        ? "light"
        : "dark";

    document.documentElement.dataset.theme = next;

    localStorage.setItem("nga-theme", next);

  });


  $("#mobile-menu-btn")?.addEventListener("click", () => {

    $(".sidebar")?.classList.toggle("open");

  });


  $$(".nav-link").forEach(link => {

    link.addEventListener("click", () => {

      $$(".nav-link").forEach(item => {

        item.classList.remove("active");

      });

      link.classList.add("active");

      $(".sidebar")?.classList.remove("open");

    });

  });

}



// Academy Branding
async function applyAcademyBranding() {

  try {

    const settings = await getAcademySettings();

    const root = document.documentElement;


    // Academy Name
    if (settings.academyName) {

      document.title = settings.academyName;

      document.querySelectorAll(
        ".academy-brand-name, .brand-name, .login-academy-name"
      ).forEach(element => {

        element.textContent = settings.academyName;

      });

      document.querySelectorAll(".mobile-brand").forEach(element => {

        const name = element.querySelector(".brand-name");

        if (name) {

          name.textContent = settings.academyName;

        }

      });

    }



    // Academy Logo
    if (settings.logoUrl) {

      document.querySelectorAll(".brand-mark").forEach(element => {

        const image = document.createElement("img");

        image.src = settings.logoUrl;

        image.alt = "Academy Logo";

        image.style.width = "100%";

        image.style.height = "100%";

        image.style.objectFit = "contain";

        element.replaceChildren(image);

      });

    }



    // Primary Color
    if (settings.primaryColor) {

      root.style.setProperty(
        "--primary",
        settings.primaryColor
      );

      root.style.setProperty(
        "--primary-dark",
        settings.primaryColor
      );

    }



    // Secondary Color
    if (settings.secondaryColor) {

      root.style.setProperty(
        "--accent",
        settings.secondaryColor
      );

    }



    // Font
    if (settings.fontFamily) {

      root.style.setProperty(
        "--font-body",
        `"${settings.fontFamily}", sans-serif`
      );

    }



    // Theme
    if (settings.theme) {

      root.dataset.theme = settings.theme;

      localStorage.setItem(
        "nga-theme",
        settings.theme
      );

    }

  } catch (error) {

    console.error(
      "Branding settings load error:",
      error
    );

  }

}



// Export Utilities
export {
  toast,
  escapeHTML,
  initials,
  APP_CONFIG
};
