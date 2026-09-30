'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PlusCircle, Edit3, Trash2, Video, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import ClassFormModal from './ClassFormModal';
import { deleteClassAction, togglePublishClassAction } from '@/app/admin/actions';

interface ClassesListClientProps {
  initialClasses: any[];
}

export default function ClassesListClient({ initialClasses }: ClassesListClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleEdit = (cls: any) => {
    setEditingClass(cls);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (classId: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete the class "${title}" and all its lessons?`)) {
      return;
    }

    setDeletingId(classId);
    try {
      await deleteClassAction(classId);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete class');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (classId: string, currentStatus: boolean) => {
    try {
      await togglePublishClassAction(classId, !currentStatus);
      router.refresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update publishing state');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7E2D8] pb-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#78716C]">
            Curriculum
          </span>
          <h1 className="font-serif text-3xl font-medium text-[#141413] tracking-tight mt-1">
            Studio Classes
          </h1>
          <p className="text-xs text-[#6E6B65] mt-1">
            Organize course categories, order sequences, and attach syllabus lessons.
          </p>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#141413] text-white text-xs uppercase tracking-wider font-medium rounded hover:bg-black transition-colors shrink-0"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Class</span>
        </button>
      </div>

      {/* Classes Table */}
      <div className="bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm shadow-subtle overflow-hidden">
        {initialClasses.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#78716C] space-y-2">
            <p className="font-serif text-base text-[#141413]">No classes created yet</p>
            <p>Click "New Class" to establish your first studio learning course.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#E7E2D8] bg-[#FAF8F5] text-[#78716C] uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 sm:px-6">Order</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Lessons</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0ECE5]">
                {initialClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono text-[#78716C] font-semibold">
                      {cls.display_order.toString().padStart(2, '0')} /
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-9 rounded overflow-hidden bg-[#F3EFEA] shrink-0 border border-[#E7E2D8]">
                          {cls.cover_image_url ? (
                            <Image
                              src={cls.cover_image_url}
                              alt={cls.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-serif text-xs text-[#78716C]">
                              Art
                            </div>
                          )}
                        </div>

                        <div>
                          <p className="font-medium text-[#141413] text-sm">
                            {cls.title}
                          </p>
                          <p className="text-[11px] text-[#78716C] line-clamp-1 max-w-xs">
                            {cls.short_description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono text-[11px] text-[#78716C]">
                      {cls.slug}
                    </td>

                    <td className="py-4 px-4">
                      <Link
                        href={`/admin/lessons?classId=${cls.id}`}
                        className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-[#FAF8F5] border border-[#E7E2D8] hover:border-[#D9D4CA] rounded text-[11px] font-medium text-[#141413]"
                      >
                        <Video className="w-3 h-3 text-[#78716C]" />
                        <span>{cls.lessons_count} Lessons</span>
                      </Link>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleTogglePublish(cls.id, cls.is_published)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors ${
                          cls.is_published
                            ? 'bg-[#F1F6F3] text-[#2A4E39] border border-[#CEE0D4]'
                            : 'bg-[#FAF8F5] text-[#A6A29A] border border-[#E7E2D8]'
                        }`}
                      >
                        {cls.is_published ? (
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
                          onClick={() => handleEdit(cls)}
                          className="p-1.5 text-[#78716C] hover:text-[#141413] rounded hover:bg-[#F3EFEA]"
                          title="Edit Class Details"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cls.id, cls.title)}
                          disabled={deletingId === cls.id}
                          className="p-1.5 text-[#8F2D2D] hover:text-black rounded hover:bg-[#FAF0F0]"
                          title="Delete Class"
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

      <ClassFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classData={editingClass}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
