// FILE: src/types.ts
// PURPOSE: shared TypeScript types. They mirror the DTOs / PostgreSQL tables the NestJS API should expose.
// WHAT TO DO: keep in sync with backend entities. Add a new type here before adding a new data model.

// A product in the inventory.
export type Product = {
  id: string
  name: string
  category: string
  sku: string // stock keeping unit: the product's unique code
  qty: number // how many are in stock right now
  min: number // minimum level: at or below this, the product counts as "Low Stock"
  price: number // selling price
  cost: number // what we pay the supplier
  supplier: string
  updated: string // date of the last change
}

// A stock transaction: stock coming in or going out.
export type Txn = {
  id: string
  product: string
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
