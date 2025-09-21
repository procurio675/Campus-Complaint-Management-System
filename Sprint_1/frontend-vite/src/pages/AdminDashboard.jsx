import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Welcome, {user?.fullName}! (Admin)</h1>
      <p>This is the Admin Dashboard. You can see and manage everything here.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
export default AdminDashboard;