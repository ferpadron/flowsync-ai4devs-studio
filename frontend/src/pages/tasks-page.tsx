import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { AlertCircleIcon } from 'lucide-react'
import { useAuth } from '@/auth/use-auth'
import { useAuthForm } from '@/auth/use-auth-form'
import { ApiError, createTask, listTasks, updateTask } from '@/lib/api'
import type { Task, TaskStatus } from '@/lib/types'
import { FieldError } from '@/components/field-error'
import { FullScreenLoader } from '@/components/full-screen-loader'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/** Los identificadores viajan por la API; en pantalla solo se ven las etiquetas. */
const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecho',
}

/** Orden en que se ofrecen los tres destinos dentro de cada fila. */
const STATUS_ORDER: readonly TaskStatus[] = ['pending', 'in_progress', 'done']

/**
 * Recorta una tarea a lo que la lista muestra.
 *
 * La actualización responde con la representación individual, que trae fecha de
 * vencimiento y veredicto. La lista no los muestra y tampoco los guarda: se
 * descartan aquí, en el único punto por el que pueden entrar.
 */
const toListEntry = ({ id, title, status, assignee }: Task): Task => ({
  id,
  title,
  status,
  assignee,
})

const FIELDS = ['title'] as const

export function TasksPage() {
  const { token } = useAuth()
  const [tasks, setTasks] = useState<Task[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  /** Filas con un cambio de estado en vuelo, para no reenviar la misma. */
  const [pendingIds, setPendingIds] = useState<ReadonlySet<number>>(new Set())
  const [title, setTitle] = useState('')
  const { isSubmitting, formError, fieldErrors, submit } = useAuthForm(FIELDS)

  // La lista es una sola y es la misma para todo el mundo: se pide entera, sin
  // filtrar por quien mira y sin imponer ningún orden.
  useEffect(() => {
    if (!token) return

    let cancelled = false

    listTasks(token)
      .then((loaded) => {
        if (cancelled) return
        setTasks(loaded)
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'No hemos podido cargar las tareas.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [token])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!token) return

    return submit(async () => {
      const created = await createTask({ title }, token)

      // La tarea que devuelve el servidor entra tal cual en la lista que ya
      // está en pantalla: ni recarga, ni navegación, ni una segunda petición.
      setTasks((current) => [...(current ?? []), created])
      setTitle('')
    })
  }

  // Un gesto y nada más: ni abrir la tarea, ni diálogo, ni campos. No se
  // comprueba de quién es la tarea — cualquiera puede cambiar cualquier estado.
  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    if (!token || pendingIds.has(task.id) || status === task.status) return

    setPendingIds((current) => new Set(current).add(task.id))
    setActionError(null)

    try {
      const updated = await updateTask(task.id, { status }, token)

      // Sin optimismo (D8): la fila no cambia hasta que el servidor confirma,
      // y entonces se sustituye por la tarea que él devuelve, recortada a lo
      // que la lista muestra. La actualización responde con la representación
      // individual, y la fecha y el vencimiento no entran en la lista ni
      // siquiera en memoria.
      setTasks((current) =>
        (current ?? []).map((item) =>
          item.id === updated.id ? toListEntry(updated) : item,
        ),
      )
    } catch (error: unknown) {
      // El estado anterior se conserva: no se tocó nada antes de la respuesta.
      setActionError(
        error instanceof ApiError
          ? error.message
          : 'No hemos podido cambiar el estado.',
      )
    } finally {
      setPendingIds((current) => {
        const next = new Set(current)
        next.delete(task.id)
        return next
      })
    }
  }

  if (tasks === null && !loadError) return <FullScreenLoader />

  const alertMessage = formError ?? actionError ?? loadError

  return (
    <div className="bg-muted/40 flex min-h-svh justify-center p-6">
      <Card className="h-fit w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Tareas del equipo</CardTitle>
          <CardDescription>
            Una sola lista, la misma para todo el mundo.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          <form onSubmit={handleSubmit} className="grid gap-2" noValidate>
            <Label htmlFor="title">Nueva tarea</Label>
            <div className="flex items-start gap-2">
              <div className="grid flex-1 gap-2">
                <Input
                  id="title"
                  name="title"
                  placeholder="¿Qué hay que hacer?"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={
                    fieldErrors.title ? 'title-error' : undefined
                  }
                />
                <FieldError id="title-error" message={fieldErrors.title} />
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creando…' : 'Crear'}
              </Button>
            </div>
          </form>

          {alertMessage && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}

          {tasks && tasks.length === 0 ? (
            <div className="border-muted-foreground/25 grid gap-1 rounded-lg border border-dashed p-8 text-center">
              <p className="font-medium">Todavía no hay ninguna tarea</p>
              <p className="text-muted-foreground text-sm">
                Aquí se ve en qué anda cada persona del equipo: el título de
                cada tarea, quién la lleva y en qué estado está. Escribe un
                título arriba para crear la primera.
              </p>
            </div>
          ) : (
            <ul className="grid gap-2">
              {tasks?.map((task) => (
                <li
                  key={task.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4"
                >
                  <div className="min-w-0">
                    {/*
                      Abrir la tarea es una forma de llegar a su vista, no un
                      dato nuevo: la fila sigue mostrando exactamente título,
                      responsable y estado.
                    */}
                    <Link
                      to={`/tasks/${task.id}`}
                      className="truncate font-medium hover:underline focus-visible:underline block"
                    >
                      {task.title}
                    </Link>
                    <p className="text-muted-foreground truncate text-sm">
                      {task.assignee.fullName || 'Sin nombre'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {STATUS_ORDER.map((status) => (
                      <Button
                        key={status}
                        type="button"
                        size="sm"
                        variant={status === task.status ? 'default' : 'outline'}
                        aria-pressed={status === task.status}
                        disabled={pendingIds.has(task.id)}
                        onClick={() => handleStatusChange(task, status)}
                      >
                        {STATUS_LABELS[status]}
                      </Button>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
