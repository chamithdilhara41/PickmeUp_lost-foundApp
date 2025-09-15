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
  status: "lost" | "found"     // always "found" for this tab
  userId: string
  createdAt: Date
  updatedAt: Date            // ✅ extra: mark if someone has claimed it
}
