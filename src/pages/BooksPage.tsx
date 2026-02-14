import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { getBooksByUser, createBook, deleteBook, Book } from '../firebase/books';
import { getEntriesByBook, deleteEntriesByBook, Entry } from '../firebase/entries';
import { BookCard } from '../components/BookCard';
import { InstallPrompt } from '../components/InstallPrompt';
import { useTheme } from '../contexts/ThemeContext';

export const BooksPage = () => {
  const [user, loading] = useAuthState(auth);
  const [books, setBooks] = useState<Book[]>([]);
  const [entriesMap, setEntriesMap] = useState<Record<string, Entry[]>>({});
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBookName, setNewBookName] = useState('');
  const [creating, setCreating] = useState(false);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [deleteConfirm, setDeleteConfirm] = useState<{ bookId: string; bookName: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const profileMenuRef = useRef<HTMLDivElement>(null);
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

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

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

  const handleDeleteClick = (bookId: string, bookName: string) => {
    setDeleteConfirm({ bookId, bookName });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;

    setDeleting(true);
    try {
      // Delete all entries first
      await deleteEntriesByBook(deleteConfirm.bookId);
      // Then delete the book
      await deleteBook(deleteConfirm.bookId);
      setDeleteConfirm(null);
      await loadBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      alert('Failed to delete book');
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Failed to sign out');
    }
  };

  const sortedBooks = [...books].sort((a, b) => {
    const timeA = a.createdAt?.toMillis?.() || 0;
    const timeB = b.createdAt?.toMillis?.() || 0;
    return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
  });

  if (loading || loadingBooks) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Profile Avatar */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                )}
              </button>

              {/* Profile Menu Popover */}
              {showProfileMenu && (
                <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  </div>

                  {/* Dark Theme Toggle */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                        </svg>
                        <span className="text-sm text-gray-700 dark:text-gray-300">Dark Theme</span>
                      </div>
                      <button
                        onClick={toggleDarkMode}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          darkMode ? 'bg-primary-500' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            darkMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                  </div>

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Books</h1>
          </div>

          <div className="flex gap-2">
            {books.length > 0 && (
              <button
                onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                title={sortOrder === 'newest' ? 'Sorted: Newest First (click for Oldest First)' : 'Sorted: Oldest First (click for Newest First)'}
              >
                {sortOrder === 'newest' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700 dark:text-gray-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h7a1 1 0 100-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2h11a1 1 0 100-2H3zM3 7a1 1 0 000 2h5a1 1 0 000-2H3zM3 11a1 1 0 100 2h4a1 1 0 100-2H3zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium whitespace-nowrap"
            >
              + New
            </button>
          </div>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">No books yet. Create your first book to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sortedBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                entries={entriesMap[book.id] || []}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Book</h2>
            <form onSubmit={handleCreateBook}>
              <input
                type="text"
                value={newBookName}
                onChange={(e) => setNewBookName(e.target.value)}
                placeholder="Book name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-4"
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
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Book</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <span className="font-semibold">"{deleteConfirm.bookName}"</span>? 
              This will permanently delete the book and all its entries. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <InstallPrompt />
    </div>
  );
};

