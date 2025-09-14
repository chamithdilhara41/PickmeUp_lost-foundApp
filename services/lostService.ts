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
import { Lost } from "@/types/lost"

export const lostRef = collection(db, "lost")

export const getAllLostByUserId = async (userId: string) => {
  const q = query(lostRef, where("userId", "==", userId))
  const querySnapshot = await getDocs(q)
  return querySnapshot.docs.map((lostDoc) => ({
    id: lostDoc.id,
    ...lostDoc.data()
  })) as Lost[]
}

export const createLost = async (lost: Omit<Lost, "id" | "createdAt" | "updatedAt">) => {
  const docRef = await addDoc(lostRef, {
    ...lost,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
  return docRef.id
}

export const getAllLost = async () => {
  const snapshot = await getDocs(lostRef)
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  })) as Lost[]
}

export const getLostById = async (id: string) => {
  const lostDocRef = doc(db, "lost", id)
  const snapshot = await getDoc(lostDocRef)
  return snapshot.exists()
    ? ({ id: snapshot.id, ...snapshot.data() } as Lost)
    : null
}

export const deleteLost = async (id: string) => {
  const lostDocRef = doc(db, "lost", id)
  return deleteDoc(lostDocRef)
}

export const updateLost = async (id: string, lost: Partial<Lost>) => {
  const lostDocRef = doc(db, "lost", id)
  const { id: _id, ...lostData } = lost // remove id field
  return updateDoc(lostDocRef, {
    ...lostData,
    updatedAt: new Date(),
  })
}
