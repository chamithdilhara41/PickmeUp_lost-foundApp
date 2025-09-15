import { Platform } from "react-native";

const CLOUD_NAME = "dwvuwedzn";
const UPLOAD_PRESET = "unsigned_preset"; // must be unsigned

export const uploadImagesToCloudinary = async (uris: string[]): Promise<string[]> => {
  const uploadedUrls: string[] = [];

  for (const uri of uris) {
    const formData = new FormData();
    formData.append("file", {
      uri: Platform.OS === "ios" ? uri.replace("file://", "") : uri,
      type: "image/jpeg",
      name: `upload_${Date.now()}.jpg`,
    } as any);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Cloudinary upload failed:", text);
        throw new Error("Image upload failed");
      }

      const data = await res.json();
      if (data.secure_url) uploadedUrls.push(data.secure_url);
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      throw new Error("Image upload failed");
    }
  }

  return uploadedUrls;
};
