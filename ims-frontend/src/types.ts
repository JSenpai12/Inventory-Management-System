// FILE: src/types.ts
// PURPOSE: shared TypeScript types. They mirror the DTOs / PostgreSQL tables the NestJS API should expose.
// WHAT TO DO: keep in sync with backend entities. Add a new type here before adding a new data model.
export type Product = { id: string; name: string; category: string; sku: string; qty: number; min: number; price: number; cost: number; supplier: string; updated: string }
export type Txn = { id: string; product: string; type: 'Stock In' | 'Stock Out'; qty: number; date: string; by: string; remarks: string }
export type Row = { id: string; [k: string]: string | number } // generic row for Suppliers, Categories, POs, Sales, Users
export const stockStatus = (p: Product) => (p.qty === 0 ? 'Out of Stock' : p.qty <= p.min ? 'Low Stock' : 'In Stock')
