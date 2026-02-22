import React from 'react';

interface InputProps {
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}

export default function Input({ label, type, value, onChange, placeholder, required = true }: InputProps) {
  return (
    <div className="mb-5 group w-full">
      {/* Label: Responsive font sizing and improved tracking for brand style */}
      <label className="block text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-gray-500 mb-2 ml-1 group-focus-within:text-orange-600 transition-colors">
        {label} {required && <span className="text-orange-600">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          /* Fixes: 
             1. text-base (16px) prevents iOS auto-zoom on focus
             2. w-full ensures no overflow
             3. Transition to brand orange instead of generic blue
          */
          className="w-full px-4 py-4 sm:py-3.5 bg-gray-50 border-2 border-transparent rounded-xl sm:rounded-2xl 
                     text-base sm:text-sm font-bold text-black placeholder:text-gray-400 
                     focus:bg-white focus:border-black focus:ring-4 focus:ring-orange-500/10 
                     outline-none transition-all duration-300 appearance-none"
        />
      </div>
    </div>
  );
}