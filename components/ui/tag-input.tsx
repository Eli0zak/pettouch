import React, { useState, KeyboardEvent, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = 'Add a tag and press Enter',
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onChange([...tags, trimmedTag]);
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
      setInputValue('');
    } else if (e.key === 'Backspace' && !inputValue && tags.length) {
      // Remove last tag on backspace if input is empty
      removeTag(tags.length - 1);
    }
  };

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2 items-center border rounded-md px-3 py-2',
        disabled ? 'bg-muted/50 cursor-not-allowed' : 'bg-background',
      )}
      onClick={() => {
        if (!disabled && inputRef.current) {
          inputRef.current.focus();
        }
      }}
    >
      {tags.map((tag, index) => (
        <div
          key={tag}
          className="flex items-center bg-primary/20 text-primary rounded-full px-3 py-1 text-sm font-medium select-none"
        >
          <span>{tag}</span>
          {!disabled && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(index);
              }}
              className="ml-1 p-0.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label={`Remove tag ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      {!disabled && (
        <input
          ref={inputRef}
          type="text"
          className="flex-grow min-w-[120px] border-none focus:ring-0 focus:outline-none text-sm text-foreground placeholder:text-muted-foreground"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-label="Tag input"
        />
      )}
    </div>
  );
};
