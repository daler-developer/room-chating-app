import { useEffect, useState } from "react"

function useDebounce<V> (value: V, milliseconds: number = 2000) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), milliseconds)

    return () => clearTimeout(timeout)
  }, [value])

  return debounced
}

export default useDebounce