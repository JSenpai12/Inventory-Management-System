// FILE: src/pages/Inventory.tsx
// PURPOSE: product table with search, category + status filters, sorting, pagination,
//          and add / edit / view / delete (with confirm + validation).
//   Also used for the "Products" menu item (same data, same forms).
// WHAT TO DO: add the Product Image upload and Description fields here when the API
//             supports files. `initialQuery` comes from the top-bar search.
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { listProducts, listTable, removeProduct, saveProduct } from '../services/api'
import { useLoad } from '../hooks/useLoad'
import { Badge, Confirm, DataTable, Field, FormModal, Modal, Spinner, useToast } from '../components/ui'
import { CATEGORIES } from '../data/mock'
import { Product, Row, stockStatus } from '../types'
import { formatMoney, getTodayDate } from '../utils/format'
import { createId } from '../utils/ids'

/** Which dialog is open and for which product. `null` means no dialog is open. */
type ModalState = { kind: 'add' | 'edit' | 'view' | 'delete'; product?: Product } | null

const STATUS_OPTIONS = ['In Stock', 'Low Stock', 'Out of Stock']

/** Values collected by the add/edit form. */
type FormValues = Record<string, string | number>

export default function Inventory({ initialQuery = '' }: { initialQuery?: string }) {
  const [products, isLoading, reloadProducts] = useLoad<Product[]>(listProducts, [])
  const [suppliers] = useLoad<Row[]>(() => listTable('suppliers'), [])

  const [searchText, setSearchText] = useState(initialQuery)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [activeModal, setActiveModal] = useState<ModalState>(null)

  const toast = useToast()

  const formFields: Field[] = [
    { k: 'name', l: 'Product name', req: true },
    { k: 'sku', l: 'SKU / barcode', req: true },
    { k: 'category', l: 'Category', o: CATEGORIES, req: true },
    { k: 'supplier', l: 'Supplier', o: suppliers.map((supplier) => String(supplier.name)) },
    { k: 'price', l: 'Unit price ($)', t: 'number', req: true },
    { k: 'cost', l: 'Cost price ($)', t: 'number', req: true },
    { k: 'qty', l: 'Current quantity', t: 'number', req: true },
    { k: 'min', l: 'Minimum stock level', t: 'number', req: true },
  ]

  // Apply the search box and both dropdown filters.
  const visibleProducts = products.filter((product) => {
    const matchesCategory = !categoryFilter || product.category === categoryFilter
    const matchesStatus = !statusFilter || stockStatus(product) === statusFilter
    const searchTarget = (product.name + product.sku + product.id).toLowerCase()
    const matchesSearch = searchTarget.includes(searchText.toLowerCase())

    return matchesCategory && matchesStatus && matchesSearch
  })

  const closeModal = () => setActiveModal(null)

  const openAdd = () => setActiveModal({ kind: 'add' })
  const openView = (product: Product) => setActiveModal({ kind: 'view', product })
  const openEdit = (product: Product) => setActiveModal({ kind: 'edit', product })
  const openDelete = (product: Product) => setActiveModal({ kind: 'delete', product })

  const handleSave = async (formValues: FormValues) => {
    const isNewProduct = activeModal?.kind === 'add'

    await saveProduct({
      // Existing values first, so a new product starts from nothing.
      ...activeModal?.product,
      ...formValues,
      id: activeModal?.product?.id ?? createId('P'),
      // Form inputs come back as strings; the store expects numbers.
      qty: +formValues.qty,
      price: +formValues.price,
      cost: +formValues.cost,
      min: +formValues.min,
      updated: getTodayDate(),
    })

    toast(isNewProduct ? 'Product added' : 'Product updated')
    closeModal()
    reloadProducts()
  }

  const handleDelete = async (product: Product) => {
    await removeProduct(product.id)
    toast('Product deleted')
    closeModal()
    reloadProducts()
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-2 p-4">
        <input
          className="inp max-w-xs"
          placeholder="Search name, SKU or ID…"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        <select
          className="inp w-auto"
          value={categoryFilter}
          onChange={(event) => setCategoryFilter(event.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>

        <select
          className="inp w-auto"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>

        {/* Pushes the add button to the far right. */}
        <div className="flex-1" />

        <button className="btn" onClick={openAdd}>
          <Plus size={15} />
          Add new product
        </button>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <DataTable<Product>
          rows={visibleProducts}
          cols={[
            { h: 'Product ID', k: 'id' },
            { h: 'Product name', k: 'name' },
            { h: 'Category', k: 'category' },
            { h: 'SKU', k: 'sku' },
            { h: 'Qty', k: 'qty' },
            { h: 'Unit price', k: 'price', r: (product) => formatMoney(product.price) },
            { h: 'Status', r: (product) => <Badge s={stockStatus(product)} /> },
            { h: 'Last updated', k: 'updated' },
            {
              h: 'Actions',
              r: (product) => (
                <div className="flex gap-3 text-brand">
                  <button onClick={() => openView(product)}>View</button>
                  <button onClick={() => openEdit(product)}>Edit</button>
                  <button className="text-red-400" onClick={() => openDelete(product)}>
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {activeModal?.kind === 'view' && activeModal.product && (
        <Modal title={activeModal.product.name} onClose={closeModal}>
          <dl className="space-y-2 text-sm">
            {Object.entries(activeModal.product).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-line pb-1">
                <dt className="text-slate-500">{label}</dt>
                <dd>{String(value)}</dd>
              </div>
            ))}
          </dl>
        </Modal>
      )}

      {(activeModal?.kind === 'add' || activeModal?.kind === 'edit') && (
        <FormModal
          title={activeModal.kind === 'add' ? 'Add new product' : 'Edit product'}
          fields={formFields}
          init={activeModal.product as any}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {activeModal?.kind === 'delete' && activeModal.product && (
        <Confirm
          msg={`Delete “${activeModal.product.name}”? This can’t be undone.`}
          onNo={closeModal}
          onYes={() => handleDelete(activeModal.product!)}
        />
      )}
    </div>
  )
}
