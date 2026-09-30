'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PlusCircle, Edit3, Trash2, Video, Eye, EyeOff, Film } from 'lucide-react';
import LessonFormModal from './LessonFormModal';
import { deleteLessonAction, togglePublishLessonAction } from '@/app/admin/actions';

interface LessonsListClientProps {
  initialClasses: any[];
  allLessons: any[];
  defaultClassId?: string;
}

export default function LessonsListClient({
  initialClasses,
  allLessons,
  defaultClassId,
}: LessonsListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClassId = searchParams.get('classId') || defaultClassId || initialClasses[0]?.id || '';

  const [selectedClassId, setSelectedClassId] = useState<string>(queryClassId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter lessons belonging to the selected class
  const displayedLessons = allLessons
    .filter((l) => l.class_id === selectedClassId)
    .sort((a, b) => a.display_order - b.display_order);

  const currentClass = initialClasses.find((c) => c.id === selectedClassId);

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLesson(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (lessonId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete lesson "${title}"?`)) {
      return;
    }

    setDeletingId(lessonId);
    try {
      await deleteLessonAction(lessonId);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete lesson');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (lessonId: string, currentStatus: boolean) => {
    try {
      await togglePublishLessonAction(lessonId, !currentStatus);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update publishing state');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E2D8] pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#78716C]">
            Content
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#141413] tracking-tight mt-1">
            Lesson Management
          </h1>
          <p className="text-xs text-[#6E6B65] mt-1">
            Associate Bunny.net video streams, arrange ordering, and curate instructional steps.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black transition-colors shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Lesson</span>
        </button>
      </div>

      {/* Class Switcher Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 border-b border-[#E7E2D8]">
        {initialClasses.map((cls) => {
          const isActive = cls.id === selectedClassId;
          return (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-4 py-2 rounded-sm text-xs font-medium uppercase tracking-wider whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-[#141413] text-white'
                  : 'bg-[#FFFFFF] border border-[#E7E2D8] text-[#6E6B65] hover:bg-[#F3EFEA]'
              }`}
            >
              {cls.title}
            </button>
          );
        })}
      </div>

      {/* Class Meta Banner */}
      {currentClass && (
        <div className="p-4 bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm flex items-center justify-between text-xs shadow-subtle">
          <div>
            <span className="font-serif font-semibold text-sm text-[#141413]">
              {currentClass.title}
            </span>
            <span className="text-[#78716C] ml-3">
              Total Lessons: {displayedLessons.length}
            </span>
          </div>
          <span className="font-mono text-[#A6A29A]">slug: {currentClass.slug}</span>
        </div>
      )}

      {/* Lessons Table */}
      <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm shadow-subtle overflow-hidden">
        {displayedLessons.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#78716C] space-y-2">
            <p className="font-serif text-base text-[#141413]">No lessons in this class</p>
            <p>Click "Add Lesson" above to attach your first video lesson.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7E2D8] bg-[#FAF8F5] text-[#78716C] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 sm:px-6">Order</th>
                  <th className="py-3 px-4">Title & Description</th>
                  <th className="py-3 px-4">Bunny Video ID</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE5]">
                {displayedLessons.map((lesson) => (
                  <tr key={lesson.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono text-[#78716C] font-semibold">
                      {lesson.display_order.toString().padStart(2, '0')} /
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-[#141413] text-sm">
                          {lesson.title}
                        </p>
                        {lesson.description && (
                          <p className="text-[11px] text-[#78716C] line-clamp-1 max-w-sm">
                            {lesson.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] text-[#78716C]">
                      {lesson.video_id ? (
                        <div className="flex items-center space-x-1.5">
                          <Film className="w-3.5 h-3.5 text-[#2A4E39]" />
                          <span className="truncate max-w-[140px]">{lesson.video_id}</span>
                        </div>
                      ) : (
                        <span className="text-[#A6A29A] italic">Not set</span>
                      )}
                    </td>

                    <td className="py-4 px-4 font-mono text-[#78716C]">
                      {formatDuration(lesson.duration_seconds)}
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleTogglePublish(lesson.id, lesson.is_published)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                          lesson.is_published
                            ? 'bg-[#F1F6F3] text-[#2A4E39] border border-[#CEE0D4]'
                            : 'bg-[#FAF8F5] text-[#A6A29A] border border-[#E7E2D8]'
                        }`}
                      >
                        {lesson.is_published ? (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Published</span>
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Draft</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <div className="inline-flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(lesson)}
                          className="p-1.5 text-[#78716C] hover:text-[#141413] rounded hover:bg-[#F3EFEA]"
                          title="Edit Lesson"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id, lesson.title)}
                          disabled={deletingId === lesson.id}
                          className="p-1.5 text-[#8F2D2D] hover:text-black rounded hover:bg-[#FAF0F0]"
                          title="Delete Lesson"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LessonFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableClasses={initialClasses}
        defaultClassId={selectedClassId}
        lessonData={editingLesson}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
