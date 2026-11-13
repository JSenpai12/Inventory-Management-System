// FILE: src/hooks/useLoad.ts
// PURPOSE: tiny data-loading hook that gives pages a loading flag and a reload() function.
// WHAT TO DO: use it as `const [data, loading, reload] = useLoad(() => listProducts(), [])`. Swap for React Query later if you want caching.
import { useCallback, useEffect, useState } from 'react'
export function useLoad<T>(fn: () => Promise<T>, init: T): [T, boolean, () => void] {
  const [d, setD] = useState<T>(init), [l, setL] = useState(true)
  const run = useCallback(() => { setL(true); fn().then((x) => { setD(x); setL(false) }) }, []) // eslint-disable-line
  useEffect(run, [run])
  return [d, l, run]
}
