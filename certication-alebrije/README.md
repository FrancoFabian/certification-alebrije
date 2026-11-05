# Árbol que nunca muere · Estudio de certificados

PWA móvil para documentar piezas artesanales. El flujo visual parte del mock proporcionado por el usuario.

## Desarrollo (solo Bun)

```bash
cd certication-alebrije
bun install --frozen-lockfile
bun run dev
bun run build
bun run lint
```

Se respetan Bun, bun.lock, React, Vite, TypeScript, Oxlint y la ruta original `certication-alebrije/`.

## Formulario: cinco pasos

1. **Identidad:** nombre de la obra y autor/taller (necesarios para avanzar), origen.
2. **Elaboración:** materiales, técnicas, tiempo invertido, medidas y descripción.
3. **Grecas:** elegir **agente**, **manual** u **omitir**.
   - Agente: guía inicial por frente, lateral derecho, lateral izquierdo, reverso, superior y acercamientos; fotografías originales conservadas en IndexedDB.
   - Manual: opcionalmente subir vistas generales y continuar con tiras/grecas creadas o fotografiadas por el artesano.
   - Omitir: no mostrar la iconografía en el certificado, sin borrar la información guardada.
4. **Selección:** conservar o excluir cada tira sin perder el material de referencia; ordenar y clasificar como principal o anexo. Nombre y significado son opcionales y los aporta el artesano.
5. **Documento:** orientación vertical/horizontal y preferencia de anexo automático, siempre o con confirmación. Vista previa conceptual.

## Persistencia actual

Los borradores y las imágenes se almacenan localmente en **IndexedDB**, con migración de los borradores anteriores de localStorage. No hay copia remota ni sincronización. Las fotos se guardan como Blob; cuidado con límites de almacenamiento del navegador.

## Estado real del agente

El modo agente tiene **solo el flujo de captura y revisión preparado**. No se ha integrado un proveedor de IA ni un backend para realizar identificación de grecas o extracción de tiras. El botón de análisis aparece deshabilitado deliberadamente.

Cuando exista la integración, el agente debe:
- Analizar fotos de varios ángulos; solicitar vistas extra cuando no sean suficientes.
- Detectar regiones candidatas de grecas y preparar **tiras visuales fieles a las capturas originales**; no inventar geometrías ni figuras.
- Entregar candidatos con evidencia/foto de origen; el artesano confirma las tiras.
- Permitir al artesano conservar, descartar, ordenar y enviar a primer plano o anexo.
- **No inferir ni presentar como hechos significados culturales no corroborados.** El campo de significado es del artesano.

El contrato técnico de visión y la generación/rectificación de imágenes quedan pendientes de una API segura del lado servidor. No almacenar claves de proveedor en la PWA.

## Limitaciones actuales

- No genera PDFs definitivos ni implementa paginación real o capas de editor.
- Los ajustes vertical/horizontal y de anexos son preferencias que se guardan.
- No se ha realizado QA táctil ni de cámara en Android/iPhone.
- Sin Supabase; los borradores solo están en el dispositivo. **No usarlos para entregar certificados oficiales hasta que existan respaldo y validaciones.**
