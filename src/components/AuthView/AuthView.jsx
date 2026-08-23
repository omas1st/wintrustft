import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { COUNTRIES } from '../../data/countries';
import { WithdrawalCarousel } from '../WithdrawalCarousel/WithdrawalCarousel';
import toast from 'react-hot-toast';
import {
  LuEye as Eye,
  LuEyeOff as EyeOff,
  LuUserPlus as UserPlus,
  LuLogIn as LogIn,
  LuGlobe as Globe2,
  LuLock as Lock,
  LuMail as Mail,
  LuPhone as Phone,
  LuMapPin as MapPin,
  LuTag as Tag,
  LuCircleAlert as AlertCircle,
  LuCircleCheck as CheckCircle2,
  LuLoaderCircle as Loader2,
} from 'react-icons/lu';
import './AuthView.css';

export const AuthView = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialReferral = searchParams.get('ref') || '';

  const [authMode, setAuthMode] = useState('login');

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCountry, setRegCountry] = useState('United States');
  const [regAddress, setRegAddress] = useState('');
  const [regReferral, setRegReferral] = useState(initialReferral);
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength (simplified)
  const passwordStrength = useMemo(() => {
    if (!regPassword) return { score: 0, label: 'Enter Password', color: 'text-slate-500' };
    let score = 0;
    if (regPassword.length >= 8) score++;
    if (/[A-Z]/.test(regPassword) && /[a-z]/.test(regPassword)) score++;
    if (/\d/.test(regPassword)) score++;
    if (/[^A-Za-z0-9]/.test(regPassword)) score++;
    if (score <= 1) return { score: 1, label: 'Weak', color: 'text-rose-400' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'text-amber-400' };
    if (score === 3) return { score: 3, label: 'Good', color: 'text-cyan-400' };
    return { score: 4, label: 'Strong', color: 'text-emerald-400' };
  }, [regPassword]);

  const passwordMatch = useMemo(() => {
    if (!regConfirmPassword) return { match: false, message: '' };
    if (!regPassword) return { match: false, message: 'Enter password first' };
    const ok = regPassword === regConfirmPassword;
    return { match: ok, message: ok ? 'Passwords match' : 'Passwords do not match' };
  }, [regPassword, regConfirmPassword]);

  useEffect(() => {
    if (initialReferral) {
      setRegReferral(initialReferral);
      setAuthMode('register');
    }
  }, [initialReferral]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!loginIdentifier.trim() || !loginPassword) {
      setFormError('Please fill in all fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      await login(loginIdentifier.trim(), loginPassword);
      navigate('/dashboard');
      toast.success('Welcome back!');
    } catch (err) {
      setFormError(
        err.response?.data?.error ||
        (err.response?.status === 500 ? 'Server error. Please try again later.' : err.message) ||
        'Login failed. Check your credentials.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!regFirstName.trim() || !regLastName.trim() || !regEmail.trim() || !regPhone.trim() || !regAddress.trim() || !regPassword) {
      setFormError('All fields are required.');
      return;
    }
    if (!regEmail.includes('@')) {
      setFormError('Invalid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const userData = {
        firstName: regFirstName.trim(),
        lastName: regLastName.trim(),
        email: regEmail.trim().toLowerCase(),
        phoneNumber: regPhone.trim(),
        country: regCountry,
        homeAddress: regAddress.trim(),
        referralCode: regReferral.trim() || undefined,
        password: regPassword,
      };
      await register(userData);
      // The welcome modal will be shown automatically by App.js via the newlyRegistered flag
      navigate('/dashboard');
      toast.success('Account created successfully!');
    } catch (err) {
      setFormError(
        err.response?.data?.error ||
        (err.response?.status === 500 ? 'Server error. Please try again later.' : err.message) ||
        'Registration failed.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-view">
      <div className="auth-hero">
        <div className="hero-badge">High-Tier Institutional Liquidity & Vaults</div>
        <h1>Next-Gen Banking with <span>Wintrust</span></h1>
        <p>Experience seamless global digital banking, instantaneous peer-to-peer transfers, cryptocurrency reserves, and enterprise-grade asset protection.</p>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h2>{authMode === 'login' ? 'Access Your Wintrust Account' : 'Open a New Wintrust Account'}</h2>
          <div className="auth-tabs">
            <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>Sign In</button>
            <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>Register</button>
          </div>
        </div>

        {formError && (
          <div className="auth-error">
            <AlertCircle /> {formError}
          </div>
        )}

        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label>Email or Phone Number</label>
              <div className="input-with-icon">
                <Mail />
                <input
                  type="text"
                  placeholder="e.g. name@example.com or +14155550143"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="input-with-icon">
                <Lock />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
                <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)}>
                  {showLoginPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="auth-submit">
              {isSubmitting ? <Loader2 className="spinner" /> : <LogIn />}
              {isSubmitting ? 'Verifying...' : 'Sign In to Dashboard'}
            </button>
            <p className="auth-switch">
              Don't have an account? <button type="button" onClick={() => setAuthMode('register')}>Register Now</button>
            </p>
          </form>
        )}

        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label>First Name</label>
                <input type="text" placeholder="John" value={regFirstName} onChange={(e) => setRegFirstName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input type="text" placeholder="Doe" value={regLastName} onChange={(e) => setRegLastName(e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-with-icon">
                  <Mail />
                  <input type="email" placeholder="john@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <div className="input-with-icon">
                  <Phone />
                  <input type="tel" placeholder="+1 (555) 000-0000" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label>Country</label>
              <div className="input-with-icon">
                <Globe2 />
                <select value={regCountry} onChange={(e) => setRegCountry(e.target.value)} required>
                  {COUNTRIES.map(c => <option key={c.code} value={c.name}>{c.flag} {c.name} ({c.phone})</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Home Address</label>
              <div className="input-with-icon">
                <MapPin />
                <input type="text" placeholder="Street, City, State, ZIP" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} required />
              </div>
            </div>
            <div className="form-group">
              <label>Referral Code (Optional)</label>
              <div className="input-with-icon">
                <Tag />
                <input type="text" placeholder="e.g. sophia389" value={regReferral} onChange={(e) => setRegReferral(e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <div className="input-with-icon">
                  <Lock />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowRegPassword(!showRegPassword)}>
                    {showRegPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {regPassword && (
                  <div className="password-strength">
                    <span className="strength-bar">
                      <span style={{ width: `${passwordStrength.score * 25}%` }} />
                    </span>
                    <span className={passwordStrength.color}>{passwordStrength.label}</span>
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <div className="input-with-icon">
                  <Lock />
                  <input
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}>
                    {showRegConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {regConfirmPassword && (
                  <div className={`password-match ${passwordMatch.match ? 'match' : 'mismatch'}`}>
                    {passwordMatch.match ? <CheckCircle2 /> : <AlertCircle />}
                    {passwordMatch.message}
                  </div>
                )}
              </div>
            </div>
            <button type="submit" disabled={isSubmitting} className="auth-submit">
              {isSubmitting ? <Loader2 className="spinner" /> : <UserPlus />}
              {isSubmitting ? 'Creating Account...' : 'Create My Wintrust Account'}
            </button>
            <p className="auth-switch">
              Already registered? <button type="button" onClick={() => setAuthMode('login')}>Sign In here</button>
            </p>
          </form>
        )}
      </div>

      <div className="auth-carousel">
        <WithdrawalCarousel />
      </div>
    </div>
  );
};