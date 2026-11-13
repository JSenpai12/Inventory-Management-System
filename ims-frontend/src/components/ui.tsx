// FILE: src/components/ui.tsx
// PURPOSE: the reusable design system: toasts, badges, modal, confirm dialog, validated form, sortable + paginated table.
// WHAT TO DO: build every new screen from these pieces. Do not hand-roll tables, modals or forms in pages.
import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { X } from 'lucide-react'

const ToastCtx = createContext<(m: string, err?: boolean) => void>(() => {})
export const useToast = () => useContext(ToastCtx) // call toast('Saved') or toast('Failed', true)
export function ToastProvider({ children }: { children: ReactNode }) {
  const [m, setM] = useState<{ t: string; err?: boolean } | null>(null)
  const push = (t: string, err?: boolean) => { setM({ t, err }); setTimeout(() => setM(null), 3000) }
  return <ToastCtx.Provider value={push}>{children}{m && <div role="status" className={`fixed bottom-5 right-5 z-[60] rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${m.err ? 'bg-red-500 text-white' : 'bg-brand text-black'}`}>{m.t}</div>}</ToastCtx.Provider>
}

const TONE: Record<string, string> = { 'In Stock': 'emerald', 'Low Stock': 'amber', 'Out of Stock': 'red', 'Stock In': 'emerald', 'Stock Out': 'red', Active: 'emerald', Inactive: 'slate', Pending: 'amber', Approved: 'sky', Ordered: 'indigo', Completed: 'emerald', Cancelled: 'red' }
const TONES: Record<string, string> = { emerald: 'bg-emerald-500/15 text-emerald-400', amber: 'bg-amber-500/15 text-amber-400', red: 'bg-red-500/15 text-red-400', sky: 'bg-sky-500/15 text-sky-400', indigo: 'bg-indigo-500/15 text-indigo-400', slate: 'bg-slate-500/15 text-slate-400' }
export const Badge = ({ s }: { s: string }) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONES[TONE[s] ?? 'slate']}`}>{s}</span>

export const Spinner = () => <div className="p-10 text-center text-sm text-slate-500">Loading…</div>

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
    <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-line px-5 py-4"><h3 className="font-semibold text-white">{title}</h3><button onClick={onClose} aria-label="Close"><X size={18} /></button></div>
      <div className="p-5">{children}</div></div></div>
}
export const Confirm = ({ msg, onYes, onNo }: { msg: string; onYes: () => void; onNo: () => void }) =>
  <Modal title="Please confirm" onClose={onNo}><p className="text-sm text-slate-400">{msg}</p><div className="flex justify-end gap-2 pt-5"><button className="btn2" onClick={onNo}>Cancel</button><button className="btn !bg-red-500 !text-white" onClick={onYes}>Delete</button></div></Modal>

export type Field = { k: string; l: string; t?: string; o?: string[]; req?: boolean; min?: number }
type V = Record<string, string | number>
// Inline form with validation (required, email, number min). Used inside modals and on the Stock page.
export function Form({ fields, init, onSave, onCancel, label = 'Save' }: { fields: Field[]; init?: V; onSave: (v: V) => void; onCancel?: () => void; label?: string }) {
  const [v, setV] = useState<V>(init ?? {}), [e, setE] = useState<Record<string, string>>({})
  const go = () => {
    const er: Record<string, string> = {}
    fields.forEach((f) => { const x = v[f.k], empty = x === undefined || x === ''
      if (f.req && empty) er[f.k] = 'This field is required'
      else if (f.t === 'email' && !empty && !/^\S+@\S+\.\S+$/.test(String(x))) er[f.k] = 'Enter a valid email address'
      else if (f.t === 'number' && !empty && (isNaN(+x) || +x < (f.min ?? 0))) er[f.k] = `Enter a number of ${f.min ?? 0} or more` })
    setE(er); if (!Object.keys(er).length) onSave(v)
  }
  return <div className="space-y-3">{fields.map((f) => <label key={f.k} className="block text-sm"><span className="text-slate-400">{f.l}</span>
    {f.o ? <select className="inp mt-1" value={v[f.k] ?? ''} onChange={(x) => setV({ ...v, [f.k]: x.target.value })}><option value="">Select…</option>{f.o.map((o) => <option key={o}>{o}</option>)}</select>
      : <input className="inp mt-1" type={f.t ?? 'text'} value={v[f.k] ?? ''} onChange={(x) => setV({ ...v, [f.k]: x.target.value })} />}
    {e[f.k] && <span className="text-xs text-red-400">{e[f.k]}</span>}</label>)}
    <div className="flex justify-end gap-2 pt-2">{onCancel && <button className="btn2" onClick={onCancel}>Cancel</button>}<button className="btn" onClick={go}>{label}</button></div></div>
}
export const FormModal = (p: { title: string; fields: Field[]; init?: V; onSave: (v: V) => void; onClose: () => void }) =>
  <Modal title={p.title} onClose={p.onClose}><Form fields={p.fields} init={p.init} onSave={p.onSave} onCancel={p.onClose} /></Modal>

type Col<T> = { h: string; k?: keyof T & string; r?: (x: T) => ReactNode }
// Table with click-to-sort headers, pagination and an empty state. `k` = sortable key, `r` = custom cell renderer.
export function DataTable<T extends { id: string }>({ cols, rows, size = 8 }: { cols: Col<T>[]; rows: T[]; size?: number }) {
  const [sk, setSk] = useState<string | null>(null), [asc, setAsc] = useState(true), [pg, setPg] = useState(0)
  const sorted = useMemo(() => (sk ? [...rows].sort((a: any, b: any) => (a[sk] > b[sk] ? 1 : a[sk] < b[sk] ? -1 : 0) * (asc ? 1 : -1)) : rows), [rows, sk, asc])
  const pages = Math.max(1, Math.ceil(sorted.length / size)), cur = Math.min(pg, pages - 1)
  if (!rows.length) return <div className="p-10 text-center text-sm text-slate-500">No records match. Adjust your search or filters, or add a new record.</div>
  return <div><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-line text-left text-slate-500">
    {cols.map((c) => <th key={c.h} className="whitespace-nowrap px-4 py-3 font-medium">{c.k ? <button className="hover:text-white" onClick={() => { setAsc(sk === c.k ? !asc : true); setSk(c.k!) }}>{c.h}{sk === c.k ? (asc ? ' ↑' : ' ↓') : ''}</button> : c.h}</th>)}</tr></thead>
    <tbody>{sorted.slice(cur * size, cur * size + size).map((r) => <tr key={r.id} className="border-b border-line/60 hover:bg-white/[.03]">{cols.map((c) => <td key={c.h} className="whitespace-nowrap px-4 py-3">{c.r ? c.r(r) : String((r as any)[c.k!] ?? '')}</td>)}</tr>)}</tbody></table></div>
    <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-500"><span>{cur * size + 1}–{Math.min(sorted.length, cur * size + size)} of {sorted.length}</span>
      <div className="flex gap-2"><button className="btn2" disabled={cur === 0} onClick={() => setPg(cur - 1)}>Previous</button><button className="btn2" disabled={cur >= pages - 1} onClick={() => setPg(cur + 1)}>Next</button></div></div></div>
}
