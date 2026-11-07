# Diario

App web de organización personal: tareas del día y recordatorios con fecha. Funciona sin conexión y se puede instalar en el móvil como PWA.

> 🚧 En desarrollo. La documentación completa llegará al final del proyecto.

## Ejecutar en local

Requisitos: Node.js 22 o superior.

```bash
npm install
npm run dev
```

Abre la URL que aparece en la terminal (por defecto http://localhost:5173).

## Scripts

| Comando                | Qué hace                                  |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Servidor de desarrollo con recarga rápida |
| `npm run build`        | Comprueba tipos y genera `dist/`          |
| `npm run preview`      | Sirve la versión compilada                |
| `npm run lint`         | ESLint (falla con cualquier aviso)        |
| `npm run format`       | Formatea el código con Prettier           |
| `npm run format:check` | Comprueba el formato sin cambiar nada     |
| `npm run typecheck`    | Solo comprobación de tipos                |
