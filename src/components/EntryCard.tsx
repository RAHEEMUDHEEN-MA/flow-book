import { Entry } from '../firebase/entries';
import { format } from 'date-fns';

interface EntryCardProps {
  entry: Entry;
  onEdit?: (entry: Entry) => void;
  onDelete?: (entryId: string) => void;
}

export const EntryCard = ({ entry, onEdit, onDelete }: EntryCardProps) => {
  const date = entry.date?.toDate ? entry.date.toDate() : new Date(entry.date as any);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xl font-bold ${
              entry.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toLocaleString('en-IN')}
            </span>
          </div>
          {entry.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{entry.description}</p>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{format(date, 'MMM dd, yyyy h:mm a')}</span>
            {entry.tags && entry.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex flex-wrap gap-1">
                  {entry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        {(onEdit || onDelete) && (
          <div className="flex gap-2 ml-2">
            {onEdit && (
              <button
                onClick={() => onEdit(entry)}
                className="text-gray-400 hover:text-primary-600 transition-colors"
                aria-label="Edit entry"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(entry.id)}
                className="text-gray-400 hover:text-red-600 transition-colors"
                aria-label="Delete entry"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
      {entry.attachmentUrl && (
        <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
          <a
            href={entry.attachmentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
          >
            📎 View attachment
          </a>
        </div>
      )}
    </div>
  );
};

