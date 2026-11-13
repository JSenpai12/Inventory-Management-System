// FILE: src/hooks/useLoad.ts
// PURPOSE: tiny data-loading hook that gives pages the data, an "is loading" flag, and a reload() function.
// WHAT TO DO: use it as `const [products, isLoading, reloadProducts] = useLoad(() => listProducts(), [])`. Swap for React Query later if you want caching.
import { useCallback, useEffect, useState } from 'react'

export function useLoad<T>(loadData: () => Promise<T>, initialData: T): [T, boolean, () => void] {
  const [data, setData] = useState<T>(initialData)
  const [isLoading, setIsLoading] = useState(true)

  const reload = useCallback(() => {
    setIsLoading(true)
    loadData().then((result) => {
      setData(result)
      setIsLoading(false)
    })
  }, []) // eslint-disable-line

  useEffect(reload, [reload])
  return [data, isLoading, reload]
}
