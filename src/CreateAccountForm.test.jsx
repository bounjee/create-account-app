// src/CreateAccountForm.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import CreateAccountForm from './CreateAccountForm';

describe('CreateAccountForm Bileşeni — Detaylı Birim Testleri', () => {
  let onSubmitMock;

  beforeEach(() => {
    onSubmitMock = jest.fn();
    render(<CreateAccountForm onSubmit={onSubmitMock} />);
  });

  test('Tüm alanları ve SUBMIT butonunu gösterir', () => {
    ['firstName','lastName','email','password','confirmPassword','dob']
      .forEach(name => {
        expect(screen.getByTestId(name)).toBeInTheDocument();
      });
    expect(screen.getByRole('button', { name: /submit/i })).toBeEnabled();
  });

  test('Hiç doldurmadan SUBMIT tuşuna basınca tüm alanlara "Required" hatası ekler, onSubmit çağrılmaz', () => {
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    ['firstName','lastName','email','password','confirmPassword','dob']
      .forEach(name => {
        expect(screen.getByTestId(`${name}-error`)).toHaveTextContent('Required');
      });
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  test('Sadece bazı alanlar doldurulduğunda, doldurulan alanlarda hata yok, diğerlerinde "Required" hatası var', () => {
    fireEvent.change(screen.getByTestId('firstName'), { target: { value: 'Ayşe' } });
    fireEvent.change(screen.getByTestId('email'),     { target: { value: 'ayse@ornek.com' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    // Doldurulan alanlar
    ['firstName','email'].forEach(name => {
      expect(screen.queryByTestId(`${name}-error`)).toBeNull();
    });
    // Doldurulmayanlar
    ['lastName','password','confirmPassword','dob'].forEach(name => {
      expect(screen.getByTestId(`${name}-error`)).toHaveTextContent('Required');
    });
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  test('Sadece boşluk girilen input "Required" hatası verir (trim kontrolü)', () => {
    fireEvent.change(screen.getByTestId('firstName'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByTestId('firstName-error')).toHaveTextContent('Required');
  });

  test('Geçersiz email formatı "Invalid email" hatası verir', () => {
    fireEvent.change(screen.getByTestId('email'), { target: { value: 'foo@bar' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByTestId('email-error')).toHaveTextContent('Invalid email');
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  test('Email alanına başında/sonunda boşluk ve büyük harf girildiğinde hata göstermez', () => {
    fireEvent.change(screen.getByTestId('email'), { target: { value: '  FOO@BAR.COM  ' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.queryByTestId('email-error')).toBeNull();
  });

  test('Password ve ConfirmPassword uyuşmazsa "Passwords must match" hatası verir', () => {
    fireEvent.change(screen.getByTestId('password'),        { target: { value: '1234abcd' } });
    fireEvent.change(screen.getByTestId('confirmPassword'), { target: { value: 'abcd1234' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByTestId('confirmPassword-error'))
      .toHaveTextContent('Passwords must match');
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  test('Password eşleşmesi düzeltildiğinde hata kaybolur', () => {
    // önce mismatch
    fireEvent.change(screen.getByTestId('password'),        { target: { value: 'pAss1234' } });
    fireEvent.change(screen.getByTestId('confirmPassword'), { target: { value: 'xxxx' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.getByTestId('confirmPassword-error')).toBeInTheDocument();

    // sonra düzelt
    fireEvent.change(screen.getByTestId('confirmPassword'), { target: { value: 'pAss1234' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(screen.queryByTestId('confirmPassword-error')).toBeNull();
  });

  test('Tüm alanlar geçerli girildiğinde onSubmit tek sefer çağrılır ve doğru veriyi alır', async () => {
    const geçerli = {
      firstName: 'Mehmet',
      lastName: 'Yılmaz',
      email: 'mehmet@example.com',
      password: 'abc12345',
      confirmPassword: 'abc12345',
      dob: '1990-05-05'
    };
    Object.entries(geçerli).forEach(([alan, değer]) => {
      fireEvent.change(screen.getByTestId(alan), { target: { value: değer } });
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmitMock).toHaveBeenCalledTimes(1);
      expect(onSubmitMock).toHaveBeenCalledWith(geçerli);
    });
  });
});
