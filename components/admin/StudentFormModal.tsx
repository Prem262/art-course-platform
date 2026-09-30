'use client';

import { useState } from 'react';
import { createStudentAction } from '@/app/admin/actions';
import { X, UserPlus, AlertCircle, Check } from 'lucide-react';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableClasses: { id: string; title: string }[];
  onSuccess: () => void;
}

export default function StudentFormModal({
  isOpen,
  onClose,
  availableClasses,
  onSuccess,
}: StudentFormModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdResult, setCreatedResult] = useState<{
    email: string;
    temporaryPassword?: string;
  } | null>(null);

  if (!isOpen) return null;

  function toggleClass(id: string) {
    if (selectedClassIds.includes(id)) {
      setSelectedClassIds(selectedClassIds.filter((c) => c !== id));
    } else {
      setSelectedClassIds([...selectedClassIds, id]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await createStudentAction({
        fullName: fullName.trim(),
        email: email.trim(),
        password: password.trim() || undefined,
        classIds: selectedClassIds,
      });

      setCreatedResult({
        email: res.email,
        temporaryPassword: res.temporaryPassword,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create student account');
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    setFullName('');
    setEmail('');
    setPassword('');
    setSelectedClassIds([]);
    setError(null);
    setCreatedResult(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm shadow-xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-4">
          <div className="flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-[#141413]" />
            <h3 className="font-serif text-xl font-medium text-[#141413]">
              {createdResult ? 'Student Account Created' : 'Create New Student'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-[#78716C] hover:text-[#141413] p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdResult ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#F1F6F3] border border-[#CEE0D4] rounded text-xs text-[#2A4E39] space-y-2">
              <p className="font-semibold text-sm">Student successfully registered in Supabase Auth!</p>
              <p>Email: <span className="font-mono font-medium text-[#141413]">{createdResult.email}</span></p>
              <p>
                Generated Password: <span className="font-mono font-bold text-[#141413] px-2 py-0.5 bg-white rounded border border-[#CEE0D4]">{createdResult.temporaryPassword}</span>
              </p>
            </div>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Please share these credentials securely with the student. They will be able to log in immediately and access their assigned classes.
            </p>
            <div className="pt-2">
              <button
                onClick={handleClose}
                className="w-full py-2.5 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black"
              >
                Close & Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start space-x-2 p-3 bg-[#FAF0F0] border border-[#EAD0D0] text-[#8F2D2D] rounded text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="w-full px-3.5 py-2 bg-white border border-[#E7E2D8] rounded text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2 bg-white border border-[#E7E2D8] rounded text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                Initial Password (Optional)
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to auto-generate a secure password"
                className="w-full px-3.5 py-2 bg-white border border-[#E7E2D8] rounded text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            {/* Initial Class Access Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-[#F0ECE5]">
              <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                Assign Initial Classes
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {availableClasses.map((cls) => {
                  const isChecked = selectedClassIds.includes(cls.id);
                  return (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => toggleClass(cls.id)}
                      className={`flex items-center space-x-2.5 p-2.5 rounded border text-left text-xs transition-colors ${
                        isChecked
                          ? 'bg-[#F1F6F3] border-[#2A4E39] text-[#2A4E39] font-medium'
                          : 'bg-[#FAF8F5] border-[#E7E2D8] text-[#6E6B65] hover:bg-[#F3EFEA]'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                          isChecked
                            ? 'bg-[#2A4E39] border-[#2A4E39] text-white'
                            : 'border-[#D9D4CA] bg-white'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span className="truncate">{cls.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-[#E7E2D8] text-xs uppercase tracking-wider font-medium rounded text-[#6E6B65] hover:bg-[#F3EFEA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
