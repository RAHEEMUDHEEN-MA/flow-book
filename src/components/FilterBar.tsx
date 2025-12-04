import { useState } from 'react';
import { UserTag } from '../firebase/tags';

export interface FilterState {
  type: 'all' | 'income' | 'expense';
  tags: string[];
  dateFrom: string;
  dateTo: string;
  amountMin: string;
  amountMax: string;
}

interface FilterBarProps {
  tags: UserTag[];
  onFilterChange: (filters: FilterState) => void;
}

export const FilterBar = ({ tags, onFilterChange }: FilterBarProps) => {
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    tags: [],
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleTagToggle = (tagName: string) => {
    const newTags = filters.tags.includes(tagName)
      ? filters.tags.filter(t => t !== tagName)
      : [...filters.tags, tagName];
    handleFilterChange('tags', newTags);
  };

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      type: 'all',
      tags: [],
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = 
    filters.type !== 'all' ||
    filters.tags.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.amountMin ||
    filters.amountMax;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-xs text-primary-600 hover:text-primary-700 font-medium"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="text-xs text-gray-600 hover:text-gray-700"
          >
            {showFilters ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {/* Quick filter buttons */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <button
          onClick={() => handleFilterChange('type', 'all')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filters.type === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange('type', 'income')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filters.type === 'income'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Income
        </button>
        <button
          onClick={() => handleFilterChange('type', 'expense')}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            filters.type === 'expense'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Expense
        </button>
      </div>

      {showFilters && (
        <div className="space-y-3 pt-3 border-t border-gray-200">
          {/* Tags */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => handleTagToggle(tag.name)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    filters.tags.includes(tag.name)
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                From
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                To
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Min Amount
              </label>
              <input
                type="number"
                value={filters.amountMin}
                onChange={(e) => handleFilterChange('amountMin', e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Max Amount
              </label>
              <input
                type="number"
                value={filters.amountMax}
                onChange={(e) => handleFilterChange('amountMax', e.target.value)}
                placeholder="∞"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

