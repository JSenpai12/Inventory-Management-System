// FILE: src/data/mock.ts
// PURPOSE: realistic sample data used by services/api.ts while there is no backend.
// WHAT TO DO: delete this file once the NestJS API returns real data (and remove its import in api.ts).
import { Product, Row, Txn } from '../types'

export const CATEGORIES = [
  { id: 'C-01', name: 'Electronics' },
  { id: 'C-02', name: 'Office Supplies' },
  { id: 'C-03', name: 'Packaging' },
  { id: 'C-04', name: 'Tools' },
  { id: 'C-05', name: 'Safety Gear' },
]

// Ids of the suppliers listed in `tables.suppliers` below.
const SUPPLIER = { northline: 'S-01', pacificPaper: 'S-02', safeWorks: 'S-03', boxCraft: 'S-04' }
// Ids of the entries in CATEGORIES above.
const CATEGORY = { electronics: 'C-01', office: 'C-02', packaging: 'C-03', tools: 'C-04', safety: 'C-05' }

const MS_PER_DAY = 86_400_000

/**
 * Returns an ISO date (YYYY-MM-DD) `daysAgo` days before today.
 * A negative value therefore produces a date in the future.
 */
const daysAgo = (daysAgo: number) => new Date(Date.now() - daysAgo * MS_PER_DAY).toISOString().slice(0, 10)

/** Builds a product row. `index` only drives the generated id and the `updated` date. */
const makeProduct = (
  index: number,
  name: string,
  categoryId: string,
  sku: string,
  qty: number,
  min: number,
  price: number,
  supplierId: string,
): Product => ({
  id: `P-${1001 + index}`,
  name,
  categoryId,
  sku,
  qty,
  min,
  price,
  // Cost is derived from the sell price at a fixed 62% margin.
  cost: Number((price * 0.62).toFixed(2)),
  supplierId,
  updated: daysAgo(index % 8),
})

export const products: Product[] = [
  makeProduct(0, 'Wireless Barcode Scanner', CATEGORY.electronics, 'EL-1001', 24, 10, 89.5, SUPPLIER.northline),
  makeProduct(1, 'Thermal Label Printer', CATEGORY.electronics, 'EL-1002', 6, 8, 249, SUPPLIER.northline),
  makeProduct(2, 'A4 Copy Paper (Ream)', CATEGORY.office, 'OF-2001', 320, 100, 4.2, SUPPLIER.pacificPaper),
  makeProduct(3, 'Ballpoint Pens (Box of 50)', CATEGORY.office, 'OF-2002', 0, 20, 9.8, SUPPLIER.pacificPaper),
  makeProduct(4, 'Corrugated Box 12x12', CATEGORY.packaging, 'PK-3001', 1450, 500, 0.65, SUPPLIER.boxCraft),
  makeProduct(5, 'Bubble Wrap Roll', CATEGORY.packaging, 'PK-3002', 18, 25, 22, SUPPLIER.boxCraft),
  makeProduct(6, 'Cordless Drill 18V', CATEGORY.tools, 'TL-4001', 12, 5, 119, SUPPLIER.northline),
  makeProduct(7, 'Torque Wrench Set', CATEGORY.tools, 'TL-4002', 0, 4, 74, SUPPLIER.northline),
  makeProduct(8, 'Safety Helmet', CATEGORY.safety, 'SF-5001', 85, 30, 14.5, SUPPLIER.safeWorks),
  makeProduct(9, 'Hi-Vis Vest', CATEGORY.safety, 'SF-5002', 40, 50, 6.9, SUPPLIER.safeWorks),
]

export const txns: Txn[] = [
  { id: 'T-9001', productId: 'P-1001', type: 'Stock In', qty: 20, date: daysAgo(0), by: 'Amara Reyes', remarks: 'PO-7781' },
  { id: 'T-9002', productId: 'P-1004', type: 'Stock Out', qty: 35, date: daysAgo(1), by: 'Jon Park', remarks: 'Sale' },
  { id: 'T-9003', productId: 'P-1009', type: 'Stock In', qty: 60, date: daysAgo(2), by: 'Amara Reyes', remarks: 'PO-7779' },
  { id: 'T-9004', productId: 'P-1006', type: 'Stock Out', qty: 12, date: daysAgo(3), by: 'Lena Ortiz', remarks: 'Damaged' },
  { id: 'T-9005', productId: 'P-1003', type: 'Stock Out', qty: 80, date: daysAgo(4), by: 'Jon Park', remarks: 'Sale' },
]

/**
 * Daily earnings for the dashboard bar chart (earning + commission, like the
 * reference design). One entry per day for a 31-day window.
 */
export const daily = Array.from({ length: 31 }, (_, index) => {
  const earning = 120 + ((index * 53) % 230)
  return { day: index + 1, earning, commission: Math.round(earning * 0.28) }
})

/** Backing rows for the generic CRUD screens, keyed by table name. */
export const tables: Record<string, Row[]> = {
  suppliers: [
    { id: 'S-01', name: 'Northline Distribution', contact: 'Elena Brooks', email: 'elena@northline.com', phone: '+1 415 555 0142', status: 'Active' },
    { id: 'S-02', name: 'Pacific Paper Co.', contact: 'Daniel Okafor', email: 'daniel@pacificpaper.com', phone: '+1 206 555 0188', status: 'Active' },
    { id: 'S-03', name: 'SafeWorks Supply', contact: 'Priya Nair', email: 'priya@safeworks.com', phone: '+1 312 555 0117', status: 'Active' },
    { id: 'S-04', name: 'BoxCraft Packaging', contact: 'Tom Hale', email: 'tom@boxcraft.com', phone: '+1 602 555 0170', status: 'Inactive' },
  ],

  // Derived from CATEGORIES; the product count is read off the sample products.
  categories: CATEGORIES.map((category) => ({
    id: category.id,
    name: category.name,
    products: products.filter((product) => product.categoryId === category.id).length,
  })),

  orders: [
    { id: 'PO-7781', supplier: 'Northline Distribution', item: 'Thermal Label Printer', qty: 10, total: 1543.8, expected: daysAgo(-6), status: 'Ordered' },
    { id: 'PO-7780', supplier: 'Pacific Paper Co.', item: 'Ballpoint Pens (Box of 50)', qty: 200, total: 1215.2, expected: daysAgo(-4), status: 'Approved' },
    { id: 'PO-7779', supplier: 'SafeWorks Supply', item: 'Hi-Vis Vest', qty: 150, total: 641.7, expected: daysAgo(-9), status: 'Pending' },
  ],

  sales: [
    { id: 'SL-2041', product: 'A4 Copy Paper (Ream)', qty: 80, price: 4.2, total: 336, date: daysAgo(0), by: 'Lena Ortiz' },
    { id: 'SL-2042', product: 'Safety Helmet', qty: 15, price: 14.5, total: 217.5, date: daysAgo(1), by: 'Jon Park' },
    { id: 'SL-2043', product: 'Cordless Drill 18V', qty: 2, price: 119, total: 238, date: daysAgo(2), by: 'Jon Park' },
  ],

  users: [
    { id: 'U-01', name: 'Amara Reyes', email: 'amara@stockwise.io', role: 'Administrator', status: 'Active' },
    { id: 'U-02', name: 'Marcus Cole', email: 'marcus@stockwise.io', role: 'Manager', status: 'Active' },
    { id: 'U-03', name: 'Jon Park', email: 'jon@stockwise.io', role: 'Staff', status: 'Active' },
    { id: 'U-04', name: 'Dev Patel', email: 'dev@stockwise.io', role: 'Staff', status: 'Inactive' },
  ],
}
