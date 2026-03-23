import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc,
  updateDoc,
  serverTimestamp,
  type Timestamp
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForDemoPurposes12345",
  authDomain: "afnan-ai-demo.firebaseapp.com",
  projectId: "afnan-ai-demo",
  storageBucket: "afnan-ai-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Auth functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Save user to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    }, { merge: true });
    
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      unsubscribe();
      resolve(user);
    });
  });
};

// Chat types
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Timestamp;
  attachments?: string[];
}

export interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Firestore functions
export const createChat = async (userId: string, title: string) => {
  const chatRef = doc(collection(db, 'users', userId, 'chats'));
  await setDoc(chatRef, {
    title,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return chatRef.id;
};

export const addMessage = async (userId: string, chatId: string, message: { text: string; isUser: boolean }) => {
  const messageRef = doc(collection(db, 'users', userId, 'chats', chatId, 'messages'));
  await setDoc(messageRef, {
    ...message,
    timestamp: serverTimestamp()
  });
  
  // Update chat's updatedAt
  await updateDoc(doc(db, 'users', userId, 'chats', chatId), {
    updatedAt: serverTimestamp()
  });
  
  return messageRef.id;
};

export const getUserChats = async (userId: string) => {
  const chatsQuery = query(
    collection(db, 'users', userId, 'chats'),
    orderBy('updatedAt', 'desc')
  );
  const snapshot = await getDocs(chatsQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Chat[];
};

export const getChatMessages = async (userId: string, chatId: string) => {
  const messagesQuery = query(
    collection(db, 'users', userId, 'chats', chatId, 'messages'),
    orderBy('timestamp', 'asc')
  );
  const snapshot = await getDocs(messagesQuery);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as ChatMessage[];
};

export const deleteChat = async (userId: string, chatId: string) => {
  await deleteDoc(doc(db, 'users', userId, 'chats', chatId));
};

export const updateChatTitle = async (userId: string, chatId: string, title: string) => {
  await updateDoc(doc(db, 'users', userId, 'chats', chatId), {
    title,
    updatedAt: serverTimestamp()
  });
};
