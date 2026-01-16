import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

// eslint-disable-next-line react-refresh/only-export-components
export const classNames = (...inputs) => twMerge(clsx(inputs));

export const EdentaButton = ({ children, icon: Icon, onClick, loading, disabled, className, variant = "primary", type = "button", mobileIconOnly = false }) => {
  const isIconOnly = !children;
  // If no children, use p-2. If mobileIconOnly, use p-2 on mobile and px-4 on desktop. Else px-4.
  const padding = isIconOnly ? "p-2" : mobileIconOnly ? "p-2 lg:px-4 lg:py-2" : "px-4 py-2";

  const baseStyles = `rounded-md font-medium transition-colors flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed ${padding}`;
  const variants = {
    primary: "bg-pink-600 text-white hover:bg-pink-700 border border-transparent shadow-sm",
    secondary: "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm",
    danger: "bg-red-600 text-white hover:bg-red-700 border border-transparent shadow-sm",
    ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
    outline: "border-2 border-pink-600 text-pink-600 hover:bg-pink-50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={classNames(baseStyles, variants[variant] || variants.primary, className)}
    >
      {loading ? <ButtonLoadingSpinner /> : Icon && <Icon size={18} />}
      {children && (
        <span className={mobileIconOnly ? "hidden lg:inline" : ""}>
          {children}
        </span>
      )}
    </button>
  );
};

export const Card = ({ children, className }) =>
  <div className={classNames("bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6", className)}>
    {children}
  </div>

export const LoadingSpinner = ({ txt }) =>
  <div className="text-center py-12">
    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
    <p className="text-gray-500 mt-4">Loading {txt} ...</p>
  </div>

export const ButtonLoadingSpinner = () => <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>

export const Header = ({ title, action, onAction }) =>
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-xl font-bold text-gray-900 break-words line-clamp-3">{title}</h2>
    {action && onAction && (
      <EdentaButton onClick={onAction}>
        {action}
      </EdentaButton>
    )}
  </div>

export const Input = ({ label, value, onChange, placeholder, type = "text", className }) =>
  <div className={classNames("mb-4", className)}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 border"
    />
  </div>

export const Textarea = ({ label, value, onChange, placeholder, rows = 3 }) =>
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <textarea
      rows={rows}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 border"
    />
  </div>

export const Select = ({ label, value, options, onChange }) =>
  <div className="mb-4">
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm p-2.5 border"
    >
      <option value="">Select...</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>

export const IconBtn = ({ children, onClick, className }) =>
  <button
    onClick={onClick}
    className={classNames("p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500", className)}
  >
    {children}
  </button>

export const BlockBar = ({ onAdd }) => {
  const blocks = [
    { type: "text", label: "Text" },
    { type: "image", label: "Image" },
    { type: "gallery", label: "Gallery" }
  ];

  return (
    <div className="flex gap-2 p-2 bg-gray-50 rounded-lg justify-center border border-dashed border-gray-300 mt-4">
      <span className="text-xs font-medium text-gray-400 self-center mr-2">ADD BLOCK:</span>
      {blocks.map((b) => (
        <button
          key={b.type}
          onClick={() => onAdd(b.type)}
          className="px-3 py-1 bg-white border border-gray-200 text-xs font-semibold text-gray-700 rounded-md hover:border-pink-300 hover:text-pink-600 shadow-sm transition-all"
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel", isDanger = true, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2 break-words line-clamp-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <EdentaButton
            onClick={onClose}
            variant="secondary"
            disabled={loading}
          >
            {cancelText}
          </EdentaButton>
          <EdentaButton
            onClick={onConfirm}
            variant={isDanger ? "danger" : "primary"}
            loading={loading}
          >
            {confirmText}
          </EdentaButton>
        </div>
      </div>
    </div>
  );
};

export const SearchInput = ({ value, onChange, placeholder = "Search...", className }) => {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [localValue, onChange, value]);

  return (
    <div className={classNames("relative", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 bg-white outline-none transition-all"
        placeholder={placeholder}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    </div>
  );
};

export const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, start + maxVisiblePages - 1);

      if (end === totalPages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }

      for (let i = start; i <= end; i++) pages.push(i);
    }
    return pages;
  };

  return (
    <div className={classNames("flex items-center justify-center gap-2 mt-8", className)}>
      <EdentaButton
        variant="secondary"
        className="p-2 min-w-0"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={18} />
      </EdentaButton>

      <div className="flex gap-1">
        {getPages().map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={classNames(
              "w-10 h-10 rounded-md font-medium transition-all text-sm",
              currentPage === page
                ? "bg-pink-600 text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-600 hover:border-pink-300 hover:text-pink-600"
            )}
          >
            {page}
          </button>
        ))}
      </div>

      <EdentaButton
        variant="secondary"
        className="p-2 min-w-0"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight size={18} />
      </EdentaButton>
    </div>
  );
};
