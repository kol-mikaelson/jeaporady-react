import HomePage from "./pages/home";
import { AuthProvider } from "./auth/AuthContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from "./pages/login";
import { PrivateRoute } from "./auth/PrivateRoutes";
import { RestrictedRoute } from "./components/restrictedroutes";
import AdminPage from "./pages/admin";
function App(){
    const ALLOWED_EMAIL = "admin@litsoc.com";
  
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } />
          <Route 
                      path="/restricted" 
                      element={
                        <PrivateRoute>
                          <RestrictedRoute allowedEmail={ALLOWED_EMAIL}>
                            <AdminPage />
                          </RestrictedRoute>
                        </PrivateRoute>
                      } 
                    />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>);
}

export default App;