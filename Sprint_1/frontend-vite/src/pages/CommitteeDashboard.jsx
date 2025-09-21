import { useAuth } from '../context/AuthContext';

const CommitteeDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Welcome, {user?.fullName}! (Committee)</h1>
      <p>This is the Committee Dashboard. You can view assigned complaints here.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
export default CommitteeDashboard;