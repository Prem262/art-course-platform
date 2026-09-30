'use client';

import { useState } from 'react';
import { saveLessonAction } from '@/app/admin/actions';
import { X, Video, AlertCircle } from 'lucide-react';

interface LessonFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  availableClasses: { id: string; title: string }[];
  defaultClassId?: string;
  lessonData?: {
    id?: string;
    class_id: string;
    title: string;
    description?: string | null;
    display_order: number;
    video_id?: string | null;
    video_provider?: string;
    duration_seconds: number;
    is_published: boolean;
  } | null;
}

export default function LessonFormModal({
  isOpen,
  onClose,
  onSuccess,
  availableClasses,
  defaultClassId,
  lessonData,
}: LessonFormModalProps) {
  const isEditing = !!lessonData?.id;

  const [classId, setClassId] = useState(
    lessonData?.class_id || defaultClassId || availableClasses[0]?.id || ''
  );
  const [title, setTitle] = useState(lessonData?.title || '');
  const [description, setDescription] = useState(lessonData?.description || '');
  const [videoId, setVideoId] = useState(lessonData?.video_id || '');
  const [durationMinutes, setDurationMinutes] = useState(
    Math.floor((lessonData?.duration_seconds || 1200) / 60)
  );
  const [durationSeconds, setDurationSeconds] = useState(
    (lessonData?.duration_seconds || 1200) % 60
  );
  const [displayOrder, setDisplayOrder] = useState<number>(lessonData?.display_order || 1);
  const [isPublished, setIsPublished] = useState<boolean>(lessonData?.is_published ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const totalSeconds = durationMinutes * 60 + durationSeconds;

      await saveLessonAction({
        id: lessonData?.id,
        class_id: classId,
        title: title.trim(),
        description: description.trim() || undefined,
        display_order: Number(displayOrder),
        video_id: videoId.trim() || undefined,
        video_provider: 'bunny',
        duration_seconds: totalSeconds,
        is_published: isPublished,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm shadow-xl p-6 sm:p-8 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-4">
          <div className="flex items-center space-x-2">
            <Video className="w-5 h-5 text-[#141413]" />
            <h3 className="font-serif text-xl font-medium text-[#141413]">
              {isEditing ? 'Edit Lesson' : 'Add New Studio Lesson'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#78716C] hover:text-[#141413] p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start space-x-2 p-3 bg-[#FAF0F0] border border-[#EAD0D0] text-[#8F2D2D] rounded text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Class Selector */}
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
              Target Class
            </label>
            <select
              required
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E7E2D8] rounded text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
            >
              {availableClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Title & Order */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                Lesson Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Working with Water"
                className="w-full px-3 py-2 bg-white border border-[#E7E2D8] rounded text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                Order #
              </label>
              <input
                type="number"
                min="1"
                required
                value={displayOrder}
                onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-white border border-[#E7E2D8] rounded text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
              Instruction Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of what the student will learn and observe..."
              className="w-full px-3 py-2 bg-white border border-[#E7E2D8] rounded text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>

          {/* Bunny Video Configuration */}
          <div className="p-3.5 bg-[#FAF8F5] border border-[#E7E2D8] rounded space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#141413]">
                Bunny.net Video Stream Configuration
              </span>
              <span className="text-[10px] font-mono text-[#78716C] uppercase">
                Provider: Bunny Stream
              </span>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] uppercase tracking-wider font-medium text-[#78716C]">
                Bunny Video ID (GUID)
              </label>
              <input
                type="text"
                value={videoId}
                onChange={(e) => setVideoId(e.target.value)}
                placeholder="e.g. b8f4321a-9876-4321-89ab-cdef01234567"
                className="w-full px-3 py-2 bg-white border border-[#E7E2D8] rounded text-xs sm:text-sm font-mono text-[#141413] focus:outline-none focus:border-[#141413]"
              />
              <p className="text-[10px] text-[#A6A29A]">
                Copy this directly from your Bunny.net Stream video details dashboard.
              </p>
            </div>
          </div>

          {/* Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min="0"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-[#E7E2D8] rounded text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                Duration (Seconds)
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={durationSeconds}
                onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white border border-[#E7E2D8] rounded text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>
          </div>

          {/* Published */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="is_published_lesson"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-[#141413] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="is_published_lesson" className="text-xs font-medium text-[#141413] cursor-pointer">
              Published (Visible to students)
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[#F0ECE5]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E7E2D8] text-xs uppercase tracking-wider font-medium rounded text-[#6E6B65] hover:bg-[#F3EFEA]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Lesson' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
