import React, { useEffect, useState } from 'react';
import { db } from '../firebase-config';
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap styles

const AdminPage: React.FC = () => {
  const [questionId, setQuestionId] = useState<string>("");
  const [newQuestionId, setNewQuestionId] = useState<string>("");
  const navigate = useNavigate();

  // Fetch the existing questionId
  useEffect(() => {
    const fetchQuestionId = async () => {
      try {
        const questionCollection = collection(db, "questiondisplay");
        const querySnapshot = await getDocs(questionCollection);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0];
          setQuestionId(docData.data().id); // Assuming the document has an `id` field
          setNewQuestionId(docData.data().id);
        }
      } catch (error) {
        console.error("Error fetching questionId:", error);
      }
    };

    fetchQuestionId();
  }, []);

  // Handle update to Firestore
  const handleUpdate = async () => {
    try {
      const questionCollection = collection(db, "questiondisplay");
      const querySnapshot = await getDocs(questionCollection);

      if (!querySnapshot.empty) {
        const docRef = doc(db, "questiondisplay", querySnapshot.docs[0].id);
        await updateDoc(docRef, { id: newQuestionId });

        setQuestionId(newQuestionId);
        alert("Question ID updated successfully!");
      }
    } catch (error) {
      console.error("Error updating questionId:", error);
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center vh-100">
      <h1 className="mb-4">Update Question ID</h1>
      <p className="mb-3">Current Question ID: <strong>{questionId || "Loading..."}</strong></p>
      <input
        type="text"
        className="form-control mb-3"
        value={newQuestionId}
        onChange={(e) => setNewQuestionId(e.target.value)}
        placeholder="Enter new Question ID"
      />
      <button onClick={handleUpdate} className="btn btn-primary mb-2">
        Update
      </button>
      <button onClick={() => navigate("/")} className="btn btn-secondary">
        Go Back
      </button>
    </div>
  );
};

export default AdminPage;
