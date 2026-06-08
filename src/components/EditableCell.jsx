import { useState, useEffect, useRef } from "react";
import { formatPrecio } from "../utils.js";

export default function EditableCell({ value, onSave, className = "", placeholder = "—" }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commit = () => {
    const parsed = parseFloat(draft);
    const newValue = isNaN(parsed) ? 0 : parsed;
    if (newValue !== (value || 0)) {
      onSave(newValue);
    }
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(value ?? "");
    setIsEditing(false);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="number"
        step="0.01"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={onKeyDown}
        className={`w-full bg-white border border-blue-300 rounded px-2 py-1 text-right text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-200 ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className={`w-full text-right py-1 px-2 rounded hover:bg-blue-50 hover:ring-1 hover:ring-blue-200 transition-colors cursor-text ${
        value ? "text-gray-600" : "text-gray-300"
      } ${className}`}
      title="Click para editar"
    >
      {value ? formatPrecio(value) : placeholder}
    </button>
  );
}
