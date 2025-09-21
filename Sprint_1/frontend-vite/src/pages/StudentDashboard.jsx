import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h1>Welcome, {user?.fullName}! (Student)</h1>
      <p>This is the Student Dashboard. You can submit and track your complaints here.</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
export default StudentDashboard;