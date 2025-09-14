export interface Lost {
  id: string
  title: string
  description: string
  imageUrl?: string
  location?: string
  category?: string        // ✅ new: for filtering
  status: "lost" | "found" // ✅ new: lost or found item
  userId: string
  createdAt: Date
  updatedAt: Date
}
