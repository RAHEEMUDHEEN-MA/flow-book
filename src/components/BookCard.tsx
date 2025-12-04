import { Link } from 'react-router-dom';
import { Book } from '../firebase/books';
import { Entry } from '../firebase/entries';

interface BookCardProps {
  book: Book;
  entries: Entry[];
}

export const BookCard = ({ book, entries }: BookCardProps) => {
  const income = entries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const expense = entries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const balance = income - expense;

  return (
    <Link
      to={`/book/${book.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{book.name}</h3>
        <span className="text-xs text-gray-500">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Income</span>
          <span className="text-sm font-medium text-green-600">
            +₹{income.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Expense</span>
          <span className="text-sm font-medium text-red-600">
            -₹{expense.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="pt-2 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-900">Balance</span>
            <span className={`text-lg font-bold ${
              balance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ₹{balance.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

