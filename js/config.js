// ==========================================
// NEXTGEN ACADEMY - CENTRAL CONFIGURATION
// ==========================================

export const APP_CONFIG = {

// Academy Information
name: "NextGen Academy",
locale: "bn-BD",
defaultTheme: "light",

// Firebase Configuration
firebase: {
apiKey: "AIzaSyCiuVDN52fNvW53wZ7qXUf6lVxXNOPPsLM",
authDomain: "nextgen-academy-ba9ed.firebaseapp.com",
projectId: "nextgen-academy-ba9ed",
storageBucket: "nextgen-academy-ba9ed.firebasestorage.app",
messagingSenderId: "250055044170",
appId: "1:250055044170:web:a1781adf499d33570f4ab3",
measurementId: "G-58XX0MKTPE"
},

// Firestore Collections
collections: {

users: "users",
courses: "courses",
students: "students",
notices: "notices",
admissions: "admissions",
teachers: "teachers",
batches: "batches",
attendance: "attendance",
academySettings: "academySettings",

// Academic Management
classes: "classes",
subjects: "subjects",

// Exam & Result Management
examinations: "examinations",
results: "results"

}

};
