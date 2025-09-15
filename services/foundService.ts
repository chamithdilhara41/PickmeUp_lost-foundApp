import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where
} from "firebase/firestore"
import { db } from "@/firebase"
import { Found } from "@/types/found" // Make sure to create this interface

export const foundRef = collection(db, "found")

export const getAllFoundByUserId = async (userId: string) => {
  const q = query(foundRef, where("userId", "==", userId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((foundDoc) => ({
    id: foundDoc.id,
    ...foundDoc.data()
  })) as Found[]
}

export const createFound = async (found: Omit<Found, "id" | "createdAt" | "updatedAt">) => {
  const docRef = await addDoc(foundRef, {
    ...found,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return docRef.id
}

export const getAllFound = async () => {
  const snapshot = await getDocs(foundRef)
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as Found[]
}

export const getFoundById = async (id: string) => {
  const foundDocRef = doc(db, "found", id)
  const snapshot = await getDoc(foundDocRef)
  return snapshot.exists()
    ? ({ id: snapshot.id, ...snapshot.data() } as Found)
    : null
}

export const deleteFound = async (id: string) => {
  const foundDocRef = doc(db, "found", id)
  return deleteDoc(foundDocRef)
}

export const updateFound = async (id: string, found: Partial<Found>) => {
  const foundDocRef = doc(db, "found", id)
  const { id: _id, ...foundData } = found // remove id field
  return updateDoc(foundDocRef, {
    ...foundData,
    updatedAt: new Date(),
  })
}

// Additional useful queries you might want
export const getFoundByCategory = async (category: string) => {
  const q = query(foundRef, where("category", "==", category))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((foundDoc) => ({
    id: foundDoc.id,
    ...foundDoc.data()
  })) as Found[]
}

export const getFoundByStatus = async (status: "lost" | "found") => {
  const q = query(foundRef, where("status", "==", status))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((foundDoc) => ({
    id: foundDoc.id,
    ...foundDoc.data()
  })) as Found[]
}