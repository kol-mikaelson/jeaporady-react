import LitsocNav from "../components/navbar"; 
import BiddingQuestion from "../components/auctionq";
import React from 'react';
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from 'react-router-dom';
function HomePage(){
  const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
  
    const handleLogout = async () => {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('Failed to log out:', error);
      }
    };
  return(
    <>
      <LitsocNav/>
      <BiddingQuestion questionId={'Q001'}/>
    </>
  )
}

export default HomePage;