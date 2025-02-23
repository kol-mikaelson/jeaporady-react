import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import { db } from '../firebase-config';// You'll need to create this
import { doc, onSnapshot } from 'firebase/firestore';

function BiddingQuestion({ questionId }:{questionId:string}) {
  const [questionData, setQuestionData] = useState({
    category: '',
    points: 0,
    highestBid: 0,
    keyword: ''
  });

  useEffect(() => {
    // Subscribe to real-time updates
    const questionRef = doc(db, 'questions', questionId);
    
    const unsubscribe = onSnapshot(questionRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setQuestionData({
          category: data.category || '',
          points: data.points || 0,
          highestBid: data.highestBid || 0,
          keyword: data.keyword || ''
        });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [questionId]);

  return (
    <Card className="text-center">
      <Card.Header>{questionData.category}</Card.Header>
      <Card.Body>
        <Card.Title>Points: {questionData.points}</Card.Title>
        <Card.Text>
          Highest Bid: {questionData.highestBid}
        </Card.Text>
        <Button variant="primary">Place Bid</Button>
      </Card.Body>
      <Card.Footer className="text-muted">Keyword: {questionData.keyword}</Card.Footer>
    </Card>
  );
}

export default BiddingQuestion;