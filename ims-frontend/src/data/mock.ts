// FILE: src/data/mock.ts
// PURPOSE: realistic sample data used by services/api.ts while there is no backend.
// WHAT TO DO: delete this file once the NestJS API returns real data (and remove its import in api.ts).
import { Product, Row, Txn } from '../types'
export const CATEGORIES = ['Electronics', 'Office Supplies', 'Packaging', 'Tools', 'Safety Gear']
const d = (n: number) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10)
const P = (i: number, name: string, category: string, sku: string, qty: number, min: number, price: number, supplier: string): Product => ({ id: 'P-' + (1001 + i), name, category, sku, qty, min, price, cost: +(price * 0.62).toFixed(2), supplier, updated: d(i % 8) })
export const products: Product[] = [
  P(0, 'Wireless Barcode Scanner', 'Electronics', 'EL-1001', 24, 10, 89.5, 'Northline Distribution'), P(1, 'Thermal Label Printer', 'Electronics', 'EL-1002', 6, 8, 249, 'Northline Distribution'),
  P(2, 'A4 Copy Paper (Ream)', 'Office Supplies', 'OF-2001', 320, 100, 4.2, 'Pacific Paper Co.'), P(3, 'Ballpoint Pens (Box of 50)', 'Office Supplies', 'OF-2002', 0, 20, 9.8, 'Pacific Paper Co.'),
  P(4, 'Corrugated Box 12x12', 'Packaging', 'PK-3001', 1450, 500, 0.65, 'BoxCraft Packaging'), P(5, 'Bubble Wrap Roll', 'Packaging', 'PK-3002', 18, 25, 22, 'BoxCraft Packaging'),
  P(6, 'Cordless Drill 18V', 'Tools', 'TL-4001', 12, 5, 119, 'Northline Distribution'), P(7, 'Torque Wrench Set', 'Tools', 'TL-4002', 0, 4, 74, 'Northline Distribution'),
  P(8, 'Safety Helmet', 'Safety Gear', 'SF-5001', 85, 30, 14.5, 'SafeWorks Supply'), P(9, 'Hi-Vis Vest', 'Safety Gear', 'SF-5002', 40, 50, 6.9, 'SafeWorks Supply'),
]
export const txns: Txn[] = [
  { id: 'T-9001', product: 'Wireless Barcode Scanner', type: 'Stock In', qty: 20, date: d(0), by: 'Amara Reyes', remarks: 'PO-7781' },
  { id: 'T-9002', product: 'Ballpoint Pens (Box of 50)', type: 'Stock Out', qty: 35, date: d(1), by: 'Jon Park', remarks: 'Sale' },
  { id: 'T-9003', product: 'Safety Helmet', type: 'Stock In', qty: 60, date: d(2), by: 'Amara Reyes', remarks: 'PO-7779' },
  { id: 'T-9004', product: 'Bubble Wrap Roll', type: 'Stock Out', qty: 12, date: d(3), by: 'Lena Ortiz', remarks: 'Damaged' },
  { id: 'T-9005', product: 'A4 Copy Paper (Ream)', type: 'Stock Out', qty: 80, date: d(4), by: 'Jon Park', remarks: 'Sale' },
]
// Daily earnings for the dashboard bar chart (earning + commission, like the reference design).
export const daily = Array.from({ length: 31 }, (_, i) => { const e = 120 + ((i * 53) % 230); return { day: i + 1, earning: e, commission: Math.round(e * 0.28) } })
export const tables: Record<string, Row[]> = {
  suppliers: [
    { id: 'S-01', name: 'Northline Distribution', contact: 'Elena Brooks', email: 'elena@northline.com', phone: '+1 415 555 0142', status: 'Active' },
    { id: 'S-02', name: 'Pacific Paper Co.', contact: 'Daniel Okafor', email: 'daniel@pacificpaper.com', phone: '+1 206 555 0188', status: 'Active' },
    { id: 'S-03', name: 'SafeWorks Supply', contact: 'Priya Nair', email: 'priya@safeworks.com', phone: '+1 312 555 0117', status: 'Active' },
    { id: 'S-04', name: 'BoxCraft Packaging', contact: 'Tom Hale', email: 'tom@boxcraft.com', phone: '+1 602 555 0170', status: 'Inactive' }],
  categories: CATEGORIES.map((c, i) => ({ id: 'C-0' + (i + 1), name: c, products: products.filter((p) => p.category === c).length })),
  orders: [
    { id: 'PO-7781', supplier: 'Northline Distribution', item: 'Thermal Label Printer', qty: 10, total: 1543.8, expected: d(-6), status: 'Ordered' },
    { id: 'PO-7780', supplier: 'Pacific Paper Co.', item: 'Ballpoint Pens (Box of 50)', qty: 200, total: 1215.2, expected: d(-4), status: 'Approved' },
    { id: 'PO-7779', supplier: 'SafeWorks Supply', item: 'Hi-Vis Vest', qty: 150, total: 641.7, expected: d(-9), status: 'Pending' }],
  sales: [
    { id: 'SL-2041', product: 'A4 Copy Paper (Ream)', qty: 80, price: 4.2, total: 336, date: d(0), by: 'Lena Ortiz' },
    { id: 'SL-2042', product: 'Safety Helmet', qty: 15, price: 14.5, total: 217.5, date: d(1), by: 'Jon Park' },
    { id: 'SL-2043', product: 'Cordless Drill 18V', qty: 2, price: 119, total: 238, date: d(2), by: 'Jon Park' }],
  users: [
    { id: 'U-01', name: 'Amara Reyes', email: 'amara@stockwise.io', role: 'Administrator', status: 'Active' },
    { id: 'U-02', name: 'Marcus Cole', email: 'marcus@stockwise.io', role: 'Manager', status: 'Active' },
    { id: 'U-03', name: 'Jon Park', email: 'jon@stockwise.io', role: 'Staff', status: 'Active' },
    { id: 'U-04', name: 'Dev Patel', email: 'dev@stockwise.io', role: 'Staff', status: 'Inactive' }],
}
