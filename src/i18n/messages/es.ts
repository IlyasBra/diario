/**
 * Spanish: the source language. Every other language must provide exactly
 * these keys (the compiler checks it). `{name}` marks a value filled in at
 * runtime. Counted nouns have one key per plural form ("_one", "_other").
 */
export const es = {
  // Common
  'common.cancel': 'Cancelar',
  'common.delete': 'Borrar',
  'common.save': 'Guardar',
  'common.add': 'Añadir',
  'common.close': 'Cerrar',
  'common.edit': 'Editar',
  'common.loading': 'Cargando…',
  'day.today': 'Hoy',
  'day.tomorrow': 'Mañana',
  'priority.legend': 'Prioridad',
  'priority.high': 'Alta',
  'priority.medium': 'Media',
  'priority.low': 'Baja',

  // Counted nouns
  'count.tasks_one': '{count} tarea',
  'count.tasks_other': '{count} tareas',
  'count.completed_one': '{count} completada',
  'count.completed_other': '{count} completadas',
  'count.overdue_one': '{count} tarea atrasada',
  'count.overdue_other': '{count} tareas atrasadas',
  'count.reminders_one': '{count} recordatorio',
  'count.reminders_other': '{count} recordatorios',
  'count.days_one': '{count} día',
  'count.days_other': '{count} días',

  // Layout and navigation
  'layout.skip': 'Saltar al contenido',
  'nav.label': 'Secciones',
  'nav.today': 'Hoy',
  'nav.upcoming': 'Próximos',
  'nav.calendar': 'Calendario',
  'nav.reminders': 'Avisos',
  'nav.stats': 'Resumen',
  'header.search': 'Buscar',
  'header.settings': 'Ajustes',
  'main.newTask': 'Nueva tarea',
  'main.newReminder': 'Nuevo recordatorio',
  'main.noStorage':
    'Este navegador no permite guardar datos: lo que apuntes se perderá al cerrar la app.',
  'main.retry': 'Inténtalo de nuevo.',
  'main.loadErrorTitle': 'No se han podido cargar tus datos',
  'main.loadErrorDescription':
    'Recarga la página. Si el problema sigue, revisa el espacio libre del dispositivo.',
  'notice.dismiss': 'Cerrar aviso',

  // Filters and search
  'filters.summary': 'Filtros',
  'filters.summaryActive': 'Filtros (activos)',
  'filters.tag': 'Etiqueta',
  'filters.priority': 'Prioridad',
  'filters.all': 'Todas',
  'filters.clear': 'Quitar filtros',
  'search.title': 'Buscar',
  'search.label': 'Buscar en tareas y recordatorios',
  'search.hint':
    'Escribe una palabra o elige una etiqueta o prioridad. Busca en títulos, notas, subtareas y etiquetas, sin importar mayúsculas ni tildes.',
  'search.emptyTitle': 'No hay resultados',
  'search.emptyDescription': 'Prueba con otra palabra o quita algún filtro.',
  'search.tasks': 'Tareas',
  'search.reminders': 'Recordatorios',
  'search.pastReminders': 'Recordatorios pasados',

  // Today and upcoming
  'today.title': 'Hoy',
  'today.overdue': 'Atrasadas',
  'today.emptyTitle': 'Nada planeado para hoy',
  'today.emptyDescription': 'Añade lo que quieras hacer hoy y márcalo cuando lo termines.',
  'today.filteredTitle': 'Ninguna tarea de hoy coincide con los filtros',
  'today.filteredDescription': 'Quita los filtros para ver todas.',
  'upcoming.title': 'Próximos días',
  'upcoming.emptyTitle': 'No hay nada planeado',
  'upcoming.emptyDescription':
    'Las tareas de mañana en adelante aparecerán aquí, agrupadas por día.',
  'upcoming.filteredTitle': 'Ninguna tarea coincide con los filtros',
  'upcoming.plan': 'Planear una tarea',
  'summary.none': 'No tienes tareas para hoy.',
  'summary.today': 'Hoy tienes {tasks}, {completed}.',
  'summary.overdue': 'Y {overdue} de días anteriores.',
  'summary.progress': 'Progreso de hoy',

  // Tasks
  'task.new': 'Nueva tarea',
  'task.editTitle': 'Editar tarea',
  'task.add': 'Añadir tarea',
  'task.completed': 'Tarea completada',
  'task.deleted': 'Tarea borrada',
  'task.deleteLabel': 'Borrar tarea',
  'task.movedTo': 'Movida a {day}',
  'task.at': 'A las ',
  'task.subtasksDone': 'Subtareas hechas: ',
  'task.overdueBadge': 'Atrasada · {date}',
  'task.priorityPrefix': 'Prioridad ',
  'task.postpone': 'Pasar a mañana',
  'task.postponeSr': 'Pasar «{title}» a mañana',
  'task.edit': 'Editar',
  'task.editSr': 'Editar «{title}»',
  'task.moveSr': 'Mover «{title}» a otro día',
  'form.title': 'Título',
  'form.taskPlaceholder': '¿Qué tienes que hacer?',
  'form.note': 'Nota (opcional)',
  'form.date': 'Fecha',
  'form.startsOn': 'Empieza el',
  'form.time': 'Hora',
  'form.timeOptional': 'Hora (opcional)',
  'form.noTime': 'Sin hora',
  'form.tag': 'Etiqueta',
  'form.noTag': 'Sin etiqueta',
  'form.subtasks': 'Subtareas (opcional)',
  'form.subtask': 'Subtarea {n}',
  'form.removeSubtask': 'Quitar subtarea {n}',
  'form.addSubtask': 'Añadir subtarea',
  'form.name': 'Nombre',
  'form.color': 'Color',
  'error.titleRequired': 'Escribe un título.',
  'error.titleTooLong': 'El título no puede superar {max} caracteres.',
  'error.dateRequired': 'Elige una fecha.',
  'error.timeInvalid': 'Escribe una hora válida.',
  'error.timeRequired': 'Elige una hora.',
  'error.weekdays': 'Elige al menos un día de la semana.',
  'confirm.before': '¿Seguro que quieres borrar ',
  'confirm.after': '? No se puede deshacer.',

  // Repetition
  'repeat.legend': 'Se repite',
  'repeat.legendShort': 'Repetir',
  'repeat.no': 'No',
  'repeat.none': 'No se repite',
  'repeat.daily': 'Cada día',
  'repeat.weekly': 'Cada semana',
  'repeat.monthly': 'Cada mes',
  'repeat.yearly': 'Cada año',
  'repeat.weeklyOn': 'Cada {days}',
  'repeat.weekdays': 'Días de la semana',

  // Reminders
  'reminder.new': 'Nuevo recordatorio',
  'reminder.editTitle': 'Editar recordatorio',
  'reminder.deleted': 'Recordatorio borrado',
  'reminder.deleteLabel': 'Borrar recordatorio',
  'reminder.placeholder': 'ITV, renovar DNI, cumpleaños…',
  'reminders.title': 'Recordatorios',
  'reminders.period': 'Periodo',
  'reminders.week': 'Esta semana',
  'reminders.month': 'Este mes',
  'reminders.all': 'Todos',
  'reminders.emptyWeek': 'No tienes recordatorios esta semana.',
  'reminders.emptyMonth': 'No tienes recordatorios este mes.',
  'reminders.emptyAll': 'Todavía no tienes recordatorios.',
  'reminders.emptyDescription':
    'Apunta la ITV, renovar el DNI, cumpleaños o pagos y te avisaré a la hora indicada.',
  'reminders.add': 'Añadir recordatorio',
  'reminders.past': 'Pasados',

  // Calendar and stats
  'calendar.title': 'Calendario',
  'calendar.previous': 'Mes anterior',
  'calendar.next': 'Mes siguiente',
  'calendar.empty': 'Nada planeado este día.',
  'stats.title': 'Resumen',
  'stats.emptyTitle': 'Todavía no hay datos',
  'stats.emptyDescription':
    'Completa tareas y aquí verás tu racha, lo que has hecho cada semana y en qué etiquetas.',
  'stats.streak': 'Racha actual',
  'stats.bestStreak': 'Mejor racha',
  'stats.thisWeek': 'Esta semana',
  'stats.last30': 'Últimos 30 días',
  'stats.weekHeading': 'Tareas completadas, últimos 7 días',
  'stats.byTag': 'Por etiqueta, últimos 30 días',

  // Dragging
  'drag.instructions':
    'Arrastra con el dedo o el ratón para llevar la tarea a otro día. Con teclado, cambia la fecha desde el botón de editar.',
  'drag.drop': 'Suéltala sobre un día',
  'drag.theTask': 'la tarea',
  'drag.noDay': 'ningún día',
  'drag.start': 'Has cogido «{title}».',
  'drag.over': '«{title}» está sobre {day}.',
  'drag.dropped': 'Has soltado «{title}» sobre {day}.',
  'drag.outside': 'Has soltado «{title}» fuera de los días.',
  'drag.cancel': 'Has cancelado el movimiento de «{title}».',

  // Settings
  'settings.title': 'Ajustes',
  'settings.appearance': 'Apariencia',
  'theme.legend': 'Tema',
  'theme.system': 'Sistema',
  'theme.light': 'Claro',
  'theme.dark': 'Oscuro',
  'theme.hint': '«Sistema» sigue el modo claro u oscuro de tu móvil.',
  'language.title': 'Idioma',
  'language.label': 'Idioma de la aplicación',
  'language.auto': 'Automático (idioma del móvil)',
  'language.hint': '«Automático» usa el idioma de tu móvil si la app está disponible en él.',

  // Tags
  'tags.title': 'Etiquetas',
  'tags.new': 'Nueva etiqueta',
  'tags.add': 'Añadir etiqueta',
  'tags.deleteQuestion': '¿Borrar «{name}»?',
  'tags.movesTasks': 'Sus tareas pasarán a «{other}».',
  'tags.noTasks': 'No tiene tareas.',
  'tags.delete': 'Borrar etiqueta',
  'tags.editSr': 'Editar etiqueta «{name}»',
  'tags.deleteSr': 'Borrar etiqueta «{name}»',
  'error.tagNameRequired': 'Escribe un nombre.',
  'error.tagNameTooLong': 'El nombre no puede superar {max} caracteres.',
  'error.tagDuplicate': 'Ya existe una etiqueta con ese nombre.',
  'tag.home': 'Casa',
  'tag.studies': 'Estudios',
  'tag.work': 'Trabajo',
  'tag.personal': 'Personal',
  'tag.other': 'Otros',
  'color.slate': 'Gris',
  'color.red': 'Rojo',
  'color.amber': 'Ámbar',
  'color.green': 'Verde',
  'color.teal': 'Turquesa',
  'color.blue': 'Azul',
  'color.violet': 'Violeta',
  'color.pink': 'Rosa',

  // Backup
  'backup.title': 'Copia de seguridad',
  'backup.saveTitle': 'Guardar copia',
  'backup.saveDescription':
    'Descarga un archivo con tus {tasks} y {reminders}. Hazlo de vez en cuando: es la forma de no perder nada si cambias de móvil o borras los datos del navegador.',
  'backup.saveButton': 'Guardar copia',
  'backup.saved': 'Copia guardada. Consérvala en un lugar seguro.',
  'backup.restoreTitle': 'Restaurar copia',
  'backup.restoreDescription':
    'Elige un archivo guardado antes. Sustituirá lo que hay ahora en la app.',
  'backup.chooseFile': 'Elegir archivo',
  'backup.pending':
    'La copia tiene {backupTasks} y {backupReminders}. Esto reemplazará tus {tasks} y {reminders} actuales.',
  'backup.replace': 'Reemplazar datos',
  'backup.restored': 'Copia restaurada.',
  'backup.restoreFailed': 'No se ha podido restaurar la copia.',
  'backup.persistent':
    'Almacenamiento protegido: el navegador no borrará tus datos por falta de espacio.',
  'backup.notPersistent':
    'El navegador podría borrar los datos si falta espacio. Instala la app en la pantalla de inicio y guarda copias.',
  'backup.invalidJson': 'El archivo no es un JSON válido.',
  'backup.notBackup': 'Este archivo no es una copia de seguridad de Diario.',
  'backup.newerVersion':
    'La copia es de una versión más nueva de la app. Actualiza Diario e inténtalo de nuevo.',
  'backup.missingData': 'Faltan datos en la copia.',
  'backup.invalidTasks': 'La copia contiene tareas con datos no válidos.',
  'backup.invalidReminders': 'La copia contiene recordatorios con datos no válidos.',
  'backup.invalidTags': 'La copia contiene etiquetas con datos no válidos.',
  'backup.duplicates': 'La copia contiene elementos repetidos.',
  'backup.unknownTags': 'La copia contiene tareas con etiquetas desconocidas.',

  // Notifications
  'alerts.reminderBody': 'Recordatorio · {time}',
  'alerts.taskBody': 'Tarea · {time}',
  'alerts.dismiss': 'Entendido',
  'prompt.title': '¿Te aviso a la hora?',
  'prompt.description':
    'Te enviaré una notificación cuando llegue la hora de un recordatorio o de una tarea con hora.',
  'prompt.enable': 'Activar avisos',
  'prompt.notNow': 'Ahora no',
  'prompt.test': 'Enviar aviso de prueba',
  'prompt.testBody': 'Así te llegarán los avisos.',
  'prompt.testFailed': 'El sistema no ha mostrado el aviso de prueba.',
  'prompt.granted':
    'Avisos activados. Sin servidor, llegan mientras Diario está abierta o en segundo plano; si estaba cerrada, verás los avisos pendientes al abrirla.',
  'prompt.denied':
    'Has bloqueado los avisos. Puedes activarlos en los ajustes del navegador o, en el iPhone, en Ajustes › Notificaciones › Diario. Mientras tanto te avisaré dentro de la app.',
  'prompt.installRequired':
    'Para recibir avisos en el iPhone, añade Diario a la pantalla de inicio (Compartir › Añadir a pantalla de inicio) y ábrela desde su icono. Mientras tanto te avisaré dentro de la app.',
  'prompt.unsupported': 'Este navegador no permite notificaciones; te avisaré dentro de la app.',

  // Undo and storage errors
  'undo.button': 'Deshacer',
  'store.task.create': 'No se ha podido crear la tarea.',
  'store.task.update': 'No se ha podido guardar la tarea.',
  'store.task.remove': 'No se ha podido borrar la tarea.',
  'store.task.replace': 'No se han podido restaurar las tareas.',
  'store.reminder.create': 'No se ha podido crear el recordatorio.',
  'store.reminder.update': 'No se ha podido guardar el recordatorio.',
  'store.reminder.remove': 'No se ha podido borrar el recordatorio.',
  'store.reminder.replace': 'No se han podido restaurar los recordatorios.',
  'store.tag.create': 'No se ha podido crear la etiqueta.',
  'store.tag.update': 'No se ha podido guardar la etiqueta.',
  'store.tag.remove': 'No se ha podido borrar la etiqueta.',
  'store.tag.replace': 'No se han podido restaurar las etiquetas.',
} as const

export type MessageKey = keyof typeof es

/**
 * The shape every language file must have. Languages with more plural forms
 * than Spanish (Arabic) may add "_zero", "_two", "_few" and "_many" variants.
 */
export type Messages = Record<MessageKey, string> &
  Partial<Record<`${string}_${'zero' | 'two' | 'few' | 'many'}`, string>>
