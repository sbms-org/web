import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/authContext';
import api from '../api/axiosInstance';

export default function Login() {
  const testToolsEnabled = import.meta.env.VITE_SBMS_TEST_MODE === 'true';
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone');
  const [demoUsers, setDemoUsers] = useState([]);
  const [demoError, setDemoError] = useState('');
  const { user, sendOtp, verifyOtp, loading } = useAuth();
  const navigate = useNavigate();

  async function skipLoginForTesting() {
    let account = demoUsers.find((candidate) => candidate.role === 'client');
    if (!account) {
      try {
        const dump = await fetch('/data/sbms_dump.json').then((response) => {
          if (!response.ok) throw new Error('The local JSON dump is unavailable.');
          return response.json();
        });
        account = dump.users?.find((candidate) => candidate.role === 'client');
      } catch (error) {
        toast.error(error.message || 'No test account is available.');
        return;
      }
    }
    if (!account?.mobile) {
      toast.error('No test account is available.');
      return;
    }
    const sent = await sendOtp(account.mobile);
    if (!sent.success) {
      toast.error(sent.message);
      return;
    }
    const verified = await verifyOtp(account.mobile, '123456');
    if (!verified.success) {
      toast.error(verified.message);
      return;
    }
    toast.success('Signed in with the test account.');
    navigate('/', { replace: true });
  }

  useEffect(() => {
    api.get('/auth/demo-users')
      .then((response) => {
        const payload = response.data?.data;
        if (payload?.demoMode && Array.isArray(payload.users)) setDemoUsers(payload.users);
      })
      .catch(async () => {
        try {
          const dump = await fetch('/data/sbms_dump.json').then((response) => response.json());
          if (Array.isArray(dump.users)) setDemoUsers(dump.users);
          else setDemoError('Demo accounts are unavailable. You can still sign in normally.');
        } catch {
          setDemoError('Demo accounts are unavailable. You can still sign in normally.');
        }
      });
  }, []);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  async function submit(event) {
    event.preventDefault();
    const result = step === 'phone'
      ? await sendOtp(mobile.trim())
      : await verifyOtp(mobile.trim(), otp.trim());

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    if (step === 'phone') {
      setStep('otp');
      toast.success(result.message || 'Verification code sent.');
      return;
    }
    toast.success('You are signed in.');
    navigate('/', { replace: true });
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link className="auth-back" to="/">← Back to discovery</Link>
        <span className="brand-mark auth-mark">S</span>
        <span className="eyebrow">WELCOME TO SERVICEBOOK</span>
        <h1>{step === 'phone' ? 'Find and grow with local talent.' : 'Check your messages.'}</h1>
        <p>{step === 'phone'
          ? 'Sign in with your phone to manage bookings, share your work, or get started as a provider.'
          : `Enter the one-time verification code sent to ${mobile}.`}</p>
        <form className="form-stack auth-form" onSubmit={submit}>
          {step === 'phone' ? (
            <label>
              Mobile number
              <input
                type="tel"
                autoComplete="tel"
                placeholder="+251 9XX XXX XXX"
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                required
              />
            </label>
          ) : (
            <label>
              One-time code
              <input
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{4,8}"
                maxLength={8}
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                required
              />
            </label>
          )}
          <button className="button button-dark button-wide" disabled={loading}>
            {loading ? 'Please wait…' : step === 'phone' ? 'Send verification code' : 'Verify and sign in'}
          </button>
        </form>
        {demoUsers.length > 0 && <section className="demo-login-options" aria-label="Demo accounts">
          <strong>Try a demo role</strong>
          <p>Choose an account, then verify with the displayed demo code.</p>
          <div className="demo-login-list">
            {demoUsers.map((demoUser) => (
              <button key={demoUser.id} type="button" className="demo-login-option"
                onClick={() => { setMobile(demoUser.mobile); setOtp('123456'); setStep('otp'); }}>
                <span>{demoUser.fullname}<small>{demoUser.role.replaceAll('_', ' ')}</small></span>
                <span>{demoUser.mobile}</span>
              </button>
            ))}
          </div>
          <small>Demo verification code: <strong>123456</strong></small>
        </section>}
        {demoError && <p className="field-note">{demoError}</p>}
        {testToolsEnabled && <button type="button" className="text-button auth-resend" onClick={skipLoginForTesting}>Skip login for testing</button>}
        {step === 'otp' && <button className="text-button auth-resend" onClick={() => setStep('phone')}>Use a different phone number</button>}
        <div className="auth-privacy">Your phone number is kept private and is not shown to other users.</div>
      </div>
      <aside className="auth-aside">
        <span className="eyebrow">A BETTER WAY TO FIND HELP</span>
        <h2>Good work deserves to be found.</h2>
        <p>Discover trusted providers nearby, book a time that works, and meet with confidence.</p>
        <div className="auth-aside-stat"><strong>Discover</strong><span>Find skilled people close to you</span></div>
        <div className="auth-aside-stat"><strong>Book</strong><span>Choose your service and meeting mode</span></div>
        <div className="auth-aside-stat"><strong>Trust</strong><span>Verified profiles and consent-first work</span></div>
      </aside>
    </section>
  );
}
