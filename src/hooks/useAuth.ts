import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { Business, User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            if (userData.businessId) {
              const businessDoc = await getDoc(doc(db, 'businesses', userData.businessId));
              if (businessDoc.exists()) {
                setBusiness({
                  id: businessDoc.id,
                  ...businessDoc.data()
                } as Business);
              }
            }

            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              displayName: userData.displayName,
              businessId: userData.businessId,
              role: userData.role,
              createdAt: userData.createdAt?.toDate?.()?.toISOString(),
              updatedAt: userData.updatedAt?.toDate?.()?.toISOString()
            } as User);
          }
        } else {
          setUser(null);
          setBusiness(null);
        }
        setError(null);
      } catch (err) {
        console.error('Auth state change error:', err);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      let message = 'Failed to sign in';
      
      switch (err.code) {
        case 'auth/invalid-credential':
          message = 'Invalid email or password';
          break;
        case 'auth/user-not-found':
          message = 'User not found';
          break;
        case 'auth/wrong-password':
          message = 'Invalid password';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later';
          break;
      }
      
      throw new Error(message);
    }
  };

  const createAdminUser = async () => {
    try {
      // Create admin user with a stronger password
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        'admin@admin.com', 
        'Admin123!' // Stronger password that meets requirements
      );

      // Update profile
      await updateProfile(userCredential.user, {
        displayName: 'Admin'
      });

      // Set admin user data
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: 'admin@admin.com',
        displayName: 'Admin',
        role: 'admin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        email: 'admin@admin.com',
        password: 'Admin123!'
      };
    } catch (err: any) {
      console.error('Error creating admin:', err);
      let message = 'Failed to create admin user';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          message = 'Admin user already exists';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email format';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters';
          break;
      }
      
      throw new Error(message);
    }
  };

  const registerBusiness = async (
    email: string, 
    password: string, 
    businessName: string,
    ownerName: string
  ) => {
    try {
      setError(null);
      
      // Validate password strength
      if (password.length < 6) {
        throw new Error('Password should be at least 6 characters');
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user: firebaseUser } = userCredential;

      // Update profile
      await updateProfile(firebaseUser, {
        displayName: ownerName
      });

      // Create business document
      const businessRef = doc(db, 'businesses', firebaseUser.uid);
      const business: Business = {
        id: businessRef.id,
        name: businessName,
        email,
        ownerId: firebaseUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await setDoc(businessRef, business);

      // Create user document
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email,
        displayName: ownerName,
        businessId: businessRef.id,
        role: 'owner',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return business;
    } catch (err: any) {
      console.error('Registration error:', err);
      let message = 'Failed to register business';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          message = 'Email is already registered';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email format';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters';
          break;
      }
      
      throw new Error(message);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
      throw new Error('Failed to sign out');
    }
  };

  return {
    user,
    business,
    loading,
    error,
    signIn,
    signOut,
    registerBusiness,
    createAdminUser
  };
}