// FILE: src/components/ui.tsx
// PURPOSE: the reusable design system: toasts, badges, modal, confirm dialog, validated form, sortable + paginated table.
// WHAT TO DO: build every new screen from these pieces. Do not hand-roll tables, modals or forms in pages.
import { createContext, ReactNode, useContext, useMemo, useState } from 'react'
import { X } from 'lucide-react'

/* ============================================================
   TOAST (small popup message in the bottom-right corner)
   ============================================================ */

// A "showToast" function: pass a message, and optionally `true` to show it as an error.
type ShowToast = (message: string, isError?: boolean) => void

// The context lets any component call the toast function without passing it down as a prop.
const ToastContext = createContext<ShowToast>(() => {})

// Use this hook inside any component: toast('Saved') or toast('Failed', true)
export const useToast = () => useContext(ToastContext)

// Wrap the whole app in this once, so every component can use useToast().
export function ToastProvider({ children }: { children: ReactNode }) {
  // The toast currently on screen (or null when there is none).
  const [toast, setToast] = useState<{ text: string; isError?: boolean } | null>(null)

  const showToast: ShowToast = (text, isError) => {
    setToast({ text, isError })
    setTimeout(() => setToast(null), 3000) // hide after 3 seconds
  }

  const colorClasses = toast?.isError ? 'bg-red-500 text-white' : 'bg-brand text-black'

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      {toast && (
        <div role="status" className={`fixed bottom-5 right-5 z-[60] rounded-lg px-4 py-3 text-sm font-medium shadow-lg ${colorClasses}`}>
          {toast.text}
        </div>
      )}
    </ToastContext.Provider>
  )
}

/* ============================================================
   BADGE (small colored label, e.g. "In Stock")
   ============================================================ */

// Step 1: which color does each status word use?
const STATUS_COLOR: Record<string, string> = {
  'In Stock': 'emerald',
  'Low Stock': 'amber',
  'Out of Stock': 'red',
  'Stock In': 'emerald',
  'Stock Out': 'red',
  Active: 'emerald',
  Inactive: 'slate',
  Pending: 'amber',
  Approved: 'sky',
  Ordered: 'indigo',
  Completed: 'emerald',
  Cancelled: 'red',
}

// Step 2: what Tailwind classes does each color use?
const COLOR_CLASSES: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400',
  amber: 'bg-amber-500/15 text-amber-400',
  red: 'bg-red-500/15 text-red-400',
  sky: 'bg-sky-500/15 text-sky-400',
  indigo: 'bg-indigo-500/15 text-indigo-400',
  slate: 'bg-slate-500/15 text-slate-400',
}

