import React, { useState } from 'react';

export default function CreateAccountForm({ onSubmit }) {
  const [values, setValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    dob: ''
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    // Zorunlu alanlar
    if (!values.firstName.trim())    errs.firstName      = 'Required';
    if (!values.lastName.trim())     errs.lastName       = 'Required';
    if (!values.email.trim())        errs.email          = 'Required';
    if (!values.password)            errs.password       = 'Required';
    if (!values.confirmPassword)     errs.confirmPassword= 'Required';
    if (!values.dob)                 errs.dob            = 'Required';

    // E-posta formatı
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errs.email = 'Invalid email';
    }

    // Şifre eşleşmesi
    if (
      values.password &&
      values.confirmPassword &&
      values.password !== values.confirmPassword
    ) {
      errs.confirmPassword = 'Passwords must match';
    }

    return errs;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setValues(v => ({ ...v, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length === 0) {
      onSubmit(values);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="form">
      <div>
        <label>First Name</label>
        <input
          name="firstName"
          value={values.firstName}
          onChange={handleChange}
          data-testid="firstName"
        />
        {errors.firstName && <div data-testid="firstName-error">{errors.firstName}</div>}
      </div>

      <div>
        <label>Last Name</label>
        <input
          name="lastName"
          value={values.lastName}
          onChange={handleChange}
          data-testid="lastName"
        />
        {errors.lastName && <div data-testid="lastName-error">{errors.lastName}</div>}
      </div>

      <div>
        <label>E-mail</label>
        <input
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          data-testid="email"
        />
        {errors.email && <div data-testid="email-error">{errors.email}</div>}
      </div>

      <div>
        <label>Password</label>
        <input
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          data-testid="password"
        />
        {errors.password && <div data-testid="password-error">{errors.password}</div>}
      </div>

      <div>
        <label>Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          value={values.confirmPassword}
          onChange={handleChange}
          data-testid="confirmPassword"
        />
        {errors.confirmPassword && (
          <div data-testid="confirmPassword-error">{errors.confirmPassword}</div>
        )}
      </div>

      <div>
        <label>Date of Birth</label>
        <input
          name="dob"
          type="date"
          value={values.dob}
          onChange={handleChange}
          data-testid="dob"
        />
        {errors.dob && <div data-testid="dob-error">{errors.dob}</div>}
      </div>

      <button type="submit">SUBMIT</button>
    </form>
  );
}
