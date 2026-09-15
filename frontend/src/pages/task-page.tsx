import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { AlertCircleIcon } from 'lucide-react'
import { useAuth } from '@/auth/use-auth'
import { ApiError, getTask, updateTask } from '@/lib/api'
import type { TaskDetail } from '@/lib/types'
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
const STATUS_LABELS: Record<TaskDetail['status'], string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  done: 'Hecho',
}

/**
 * Vista mínima de una tarea.
 *
 * Es la superficie que la fecha de vencimiento necesita para existir, porque se
 * consulta y se fija al abrir la tarea, y **no** es la pantalla de detalle
 * completa: qué más debe mostrar sigue siendo una decisión de producto abierta
 * (PA-6). Por eso aquí no se edita el título, ni se cambia el responsable, ni
 * se borra nada.
 */
export function TaskPage() {
  const { token } = useAuth()
  const { id } = useParams()
  const taskId = Number(id)

  const [task, setTask] = useState<TaskDetail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!token) return

    // Un identificador que no es un número entero no puede corresponder a
    // ninguna tarea: se resuelve aquí, sin preguntar al servidor. Hay que fijar
    // el error igualmente, o la pantalla se quedaría cargando para siempre.
    if (!Number.isInteger(taskId)) {
      // Se limpia la tarea anterior: al cambiar solo el parámetro de la ruta el
      // componente se reutiliza, y sin esto se vería la tarea previa junto al
      // aviso de que no existe.
      setTask(null)
      setLoadError('Esa tarea no existe.')
      return
    }

    let cancelled = false

    getTask(taskId, token)
      .then((loaded) => {
        if (cancelled) return
        setTask(loaded)
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError(
          error instanceof ApiError
            ? error.message
            : 'No hemos podido cargar la tarea.',
        )
      })

    return () => {
      cancelled = true
    }
  }, [token, taskId])

  /**
   * Guarda la fecha en cuanto cambia: sin botón de guardado y, al retirarla,
   * sin ningún diálogo de confirmación.
   *
   * Si el servidor la rechaza, la tarea conserva intacta la que tuviera y el
   * problema se explica junto al propio campo. El campo de fecha nativo solo
   * emite fechas completas, así que este camino lo recorren sobre todo los
   * rechazos del servidor, no cada pulsación.
   */
  const handleDueDateChange = async (value: string) => {
    if (!token || !task || isSaving) return

    setIsSaving(true)
    setDateError(null)
    setActionError(null)

    try {
      const updated = await updateTask(
        task.id,
        { dueDate: value === '' ? null : value },
        token,
      )

      // Sin optimismo: la vista no cambia hasta que el servidor confirma.
      setTask(updated)
    } catch (error: unknown) {
      if (error instanceof ApiError && error.fieldErrors.dueDate) {
        setDateError(error.fieldErrors.dueDate)
      } else {
        setActionError(
          error instanceof ApiError
            ? error.message
            : 'No hemos podido guardar la fecha.',
        )
      }
    } finally {
      setIsSaving(false)
    }
  }

  if (task === null && !loadError) return <FullScreenLoader />

  const alertMessage = actionError ?? loadError

  return (
    <div className="bg-muted/40 flex min-h-svh justify-center p-6">
      <Card className="h-fit w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{task?.title ?? 'Tarea'}</CardTitle>
          <CardDescription>
            {task
              ? `${STATUS_LABELS[task.status]} · ${task.assignee.fullName || 'Sin nombre'}`
              : 'No hemos podido cargar esta tarea.'}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          {alertMessage && (
            <Alert variant="destructive">
              <AlertCircleIcon />
              <AlertDescription>{alertMessage}</AlertDescription>
            </Alert>
          )}

          {task && (
            <>
              {/*
                Señal propia de vencida: se dice con palabras, no solo con
                color, para no obligar a nadie a comparar la fecha con hoy.
              */}
              {task.isOverdue && (
                <p
                  role="status"
                  className="border-destructive/50 text-destructive rounded-lg border px-3 py-2 text-sm font-medium"
                >
                  ⚠ Vencida — la fecha de vencimiento ya pasó y la tarea sigue
                  sin estar hecha.
                </p>
              )}

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Fecha de vencimiento</Label>
                <Input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  value={task.dueDate ?? ''}
                  disabled={isSaving}
                  onChange={(event) => handleDueDateChange(event.target.value)}
                  aria-invalid={Boolean(dateError)}
                  aria-describedby={dateError ? 'dueDate-error' : undefined}
                />
                <FieldError
                  id="dueDate-error"
                  message={dateError ?? undefined}
                />
                <p className="text-muted-foreground text-sm">
                  Opcional. Se guarda sola al cambiarla; vacíala para quitarla.
                </p>
              </div>
            </>
          )}

          <Button variant="outline" asChild>
            <Link to="/tasks">Volver a la lista</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
