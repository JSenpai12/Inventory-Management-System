// FILE: src/pages/TablePage.tsx
// PURPOSE: ONE reusable CRUD page (search, table, add/edit/view/delete, validation, confirm). Powers Categories, Suppliers, Purchase Orders, Sales and Users.
// WHAT TO DO: to add a new simple screen, add an entry in TABLES in App.tsx with: `table` (key in api.ts), `noun`, `cols`, `fields`. No new file needed.
//   For a custom screen (like purchase orders with line items) copy this file and extend it.
import { ReactNode, useState } from 'react'
import { Plus } from 'lucide-react'
import { deleteRow, listTable, saveRow } from '../services/api'
import { useLoad } from '../hooks/useLoad'
import { Confirm, DataTable, Field, FormModal, Modal, Spinner, useToast } from '../components/ui'
import { Row } from '../types'

export type TableConfig = { table: string; noun: string; cols: { h: string; k?: string; r?: (r: Row) => ReactNode }[]; fields: Field[]; readOnly?: boolean }
export default function TablePage({ table, noun, cols, fields, readOnly }: TableConfig) {
  const [rows, loading, reload] = useLoad<Row[]>(() => listTable(table), []), [q, setQ] = useState(''), [m, setM] = useState<{ t: string; r?: Row } | null>(null), toast = useToast()
  const list = rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()))
  const save = async (v: any) => { await saveRow(table, { ...m?.r, ...v, id: m?.r?.id ?? table[0].toUpperCase() + '-' + Date.now().toString().slice(-5) }); toast(`${noun} ${m?.t === 'add' ? 'added' : 'updated'}`); setM(null); reload() }
  const actions = { h: 'Actions', r: (r: Row) => <div className="flex gap-3 text-brand"><button onClick={() => setM({ t: 'view', r })}>View</button>{!readOnly && <><button onClick={() => setM({ t: 'edit', r })}>Edit</button><button className="text-red-400" onClick={() => setM({ t: 'del', r })}>Delete</button></>}</div> }
  return <div className="card"><div className="flex flex-wrap items-center gap-2 p-4"><input className="inp max-w-xs" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} /><div className="flex-1" />
    {!readOnly && <button className="btn" onClick={() => setM({ t: 'add' })}><Plus size={15} />Add {noun.toLowerCase()}</button>}</div>
    {loading ? <Spinner /> : <DataTable<Row> rows={list} cols={[...cols, actions] as any} />}
    {m?.t === 'view' && m.r && <Modal title={`${noun} details`} onClose={() => setM(null)}><dl className="space-y-2 text-sm">{Object.entries(m.r).map(([k, v]) => <div key={k} className="flex justify-between gap-4 border-b border-line pb-1"><dt className="text-slate-500">{k}</dt><dd>{String(v)}</dd></div>)}</dl></Modal>}
    {(m?.t === 'add' || m?.t === 'edit') && <FormModal title={`${m.t === 'add' ? 'Add' : 'Edit'} ${noun.toLowerCase()}`} fields={fields} init={m.r as any} onSave={save} onClose={() => setM(null)} />}
    {m?.t === 'del' && m.r && <Confirm msg={`Delete this ${noun.toLowerCase()}? This can’t be undone.`} onNo={() => setM(null)} onYes={async () => { await deleteRow(table, m.r!.id); toast(`${noun} deleted`); setM(null); reload() }} />}</div>
}
