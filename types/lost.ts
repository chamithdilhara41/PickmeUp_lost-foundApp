export interface Lost {
  id: string
  title: string
  description: string
  email?: string
  phone?: string
  serverImageUrls?: string[];
  location?: string
  address?: string      // ✅ new: for more detailed location
  category?: string        // ✅ new: for filtering
  status: "lost" | "found" // ✅ new: lost or found item
  userId: string
  recoveryDetails?: {
    finderName?: string;
    contactInfo?: string;
    recoveryLocation?: string;
    notes?: string;
  };
  createdAt: Date
  updatedAt: Date
}

// export type Lost = {
//   id?: string;
//   title: string;
//   description: string;
//   location?: string;
//   serverImageUrls?: string[]; // multiple server images
//   userId: string;
//   status: "lost" | "found";
//   category?: string;
// };
