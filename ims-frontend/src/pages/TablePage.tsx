// FILE: src/pages/TablePage.tsx
// PURPOSE: ONE reusable CRUD page (search, table, add/edit/view/delete, validation,
//          confirm). Powers Categories, Suppliers, Purchase Orders, Sales and Users.
// WHAT TO DO: to add a new simple screen, add an entry in TABLES in App.tsx with:
//             `table` (key in api.ts), `noun`, `cols`, `fields`. No new file needed.
//   For a custom screen (like purchase orders with line items) copy this file and extend it.
import { ReactNode, useState } from 'react'
import { Plus } from 'lucide-react'
import { deleteRow, listTable, saveRow } from '../services/api'
import { useLoad } from '../hooks/useLoad'
import { Confirm, DataTable, Field, FormModal, Modal, Spinner, useToast } from '../components/ui'
import { Row } from '../types'
import { createId } from '../utils/ids'

export type TableConfig = {
  table: string
  noun: string
  cols: { h: string; k?: string; r?: (row: Row) => ReactNode }[]
  fields: Field[]
  /** Hides the add/edit/delete controls, leaving a browse-only page. */
  readOnly?: boolean
}

/** Which dialog is open and for which row. `null` means no dialog is open. */
type ModalState = { kind: 'add' | 'edit' | 'view' | 'delete'; row?: Row } | null

/** Values collected by the add/edit form. */
type FormValues = Record<string, string | number>

/** Renders every property of a row as a label/value pair. */
function RowDetails({ row }: { row: Row }) {
  return (
    <dl className="space-y-2 text-sm">
      {Object.entries(row).map(([label, value]) => (
        <div key={label} className="flex justify-between gap-4 border-b border-line pb-1">
          <dt className="text-slate-500">{label}</dt>
          <dd>{String(value)}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function TablePage({ table, noun, cols, fields, readOnly }: TableConfig) {
  const [allRows, isLoading, reloadRows] = useLoad<Row[]>(() => listTable(table), [])

  const [searchText, setSearchText] = useState('')
  const [activeModal, setActiveModal] = useState<ModalState>(null)

  const toast = useToast()
  const canModify = !readOnly
  const nounLabel = noun.toLowerCase()

  // Search looks through every field of every row.
  const visibleRows = allRows.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(searchText.toLowerCase()),
  )

  const closeModal = () => setActiveModal(null)

  const openAdd = () => setActiveModal({ kind: 'add' })
  const openView = (row: Row) => setActiveModal({ kind: 'view', row })
  const openEdit = (row: Row) => setActiveModal({ kind: 'edit', row })
  const openDelete = (row: Row) => setActiveModal({ kind: 'delete', row })

  const handleSave = async (formValues: FormValues) => {
    // TEMPORARY: the ID prefix is the first letter of the table key (e.g. "suppliers" -> "S").
    // Step 4 replaces this with a proper setting.
    const newId = createId(table[0].toUpperCase())

    await saveRow(table, { ...activeModal?.row, ...formValues, id: activeModal?.row?.id ?? newId })

    toast(`${noun} ${activeModal?.kind === 'add' ? 'added' : 'updated'}`)
    closeModal()
    reloadRows()
  }

  const handleDelete = async (row: Row) => {
    await deleteRow(table, row.id)
    toast(`${noun} deleted`)
    closeModal()
    reloadRows()
  }

  const actionsColumn = {
    h: 'Actions',
    r: (row: Row) => (
      <div className="flex gap-3 text-brand">
        <button onClick={() => openView(row)}>View</button>
        {canModify && (
          <>
            <button onClick={() => openEdit(row)}>Edit</button>
            <button className="text-red-400" onClick={() => openDelete(row)}>
              Delete
            </button>
          </>
        )}
      </div>
    ),
  }

  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-2 p-4">
        <input
          className="inp max-w-xs"
          placeholder="Search…"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />

        {/* Pushes the add button to the far right. */}
        <div className="flex-1" />

        {canModify && (
          <button className="btn" onClick={openAdd}>
            <Plus size={15} />
            Add {nounLabel}
          </button>
        )}
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <DataTable<Row> rows={visibleRows} cols={[...cols, actionsColumn] as any} />
      )}

      {activeModal?.kind === 'view' && activeModal.row && (
        <Modal title={`${noun} details`} onClose={closeModal}>
          <RowDetails row={activeModal.row} />
        </Modal>
      )}

      {(activeModal?.kind === 'add' || activeModal?.kind === 'edit') && (
        <FormModal
          title={`${activeModal.kind === 'add' ? 'Add' : 'Edit'} ${nounLabel}`}
          fields={fields}
          init={activeModal.row as any}
          onSave={handleSave}
          onClose={closeModal}
        />
      )}

      {activeModal?.kind === 'delete' && activeModal.row && (
        <Confirm
          msg={`Delete this ${nounLabel}? This can’t be undone.`}
          onNo={closeModal}
          onYes={() => handleDelete(activeModal.row!)}
        />
      )}
    </div>
  )
}
