import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/auth-context';
import { ProtectedRoute } from './components/protected-route';
import { LoginPage } from './pages/login-page';
import { SignupPage } from './pages/signup-page';
import { ProfilePage } from './pages/profile-page';

function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/profile' : '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
