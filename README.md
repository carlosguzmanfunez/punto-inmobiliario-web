# Punto Inmobiliario Hn

Sitio web inmobiliario (Next.js + TypeScript + Supabase).

## Uso
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # producción
node preview/build.mjs <carpeta>   # vista previa de una sola página (modo demo)
```

## Modos de datos
- **Demo** (sin configurar nada): todo se guarda en el navegador. Cuenta de administrador: `admin@demo.hn` / `admin123`; cliente: `maria@ejemplo.com` / `maria123`.
- **Supabase** (producción): crea `.env.local` con
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  ```
  y aplica `supabase/schema.sql` en el SQL Editor. Para volverte administrador:
  `insert into admin_emails values ('tu@correo.com');` antes de registrarte, o
  `update profiles set role = 'admin' where email = 'tu@correo.com';` después.

## Secciones
- `/ingresar`: registro, ingreso y recuperación de contraseña.
- `/cuenta`: favoritos, mis consultas y mis datos.
- `/admin`: resumen con estadísticas, propiedades (crear, editar, ocultar, eliminar, fotos), consultas (estado, responder por WhatsApp) y usuarios (roles).

## Dónde cambiar cosas
- `src/lib/site.ts`: número de WhatsApp, correo, horario y menú.
- `src/lib/backend/`: conexión a datos (`supabase.ts` y `demo.ts`).
- `src/data/properties.ts`: tipos y propiedades iniciales.
- `src/app/globals.css`: colores y estilos.
