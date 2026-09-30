'use client';

import { useState } from 'react';
import { saveClassAction } from '@/app/admin/actions';
import { X, GraduationCap, AlertCircle } from 'lucide-react';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  classData?: {
    id?: string;
    title: string;
    slug: string;
    description: string;
    short_description: string;
    cover_image_url?: string | null;
    display_order: number;
    is_published: boolean;
  } | null;
}

export default function ClassFormModal({
  isOpen,
  onClose,
  onSuccess,
  classData,
}: ClassFormModalProps) {
  const isEditing = !!classData?.id;

  const [title, setTitle] = useState(classData?.title || '');
  const [slug, setSlug] = useState(classData?.slug || '');
  const [shortDescription, setShortDescription] = useState(classData?.short_description || '');
  const [description, setDescription] = useState(classData?.description || '');
  const [coverImageUrl, setCoverImageUrl] = useState(classData?.cover_image_url || '');
  const [displayOrder, setDisplayOrder] = useState<number>(classData?.display_order || 1);
  const [isPublished, setIsPublished] = useState<boolean>(classData?.is_published ?? true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Auto-generate slug when creating
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && (!slug || slug === title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await saveClassAction({
        id: classData?.id,
        title: title.trim(),
        slug: slug.trim(),
        short_description: shortDescription.trim(),
        description: description.trim(),
        cover_image_url: coverImageUrl.trim() || undefined,
        display_order: Number(displayOrder),
        is_published: isPublished,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save class');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#FFFFFF] border border-[#E7E2D8] rounded-sm shadow-xl p-6 sm:p-8 space-y-6 my-8">
        <div className="flex items-center justify-between border-b border-[#F0ECE5] pb-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5 text-[#141413]" />
            <h3 className="font-serif text-xl font-medium text-[#141413]">
              {isEditing ? 'Edit Class Details' : 'Create New Studio Class'}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                Class Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="e.g. Painting"
                className="w-full px-3 py-2 bg-white border border-[#E7E2D8] rounded text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                URL Slug
              </label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. painting"
                className="w-full px-3 py-2 bg-white border border-[#E7E2D8] rounded text-xs sm:text-sm font-mono text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
              Short Description (Card Summary)
            </label>
            <input
              type="text"
              required
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="e.g. Explore colour, water and expressive painting through guided practice."
              className="w-full px-3 py-2 bg-white border border-[#E7E2D8] rounded text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
              Full Description
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the course content, techniques, and materials..."
              className="w-full px-3 py-2 bg-white border border-[#E7E2D8] rounded text-xs sm:text-sm text-[#141413] focus:outline-none focus:border-[#141413]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                Cover Image URL
              </label>
              <input
                type="text"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="/images/painting.jpg"
                className="w-full px-3 py-2 bg-white border border-[#E7E2D8] rounded text-xs sm:text-sm font-mono text-[#141413] focus:outline-none focus:border-[#141413]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs uppercase tracking-wider font-medium text-[#141413]">
                Display Order
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

          {/* Published Toggle */}
          <div className="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="is_published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 rounded text-[#141413] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="is_published" className="text-xs font-medium text-[#141413] cursor-pointer">
              Published (Visible to enrolled students)
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
              {loading ? 'Saving...' : isEditing ? 'Update Class' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
