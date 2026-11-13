// FILE: src/pages/Inventory.tsx
// PURPOSE: product table with search, category + status filters, sorting, pagination, and add / edit / view / delete (with confirm + validation).
//   Also used for the "Products" menu item (same data, same forms).
// WHAT TO DO: add the Product Image upload and Description fields here when the API supports files. `initialQuery` comes from the top-bar search.
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { listProducts, listTable, removeProduct, saveProduct } from '../services/api'
import { useLoad } from '../hooks/useLoad'
import { Badge, Confirm, DataTable, Field, FormModal, Modal, Spinner, useToast } from '../components/ui'
import { CATEGORIES } from '../data/mock'
import { Product, Row, stockStatus } from '../types'

export default function Inventory({ initialQuery = '' }: { initialQuery?: string }) {
  const [p, loading, reload] = useLoad<Product[]>(listProducts, []), [sup] = useLoad<Row[]>(() => listTable('suppliers'), [])
  const [q, setQ] = useState(initialQuery), [cat, setCat] = useState(''), [st, setSt] = useState(''), [m, setM] = useState<{ t: 'add' | 'edit' | 'view' | 'del'; r?: Product } | null>(null)
  const toast = useToast()
  const fields: Field[] = [{ k: 'name', l: 'Product name', req: true }, { k: 'sku', l: 'SKU / barcode', req: true }, { k: 'category', l: 'Category', o: CATEGORIES, req: true }, { k: 'supplier', l: 'Supplier', o: sup.map((s) => String(s.name)) },
    { k: 'price', l: 'Unit price ($)', t: 'number', req: true }, { k: 'cost', l: 'Cost price ($)', t: 'number', req: true }, { k: 'qty', l: 'Current quantity', t: 'number', req: true }, { k: 'min', l: 'Minimum stock level', t: 'number', req: true }]
  const rows = p.filter((r) => (!cat || r.category === cat) && (!st || stockStatus(r) === st) && (r.name + r.sku + r.id).toLowerCase().includes(q.toLowerCase()))
  const save = async (v: any) => { await saveProduct({ ...m?.r, ...v, id: m?.r?.id ?? 'P-' + Date.now().toString().slice(-5), qty: +v.qty, price: +v.price, cost: +v.cost, min: +v.min, updated: new Date().toISOString().slice(0, 10) }); toast(m?.t === 'add' ? 'Product added' : 'Product updated'); setM(null); reload() }
  return <div className="card">
    <div className="flex flex-wrap items-center gap-2 p-4">
      <input className="inp max-w-xs" placeholder="Search name, SKU or ID…" value={q} onChange={(e) => setQ(e.target.value)} />
      <select className="inp w-auto" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
      <select className="inp w-auto" value={st} onChange={(e) => setSt(e.target.value)}><option value="">All statuses</option>{['In Stock', 'Low Stock', 'Out of Stock'].map((c) => <option key={c}>{c}</option>)}</select>
      <div className="flex-1" /><button className="btn" onClick={() => setM({ t: 'add' })}><Plus size={15} />Add new product</button></div>
    {loading ? <Spinner /> : <DataTable<Product> rows={rows} cols={[{ h: 'Product ID', k: 'id' }, { h: 'Product name', k: 'name' }, { h: 'Category', k: 'category' }, { h: 'SKU', k: 'sku' }, { h: 'Qty', k: 'qty' }, { h: 'Unit price', k: 'price', r: (r) => '$' + r.price.toFixed(2) },
      { h: 'Status', r: (r) => <Badge s={stockStatus(r)} /> }, { h: 'Last updated', k: 'updated' },
      { h: 'Actions', r: (r) => <div className="flex gap-3 text-brand"><button onClick={() => setM({ t: 'view', r })}>View</button><button onClick={() => setM({ t: 'edit', r })}>Edit</button><button className="text-red-400" onClick={() => setM({ t: 'del', r })}>Delete</button></div> }]} />}
    {m?.t === 'view' && m.r && <Modal title={m.r.name} onClose={() => setM(null)}><dl className="space-y-2 text-sm">{Object.entries(m.r).map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-line pb-1"><dt className="text-slate-500">{k}</dt><dd>{String(v)}</dd></div>)}</dl></Modal>}
    {(m?.t === 'add' || m?.t === 'edit') && <FormModal title={m.t === 'add' ? 'Add new product' : 'Edit product'} fields={fields} init={m.r as any} onSave={save} onClose={() => setM(null)} />}
    {m?.t === 'del' && m.r && <Confirm msg={`Delete “${m.r.name}”? This can’t be undone.`} onNo={() => setM(null)} onYes={async () => { await removeProduct(m.r!.id); toast('Product deleted'); setM(null); reload() }} />}</div>
}
