// FILE: src/pages/Dashboard.tsx
// PURPOSE: overview page: 6 stat cards, stock bar chart, stock movement line chart,
//          category pie, and 3 lists.
// WHAT TO DO: replace the hard-coded trend strings ("+4.2% vs last month") and the
//             `daily` / `WEEKLY_MOVEMENT_PLACEHOLDER` chart data with values from the API.
import { AlertTriangle, ArrowLeftRight, DollarSign, LucideIcon, Package, Truck, XCircle } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { listProducts, listTable, listTxns } from '../services/api'
import { useLoad } from '../hooks/useLoad'
import { Badge, DataTable, Spinner } from '../components/ui'
import { daily } from '../data/mock'
import { Product, Row, stockStatus, Txn } from '../types'
import { formatMoney } from '../utils/format'

const CHART_COLORS = ['#34d399', '#38bdf8', '#a78bfa', '#fbbf24', '#f87171']

const TOOLTIP_PROPS = {
  contentStyle: { background: '#111415', border: '1px solid #1f2528', borderRadius: 8, fontSize: 12 },
}

const AXIS_PROPS = {
  tick: { fill: '#64748b', fontSize: 11 },
  axisLine: false,
  tickLine: false,
} as const

// Placeholder numbers for the movement chart until the API provides them.
const WEEKLY_MOVEMENT_PLACEHOLDER = [
  { weekday: 'Mon', stockIn: 40, stockOut: 30 },
  { weekday: 'Tue', stockIn: 25, stockOut: 45 },
  { weekday: 'Wed', stockIn: 60, stockOut: 20 },
  { weekday: 'Thu', stockIn: 10, stockOut: 35 },
  { weekday: 'Fri', stockIn: 35, stockOut: 50 },
  { weekday: 'Sat', stockIn: 55, stockOut: 25 },
  { weekday: 'Sun', stockIn: 20, stockOut: 40 },
]

/** Finds a product by its id and returns its name. Falls back to the id if the product no longer exists. */
const productNameOf = (products: Product[], productId: string) =>
  products.find((product) => product.id === productId)?.name ?? productId

/* -------------------------------------------------------------------------- */
/* Stat cards                                                                  */
/* -------------------------------------------------------------------------- */

type SummaryCardProps = {
  label: string
  value: string | number
  Icon: LucideIcon
  note: string
  /** Draws the brand-coloured border on the primary card. */
  highlight?: boolean
}

