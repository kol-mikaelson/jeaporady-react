import { useEffect, useState } from 'react';
import { db } from '../firebase-config';
import { doc, onSnapshot } from "firebase/firestore";

interface UserPointsProps {
  userId: string;
}

function UserPoints({ userId }: UserPointsProps) {
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    
    // Reference to the user's document in the users collection
    const userRef = doc(db, "users", userId);
    
    // Set up real-time listener for user points
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          // Set points from user data (defaulting to 0 if not present)
          setPoints(userData.points || 0);
          setLoading(false);
        } else {
          console.log("No user document found!");
          setError("User data not found");
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error getting user data:", err);
        setError("Failed to load points");
        setLoading(false);
      }
    );
    
    // Clean up listener on unmount
    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="bg-white shadow rounded-lg p-4 mb-4 mx-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-700">Your Points</h2>
        
        {loading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-sm text-gray-500">Loading...</span>
          </div>
        ) : error ? (
          <span className="text-sm text-red-500">{error}</span>
        ) : (
          <div className="flex items-center">
            <span className="text-2xl font-bold text-blue-600">{points}</span>
            <svg className="w-5 h-5 ml-1 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserPoints;