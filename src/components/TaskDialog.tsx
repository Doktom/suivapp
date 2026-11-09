import { useState, type FormEvent } from 'react'
import { useStore } from '../data/store'
import type { Priority, Task } from '../domain/types'
import { Button, Dialog, Field, inputClass } from './ui'

export function TaskDialog({ task, onClose }: { task: Task | null; onClose: () => void }) {
  const { data, save } = useStore()
  const [title, setTitle] = useState(task?.title ?? '')
  const [note, setNote] = useState(task?.note ?? '')
  const [listId, setListId] = useState(task?.list_id ?? '')
  const [due, setDue] = useState(task?.due_date ?? '')
  const [priority, setPriority] = useState<Priority>(task?.priority ?? 'normal')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    save('tasks', {
      id: task?.id ?? crypto.randomUUID(),
      parent_id: task?.parent_id ?? null,
      completed_at: task?.completed_at ?? null,
      xp_earned: task?.xp_earned ?? 0,
      title: title.trim(),
      note,
      list_id: listId || null,
      due_date: due || null,
      priority,
    } satisfies Task)
    onClose()
  }

  return (
    <Dialog title={task ? 'Modifier la tâche' : 'Nouvelle tâche'} onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field label="Titre">
          <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </Field>
        <Field label="Note">
          <textarea className={`${inputClass} py-2`} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Liste">
            <select className={inputClass} value={listId} onChange={(e) => setListId(e.target.value)}>
              <option value="">Aucune</option>
              {data.task_lists.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Priorité">
            <select className={inputClass} value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              <option value="low">Basse</option>
              <option value="normal">Normale</option>
              <option value="high">Haute</option>
            </select>
          </Field>
        </div>
        <Field label="Échéance">
          <input type="date" className={inputClass} value={due} onChange={(e) => setDue(e.target.value)} />
        </Field>
        <Button type="submit" variant="primary">Enregistrer</Button>
      </form>
    </Dialog>
  )
}
