import { useState, useEffect } from 'react';

/**
 * Custom hook để debounce value, giảm lag khi user nhập text
 * @param {any} value Giá trị cần debounce
 * @param {number} delay Thời gian delay (ms)
 * @returns {any} Giá trị đã được debounce
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will be called every time useEffect is re-called.
    // useEffect will only be re-called if value or delay changes
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook để optimize TextInput performance
 * @param {string} initialValue Giá trị ban đầu
 * @param {number} debounceDelay Thời gian debounce (mặc định 150ms)
 * @returns {Object} { displayValue, debouncedValue, setValue }
 */
export const useOptimizedInput = (initialValue = '', debounceDelay = 150) => {
  const [displayValue, setDisplayValue] = useState(initialValue);
  const debouncedValue = useDebounce(displayValue, debounceDelay);

  return {
    displayValue,
    debouncedValue,
    setValue: setDisplayValue
  };
};
