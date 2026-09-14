# Sonrisa Digital

Landing page de una clínica dental. Tiene un solo objetivo: que el paciente
pida una hora.

Construida con [Astro](https://astro.build) y desplegada en Vercel. La página
se genera estática en el build; lo único que corre en el servidor es el
endpoint que recibe el formulario.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # y completa WEB3FORMS_ACCESS_KEY
npm run dev
```

| Comando           | Qué hace                                        |
| ----------------- | ----------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo en `localhost:4321`      |
| `npm run build`   | Compila el sitio a `dist/`                      |
| `npm run preview` | Sirve el build local, con el endpoint funcional |

## Variables de entorno

| Variable                | Dónde se usa          | Para qué                                                   |
| ----------------------- | --------------------- | ---------------------------------------------------------- |
| `WEB3FORMS_ACCESS_KEY`  | Solo servidor         | Enviar la solicitud de hora al correo de la clínica         |
| `SITE_URL`              | Build                 | URL canónica, Open Graph y datos estructurados              |

En Vercel se cargan en **Settings → Environment Variables**. La clave nunca
llega al navegador: vive solo dentro de la función serverless.

## Estructura

```
src/
├─ data/            Contenido de la clínica, tipado. Única fuente de verdad.
│  ├─ clinic.ts        Teléfono, dirección, horarios, zona horaria
│  ├─ treatments.ts    Catálogo con duraciones; alimenta la lista y el <select>
│  ├─ time-slots.ts    Franjas horarias que se pueden pedir
│  └─ visit-steps.ts   Los tres pasos de la primera visita
├─ lib/             Lógica pura, sin DOM y sin dependencias
│  ├─ booking.ts       Validación compartida por cliente y servidor
│  └─ format.ts        Código de reserva y fechas en español
├─ scripts/         Código que sí corre en el navegador
│  └─ booking-form.ts  Controlador del formulario
├─ components/      Un componente por bloque de la página
├─ layouts/         <head>, metadatos y datos estructurados
├─ styles/          tokens.css (sistema de diseño) y global.css (primitivas)
└─ pages/
   ├─ index.astro       La landing
   └─ api/booking.ts    POST del formulario (única ruta bajo demanda)
```

### Decisiones que vale la pena conocer

**Los datos no viven en el marcado.** Cambiar el teléfono, un horario o la
duración de un tratamiento se hace en `src/data/` y se propaga a la cabecera,
la ficha, el pie, el `<select>` del formulario, el correo que recibe la
clínica y los datos estructurados para Google.

**La validación está escrita una vez.** `src/lib/booking.ts` la usan el
navegador (respuesta inmediata) y la función serverless (que no confía en lo
que le llega). Está escrita a mano, sin librería de esquemas, para no mandar
un validador completo al navegador por seis campos.

**El día mínimo del calendario se fija en el cliente.** La página es estática:
si el `min` saliera del build, al día siguiente ya estaría desactualizado.

**"Hoy" es el de la clínica.** Las fechas se comparan contra
`clinic.timezone`, no contra el reloj del visitante ni el del servidor.

**El formulario pide, no reserva.** La confirmación lo dice explícitamente:
la clínica llama para cerrar la hora. El código `SD-XXXXX` es una referencia
que el paciente puede dictar por teléfono.

## Despliegue

```bash
vercel deploy --prod
```

El adapter `@astrojs/vercel` publica la landing como archivos estáticos y
`/api/booking` como función serverless.
