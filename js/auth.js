import {auth} from "./firebase.js";
import {createUserWithEmailAndPassword,signInWithEmailAndPassword,signOut,onAuthStateChanged,updateProfile} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {saveUserProfile,getUserProfile} from "./store.js";
export async function signUp({name,email,password}){const credential=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(credential.user,{displayName:name});await saveUserProfile(credential.user.uid,{name,email,role:"student",status:"active"});return credential.user;}
export async function signIn(email,password){const credential=await signInWithEmailAndPassword(auth,email,password);return credential.user;}
export async function signOutUser(){await signOut(auth);}
export function watchAuth(callback){return onAuthStateChanged(auth,callback);}
export {getUserProfile};
