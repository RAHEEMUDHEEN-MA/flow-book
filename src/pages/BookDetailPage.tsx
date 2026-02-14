import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/config';
import { getBookById, Book } from '../firebase/books';
import { getEntriesByBook, Entry, deleteEntry } from '../firebase/entries';
import { getUserTags, UserTag } from '../firebase/tags';
import { FilterBar, FilterState } from '../components/FilterBar';
import { EntryCard } from '../components/EntryCard';
import { isAfter, isBefore, parseISO } from 'date-fns';

export const BookDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [tags, setTags] = useState<UserTag[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    tags: [],
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user && id) {
      loadData();
    }
  }, [user, id]);

  const loadData = async () => {
    if (!user || !id) return;

    setLoadingData(true);
    try {
      const [bookData, entriesData, tagsData] = await Promise.all([
        getBookById(id),
        getEntriesByBook(id),
        getUserTags(user.uid),
      ]);

      if (!bookData || bookData.ownerUid !== user.uid) {
        navigate('/');
        return;
      }

      setBook(bookData);
      setEntries(entriesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Type filter
      if (filters.type !== 'all' && entry.type !== filters.type) {
        return false;
      }

      // Tags filter
      if (filters.tags.length > 0) {
        const entryTags = entry.tags.map(t => t.toLowerCase());
        const hasMatchingTag = filters.tags.some(filterTag =>
          entryTags.includes(filterTag.toLowerCase())
        );
        if (!hasMatchingTag) return false;
      }

      // Date range filter
      const entryDate = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date as any);
      if (filters.dateFrom) {
        const fromDate = parseISO(filters.dateFrom);
        if (isBefore(entryDate, fromDate)) return false;
      }
      if (filters.dateTo) {
        const toDate = parseISO(filters.dateTo);
        if (isAfter(entryDate, toDate)) return false;
      }

      // Amount range filter
      if (filters.amountMin) {
        const min = parseFloat(filters.amountMin);
        if (entry.amount < min) return false;
      }
      if (filters.amountMax) {
        const max = parseFloat(filters.amountMax);
        if (entry.amount > max) return false;
      }

      return true;
    });
  }, [entries, filters]);

  const summary = useMemo(() => {
    const income = entries
      .filter(e => e.type === 'income')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const expense = entries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    return { income, expense, balance: income - expense };
  }, [entries]);

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      await deleteEntry(entryId);
      await loadData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Failed to delete entry');
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Book not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-24 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            ← Back to Books
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{book.name}</h1>
        </div>

        {/* Summary Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Income</p>
              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                +₹{summary.income.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expense</p>
              <p className="text-lg font-bold text-red-600 dark:text-red-400">
                -₹{summary.expense.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</p>
              <p className={`text-lg font-bold ${
                summary.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                ₹{summary.balance.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar tags={tags} onFilterChange={setFilters} />

        {/* Entries List */}
        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No entries found</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={handleDeleteEntry}
              />
            ))
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <Link
        to={`/book/${id}/add`}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-500 text-white rounded-full shadow-lg hover:bg-primary-600 transition-colors flex items-center justify-center text-2xl z-40"
        aria-label="Add entry"
      >
        +
      </Link>
    </div>
  );
};

