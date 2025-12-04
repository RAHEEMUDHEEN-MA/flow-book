import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { getBooksByUser, createBook, Book } from '../firebase/books';
import { getEntriesByBook, Entry } from '../firebase/entries';
import { BookCard } from '../components/BookCard';
import { InstallPrompt } from '../components/InstallPrompt';

export const BooksPage = () => {
  const [user, loading] = useAuthState(auth);
  const [books, setBooks] = useState<Book[]>([]);
  const [entriesMap, setEntriesMap] = useState<Record<string, Entry[]>>({});
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadBooks();
    }
  }, [user]);

  const loadBooks = async () => {
    if (!user) return;
    
    setLoadingBooks(true);
    try {
      const userBooks = await getBooksByUser(user.uid);
      setBooks(userBooks);
      
      // Load entries for each book
      const entries: Record<string, Entry[]> = {};
      for (const book of userBooks) {
        entries[book.id] = await getEntriesByBook(book.id);
      }
      setEntriesMap(entries);
    } catch (error) {
      console.error('Error loading books:', error);
    } finally {
      setLoadingBooks(false);
    }
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newBookName.trim()) return;

    setCreating(true);
    try {
      await createBook(newBookName.trim(), user.uid);
      setNewBookName('');
      setShowAddModal(false);
      await loadBooks();
    } catch (error) {
      console.error('Error creating book:', error);
      alert('Failed to create book');
    } finally {
      setCreating(false);
    }
  };

  if (loading || loadingBooks) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Books</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            + New Book
          </button>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No books yet. Create your first book to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                entries={entriesMap[book.id] || []}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Book</h2>
            <form onSubmit={handleCreateBook}>
              <input
                type="text"
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                placeholder="Book name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-4"
                autoFocus
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewBookName('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newBookName.trim()}
                  className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <InstallPrompt />
    </div>
  );
};

