---
title: Kickoff — Wendy Planner
type: meeting-notes
date: 2026-08-10
scope: client
---

# Kickoff — Wendy Planner

## Contexto del proyecto

Vineyards, una importante empresa de planificación de bodas, busca con este proyecto contar con una aplicación web que permita gestionar y planificar proyectos de bodas. El producto se conocerá como **Wendy Planner**, un Wedding Planner System. La aplicación permitirá a los usuarios crear y organizar todos los aspectos de su boda, desde la lista de invitados hasta la configuración de la invitación en línea.

Hoy cada boda se administra de manera manual por un/una Wedding Planner: esa persona coordina los detalles del evento, selecciona el lugar, contrata proveedores y gestiona el presupuesto. Todo se maneja con archivos de Excel y cada WP sigue su propio proceso. El reto principal ha sido estandarizar y optimizar estos flujos.

## Enfoque del proyecto

Este proyecto busca entregar un MVP para validar que es posible estandarizar algunos procesos. Si el MVP tiene éxito, se agregarán features de forma iterativa. La solución debe estar pensada para escalar y ser utilizada por diferentes WPs en el futuro.

## Modelo de engagement

- **Equipo de entrega (nuestro lado):** 2 desarrolladores — 1 backend + 1 frontend.
- **Pago:** el cliente paga por tiempo indefinido (modelo staffing).
- **Presupuesto:** sin tope definido por nuestra parte; las decisiones técnicas deben mantenerse costo-conscientes.
- **Meta de tiempo:** MVP listo en un máximo de **3 meses** como objetivo inicial. No hay fecha límite dura posterior al MVP.

## Volumen y métrica de éxito

- 10 Wedding Planners en el cliente.
- 4–10 bodas por año por cada WP.
- **Métrica de éxito del MVP:** captura completa de **2 bodas end-to-end** — alta de WP, creación de boda, invitación publicada, RSVPs recibidos y descarga de fotos posterior al evento.

## Features iniciales (alcance MVP)

### Captura de datos del cliente (boda)
- Nombre de los novios.
- Fecha de la boda.

### Gestión de lista de invitados
- Agregar invitados.
- Editar invitados.
- Eliminar invitados.
- Confirmar asistencia.

### Invitación en línea
- Selección de módulos a mostrar dentro de la invitación.
- Activación de invitación con ID de invitado para confirmar asistencia.
- Los links de invitación se entregan **a mano** por el WP (sin envío automatizado en MVP).

### Almacenamiento de fotos
- Espacio dedicado para guardar fotos del evento.
- Calidad de subida **alta/baja configurable por el cliente** — la elección impacta el costo de almacenamiento y debe ser configurable.
- Las fotos se descargan después del evento y se entregan al cliente en USB (la descarga la realiza el WP).
- **Borrado automático** del almacenamiento **1 mes después del evento** para evitar costos recurrentes.
- **Máximo 200 fotos por boda.**

> [!NOTE]
> La gestión de **presupuesto** y de **proveedores** aparece en la descripción del problema actual, pero queda **fuera del MVP**. Se difiere a iteraciones posteriores.

## Módulos de la invitación en línea

- Landing (nombre de los involucrados y fecha).
- Padres.
- Cuenta regresiva.
- Nuestra historia (texto con carrusel de fotos).
- Ubicación(es) — foto, hora, dirección, link de mapa.
- Programa.
- Galería.
- Asistencia (RSVP).
- Mesa de regalos (varios links) o datos de transferencia (texto de agradecimiento, cuentas).
- Dress code — considerar que puede variar por día en algún tooltip.
- Álbum de fotos (permite a invitados subir fotos).
- Link con ID por invitado (requiere lista de invitados precargada).
- Alojamiento (sub-página con links).
- Contacto (teléfono, nombre).

## Seguridad y autenticación

### Roles
- **Administrador:** da de alta nuevos WPs, ve proyectos y métricas.
  - Un administrador también puede ser WP.
  - Un administrador puede ver y editar todos los proyectos de los WPs que él haya dado de alta.
  - Puede **deshabilitar usuarios** y **cambiar contraseñas**.
- **Wedding Planner:** gestiona sus bodas.

### Credenciales
- Formato de usuario: `nombre@wendy` (ejemplo: `miguel@wendy`).
- La contraseña la asigna el **administrador**.
- **No** se considera mecanismo de auto-recuperación de contraseña en esta etapa.
- Datos de perfil: nombre completo, email de contacto, teléfono de contacto.

### Acceso de invitados
- Los links se entregan **a mano** por el WP.
- Cada link contiene el **ID de invitado** para confirmar asistencia.

## Internacionalización

- El código se escribe en **inglés**.
- La UI debe soportar i18n desde el inicio: **inglés y español**.
- Idioma por defecto: **inglés**.
- Detección automática según `Accept-Language` del navegador: español si está disponible, inglés en cualquier otro caso.
- La arquitectura debe permitir agregar más idiomas en el futuro.

