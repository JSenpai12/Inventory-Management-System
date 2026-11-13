// FILE: src/pages/Stock.tsx
// PURPOSE: Stock In / Stock Out forms (validated) plus the transaction history table. Stock Out is blocked if it exceeds available quantity.
// WHAT TO DO: replace the hard-coded "Amara Reyes" (processed by) with the logged-in user once you add authentication.
import { useState } from 'react'
import { addTxn, listProducts, listTable, listTxns } from '../services/api'
import { useLoad } from '../hooks/useLoad'
import { Badge, DataTable, Field, Form, Spinner, useToast } from '../components/ui'
import { Product, Row, Txn } from '../types'

export default function Stock() {
  const [p, , rp] = useLoad<Product[]>(listProducts, []), [t, lt, rt] = useLoad<Txn[]>(listTxns, []), [sup] = useLoad<Row[]>(() => listTable('suppliers'), [])
  const [tab, setTab] = useState<'Stock In' | 'Stock Out'>('Stock In'), [k, setK] = useState(0), toast = useToast(), inn = tab === 'Stock In'
  const fields: Field[] = [{ k: 'product', l: 'Product', o: p.map((x) => x.name), req: true }, { k: 'qty', l: inn ? 'Quantity received' : 'Quantity released', t: 'number', min: 1, req: true },
    inn ? { k: 'supplier', l: 'Supplier', o: sup.map((s) => String(s.name)), req: true } : { k: 'reason', l: 'Transaction reason', o: ['Sale', 'Damaged', 'Expired', 'Internal use'], req: true },
    { k: 'ref', l: 'Reference number', req: true }, { k: 'remarks', l: 'Remarks' }]
  const save = async (v: any) => {
    const pr = p.find((x) => x.name === v.product)!
    if (!inn && +v.qty > pr.qty) return toast(`Only ${pr.qty} units of ${pr.name} are available`, true)
    await addTxn({ id: 'T-' + Date.now().toString().slice(-5), product: pr.name, type: tab, qty: +v.qty, date: new Date().toISOString().slice(0, 10), by: 'Amara Reyes', remarks: v.remarks || v.ref })
    toast(`${tab} recorded for ${pr.name}`); setK(k + 1); rp(); rt()
  }
  return <div className="space-y-5">
    <div className="card p-5"><div className="mb-4 flex gap-2">{(['Stock In', 'Stock Out'] as const).map((x) => <button key={x} onClick={() => setTab(x)} className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === x ? (x === 'Stock In' ? 'bg-brand text-black' : 'bg-red-500 text-white') : 'bg-white/5 text-slate-400'}`}>{x}</button>)}</div>
      <div className="max-w-lg"><Form key={tab + k} fields={fields} onSave={save} label={`Submit ${tab.toLowerCase()} transaction`} /></div></div>
    <div className="card"><h3 className="p-4 pb-0 font-medium text-white">Transaction history</h3>{lt ? <Spinner /> : <DataTable<Txn> rows={t} cols={[{ h: 'Transaction ID', k: 'id' }, { h: 'Product', k: 'product' }, { h: 'Type', k: 'type', r: (r) => <Badge s={r.type} /> },
      { h: 'Quantity', k: 'qty', r: (r) => <span className={r.type === 'Stock In' ? 'text-emerald-400' : 'text-red-400'}>{r.type === 'Stock In' ? '+' : '−'}{r.qty}</span> }, { h: 'Date', k: 'date' }, { h: 'Processed by', k: 'by' }, { h: 'Remarks', k: 'remarks' }]} />}</div></div>
}