function SummaryCard({ label, value, Icon, note, highlight }: SummaryCardProps) {
  return (
    <div className={`card p-4 ${highlight ? '!border-brand' : ''}`}>
      <div className="flex items-center justify-between text-brand">
        <Icon size={20} />
        <span className="text-xs text-slate-500">{note}</span>
      </div>
      <div className="mt-3 text-xl font-semibold text-white">{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Charts                                                                      */
/* -------------------------------------------------------------------------- */

function StockOverviewChart() {
  return (
    <div className="card p-4">
      <h3 className="mb-3 font-medium text-white">Inventory stock overview</h3>
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart data={daily}>
            <XAxis dataKey="day" {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} />
            <Tooltip {...TOOLTIP_PROPS} cursor={{ fill: '#ffffff08' }} />
            <Bar dataKey="earning" stackId="a" fill="#6ee7b7" />
            <Bar dataKey="commission" stackId="a" fill="#38bdf8" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function MovementTrendsChart() {
  return (
    <div className="card p-4">
      <h3 className="mb-3 font-medium text-white">Stock movement trends</h3>
      <div className="h-56">
        <ResponsiveContainer>
          <LineChart data={WEEKLY_MOVEMENT_PLACEHOLDER}>
            <XAxis dataKey="weekday" {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} />
            <Tooltip {...TOOLTIP_PROPS} />
            <Line dataKey="stockIn" name="Stock in" stroke="#34d399" strokeWidth={2} />
            <Line dataKey="stockOut" name="Stock out" stroke="#f87171" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function CategoryPieChart({ products, categories }: { products: Product[]; categories: Row[] }) {
  // One slice per category: its name and how many products point to it by categoryId.
  const productsPerCategory = categories.map((category) => ({
    name: String(category.name),
    value: products.filter((product) => product.categoryId === category.id).length,
  }))

  return (
    <div className="card p-4">
      <h3 className="mb-3 font-medium text-white">Product categories</h3>
      <div className="flex h-56 items-center">
        <ResponsiveContainer width="60%">
          <PieChart>
            <Pie data={productsPerCategory} dataKey="value" innerRadius={45} outerRadius={80} stroke="#111415">
              {categories.map((category, index) => (
                <Cell key={category.id} fill={CHART_COLORS[index]} />
              ))}
            </Pie>
            <Tooltip {...TOOLTIP_PROPS} />
          </PieChart>
        </ResponsiveContainer>

        <ul className="space-y-1 text-xs">
          {categories.map((category, index) => (
            <li key={category.id} className="flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-sm" style={{ background: CHART_COLORS[index] }} />
              {category.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Lists                                                                       */
/* -------------------------------------------------------------------------- */

function LowStockAlerts({ products }: { products: Product[] }) {
  // Out-of-stock first, then merely low stock, capped at five.
  const flagged = [...products.filter((product) => product.qty === 0), ...products.filter((product) => stockStatus(product) === 'Low Stock')]

  return (
    <div className="card p-4">
      <h3 className="mb-3 font-medium text-white">Low stock alerts</h3>
      <ul className="space-y-2 text-sm">
        {flagged.slice(0, 5).map((product) => (
          <li key={product.id} className="flex justify-between gap-2">
            <span className="truncate">{product.name}</span>
            <Badge s={stockStatus(product)} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function RecentlyAddedProducts({ products }: { products: Product[] }) {
  // Highest id first ≈ most recently created.
  const newestFirst = [...products].sort((a, b) => b.id.localeCompare(a.id))

  return (
    <div className="card p-4">
      <h3 className="mb-3 font-medium text-white">Recently added products</h3>
      <ul className="space-y-2 text-sm">
        {newestFirst.slice(0, 5).map((product) => (
          <li key={product.id} className="flex justify-between gap-2">
            <span className="truncate">{product.name}</span>
            <span className="text-brand">{formatMoney(product.price)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RecentActivity({ transactions, products }: { transactions: Txn[]; products: Product[] }) {
  return (
    <div className="card p-4">
      <h3 className="mb-3 font-medium text-white">Recent activity</h3>
      <ul className="space-y-2 text-sm text-slate-400">
        {transactions.slice(0, 5).map((transaction) => (
          <li key={transaction.id}>
            {transaction.by} recorded {transaction.type.toLowerCase()} of {transaction.qty} × {productNameOf(products, transaction.productId)}
          </li>
        ))}
      </ul>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Page                                                                        */
/* -------------------------------------------------------------------------- */

export default function Dashboard() {
  const [products, isLoadingProducts] = useLoad<Product[]>(listProducts, [])
  const [transactions, isLoadingTransactions] = useLoad<Txn[]>(listTxns, [])
  const [categories, isLoadingCategories] = useLoad<Row[]>(() => listTable('categories'), [])
  const [suppliers] = useLoad<Row[]>(() => listTable('suppliers'), [])

  if (isLoadingProducts || isLoadingTransactions || isLoadingCategories) return <Spinner />

  const lowStockProducts = products.filter((product) => stockStatus(product) === 'Low Stock')
  const outOfStockProducts = products.filter((product) => product.qty === 0)
  const inventoryValue = products.reduce((total, product) => total + product.qty * product.cost, 0)

  const summaryCards: SummaryCardProps[] = [
    { label: 'Total Products', value: products.length, Icon: Package, note: '+3 this month' },
    { label: 'Inventory Value', value: formatMoney(inventoryValue, 0), Icon: DollarSign, note: '+4.2% vs last month' },
    { label: 'Low Stock Items', value: lowStockProducts.length, Icon: AlertTriangle, note: 'Needs reordering' },
    { label: 'Out-of-Stock Items', value: outOfStockProducts.length, Icon: XCircle, note: 'Action required' },
    { label: 'Total Suppliers', value: suppliers.length, Icon: Truck, note: 'Active partners' },
    { label: 'Recent Transactions', value: transactions.length, Icon: ArrowLeftRight, note: 'Last 7 days' },
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {summaryCards.map(({ label, ...card }, index) => (
          <SummaryCard key={label} {...card} label={label} highlight={index === 0} />
        ))}
      </div>

      <StockOverviewChart />

      <div className="grid gap-4 lg:grid-cols-2">
        <MovementTrendsChart />
        <CategoryPieChart products={products} categories={categories} />
      </div>

      <div className="card">
        <h3 className="p-4 pb-0 font-medium text-white">Recent inventory transactions</h3>
        <DataTable<Txn>
          size={5}
          rows={transactions}
          cols={[
            { h: 'ID', k: 'id' },
            // Shows the product NAME; clicking the header sorts by product id for now.
            { h: 'Product', k: 'productId', r: (transaction) => productNameOf(products, transaction.productId) },
            { h: 'Type', r: (transaction) => <Badge s={transaction.type} /> },
            { h: 'Qty', k: 'qty' },
            { h: 'Date', k: 'date' },
          ]}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <LowStockAlerts products={products} />
        <RecentlyAddedProducts products={products} />
        <RecentActivity transactions={transactions} products={products} />
      </div>
    </div>
  )
}
