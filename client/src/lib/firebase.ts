/* eslint-disable @typescript-eslint/no-explicit-any */
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6TkxfrmW_nRiiLLYcCkKYWHodeD008rE",
  authDomain: "topiqsss.firebaseapp.com",
  projectId: "topiqsss",
  storageBucket: "topiqsss.firebasestorage.app",
  messagingSenderId: "968935479060",
  appId: "1:968935479060:web:1d44322b204979495dd401",
  measurementId: "G-2XQ503G4DT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth functions
export const loginUser = async (email: string, password: string) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const onAuthChange = (callback: (user: any) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions
export const studentsCollection = collection(db, 'students');
export const usersCollection = collection(db, 'users');

export const getStudents = async () => {
  const snapshot = await getDocs(query(studentsCollection, orderBy('createdAt', 'desc')));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getStudent = async (id: string) => {
  const docRef = doc(studentsCollection, id);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const addStudent = async (studentData: any) => {
  return await addDoc(studentsCollection, {
    ...studentData,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

export const updateStudent = async (id: string, updates: any) => {
  const docRef = doc(studentsCollection, id);
  return await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date()
  });
};

export const deleteStudent = async (id: string) => {
  const docRef = doc(studentsCollection, id);
  return await deleteDoc(docRef);
};

export const getStudentsByStage = async (stage: string) => {
  const q = query(studentsCollection, where('currentStage', '==', stage));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getStudentsByCountry = async (country: string) => {
  const q = query(studentsCollection, where('country', '==', country));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
