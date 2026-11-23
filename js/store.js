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

// Collection Reference
const col = name => collection(db, APP_CONFIG.collections[name]);

// ==========================================
// USER PROFILE
// ==========================================

export async function getUserProfile(uid) {
  const snap = await getDoc(
    doc(db, APP_CONFIG.collections.users, uid)
  );

  return snap.exists()
    ? { id: snap.id, ...snap.data() }
    : null;
}

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

// ==========================================
// COMMON RECORD MANAGEMENT
// ==========================================

// Get Records
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

// Create Record
export async function createRecord(name, data) {
  return addDoc(col(name), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

// ==========================================
// SEQUENTIAL STUDENT ID GENERATOR
// ==========================================

export async function createStudentRecord(data) {
  const year = new Date().getFullYear();

  // Student collection
  const studentsCollection = col("students");

  // Generate Firestore document reference
  const studentRef = doc(studentsCollection);

  // Year-wise counter document
  const counterRef = doc(
    db,
    "counters",
    `students_${year}`
  );

  return await runTransaction(db, async (transaction) => {

    // Read current serial
    const counterSnap = await transaction.get(counterRef);

    const currentSerial = counterSnap.exists()
      ? Number(counterSnap.data().lastSerial || 0)
      : 0;

    // Next serial
    const nextSerial = currentSerial + 1;

    // Format Student ID
    const studentCode =
      `NGA-${year}-${String(nextSerial).padStart(4, "0")}`;

    // Save updated counter
    transaction.set(counterRef, {
      lastSerial: nextSerial,
      year,
      updatedAt: serverTimestamp()
    });

    // Create student
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

// ==========================================
// UPDATE RECORD
// ==========================================

export async function updateRecord(name, id, data) {
  return updateDoc(
    doc(db, APP_CONFIG.collections[name], id),
    {
      ...data,
      updatedAt: serverTimestamp()
    }
  );
}

// ==========================================
// DELETE RECORD
// ==========================================

export async function deleteRecord(name, id) {
  return deleteDoc(
    doc(db, APP_CONFIG.collections[name], id)
  );
}

// ==========================================
// ACADEMY SETTINGS
// ==========================================

export async function getAcademySettings() {
  const ref = doc(
    db,
    APP_CONFIG.collections.academySettings,
    "main"
  );

  const snap = await getDoc(ref);

  return snap.exists() ? snap.data() : {};
}

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

// ==========================================
// ACADEMIC YEAR SETTINGS
// ==========================================

export async function getAcademicYears() {
  const settings = await getAcademySettings();

  return settings.academicYears || [];
}

export async function saveAcademicYears(years) {
  await saveAcademySettings({
    academicYears: years
  });
}
