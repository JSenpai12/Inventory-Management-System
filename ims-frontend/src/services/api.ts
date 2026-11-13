// FILE: src/services/api.ts
// PURPOSE: the ONLY place the UI gets or changes data. Today it reads/writes in-memory mock data with a fake delay.
// WHAT TO DO: when the NestJS API is ready, replace each function body with fetch('/api/...') (keep the same names,
//   arguments and return types) and the pages will not need changes. Then delete src/data/mock.ts.
import { products, txns, tables } from '../data/mock'
import { Product, Row, Txn } from '../types'
const wait = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(structuredClone(v)), 450))
let P = [...products], T = [...txns]
const tbl: Record<string, Row[]> = { ...tables }
export const listProducts = () => wait(P)
export const saveProduct = (p: Product) => { P = P.some((x) => x.id === p.id) ? P.map((x) => (x.id === p.id ? p : x)) : [p, ...P]; return wait(p) }
export const removeProduct = (id: string) => { P = P.filter((x) => x.id !== id); return wait(true) }
export const listTxns = () => wait(T)
// Records a stock movement and updates the product quantity (the backend should do both in one DB transaction).
export const addTxn = (t: Txn) => { T = [t, ...T]; P = P.map((p) => (p.name === t.product ? { ...p, qty: p.qty + (t.type === 'Stock In' ? t.qty : -t.qty), updated: t.date } : p)); return wait(t) }
export const listTable = (key: string) => wait(tbl[key] ?? [])
export const saveRow = (key: string, r: Row) => { tbl[key] = tbl[key].some((x) => x.id === r.id) ? tbl[key].map((x) => (x.id === r.id ? r : x)) : [r, ...tbl[key]]; return wait(r) }
export const deleteRow = (key: string, id: string) => { tbl[key] = tbl[key].filter((x) => x.id !== id); return wait(true) }
