// FILE: src/pages/Stock.tsx
// PURPOSE: Stock In / Stock Out forms (validated) plus the transaction history table.
//          Stock Out is blocked if it exceeds available quantity.
// WHAT TO DO: when you add authentication, CURRENT_USER (src/config/currentUser.ts)
//             becomes the real logged-in user.
import { useState } from 'react'
import { addTxn, listProducts, listTable, listTxns } from '../services/api'
import { useLoad } from '../hooks/useLoad'
import { Badge, DataTable, Field, Form, Spinner, useToast } from '../components/ui'
import { CURRENT_USER } from '../config/currentUser'
import { Product, Row, Txn } from '../types'
import { getTodayDate } from '../utils/format'
import { createId } from '../utils/ids'

type StockTab = 'Stock In' | 'Stock Out'

const TABS: readonly StockTab[] = ['Stock In', 'Stock Out']

const STOCK_OUT_REASONS = ['Sale', 'Damaged', 'Expired', 'Internal use']

/** Values collected by the stock form. */
type FormValues = Record<string, string | number>

/** Tab button styling: brand for Stock In, red for Stock Out, muted when inactive. */
function tabButtonClass(tab: StockTab, isActive: boolean) {
  if (!isActive) return 'bg-white/5 text-slate-400'
  return tab === 'Stock In' ? 'bg-brand text-black' : 'bg-red-500 text-white'
}

/** Shows the quantity with a +/− prefix coloured by direction. */
function SignedQuantity({ row }: { row: Txn }) {
  const isIncoming = row.type === 'Stock In'
  return (
    <span className={isIncoming ? 'text-emerald-400' : 'text-red-400'}>
      {isIncoming ? '+' : '−'}
      {row.qty}
    </span>
  )
}

export default function Stock() {
  const [products, , reloadProducts] = useLoad<Product[]>(listProducts, [])
  const [transactions, isLoadingTransactions, reloadTransactions] = useLoad<Txn[]>(listTxns, [])
  const [suppliers] = useLoad<Row[]>(() => listTable('suppliers'), [])

  const [activeTab, setActiveTab] = useState<StockTab>('Stock In')
  // Changing this remounts <Form>, which clears it after a submit.
  const [formResetKey, setFormResetKey] = useState(0)

  const toast = useToast()
  const isStockIn = activeTab === 'Stock In'

  const formFields: Field[] = [
    { k: 'product', l: 'Product', o: products.map((product) => product.name), req: true },
    {
      k: 'qty',
      l: isStockIn ? 'Quantity received' : 'Quantity released',
      t: 'number',
      min: 1,
      req: true,
    },
    // Stock In is tied to a supplier; Stock Out to a reason instead.
    isStockIn
      ? { k: 'supplier', l: 'Supplier', o: suppliers.map((supplier) => String(supplier.name)), req: true }
      : { k: 'reason', l: 'Transaction reason', o: STOCK_OUT_REASONS, req: true },
    { k: 'ref', l: 'Reference number', req: true },
    { k: 'remarks', l: 'Remarks' },
  ]

  const handleSubmit = async (formValues: FormValues) => {
    const selectedProduct = products.find((product) => product.name === formValues.product)!

    // Never let a release take stock below zero.
    if (!isStockIn && +formValues.qty > selectedProduct.qty) {
      return toast(`Only ${selectedProduct.qty} units of ${selectedProduct.name} are available`, true)
    }

    await addTxn({
      id: createId('T'),
      product: selectedProduct.name,
      type: activeTab,
      qty: +formValues.qty,
      date: getTodayDate(),
      by: CURRENT_USER.name,
      remarks: formValues.remarks || formValues.ref,
    })

    toast(`${activeTab} recorded for ${selectedProduct.name}`)

    // Bump the key to remount the form empty, then refresh both datasets.
    setFormResetKey(formResetKey + 1)
    reloadProducts()
    reloadTransactions()
  }

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="mb-4 flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${tabButtonClass(tab, activeTab === tab)}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="max-w-lg">
          <Form
            key={activeTab + formResetKey}
            fields={formFields}
            onSave={handleSubmit}
            label={`Submit ${activeTab.toLowerCase()} transaction`}
          />
        </div>
      </div>

      <div className="card">
        <h3 className="p-4 pb-0 font-medium text-white">Transaction history</h3>
        {isLoadingTransactions ? (
          <Spinner />
        ) : (
          <DataTable<Txn>
            rows={transactions}
            cols={[
              { h: 'Transaction ID', k: 'id' },
              { h: 'Product', k: 'product' },
              { h: 'Type', k: 'type', r: (row) => <Badge s={row.type} /> },
              { h: 'Quantity', k: 'qty', r: (row) => <SignedQuantity row={row} /> },
              { h: 'Date', k: 'date' },
              { h: 'Processed by', k: 'by' },
              { h: 'Remarks', k: 'remarks' },
            ]}
          />
        )}
      </div>
    </div>
  )
}
