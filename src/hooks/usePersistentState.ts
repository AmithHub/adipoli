import { useEffect, useState } from "react";

export function usePersistentState<T>(
  getValue: () => T,
  setValue: (value: T) => void,
) {
  const [state, setState] = useState<T>(getValue);

  useEffect(() => {
    setValue(state);
  }, [setValue, state]);

  return [state, setState] as const;
}
