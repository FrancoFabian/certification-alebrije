# Árbol que nunca muere · Estudio de certificados

PWA móvil para documentar las piezas artesanales del taller.

## Herramientas y comandos (Bun)

```bash
bun install --frozen-lockfile
bun run dev
bun run build
bun run lint
```

Se conserva el gestor **Bun**, el `bun.lock` existente y la carpeta original `certication-alebrije/`. No se añadieron dependencias.

## Funciones incorporadas

- Diseño y navegación móvil (Inicio, Captura, Vista previa, Archivo).
- Captura de nombre, autor, materiales, técnicas, dimensiones, descripción y origen de la obra.
- Hasta **12 fotografías originales de la pieza** (frente, laterales y detalles).
- Registro ilimitado de **grecas o símbolos** con nombre, significado, hasta **4 fotografías por greca**, clasificación **principal / complementaria** y reordenamiento.
- Elección de orientación **vertical u horizontal**.
- Preferencia de página adicional: **automática, siempre o confirmar**.
- Resumen visual de símbolos prioritarios/complementarios y fotos.
- Borradores con fotos guardados en **IndexedDB**; migración de borradores previamente almacenados en `localStorage`.
- Manifest y service worker básico (requieren pruebas en teléfonos físicos).

Cada imagen tiene un límite provisional de 15 MB. El navegador puede agotar su cuota de almacenamiento con muchas fotos, por lo que no debe considerarse un respaldo permanente.

## Limitaciones de la implementación actual

- **No** se genera todavía el PDF definitivo.
- La vista previa del certificado es un **mock**, no una representación exacta del documento imprimible.
- Las preferencias de orientación, prioridad y anexo se capturan y guardan, pero el motor de composición y paginación no existe todavía.
- **No** hay reconocimiento de símbolos por IA; no se infiere automáticamente ningún significado cultural.
- **No** hay conexión a Supabase ni sincronización entre dispositivos; los datos e imágenes permanecen locales.
- No usar aún para emitir certificados finales a clientes.

## Próximos pasos

1. Validación visual y funcional en Android/iPhone, cámaras, tamaños de imagen y restauración de borradores.
2. Editor de campos restringidos y motor PDF vectorial con paginación vertical/horizontal y anexos.
3. Supabase Auth, Storage, PostgreSQL, RLS, sincronización y respaldo.
4. Análisis de fotografías por IA con revisión humana de grecas y significado.

Inspiración visual: mock de Wello entregado por el usuario, adaptado al dominio del taller.
