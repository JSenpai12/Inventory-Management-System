// FILE: src/services/api.ts
// PURPOSE: the ONLY place the UI gets or changes data. Today it reads/writes
//          in-memory mock data with a fake delay.
// WHAT TO DO: when the NestJS API is ready, replace each function body with
//   fetch('/api/...') (keep the same names, arguments and return types) and the
//   pages will not need changes. Then delete src/data/mock.ts.
import { products as seedProducts, txns as seedTransactions, tables as seedTables } from '../data/mock'
import { Product, Row, Txn } from '../types'

const FAKE_DELAY_MS = 450

/**
 * Pretends to be a network request: waits a moment, then returns a COPY of the
 * value (like JSON coming back from a server would be).
 */
function respondAfterDelay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), FAKE_DELAY_MS))
}

/* -------------------------------------------------------------------------- */
/* In-memory "database"                                                        */
/* -------------------------------------------------------------------------- */

// Lives in memory, so it resets when you refresh the page.
let products: Product[] = [...seedProducts]
let transactions: Txn[] = [...seedTransactions]
const tables: Record<string, Row[]> = { ...seedTables }

/* -------------------------------------------------------------------------- */
/* Helpers for the two list-shaped stores                                      */
/* -------------------------------------------------------------------------- */

/** Replaces the item with a matching id, or puts the new item at the front. */
function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const alreadyExists = list.some((existing) => existing.id === item.id)

  return alreadyExists
    ? list.map((existing) => (existing.id === item.id ? item : existing))
    : [item, ...list]
}

/** Returns the list with the matching id dropped. */
function removeById<T extends { id: string }>(list: T[], id: string): T[] {
  return list.filter((item) => item.id !== id)
}

/* -------------------------------------------------------------------------- */
/* Products                                                                    */
/* -------------------------------------------------------------------------- */

export const listProducts = () => respondAfterDelay(products)

export const saveProduct = (product: Product) => {
  products = upsertById(products, product)
  return respondAfterDelay(product)
}

export const removeProduct = (productId: string) => {
  products = removeById(products, productId)
  return respondAfterDelay(true)
}

/* -------------------------------------------------------------------------- */
/* Stock transactions                                                          */
/* -------------------------------------------------------------------------- */

export const listTxns = () => respondAfterDelay(transactions)

/**
 * Records a stock movement and updates the product quantity (the backend should
 * do both in one DB transaction).
 */
export const addTxn = (transaction: Txn) => {
  // Stock In adds to the shelf, Stock Out takes away.
  const quantityDelta = transaction.type === 'Stock In' ? transaction.qty : -transaction.qty

  transactions = [transaction, ...transactions]

  products = products.map((product) =>
    product.name === transaction.product
      ? { ...product, qty: product.qty + quantityDelta, updated: transaction.date }
      : product,
  )

  return respondAfterDelay(transaction)
}

/* -------------------------------------------------------------------------- */
/* Generic tables (suppliers, categories, orders, sales, users)                */
/* -------------------------------------------------------------------------- */

export const listTable = (tableKey: string) => respondAfterDelay(tables[tableKey] ?? [])

export const saveRow = (tableKey: string, row: Row) => {
  tables[tableKey] = upsertById(tables[tableKey], row)
  return respondAfterDelay(row)
}

export const deleteRow = (tableKey: string, rowId: string) => {
  tables[tableKey] = removeById(tables[tableKey], rowId)
  return respondAfterDelay(true)
}
