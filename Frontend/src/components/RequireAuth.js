import { useLocation, Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Unauthorized from './Unauthorized';

const RequireAuth = ({ allowedRoles }) => {
    const { auth } = useAuth();
    const location = useLocation();
    return (auth?.roles?.find(role => allowedRoles?.includes(role))
        ? <Outlet />//outlet stands for all the child components of RequireAuth that we wrap inside of it
        : auth?.user
            ? <Navigate to='/unauthorized' state={{ from: location }} replace></Navigate>
            : <Navigate to='/login' state={{ from: location }} replace /> //replacing the navigation history
    );
}

export default RequireAuth;