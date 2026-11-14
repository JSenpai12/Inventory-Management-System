// FILE: src/types.ts
// PURPOSE: shared TypeScript types. They mirror the DTOs / PostgreSQL tables the NestJS API should expose.
// WHAT TO DO: keep in sync with backend entities. Add a new type here before adding a new data model.

// A product in the inventory.
export type Product = {
  id: string
  name: string
  categoryId: string // id of a row in the categories table, e.g. "C-01"
  sku: string // stock keeping unit: the product's unique code
  qty: number // how many are in stock right now
  min: number // minimum level: at or below this, the product counts as "Low Stock"
  price: number // selling price
  cost: number // what we pay the supplier
  supplierId: string // id of a row in the suppliers table, e.g. "S-01"
  updated: string // date of the last change
}

// A stock transaction: stock coming in or going out.
export type Txn = {
  id: string
  productId: string // id of the product, e.g. "P-1001"
  type: 'Stock In' | 'Stock Out'
  qty: number
  date: string
  by: string // who recorded it
  remarks: string
}

// A generic row for Suppliers, Categories, POs, Sales, Users.
// Besides `id`, it can hold any other fields as text or numbers.
export type Row = {
  id: string
  [key: string]: string | number
}

// Works out a product's stock status from its quantity.
export type StockStatus = 'Out of Stock' | 'Low Stock' | 'In Stock'

export const stockStatus = (product: Product): StockStatus => {
  if (product.qty === 0) return 'Out of Stock'
  if (product.qty <= product.min) return 'Low Stock'
  return 'In Stock'
}
