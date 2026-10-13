import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn("flex items-center space-x-1.5 text-xs text-slate-400 overflow-x-auto py-2 scrollbar-none", className)}
    >
      <Link 
        to="/" 
        className="flex items-center text-slate-400 hover:text-white transition-colors shrink-0 p-1"
        title="Home"
      >
        <Home className="w-3.5 h-3.5" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
            {isLast || !item.href ? (
              <span className="font-bold text-slate-200 truncate shrink-0 max-w-[200px] sm:max-w-none">
                {item.icon && <span className="mr-1">{item.icon}</span>}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="hover:text-blue-400 transition-colors shrink-0 truncate max-w-[150px] sm:max-w-none flex items-center gap-1"
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
