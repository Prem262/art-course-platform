'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, ClassWithProgress } from '@/types/database';
import { User, Mail, Shield, CheckCircle2, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ProfileClientProps {
  initialProfile: Profile;
  assignedClasses: ClassWithProgress[];
}

export default function ProfileClient({ initialProfile, assignedClasses }: ProfileClientProps) {
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [updatingName, setUpdatingName] = useState(false);
  const [nameMessage, setNameMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Handle Name update
  async function handleUpdateName(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return;

    setUpdatingName(true);
    setNameMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName.trim() })
        .eq('id', initialProfile.id);

      if (error) throw error;

      setNameMessage({ type: 'success', text: 'Display name updated successfully.' });
    } catch (err: any) {
      setNameMessage({ type: 'error', text: err.message || 'Failed to update name.' });
    } finally {
      setUpdatingName(false);
    }
  }

  // Handle Password update
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (password !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setUpdatingPassword(true);
    setPasswordMessage(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setPasswordMessage({ type: 'success', text: 'Password updated successfully.' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setUpdatingPassword(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-[#E7E2D8] pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest text-[#78716C] font-mono">
          Account Settings
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl text-[#141413] font-medium tracking-tight">
          Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#6E6B65]">
          Manage your personal details and view your studio enrollments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Personal Information Form */}
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-6 shadow-subtle space-y-6">
            <h2 className="font-serif text-xl font-medium text-[#141413]">
              Personal Information
            </h2>

            {nameMessage && (
              <div
                className={`p-3 text-xs rounded border ${
                  nameMessage.type === 'success'
                    ? 'bg-[#F1F6F3] text-[#2A4E39] border-[#CEE0D4]'
                    : 'bg-[#FAF0F0] text-[#8F2D2D] border-[#EAD0D0]'
                }`}
              >
                {nameMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E7E2D8] rounded text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                  <User className="absolute right-3.5 top-3 w-4 h-4 text-[#A6A29A]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-medium text-[#78716C]">
                  Email Address (Studio Account)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={initialProfile.email}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#E7E2D8] rounded text-sm text-[#78716C] cursor-not-allowed"
                  />
                  <Mail className="absolute right-3.5 top-3 w-4 h-4 text-[#A6A29A]" />
                </div>
                <p className="text-[11px] text-[#A6A29A]">Email address is managed by studio administrators.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-medium text-[#78716C]">
                  Account Role
                </label>
                <div className="flex items-center space-x-2 text-xs font-mono uppercase bg-[#FAF8F5] border border-[#E7E2D8] px-3.5 py-2 rounded text-[#141413]">
                  <Shield className="w-3.5 h-3.5 text-[#2A4E39]" />
                  <span>{initialProfile.role}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingName}
                className="w-full px-4 py-2.5 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black transition-colors disabled:opacity-50"
              >
                {updatingName ? 'Saving...' : 'Update Name'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-6 shadow-subtle space-y-6">
            <h2 className="font-serif text-xl font-medium text-[#141413]">
              Security & Password
            </h2>

            {passwordMessage && (
              <div
                className={`p-3 text-xs rounded border ${
                  passwordMessage.type === 'success'
                    ? 'bg-[#F1F6F3] text-[#2A4E39] border-[#CEE0D4]'
                    : 'bg-[#FAF0F0] text-[#8F2D2D] border-[#EAD0D0]'
                }`}
              >
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E7E2D8] rounded text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                  <Lock className="absolute right-3.5 top-3 w-4 h-4 text-[#A6A29A]" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E7E2D8] rounded text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
                  />
                  <Lock className="absolute right-3.5 top-3 w-4 h-4 text-[#A6A29A]" />
                </div>
              </div>

              <button
                type="submit"
                disabled={updatingPassword}
                className="w-full px-4 py-2.5 bg-[#FAF8F5] border border-[#E7E2D8] hover:bg-[#F3EFEA] text-[#141413] text-xs uppercase tracking-wider font-medium rounded transition-colors disabled:opacity-50"
              >
                {updatingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Assigned Classes Overview */}
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm p-6 shadow-subtle space-y-5">
            <div>
              <h2 className="font-serif text-xl font-medium text-[#141413]">
                Assigned Classes
              </h2>
              <p className="text-xs text-[#78716C] mt-1">
                Your currently active studio course privileges
              </p>
            </div>

            {assignedClasses.length === 0 ? (
              <p className="text-xs text-[#78716C] italic p-4 bg-[#FAF8F5] rounded border border-[#E7E2D8]">
                No classes have been assigned to your account yet.
              </p>
            ) : (
              <div className="space-y-3">
                {assignedClasses.map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/classes/${cls.slug}`}
                    className="group block p-4 rounded border border-[#E7E2D8] hover:border-[#D9D4CA] hover:bg-[#FAF8F5]/60 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-serif text-base text-[#141413] group-hover:text-[#2A4E39] font-medium">
                        {cls.title}
                      </h4>
                      <span className="font-mono text-xs text-[#78716C]">
                        {cls.progress_percentage}%
                      </span>
                    </div>

                    <div className="w-full h-1 bg-[#F3EFEA] rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-[#141413] rounded-full"
                        style={{ width: `${cls.progress_percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#78716C]">
                      <span>{cls.completed_lessons} of {cls.total_lessons} lessons completed</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
