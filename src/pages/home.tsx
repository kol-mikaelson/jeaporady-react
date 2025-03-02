import { useEffect, useState } from 'react';
import { db } from '../firebase-config'; // Ensure Firebase is properly initialized
import { collection, onSnapshot} from "firebase/firestore";
import LitsocNav from "../components/navbar"; 
import BiddingQuestion from "../components/auctionq";

function HomePage() {
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check authentication state

  // Set up listener for active question
  useEffect(() => {
    // Set up a real-time listener for the questiondisplay collection
    const questionDisplayRef = collection(db, "questiondisplay");
    
    // This creates a listener that will update whenever the data changes
    const unsubscribe = onSnapshot(
      questionDisplayRef,
      (snapshot) => {
        // Reset loading and error states
        setLoading(true);
        setError(null);
        
        try {
          if (!snapshot.empty) {
            // Get the first document from the collection
            const docData = snapshot.docs[0].data();
            setQuestionId(docData.id); // Assuming the document has an `id` field
            console.log("Question ID updated:", docData.id);
          } else {
            console.log("No documents found in questiondisplay collection");
            setQuestionId(null);
          }
        } catch (err) {
          console.error("Error processing snapshot data:", err);
          setError("Failed to load the current question");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        console.error("Error in snapshot listener:", err);
        setError("Failed to connect to the database");
        setLoading(false);
      }
    );
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  return (
    <>
      <LitsocNav />
            
      {error ? (
        <div className="text-red-500 p-4 text-center">{error}</div>
      ) : loading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-2">Loading question...</p>
        </div>
      ) : questionId ? (
        <BiddingQuestion questionId={questionId} />
      ) : (
        <p className="text-center p-4">No active question available</p>
      )}
    </>
  );
}

export default HomePage;