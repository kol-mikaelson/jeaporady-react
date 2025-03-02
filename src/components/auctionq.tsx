import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { db } from '../firebase-config';
import { doc, onSnapshot, getDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Define a type for our transaction result
type TransactionResult = {
  success: boolean;
  reason?: string;
};

function BiddingQuestion({ questionId }: { questionId: string }) {
  const [questionData, setQuestionData] = useState({
    category: '',
    points: 0,
    highestBid: 0,
    highestBidder: '',
    keyword: '',
    bidders: [] as string[]
  });
  const [availablePoints, setAvailablePoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState(0);
  const [bidError, setBidError] = useState('');
  const [userHasBid, setUserHasBid] = useState(false);
  const auth = getAuth();
  
  useEffect(() => {
    // Subscribe to real-time updates for question data
    const questionRef = doc(db, 'questions', questionId);
    
    const unsubscribe = onSnapshot(questionRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setQuestionData({
          category: data.category || '',
          points: data.points || 0,
          highestBid: data.highestBid || 0,
          highestBidder: data.highestBidder || '',
          keyword: data.keyword || '',
          bidders: data.bidders || []
        });
        
        // Check if current user has already bid
        const currentUser = auth.currentUser;
        if (currentUser) {
          const hasBid = data.bidders && 
                         Array.isArray(data.bidders) && 
                         data.bidders.includes(currentUser.uid);
          
          // Set userHasBid to true if user is in the bidders array, regardless of whether they're the highest bidder
          setUserHasBid(hasBid);
        }
      }
    });
    
    // Get user's available points
    const fetchUserPoints = async () => {
      setLoading(true);
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            setAvailablePoints(userDoc.data().available_points || 0);
          } else {
            console.log('No user document found!');
            setAvailablePoints(0);
          }
        } catch (error) {
          console.error('Error fetching user points:', error);
          setAvailablePoints(0);
        }
      } else {
        console.log('No user is signed in');
        setAvailablePoints(0);
      }
      
      setLoading(false);
    };
    fetchUserPoints();
    
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [questionId, auth]);

  // Function to open the bid modal
  const openBidModal = () => {
    // Set initial bid amount to 1 (minimum bid)
    setBidAmount(1);
    setBidError('');
    setShowBidModal(true);
  };

  // Function to handle bidding
  const handleSubmitBid = async () => {
    // Validate bid amount is positive
    if (bidAmount <= 0) {
      setBidError('Your bid must be greater than zero');
      return;
    }
    
    if (bidAmount > availablePoints) {
      setBidError('You do not have enough points for this bid');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      setBidError('You must be logged in to place a bid');
      return;
    }

    // Check if user has already bid
    if (userHasBid) {
      setBidError('You have already placed a bid on this question');
      return;
    }

    try {
      // We'll use a transaction to ensure atomicity of the operations
      await runTransaction<TransactionResult>(db, async (transaction) => {
        // IMPORTANT: First collect ALL reads, then perform ALL writes
        
        // 1. READS
        // Get the current question data
        const questionRef = doc(db, 'questions', questionId);
        const questionSnapshot = await transaction.get(questionRef);
        
        if (!questionSnapshot.exists()) {
          throw new Error("Question does not exist!");
        }
        
        const questionData = questionSnapshot.data();
        const previousHighestBidder = questionData.highestBidder;
        const previousHighestBid = questionData.highestBid || 0;
        
        // Get current user data
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnapshot = await transaction.get(userRef);
        
        if (!userSnapshot.exists()) {
          throw new Error("User document does not exist!");
        }
        
        const userData = userSnapshot.data();
        
        // Get previous bidder data if applicable
        let prevBidderSnapshot = null;
        if (previousHighestBidder && 
            previousHighestBidder !== currentUser.uid && 
            previousHighestBid > 0) {
          
          const prevBidderRef = doc(db, 'users', previousHighestBidder);
          prevBidderSnapshot = await transaction.get(prevBidderRef);
        }
        
        // Check if this bid should become the new highest bid
        const isNewHighestBid = bidAmount > previousHighestBid;
        
        // 2. WRITES
        // Update the question with the new bid information
        if (isNewHighestBid) {
          // Only update highest bid and bidder if this is higher than previous
          transaction.update(questionRef, {
            highestBid: bidAmount,
            highestBidder: currentUser.uid,
            bidders: arrayUnion(currentUser.uid)
          });
          
          // Refund points to previous highest bidder if applicable
          if (prevBidderSnapshot && prevBidderSnapshot.exists()) {
            const prevBidderData = prevBidderSnapshot.data();
            const prevBidderRef = doc(db, 'users', previousHighestBidder);
            
            transaction.update(prevBidderRef, {
              available_points: (prevBidderData.available_points || 0) + previousHighestBid
            });
          }
        } else {
          // Just add to bidders array if not highest bid
          transaction.update(questionRef, {
            bidders: arrayUnion(currentUser.uid)
          });
        }

        // Update current user's available points
        transaction.update(userRef, {
          available_points: (userData.available_points || 0) - bidAmount
        });
        
        return { success: true };
      });

      // Transaction was successful
      setShowBidModal(false);
      // Update local state to reflect that user has bid
      setUserHasBid(true);
    } catch (error) {
      console.error('Error placing bid:', error);
      setBidError('An error occurred while placing your bid. Please try again.');
    }
  };

  // Determine if current user is highest bidder
  const isCurrentHighestBidder = auth.currentUser && 
    questionData.highestBidder === auth.currentUser.uid;

  return (
    <>
      <Card className="text-center">
        <Card.Header>{questionData.category}</Card.Header>
        <Card.Body>
          <Card.Title>Points: {questionData.points}</Card.Title>
          <Card.Text>
            Your Available Points: {loading ? 'Loading...' : availablePoints}
          </Card.Text>
          
          {/* Current highest bid information */}
          
          {/* Current bid status messages */}
          {userHasBid && (
            <Card.Text className={isCurrentHighestBidder ? "mt-2 text-success" : "mt-2 text-muted"}>
              {isCurrentHighestBidder 
                ? "You are currently the highest bidder!" 
                : "You've placed a bid but someone has a higher bid"}
            </Card.Text>
          )}
          
          {/* Bid button - disabled if user has already bid */}
          <Button 
            variant={isCurrentHighestBidder ? "success" : "primary"} 
            onClick={openBidModal}
            disabled={loading || availablePoints <= 0 || userHasBid}
          >
            Place Bid
          </Button>
          
          {userHasBid && (
            <Card.Text className="mt-2 text-warning">
              You can only place one bid per question
            </Card.Text>
          )}
        </Card.Body>
        <Card.Footer className="text-muted">Keyword: {questionData.keyword}</Card.Footer>
      </Card>

      {/* Bid Modal */}
      <Modal show={showBidModal} onHide={() => setShowBidModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Place Your Bid</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Enter Bid Amount</Form.Label>
              <Form.Control
                type="number"
                min={1}
                max={availablePoints}
                value={bidAmount}
                onChange={(e) => setBidAmount(Number(e.target.value))}
              />
              <Form.Text>
                You have {availablePoints} points available
              </Form.Text>
              {bidError && <Form.Text className="text-danger d-block mt-2">{bidError}</Form.Text>}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBidModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmitBid}>
            Confirm Bid
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default BiddingQuestion;