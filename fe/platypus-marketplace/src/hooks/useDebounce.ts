import { useEffect, useState } from "react";

const useDebounce = <T>(value: T, time = 500): T => {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounceValue(value);
    }, time);

    return () => {
      clearTimeout(timeout);
    };
  }, [value, time]);

  return debounceValue;
};

export default useDebounce;
