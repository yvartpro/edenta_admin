import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// eslint-disable-next-line react-refresh/only-export-components
export const classNames = (...inputs) => twMerge(clsx(inputs));

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
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
    {action && onAction && (
      <button
        onClick={onAction}
        className="px-4 py-2 bg-pink-600 text-white text-sm font-medium rounded-md hover:bg-pink-700 transition-colors"
      >
        {action}
      </button>
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
