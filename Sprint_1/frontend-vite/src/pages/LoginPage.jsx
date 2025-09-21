import React, { useState, useContext } from 'react';
// 1. Import useNavigate from react-router-dom
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const LoginPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'student',
  });
  const { login, register, error, isLoading } = useContext(AuthContext);
  // 2. Initialize the navigate function
  const navigate = useNavigate();

  const { fullName, email, password, role } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    let success = false;
    if (isLoginView) {
      success = await login({ email, password });
    } else {
      success = await register({ fullName, email, password, role });
    }

    // 3. Add this block to navigate on success
    if (success) {
      navigate('/'); // Redirect to the main page
    }
  };

  return (
    <div className="login-container">
        <div className="login-box">
            <div className="login-header">
                <div className="logo-icon">👥</div>
                <h2>Campus Complaint Management</h2>
            </div>
            <div className="manual-login">
                <h3>{isLoginView ? 'Login' : 'Create Account'}</h3>
                <p>Enter your details to access the system</p>
                <form onSubmit={onSubmit}>
                    {!isLoginView && (
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name</label>
                            <input type="text" id="fullName" name="fullName" value={fullName} onChange={onChange} placeholder="Enter your full name" required={!isLoginView} />
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" value={email} onChange={onChange} placeholder="your.email@example.com" required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" value={password} onChange={onChange} placeholder="Enter your password" required />
                    </div>
                    {!isLoginView && (
                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select id="role" name="role" value={role} onChange={onChange}>
                                <option value="student">Student</option>
                                <option value="committee">Committee</option>
                            </select>
                        </div>
                    )}
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn btn-login" disabled={isLoading}>
                        {isLoading ? 'Loading...' : isLoginView ? 'Login' : 'Register'}
                    </button>
                </form>
                <p className="toggle-form">
                    {isLoginView ? "Don't have an account?" : 'Already have an account?'}
                    <button onClick={() => setIsLoginView(!isLoginView)}>
                        {isLoginView ? 'Register' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;