# PROGRESO — MVP «Yo me quiero casar, ¿y usted?»

Proveedor: Insights · Closer: Romina · Dueña del negocio: Viviana (administradora de la demo)

## Completado
- Bloque 1: Setup Vite 5 + React 18 + TS, Tailwind v3 (tokens light/dark, acento vino con canales RGB), Inter + JetBrains Mono, anti-flash, i18n base, render.yaml.
- Bloque 2: Tipos, 48 miembros mock bilingües, entrevistas, transacciones, automatizaciones, auditoría, `computeScore` (reglas + cuestionario + música + notas de psicóloga + aprendizaje de rechazos + repetidos).
- Bloque 3: Store global (fotos/canciones editables en sesión) + `<MemberPhoto />` con placeholders de iniciales (sin fotos reales ni IA).
- Bloque 4: Auth mock, login dos columnas, /registro (verificación email con DevNotice), rutas + `go()` con cambio de rol.
- Bloque 5: Shell con top-nav, role switcher, toggles ES/EN y tema, footer CTA, sheet + bottom-nav mobile, PreviewBanner, DevNotice, InDev.
- Bloque 6: Admin Panel (KPIs, área, funnel, alertas accionables) + Usuarios (tabs/filtros/acciones) + ficha de detalle.
- Bloque 7: Motor de matches (recalculo en vivo con framer-motion `layout`, filtros duros, lógica avanzada con pesos, drawer de desglose, `?detalle=top`).
- Bloque 8: Calendario (semana/mes, color por psicóloga, cancelaciones) + Pagos (KPIs, transacciones, recibo, monto editable).
- Bloque 9: Automatizaciones (5 triggers, canal, log) + Roles y auditoría (matriz editable, equipo, auditoría filtrable).
- Bloque 10: Psicóloga — Agenda, Perfiles a revisar, Entrevistas (notas autoguardadas, etiquetas que ajustan el score, resultado), Sugerencias.
- Bloque 11-12: Usuario — Onboarding 5 pasos, Perfil con 8 tabs, Fotos (upload real FileReader/ObjectURL, dnd-kit, portada) y Mi música (modal, dnd, canción ideal).
- Bloque 13: Mis matches, Mi entrevista, Mis pagos.
- Bloque 14: Sección Propuesta (circuito, 9 módulos con `go()`, inversión oculta que solo se monta al revelar, print).
- Bloque 15: Welcome Modal + Tour por rol (spotlight con path evenodd, dot azul, scrollIntoView center, re-medición).
- Bloque 16: Modo Trailer (12 escenas, ~90 s, loop, cursor virtual con click real, salida X/Esc).
- Bloque 17: QA — i18n recorrido por las 25 vistas en EN sin strings en español; 375 px sin scroll horizontal; centrado de modales 0 px; grep de términos prohibidos limpio; `npx serve -s dist` con links profundos OK.
- Bloque 18: Screenshots en /screenshots (script `scripts/screenshots.mjs`).
- Rebranding: la agencia se llama «Yo me quiero casar, ¿y usted?».

- Bloque 19: repo privado https://github.com/insightsapps-mvp/truelove-mvp (la cuenta doncelromi no tiene permisos en developers-insights).

## En curso
- (nada)

## Pendiente
- (nada)

## Decisiones
- Dueña = Viviana (Welcome, login, equipo, auditoría). Romina = closer (no aparece en la UI).
- Proyecto en `C:\Users\donce\Documents\truelove-mvp`: el workspace temporal superaba MAX_PATH de Windows.
- Componentes UI propios sobre Radix (estilo shadcn), sin CLI interactivo.
- Martín está en el paso 4: sus matches se muestran como "sugerencias preliminares" hasta que lo aprueben.
- Scores calculados (no hardcodeados); los datos se ajustaron para que el par top dé 94, Martín–Valentina 91, Carolina Sosa 88 excluida por hijos y Florencia baje 54→46 con "Aprender de rechazos".
- El "PROPUESTA COMERCIAL" es el único badge de /propuesta; montos solo ahí.

## Bloqueos
- (ninguno)
