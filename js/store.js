import { db } from "./firebase.js";

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  runTransaction
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { APP_CONFIG } from "./config.js";

const col = name => collection(db, APP_CONFIG.collections[name]);

// Get user profile
export async function getUserProfile(uid) {
  const snap = await getDoc(
    doc(db, APP_CONFIG.collections.users, uid)
  );

  return snap.exists()
    ? { id: snap.id, ...snap.data() }
    : null;
}

// Save user profile
export async function saveUserProfile(uid, data) {
  await setDoc(
    doc(db, APP_CONFIG.collections.users, uid),
    {
      ...data,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

// List records
export async function listRecords(name, max = 100) {
  try {
    const snap = await getDocs(
      query(
        col(name),
        orderBy("createdAt", "desc"),
        limit(max)
      )
    );

    return snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

  } catch (error) {
    console.error(`Error loading ${name}:`, error);
    throw error;
  }
}

// Create normal record
export async function createRecord(name, data) {
  return addDoc(col(name), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// Create student with sequential Student ID
export async function createStudentRecord(data) {
  const year = new Date().getFullYear();

  const studentsCollection = col("students");
  const studentRef = doc(studentsCollection);

  const counterRef = doc(
    db,
    "counters",
    `students_${year}`
  );

  return await runTransaction(db, async transaction => {

    const counterSnap = await transaction.get(counterRef);

    const currentSerial = counterSnap.exists()
      ? Number(counterSnap.data().lastSerial || 0)
      : 0;

    const nextSerial = currentSerial + 1;

    const studentCode =
      `NGA-${year}-${String(nextSerial).padStart(4, "0")}`;

    transaction.set(counterRef, {
      lastSerial: nextSerial,
      year,
      updatedAt: serverTimestamp()
    });

    transaction.set(studentRef, {
      ...data,
      studentCode,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return {
      id: studentRef.id,
      studentCode
    };
  });
}
// Approve admission and create student atomically
export async function approveAdmission(admissionId, userId) {
  const admissionRef = doc(
    db,
    APP_CONFIG.collections.admissions,
    admissionId
  );

  const year = new Date().getFullYear();

  const counterRef = doc(
    db,
    "counters",
    `students_${year}`
  );

  const studentRef = doc(col("students"));

  return await runTransaction(db, async transaction => {
    // Read admission first
    const admissionSnap = await transaction.get(admissionRef);

    if (!admissionSnap.exists()) {
      throw new Error("ভর্তি আবেদন পাওয়া যায়নি।");
    }

    const application = admissionSnap.data();

    // Prevent duplicate student creation
    if (application.status === "approved") {
      return {
        alreadyApproved: true,
        id: application.studentId || "",
        studentCode: application.studentCode || ""
      };
    }

    // Read counter
    const counterSnap = await transaction.get(counterRef);

    const currentSerial = counterSnap.exists()
      ? Number(counterSnap.data().lastSerial || 0)
      : 0;

    const nextSerial = currentSerial + 1;

    const studentCode =
      `NGA-${year}-${String(nextSerial).padStart(4, "0")}`;

    // Create student
    transaction.set(studentRef, {
      name: application.name || "",
      email: application.email || "",
      phone: application.phone || "",
      course: application.course || "",
      admissionId,
      studentCode,
      createdBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update counter
    transaction.set(counterRef, {
      lastSerial: nextSerial,
      year,
      updatedAt: serverTimestamp()
    });

    // Approve admission
    transaction.update(admissionRef, {
      status: "approved",
      studentId: studentRef.id,
      studentCode,
      updatedAt: serverTimestamp()
    });

    return {
      alreadyApproved: false,
      id: studentRef.id,
      studentCode
    };
  });
}

// Update record
export async function updateRecord(name, id, data) {
  return updateDoc(
    doc(db, APP_CONFIG.collections[name], id),
    {
      ...data,
      updatedAt: serverTimestamp()
    }
  );
}

// Delete record
export async function deleteRecord(name, id) {
  return deleteDoc(
    doc(db, APP_CONFIG.collections[name], id)
  );
}

// Get academy settings
export async function getAcademySettings() {
  const ref = doc(
    db,
    APP_CONFIG.collections.academySettings,
    "main"
  );

  const snap = await getDoc(ref);

  return snap.exists() ? snap.data() : {};
}

// Save academy settings
export async function saveAcademySettings(data) {
  const ref = doc(
    db,
    APP_CONFIG.collections.academySettings,
    "main"
  );

  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
}

// Get academic years
export async function getAcademicYears() {
  const settings = await getAcademySettings();

  return settings.academicYears || [];
}

// Save academic years
export async function saveAcademicYears(years) {
  await saveAcademySettings({
    academicYears: years
  });
}
