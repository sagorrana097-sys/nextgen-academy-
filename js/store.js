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
  serverTimestamp
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

// Update Record
export async function updateRecord(name, id, data) {
  return updateDoc(
    doc(db, APP_CONFIG.collections[name], id),
    {
      ...data,
      updatedAt: serverTimestamp()
    }
  );
}

// Delete Record
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
