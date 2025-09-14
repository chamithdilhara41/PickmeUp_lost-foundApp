import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import * as FileSystem from "expo-file-system";
import { storage } from "@/firebase";

export const uploadImageAsync = async (uri: string, path: string) => {
  try {
    console.log("Uploading file URI:", uri);

    // Read file as base64
    const base64Data = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Convert base64 to Uint8Array
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    const storageRef = ref(storage, path);

    return new Promise<string>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(storageRef, byteArray);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          console.log("Upload successful:", downloadUrl);
          resolve(downloadUrl);
        }
      );
    });
  } catch (err: any) {
    console.error("Firebase upload error:", err);
    throw new Error(err.message || "Upload failed");
  }
};
