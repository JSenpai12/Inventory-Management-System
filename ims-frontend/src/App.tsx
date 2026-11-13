// FILE: src/App.tsx
// PURPOSE: root component. Holds the current page and maps each sidebar label to its screen (PAGES).
// WHAT TO DO: register new screens in PAGES (key = sidebar label in Layout.tsx). Not built yet: "Reports and Analytics" and "Settings" show a placeholder;
//   build them as src/pages/Reports.tsx and Settings.tsx and add them here.
import { ReactNode, useState } from 'react'
import Layout from './components/Layout'
import { Badge, ToastProvider } from './components/ui'
import Dashboard from './pages/Dashboard'
import Inventory from './pages/Inventory'
import Stock from './pages/Stock'
import TablePage, { TableConfig } from './pages/TablePage'

const money = (n: any) => '$' + Number(n).toLocaleString(undefined, { minimumFractionDigits: 2 })
const status = { h: 'Status', k: 'status', r: (r: any) => <Badge s={r.status} /> }
const TABLES: Record<string, TableConfig> = {
  Categories: { table: 'categories', noun: 'Category', cols: [{ h: 'ID', k: 'id' }, { h: 'Category', k: 'name' }, { h: 'Products', k: 'products' }], fields: [{ k: 'name', l: 'Category name', req: true }] },
  Suppliers: { table: 'suppliers', noun: 'Supplier', cols: [{ h: 'Supplier', k: 'name' }, { h: 'Contact', k: 'contact' }, { h: 'Email', k: 'email' }, { h: 'Phone', k: 'phone' }, status],
    fields: [{ k: 'name', l: 'Supplier name', req: true }, { k: 'contact', l: 'Contact person', req: true }, { k: 'email', l: 'Email address', t: 'email', req: true }, { k: 'phone', l: 'Phone number' }, { k: 'status', l: 'Status', o: ['Active', 'Inactive'], req: true }] },
  'Purchase Orders': { table: 'orders', noun: 'Purchase order', cols: [{ h: 'PO', k: 'id' }, { h: 'Supplier', k: 'supplier' }, { h: 'Item', k: 'item' }, { h: 'Qty', k: 'qty' }, { h: 'Total', k: 'total', r: (r) => money(r.total) }, { h: 'Expected', k: 'expected' }, status],
    fields: [{ k: 'supplier', l: 'Supplier', req: true }, { k: 'item', l: 'Product', req: true }, { k: 'qty', l: 'Quantity', t: 'number', min: 1, req: true }, { k: 'total', l: 'Total ($)', t: 'number', req: true }, { k: 'expected', l: 'Expected delivery', t: 'date', req: true }, { k: 'status', l: 'Status', o: ['Pending', 'Approved', 'Ordered', 'Partially Received', 'Completed', 'Cancelled'], req: true }] },
  'Sales Transactions': { table: 'sales', noun: 'Sale', readOnly: true, fields: [], cols: [{ h: 'ID', k: 'id' }, { h: 'Product', k: 'product' }, { h: 'Qty sold', k: 'qty' }, { h: 'Unit price', k: 'price', r: (r) => money(r.price) }, { h: 'Total', k: 'total', r: (r) => money(r.total) }, { h: 'Date', k: 'date' }, { h: 'Processed by', k: 'by' }] },
  'User Management': { table: 'users', noun: 'User', cols: [{ h: 'Name', k: 'name' }, { h: 'Email', k: 'email' }, { h: 'Role', k: 'role' }, status],
    fields: [{ k: 'name', l: 'Full name', req: true }, { k: 'email', l: 'Email', t: 'email', req: true }, { k: 'role', l: 'Role', o: ['Administrator', 'Manager', 'Staff'], req: true }, { k: 'status', l: 'Account status', o: ['Active', 'Inactive'], req: true }] },
}
export default function App() {
  const [page, setPage] = useState('Dashboard'), [q, setQ] = useState(''), [k, setK] = useState(0)
  const screens: Record<string, ReactNode> = { Dashboard: <Dashboard />, Inventory: <Inventory key={k} initialQuery={q} />, Products: <Inventory />, 'Stock Management': <Stock /> }
  const body = screens[page] ?? (TABLES[page] ? <TablePage key={page} {...TABLES[page]} /> : <div className="card p-10 text-center text-sm text-slate-500">{page} isn’t built yet. See the note at the top of src/App.tsx.</div>)
  return <ToastProvider><Layout page={page} go={setPage} onSearch={(v) => { setQ(v); setK(k + 1); setPage('Inventory') }}>{body}</Layout></ToastProvider>
}
