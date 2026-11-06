import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const { user, loading, signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', role: 'student', teamName: '', password: '', confirmPassword: '', inviteCode: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && user) return <Navigate to="/" replace />;
  const isTeamRole = form.role === 'vendor' || form.role === 'organizer';

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('The passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await signUp({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        teamName: form.teamName,
        inviteCode: form.inviteCode,
      });
      navigate('/', { replace: true });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <section className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-700">Campus Market</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="mt-2 text-sm text-gray-600">Students, vendors, and event organizers each get their own workspace.</p>
        </div>

        {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="register-name" className="mb-1 block text-sm font-medium text-gray-800">Full name</label>
            <input id="register-name" autoComplete="name" required minLength={2} maxLength={80} value={form.name} onChange={update('name')} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="register-email" className="mb-1 block text-sm font-medium text-gray-800">Email</label>
            <input id="register-email" type="email" autoComplete="email" required value={form.email} onChange={update('email')} className="input-field" />
            <p className="mt-1 text-xs text-gray-500">Use your campus email if your school requires one.</p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="register-role" className="mb-1 block text-sm font-medium text-gray-800">Account type</label>
            <select id="register-role" value={form.role} onChange={update('role')} className="input-field">
              <option value="student">Student buyer</option>
              <option value="vendor">Student vendor / project team</option>
              <option value="organizer">Event organizer</option>
              <option value="moderator">Marketplace moderator</option>
            </select>
          </div>
          {isTeamRole && (
            <div className="sm:col-span-2">
              <label htmlFor="register-team" className="mb-1 block text-sm font-medium text-gray-800">Vendor, class, or project team</label>
              <input id="register-team" required minLength={2} maxLength={100} value={form.teamName} onChange={update('teamName')} className="input-field" />
            </div>
          )}
          {form.role === 'moderator' && (
            <div className="sm:col-span-2">
              <label htmlFor="register-invite" className="mb-1 block text-sm font-medium text-gray-800">Staff invite code</label>
              <input id="register-invite" type="password" autoComplete="off" required value={form.inviteCode} onChange={update('inviteCode')} className="input-field" />
              <p className="mt-1 text-xs text-gray-500">Moderators must be invited by the marketplace administrator.</p>
            </div>
          )}
          <div>
            <label htmlFor="register-password" className="mb-1 block text-sm font-medium text-gray-800">Password</label>
            <input id="register-password" type="password" autoComplete="new-password" required minLength={10} maxLength={128} value={form.password} onChange={update('password')} className="input-field" />
            <p className="mt-1 text-xs text-gray-500">At least 10 characters.</p>
          </div>
          <div>
            <label htmlFor="register-confirm" className="mb-1 block text-sm font-medium text-gray-800">Confirm password</label>
            <input id="register-confirm" type="password" autoComplete="new-password" required minLength={10} maxLength={128} value={form.confirmPassword} onChange={update('confirmPassword')} className="input-field" />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" disabled={submitting} className="btn-primary w-full disabled:cursor-wait disabled:opacity-60">
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </div>
        </form>
        <p className="mt-5 text-center text-sm text-gray-600">
          Already registered? <Link className="font-semibold text-primary-700 hover:underline" to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
};

export default RegisterPage;
