import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Member } from '../types';

export function useTeam(businessId: string | undefined) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const teamQuery = query(usersRef, where('businessId', '==', businessId));

      const unsubscribe = onSnapshot(
        teamQuery,
        (snapshot) => {
          const teamMembers = snapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().displayName,
            email: doc.data().email,
            role: doc.data().role,
            avatar: doc.data().avatar,
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString(),
            updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString()
          })) as Member[];

          setMembers(teamMembers);
          setError(null);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching team members:', err);
          setError('Failed to load team members');
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up team subscription:', err);
      setError('Failed to connect to database');
      setLoading(false);
    }
  }, [businessId]);

  return {
    members,
    loading,
    error
  };
}