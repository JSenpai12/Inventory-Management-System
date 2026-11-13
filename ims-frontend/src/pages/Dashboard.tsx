// FILE: src/pages/Dashboard.tsx
// PURPOSE: overview page: 6 stat cards, stock bar chart, stock movement line chart, category pie, and 3 lists.
// WHAT TO DO: replace the hard-coded trend strings ("+4.2% vs last month") and the `daily`/`move` chart data with values from the API.
import { AlertTriangle, ArrowLeftRight, DollarSign, Package, Truck, XCircle } from 'lucide-react'
import { Bar, BarChart, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { listProducts, listTable, listTxns } from '../services/api'
import { useLoad } from '../hooks/useLoad'
import { Badge, DataTable, Spinner } from '../components/ui'
import { CATEGORIES, daily } from '../data/mock'
import { Product, Row, stockStatus, Txn } from '../types'

const COL = ['#34d399', '#38bdf8', '#a78bfa', '#fbbf24', '#f87171']
const tip = { contentStyle: { background: '#111415', border: '1px solid #1f2528', borderRadius: 8, fontSize: 12 } }
const axis = { tick: { fill: '#64748b', fontSize: 11 }, axisLine: false, tickLine: false } as const

export default function Dashboard() {
  const [p, lp] = useLoad<Product[]>(listProducts, []), [t, lt] = useLoad<Txn[]>(listTxns, []), [s] = useLoad<Row[]>(() => listTable('suppliers'), [])
  if (lp || lt) return <Spinner />
  const low = p.filter((x) => stockStatus(x) === 'Low Stock'), out = p.filter((x) => x.qty === 0)
  const cards = [
    ['Total Products', p.length, Package, '+3 this month'], ['Inventory Value', '$' + Math.round(p.reduce((a, x) => a + x.qty * x.cost, 0)).toLocaleString(), DollarSign, '+4.2% vs last month'],
    ['Low Stock Items', low.length, AlertTriangle, 'Needs reordering'], ['Out-of-Stock Items', out.length, XCircle, 'Action required'],
    ['Total Suppliers', s.length, Truck, 'Active partners'], ['Recent Transactions', t.length, ArrowLeftRight, 'Last 7 days']] as const
  const move = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({ d, in: [40, 25, 60, 10, 35, 55, 20][i], out: [30, 45, 20, 35, 50, 25, 40][i] }))
  return <div className="space-y-5">
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">{cards.map(([l, v, Icon, n], i) => <div key={l} className={`card p-4 ${i === 0 ? '!border-brand' : ''}`}><div className="flex items-center justify-between text-brand"><Icon size={20} /><span className="text-xs text-slate-500">{n}</span></div><div className="mt-3 text-xl font-semibold text-white">{v}</div><div className="text-xs text-slate-500">{l}</div></div>)}</div>
    <div className="card p-4"><h3 className="mb-3 font-medium text-white">Inventory stock overview</h3><div className="h-64"><ResponsiveContainer><BarChart data={daily}><XAxis dataKey="day" {...axis} /><YAxis {...axis} /><Tooltip {...tip} cursor={{ fill: '#ffffff08' }} /><Bar dataKey="earning" stackId="a" fill="#6ee7b7" /><Bar dataKey="commission" stackId="a" fill="#38bdf8" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div></div>
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="card p-4"><h3 className="mb-3 font-medium text-white">Stock movement trends</h3><div className="h-56"><ResponsiveContainer><LineChart data={move}><XAxis dataKey="d" {...axis} /><YAxis {...axis} /><Tooltip {...tip} /><Line dataKey="in" name="Stock in" stroke="#34d399" strokeWidth={2} /><Line dataKey="out" name="Stock out" stroke="#f87171" strokeWidth={2} /></LineChart></ResponsiveContainer></div></div>
      <div className="card p-4"><h3 className="mb-3 font-medium text-white">Product categories</h3><div className="flex h-56 items-center"><ResponsiveContainer width="60%"><PieChart><Pie data={CATEGORIES.map((c) => ({ name: c, value: p.filter((x) => x.category === c).length }))} dataKey="value" innerRadius={45} outerRadius={80} stroke="#111415">{CATEGORIES.map((_, i) => <Cell key={i} fill={COL[i]} />)}</Pie><Tooltip {...tip} /></PieChart></ResponsiveContainer>
        <ul className="space-y-1 text-xs">{CATEGORIES.map((c, i) => <li key={c} className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: COL[i] }} />{c}</li>)}</ul></div></div></div>
    <div className="card"><h3 className="p-4 pb-0 font-medium text-white">Recent inventory transactions</h3><DataTable<Txn> size={5} rows={t} cols={[{ h: 'ID', k: 'id' }, { h: 'Product', k: 'product' }, { h: 'Type', r: (r) => <Badge s={r.type} /> }, { h: 'Qty', k: 'qty' }, { h: 'Date', k: 'date' }]} /></div>
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="card p-4"><h3 className="mb-3 font-medium text-white">Low stock alerts</h3><ul className="space-y-2 text-sm">{[...out, ...low].slice(0, 5).map((x) => <li key={x.id} className="flex justify-between gap-2"><span className="truncate">{x.name}</span><Badge s={stockStatus(x)} /></li>)}</ul></div>
      <div className="card p-4"><h3 className="mb-3 font-medium text-white">Recently added products</h3><ul className="space-y-2 text-sm">{[...p].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5).map((x) => <li key={x.id} className="flex justify-between gap-2"><span className="truncate">{x.name}</span><span className="text-brand">${x.price}</span></li>)}</ul></div>
      <div className="card p-4"><h3 className="mb-3 font-medium text-white">Recent activity</h3><ul className="space-y-2 text-sm text-slate-400">{t.slice(0, 5).map((x) => <li key={x.id}>{x.by} recorded {x.type.toLowerCase()} of {x.qty} × {x.product}</li>)}</ul></div></div></div>
}
