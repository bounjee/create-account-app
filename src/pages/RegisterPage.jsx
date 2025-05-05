import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm]     = useState({ firstName:'', lastName:'', email:'', password:'', confirmPassword:'' });
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = {};
    if (!form.firstName.trim())                errs.firstName      = 'Required';
    if (!form.lastName.trim())                 errs.lastName       = 'Required';
    if (!form.email.trim())                    errs.email          = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                              errs.email          = 'Invalid email';
    if (!form.password)                        errs.password       = 'Required';
    if (form.password !== form.confirmPassword)
                                              errs.confirmPassword= 'Passwords must match';

    setErrors(errs);
    if (Object.keys(errs).length) return;

    // backend register
    const res = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
    } else {
      alert('Registration successful');
      navigate('/login');
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={() => navigate(-1)}>×</button>
        <h2>Sign up</h2>
        <p className="subtitle">We just need a few details to get you started.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {[
            { name:'firstName', label:'First Name' },
            { name:'lastName',  label:'Last Name' },
            { name:'email',     label:'Email', type:'email' },
            { name:'password',  label:'Password', type:'password' },
            { name:'confirmPassword', label:'Confirm Password', type:'password' },
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
              {errors[name] && <small className="error">{errors[name]}</small>}
            </div>
          ))}
          <button type="submit" className="btn-primary">Sign up</button>
        </form>

        <div className="or-separator"><span>Or</span></div>

        <p className="link-text">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
   
      </div>
    </div>
  );
}
