// FILE: src/components/Layout.tsx
// PURPOSE: app shell: dark sidebar (grouped sections, logo, profile + logout), top bar (search, date, bell, profile) and mobile drawer.
// WHAT TO DO: add or rename menu items in the NAV array (the label must match a key in App.tsx).
//   When you add react-router, turn each button into a <NavLink>.
import { ReactNode, useState } from 'react'
import { BarChart3, Bell, Boxes, ClipboardList, Folder, LayoutDashboard, LogOut, Menu, Package, Search, Settings, ShoppingCart, Tag, Truck, Users, ArrowLeftRight } from 'lucide-react'
import { useToast } from './ui'

export const NAV: { section: string; items: [string, typeof Boxes][] }[] = [
  { section: 'MENU', items: [['Dashboard', LayoutDashboard]] },
  { section: 'INVENTORY', items: [['Inventory', Boxes], ['Products', Tag], ['Categories', Folder], ['Suppliers', Truck], ['Stock Management', ArrowLeftRight]] },
  { section: 'ORDERS', items: [['Purchase Orders', ClipboardList], ['Sales Transactions', ShoppingCart]] },
  { section: 'ANALYTICS', items: [['Reports and Analytics', BarChart3]] },
  { section: 'ADMINISTRATION', items: [['User Management', Users], ['Settings', Settings]] },
]

export default function Layout({ page, go, onSearch, children }: { page: string; go: (p: string) => void; onSearch: (q: string) => void; children: ReactNode }) {
  const [open, setOpen] = useState(false), [bell, setBell] = useState(false), toast = useToast()
  const side = <div className="flex h-full flex-col bg-panel">
    <div className="flex items-center gap-2 px-5 py-5"><div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-black"><Package size={18} /></div><span className="text-lg font-bold text-white">StockWise</span></div>
    <nav className="flex-1 overflow-y-auto px-3">{NAV.map((g) => <div key={g.section} className="mb-3"><div className="px-3 py-1 text-[11px] text-slate-600">{g.section}</div>
      {g.items.map(([l, Icon]) => <button key={l} onClick={() => { go(l); setOpen(false) }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm ${page === l ? 'bg-brand/10 text-brand' : 'text-slate-400 hover:bg-white/5'}`}><Icon size={16} />{l}</button>)}</div>)}</nav>
    <div className="space-y-3 border-t border-line p-4"><div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-line text-sm text-white">AR</div><div><div className="text-sm text-white">Amara Reyes</div><div className="text-xs text-brand">Administrator</div></div></div>
      <button className="btn w-full justify-center" onClick={() => toast('Signed out (demo session)')}><LogOut size={15} />Logout</button></div></div>
  return <div className="min-h-screen md:flex">
    <aside className="hidden w-60 shrink-0 border-r border-line md:sticky md:top-0 md:block md:h-screen">{side}</aside>
    {open && <div className="fixed inset-0 z-40 md:hidden"><div className="absolute inset-0 bg-black/70" onClick={() => setOpen(false)} /><div className="absolute inset-y-0 left-0 w-64">{side}</div></div>}
    <div className="min-w-0 flex-1 p-4 md:p-6">
      <header className="card mb-5 flex items-center gap-3 px-4 py-2.5">
        <button className="md:hidden" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={20} /></button>
        <Search size={16} className="text-slate-500" /><input className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-500" placeholder="Search products and press Enter…" onKeyDown={(e) => { if (e.key === 'Enter') onSearch(e.currentTarget.value) }} />
        <span className="hidden text-xs text-slate-500 lg:block">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        <div className="relative"><button aria-label="Notifications" onClick={() => setBell(!bell)} className="relative rounded-lg p-2 hover:bg-white/5"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand" /></button>
          {bell && <div className="card absolute right-0 z-30 mt-2 w-64 p-3 text-sm text-slate-300">Some products need restocking. Open Inventory and filter by “Low Stock”.</div>}</div>
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-line text-xs text-white" onClick={() => go('Settings')} aria-label="Profile">AR</button></header>
      <h1 className="text-2xl font-semibold text-brand">{page}</h1><p className="mb-5 mt-1 text-xs text-slate-500">Home / {page}</p>
      {children}</div></div>
}
