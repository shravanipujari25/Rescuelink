import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * ProtectedRoute — redirects to /login if not authenticated.
 * Optionally restricts to specific roles.
 */
export const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(user?.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

/**
 * GuestRoute — redirects authenticated users away from login/signup pages.
 */
export const GuestRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated) {
        // Route to role-appropriate dashboard
        const dest = user?.role === 'admin' ? '/admin' :
            user?.role === 'ngo' ? '/dashboard' :
                user?.role === 'volunteer' ? '/dashboard' : '/dashboard';
        return <Navigate to={dest} replace />;
    }

    return children;
};