## Restricciones técnicas

- **Arquitectura:** monolito modular. No microservicios.
- **Despliegue:** pensado para nube y ejecución en contenedores.
- **Backend:** equipo interno de Vineyards esta familiarizado con Java (Spring Boot 4 + GraalVM) y Node.js (NestJS 11.1.29). Se seleccionará stack al inicio del proyecto.
- **Frontend:** dentro de Vineyards no hay equipo de FE en el cliente. Propondremos stack basándonos en requerimientos y volumetría. Criterio: desarrollo rápido, mantenimiento sencillo, balance entre mantenibilidad y experiencia de usuario — no se busca la moda, se busca el ajuste al problema.
- **Plataforma objetivo:** versión web optimizada para **PC y tablet**. No se optimizará para móvil en MVP.
- **Base de datos:** seleccionaremos una base de datos en la nube (tecnología a definir).
- **Multitenancy:** **no requerida en MVP**, pero el esquema de base de datos debe **prepararse** para soportarlo a futuro (columna `tenant_id` desde el inicio).
- **Almacenamiento de fotos:** tecnología a definir; debe permitir borrado automático a +1 mes del evento.
- **Alojamiento de datos:** a definir por el equipo de entrega; el requisito es nube. El cliente ya firma acuerdo de manejo de datos personales con sus clientes finales.

## Fuera de alcance (MVP)

- Gestión de presupuesto.
- Gestión de proveedores.
- Notificaciones por email (entrega de links manual).
- Auto-recuperación de contraseña.
- Experiencia mobile-first.
- Migración de datos históricos desde Excel.
- Implementación de multitenancy (solo se prepara el esquema).
- Versionado automático de invitaciones cuando los novios editan contenido.
- Reenvío automatizado de invitaciones y recordatorios.

## Precondiciones y pendientes para sesiones de refinamiento

> [!IMPORTANT]
> Estos puntos deben resolverse antes de iniciar implementación, o documentarse explícitamente como riesgos asumidos.

- **Product Owner / contacto del cliente:** nombre, horas disponibles por semana, SLA de respuesta a dudas del equipo.
- **Stack de backend definitivo:** Java (Spring Boot 4 + GraalVM) vs Node.js (NestJS) — decisión a tomar en la primera sesión técnica.
- **Stack de frontend propuesto:** propuesta del equipo de entrega, validación con el cliente.
- **Proveedor cloud y región de alojamiento:** afecta latencia, cumplimiento y costo.
- **Tecnología de base de datos:** PostgreSQL, MySQL, MongoDB u otra — selección a justificar.
- **Proveedor de almacenamiento de fotos y mecanismo de auto-borrado:** lifecycle policy del proveedor o cron job interno; definir antes de la primera boda piloto.
- **Diseño de esquema con `tenant_id`:** estrategia concreta para preparar multitenancy sin implementar aislamiento en MVP.
- **Estructura de URLs para invitaciones públicas:** subdominio, path dentro del dominio principal o dominio personalizado por WP.
- **Definición operativa de "captura de boda exitosa":** checklist concreto para validar los 2 casos piloto (qué artefactos deben existir, qué RSVPs cuentan, qué significa "descarga entregada").
- **Política de retención de datos no fotográficos:** después del evento, ¿los datos de boda y lista de invitados se conservan? ¿Por cuánto tiempo? ¿Se archivan en frío?
- **Borrado de fotos — fecha de referencia:** ¿+1 mes desde la fecha del evento o desde la última subida? Resolver antes de la primera boda piloto.
- **Soporte al invitado final:** procedimiento cuando un invitado reporta problemas con el link o el RSVP (canal, responsable, tiempo de respuesta).
- **Estrategia de backup y recuperación:** frecuencia, retención, RTO/RPO mínimos.
- **Definición de tiers de calidad de foto:** resoluciones concretas para "alta" y "baja", compresión aplicada, impacto en costo por boda.
- **Cumplimiento aplicable:** confirmar la regulación específica (LFPDPPP, GDPR u otra) y derechos de eliminación / acceso del invitado final.
- **Auditoría mínima:** registro de eventos críticos — alta de usuario, deshabilitación, cambio de contraseña, descarga de fotos, borrado automático.
- **Estrategia de CI/CD y ambientes:** pipeline mínimo para dev/staging/prod con 2 desarrolladores.
- **Subida de fotos por invitados:** reglas anti-abuso — tamaño máximo por archivo, formato permitido, moderación antes de publicar.
- **Spike técnico inicial:** comparación breve de stacks de backend (Java vs Node) contra los requerimientos reales del MVP antes de comprometer la arquitectura.

## Documentos asociados

(Lista de archivos complementarios cuando existan — p. ej., Project Brief, arquitectura, ADRs.)
