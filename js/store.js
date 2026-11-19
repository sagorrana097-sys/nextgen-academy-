import {db} from "./firebase.js";
import {collection,addDoc,getDocs,query,orderBy,limit,doc,getDoc,setDoc,updateDoc,serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {APP_CONFIG} from "./config.js";
const col=name=>collection(db,APP_CONFIG.collections[name]);
export async function getUserProfile(uid){const snap=await getDoc(doc(db,APP_CONFIG.collections.users,uid));return snap.exists()?{id:snap.id,...snap.data()}:null;}
export async function saveUserProfile(uid,data){await setDoc(doc(db,APP_CONFIG.collections.users,uid),{...data,updatedAt:serverTimestamp()},{merge:true});}
export async function listRecords(name,max=100){const snap=await getDocs(query(col(name),orderBy("createdAt","desc"),limit(max)));return snap.docs.map(d=>({id:d.id,...d.data()}));}
export async function createRecord(name,data){return addDoc(col(name),{...data,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});}
export async function updateRecord(name,id,data){return updateDoc(doc(db,APP_CONFIG.collections[name],id),{...data,updatedAt:serverTimestamp()});}
