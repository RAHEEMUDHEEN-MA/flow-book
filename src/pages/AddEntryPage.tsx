import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { createEntry, EntryInput } from '../firebase/entries';
import { getUserTags, UserTag } from '../firebase/tags';
import { TagInput } from '../components/TagInput';
import { uploadAttachment } from '../firebase/storage';

export const AddEntryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [tags, setTags] = useState<UserTag[]>([]);
  const [loadingTags, setLoadingTags] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<EntryInput>({
    bookId: id || '',
    ownerUid: user?.uid || '',
    type: 'expense',
    amount: 0,
    date: new Date(),
    description: '',
    tags: [],
  });

  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    } else if (user) {
      setFormData(prev => ({ ...prev, ownerUid: user.uid }));
      loadTags();
    }
  }, [user, loading, navigate]);

  const loadTags = async () => {
    if (!user) return;
    setLoadingTags(true);
    try {
      const userTags = await getUserTags(user.uid);
      setTags(userTags);
    } catch (error) {
      console.error('Error loading tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id || formData.amount <= 0) return;

    setSaving(true);
    try {
      let attachmentUrl: string | undefined = undefined;

      // Upload attachment if provided
      if (attachmentFile) {
        const tempEntryId = `temp-${Date.now()}`;
        attachmentUrl = await uploadAttachment(attachmentFile, user.uid, tempEntryId);
      }

      // Prepare entry data
      const entryToCreate: EntryInput = {
        ...formData,
        bookId: id,
      };

      // Only add attachmentUrl if it exists
      if (attachmentUrl) {
        entryToCreate.attachmentUrl = attachmentUrl;
      }

      await createEntry(entryToCreate);

      navigate(`/book/${id}`);
    } catch (error) {
      console.error('Error creating entry:', error);
      alert('Failed to create entry');
    } finally {
      setSaving(false);
    }
  };

  if (loading || loadingTags) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <Link
            to={`/book/${id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add Entry</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  formData.type === 'income'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  formData.type === 'expense'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Expense
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.amount || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={formData.date.toISOString().split('T')[0]}
              onChange={(e) => setFormData(prev => ({ ...prev, date: new Date(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="Add a description..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <TagInput
              tags={formData.tags}
              suggestions={tags}
              onChange={(newTags) => setFormData(prev => ({ ...prev, tags: newTags }))}
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachment (optional)
            </label>
            <input
              type="file"
              onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              accept="image/*,.pdf"
            />
            {attachmentFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {attachmentFile.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Link
              to={`/book/${id}`}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || formData.amount <= 0}
              className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {saving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

