# Árbol que nunca muere · Estudio de certificados

PWA móvil para documentar las piezas artesanales del taller de alebrijes.

## Desarrollo con Bun (gestor oficial del proyecto)

```bash
bun install --frozen-lockfile
bun run dev
bun run build
bun run lint
```

El proyecto Vite está dentro de `certication-alebrije/` (nombre existente en el repositorio).
No se ha sustituido Bun, ni modificado `bun.lock`, ni incorporado otro gestor.

## Estado de implementación

### Iteración 1 — Base visual móvil
- Inicio con navegación inferior, CTA y actividad reciente.
- Formulario para capturar una obra.
- Vista previa de composición, sin edición de capas.
- Archivo de borradores con búsqueda, edición y eliminación.
- Almacenamiento local en `localStorage` (no sincronizado, sin copias de seguridad automáticas).
- Manifest y service worker básico; funcionamiento offline sujeto a pruebas en teléfonos reales.

### Pendiente
- Iteración 2: prueba visual en Android/iPhone, mejoras UX, validación de textos largos.
- Iteración 3: editor táctil de campos restringidos, PDF real vectorial.
- Iteración 4: Supabase Auth/Database/Storage, seguridad RLS, sincronización, respaldos y pruebas de PWA.

**Importante:** La vista previa actual es una maqueta y no emite certificados oficiales ni genera un PDF descargable. Los borradores pueden perderse si se borran los datos del navegador. No usar todavía para documentos de clientes.

## Referencia visual
Basada en el archivo de referencia Wello compartido en la conversación: contraste claro/oscuro, acciones en verde lima, jerarquía de tipografía, tarjetas redondeadas y navegación de una mano. No se han copiado datos, fotografías ni componentes de bienestar.