// `s` is the status text. Unknown statuses fall back to grey ("slate").
export const Badge = ({ s }: { s: string }) => {
  const color = STATUS_COLOR[s] ?? 'slate'
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_CLASSES[color]}`}>{s}</span>
}

/* ============================================================
   SPINNER (loading text)
   ============================================================ */

export const Spinner = () => <div className="p-10 text-center text-sm text-slate-500">Loading…</div>

/* ============================================================
   MODAL (popup window) and CONFIRM (yes/no popup)
   ============================================================ */

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    // Clicking the dark background closes the modal...
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      {/* ...but clicking inside the white box must NOT close it, so we stop the click here. */}
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-semibold text-white">{title}</h3>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

// A modal that asks "are you sure?". onYes runs the delete, onNo cancels.
export const Confirm = ({ msg, onYes, onNo }: { msg: string; onYes: () => void; onNo: () => void }) => (
  <Modal title="Please confirm" onClose={onNo}>
    <p className="text-sm text-slate-400">{msg}</p>
    <div className="flex justify-end gap-2 pt-5">
      <button className="btn2" onClick={onNo}>Cancel</button>
      <button className="btn !bg-red-500 !text-white" onClick={onYes}>Delete</button>
    </div>
  </Modal>
)

/* ============================================================
   FORM (inputs + validation)
   ============================================================ */

// Describes one input in the form.
// One dropdown choice: `value` is what gets saved (e.g. "C-01"), `label` is what the user sees.
export type Option = { value: string; label: string }

// Describes one input in the form.
export type Field = {
  k: string // key: the name the value is stored under (e.g. "email")
  l: string // label shown above the input
  t?: string // input type: 'text' (default), 'email', 'number', ...
  o?: (string | Option)[] // options: plain strings, or { value, label } pairs. Shows a dropdown instead of a text input
  req?: boolean // required: must not be empty
  min?: number // smallest allowed number (only for type 'number'; default 0)
}

// The form's values: one entry per field key.
type FormValues = Record<string, string | number>

// Returns an error message for one field, or '' if the value is fine.
function validateField(field: Field, value: string | number | undefined): string {
  const isEmpty = value === undefined || value === ''

  if (field.req && isEmpty) return 'This field is required'

  if (field.t === 'email' && !isEmpty && !/^\S+@\S+\.\S+$/.test(String(value))) {
    return 'Enter a valid email address'
  }

  if (field.t === 'number' && !isEmpty) {
    const minimum = field.min ?? 0
    const num = Number(value)
    if (isNaN(num) || num < minimum) return `Enter a number of ${minimum} or more`
  }

  return ''
}

// Inline form with validation (required, email, number min). Used inside modals and on the Stock page.
export function Form({ fields, init, onSave, onCancel, label = 'Save' }: {
  fields: Field[]
  init?: FormValues // starting values (e.g. when editing a record)
  onSave: (values: FormValues) => void
  onCancel?: () => void // if given, a Cancel button is shown
  label?: string // text on the save button
}) {
  const [values, setValues] = useState<FormValues>(init ?? {})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update one field's value, keeping all the others.
  const setValue = (key: string, value: string) => setValues({ ...values, [key]: value })

  const handleSave = () => {
    // Check every field and collect the error messages.
    const newErrors: Record<string, string> = {}
    fields.forEach((field) => {
      const message = validateField(field, values[field.k])
      if (message) newErrors[field.k] = message
    })
    setErrors(newErrors)

    // Only save when there are no errors.
    if (Object.keys(newErrors).length === 0) onSave(values)
  }

  return (
    <div className="space-y-3">
      {fields.map((field) => (
        <label key={field.k} className="block text-sm">
          <span className="text-slate-400">{field.l}</span>

          {field.o ? (
            // Dropdown
            <select className="inp mt-1" value={values[field.k] ?? ''} onChange={(e) => setValue(field.k, e.target.value)}>
              <option value="">Select…</option>
              {field.o.map((option) => {
                // A plain string is both the value and the label; an Option has them separately.
                const { value, label } = typeof option === 'string' ? { value: option, label: option } : option
                return <option key={value} value={value}>{label}</option>
              })}
            </select>
          ) : (
            // Regular input
            <input className="inp mt-1" type={field.t ?? 'text'} value={values[field.k] ?? ''} onChange={(e) => setValue(field.k, e.target.value)} />
          )}

          {errors[field.k] && <span className="text-xs text-red-400">{errors[field.k]}</span>}
        </label>
      ))}

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && <button className="btn2" onClick={onCancel}>Cancel</button>}
        <button className="btn" onClick={handleSave}>{label}</button>
      </div>
    </div>
  )
}

// A Form shown inside a Modal. Closing or cancelling calls onClose.
export const FormModal = (props: { title: string; fields: Field[]; init?: FormValues; onSave: (values: FormValues) => void; onClose: () => void }) => (
  <Modal title={props.title} onClose={props.onClose}>
    <Form fields={props.fields} init={props.init} onSave={props.onSave} onCancel={props.onClose} />
  </Modal>
)

/* ============================================================
   DATA TABLE (sortable + paginated)
   ============================================================ */

// Describes one table column.
type Col<T> = {
  h: string // header text
  k?: keyof T & string // key of the row property to show; also makes the column sortable
  r?: (row: T) => ReactNode // custom renderer for the cell (use instead of `k` for buttons, badges, etc.)
}

// Table with click-to-sort headers, pagination and an empty state. `k` = sortable key, `r` = custom cell renderer.
export function DataTable<T extends { id: string }>({ cols, rows, size = 8 }: { cols: Col<T>[]; rows: T[]; size?: number }) {
  const [sortKey, setSortKey] = useState<string | null>(null) // which column is sorted (null = not sorted)
  const [ascending, setAscending] = useState(true)
  const [page, setPage] = useState(0) // 0 = first page

  // Sort a copy of the rows (never change the original array). Re-runs only when something it uses changes.
  const sortedRows = useMemo(() => {
    if (!sortKey) return rows
    const direction = ascending ? 1 : -1
    return [...rows].sort((a: any, b: any) => {
      if (a[sortKey] > b[sortKey]) return direction
      if (a[sortKey] < b[sortKey]) return -direction
      return 0
    })
  }, [rows, sortKey, ascending])

  // Pagination math. `currentPage` is kept in range in case the rows shrink (e.g. after a search).
  const totalPages = Math.max(1, Math.ceil(sortedRows.length / size))
  const currentPage = Math.min(page, totalPages - 1)
  const firstIndex = currentPage * size
  const pageRows = sortedRows.slice(firstIndex, firstIndex + size)

  // Empty state
  if (!rows.length) {
    return <div className="p-10 text-center text-sm text-slate-500">No records match. Adjust your search or filters, or add a new record.</div>
  }

  // Clicking a header: if it is already the sorted column, flip the direction; otherwise sort it ascending.
  const handleSortClick = (key: string) => {
    setAscending(sortKey === key ? !ascending : true)
    setSortKey(key)
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-slate-500">
              {cols.map((col) => (
                <th key={col.h} className="whitespace-nowrap px-4 py-3 font-medium">
                  {col.k ? (
                    <button className="hover:text-white" onClick={() => handleSortClick(col.k!)}>
                      {col.h}
                      {sortKey === col.k ? (ascending ? ' ↑' : ' ↓') : ''}
                    </button>
                  ) : (
                    col.h
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pageRows.map((row) => (
              <tr key={row.id} className="border-b border-line/60 hover:bg-white/[.03]">
                {cols.map((col) => (
                  <td key={col.h} className="whitespace-nowrap px-4 py-3">
                    {col.r ? col.r(row) : String((row as any)[col.k!] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer: "1–8 of 20" and Previous / Next buttons */}
      <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-500">
        <span>{firstIndex + 1}–{Math.min(sortedRows.length, firstIndex + size)} of {sortedRows.length}</span>
        <div className="flex gap-2">
          <button className="btn2" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button>
          <button className="btn2" disabled={currentPage >= totalPages - 1} onClick={() => setPage(currentPage + 1)}>Next</button>
        </div>
      </div>
    </div>
  )
}
