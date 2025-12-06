
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'admin';
  joinedDate: string;
  reputation: number;
  password?: string; // Added for local auth MVP
  isVerified?: boolean;
}

export interface ForumCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface ForumThread {
  id: string;
  categoryId: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: string;
  views: number;
  replies: number;
  isPinned?: boolean;
}

export interface ForumPost {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Listing {
  id: string;
  sellerId: string;
  sellerName: string; // Added for display purposes
  title: string;
  description: string;
  price: number;
  make: string;
  model: string;
  year: number;
  odometer: number;
  location: string;
  images: string[];
  createdAt: string;
  type: 'car' | 'part';
  isFeatured?: boolean;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  listingId?: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ViewState = 'LIST' | 'create_listing' | 'create_thread' | 'VIEW_THREAD' | 'VIEW_LISTING';