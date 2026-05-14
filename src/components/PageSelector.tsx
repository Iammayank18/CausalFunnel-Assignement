import { ChevronDown, Globe } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface PageSelectorProps {
  urls: string[];
  selectedUrl: string;
  onSelect: (url: string) => void;
  className?: string;
}

export function PageSelector({ urls, selectedUrl, onSelect, className }: PageSelectorProps) {
  return (
    <div className={twMerge(clsx('relative w-full sm:w-72 md:w-96', className))}>
      <div className='absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400'>
        <Globe className='w-4 h-4' />
      </div>
      <select
        value={selectedUrl}
        onChange={(e) => onSelect(e.target.value)}
        className='w-full appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-10 pr-10 rounded-xl font-medium shadow-sm hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer transition-all truncate'>
        <option value='' disabled>
          Select a page to analyze...
        </option>
        {urls.map((url) => {
          let displayPath = url;
          try {
            const u = new URL(url);
            displayPath = u.pathname;
          } catch (e) {
            // Not a valid URL, fallback
          }
          return (
            <option key={url} value={url}>
              {displayPath === '/' ? '/ (Home)' : displayPath}
            </option>
          );
        })}
      </select>
      <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400'>
        <ChevronDown className='w-4 h-4' />
      </div>
    </div>
  );
}
