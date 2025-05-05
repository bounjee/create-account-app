import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email:'', password:'' });
  const [errorMsg, setError]  = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) {
      setError('Email and password are required');
      return;
    }

    // backend login
    const res = await fetch('http://localhost:5000/api/login', {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message);
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={() => navigate(-1)}>×</button>
        <h2>Sign in to your account</h2>
        <p className="subtitle">Welcome back! Please enter your details.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {[
            { name:'email',    label:'Email',    type:'email' },
            { name:'password', label:'Password', type:'password' }
          ].map(({name,label,type='text'})=>(
            <div className="field" key={name}>
              <label>{label}</label>
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={handleChange}
                placeholder={label}
              />
            </div>
          ))}
          {errorMsg && <small className="error">{errorMsg}</small>}
          <button type="submit" className="btn-primary">Sign in</button>
        </form>

        <div className="or-separator"><span>Or</span></div>

        <p className="link-text">
          Don’t have an account? <Link to="/register">Sign up</Link>
        </p>
        
      </div>
    </div>
  );
}
