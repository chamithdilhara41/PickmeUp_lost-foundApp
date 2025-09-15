export interface Found {
  id: string
  title: string
  description: string
  email?: string
  phone?: string
  serverImageUrls?: string[]   // photos uploaded to server
  location?: string
  address?: string             // more detailed location
  category?: string            // for filtering
  status: "returned" | "found"     // always "found" for this tab
  userId: string
    returnDetails?: {
    ownerName?: string;       // ✅ new: name of the owner
    contactInfo?: string;     // ✅ new: how to contact the owner
    returnLocation?: string;  // ✅ new: where the item was returned
    notes?: string;           // ✅ new: any additional notes about the return
  };
  createdAt: Date
  updatedAt: Date            // ✅ extra: mark if someone has claimed it
}
