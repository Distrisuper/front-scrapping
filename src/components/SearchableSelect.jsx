import { useState, useRef, useEffect, useMemo } from "react";
import { normalizar } from "../utils.js";

export default function SearchableSelect({ label, placeholder, value, options, onChange }) {
  const [inputText, setInputText] = useState(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    setInputText(value || "");
  }, [value]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setInputText(value || "");
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [value]);

  const filtered = useMemo(() => {
    const showAll = !inputText || inputText === value;
    if (showAll) return options;
    const q = normalizar(inputText);
    return options.filter((opt) => normalizar(opt).includes(q));
  }, [inputText, options, value]);

  useEffect(() => {
    if (highlightedIndex >= filtered.length) {
      setHighlightedIndex(filtered.length > 0 ? 0 : -1);
    }
  }, [filtered, highlightedIndex]);

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0 || !listRef.current) return;
    const el = listRef.current.children[highlightedIndex];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, isOpen]);

  const selectOption = (opt) => {
    onChange(opt);
    setInputText(opt);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const clear = () => {
    onChange("");
    setInputText("");
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIsOpen(true);
      setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (isOpen && highlightedIndex >= 0 && filtered[highlightedIndex]) {
        selectOption(filtered[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setInputText(value || "");
    }
  };

  return (
    <div className="flex-1 min-w-[200px]" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={inputText}
          placeholder={placeholder}
          onChange={(e) => {
            setInputText(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={onKeyDown}
          className="w-full bg-white border border-gray-200 rounded-lg pl-3 pr-9 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder-gray-300"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
        />
        {value ? (
          <button
            type="button"
            onClick={clear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-rose-400 transition-colors text-sm w-6 h-6 flex items-center justify-center"
            title="Limpiar"
          >
            ✕
          </button>
        ) : (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs pointer-events-none">
            ▼
          </span>
        )}

        {isOpen && (
          <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              <ul ref={listRef} role="listbox">
                {filtered.map((opt, i) => (
                  <li
                    key={opt}
                    role="option"
                    aria-selected={i === highlightedIndex}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectOption(opt);
                    }}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                      i === highlightedIndex
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    } ${opt === value ? "font-semibold" : ""}`}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-400">Sin resultados</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
