// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// La landing se prerenderiza completa; solo /api/booking corre bajo demanda
// como función serverless, para que la clave del formulario nunca viaje al
// navegador. Ver src/pages/api/booking.ts.
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://sonrisa-digital.vercel.app',
  output: 'static',
  adapter: vercel(),
});
