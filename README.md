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
- **Demo** (sin configurar nada): todo se guarda en el navegador. Todas las cuentas de prueba usan la contraseña `123456789@`: dueño `puntoinmobiliariohn@gmail.com` (administrador), administrador `admin@demo.hn`, vendedor `ventas@morazan.hn`, comprador `maria@ejemplo.com`. Un administrador ve el menú **Entrar como** (arriba a la derecha) para pasar entre `/admin`, `/panel` y `/cuenta`.
- **Supabase** (producción): crea `.env.local` con
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=...
  NEXT_PUBLIC_SITE_URL=https://tudominio.com
  ```
  y aplica `supabase/schema.sql` en el SQL Editor. Para volverte administrador:
  `insert into admin_emails values ('tu@correo.com');` antes de registrarte, o
  `update profiles set role = 'admin' where email = 'tu@correo.com';` después.
- **Ingreso con Google**: en Supabase, Authentication → Providers → Google, pega el Client ID y Secret de Google Cloud
  y agrega `https://<tu-proyecto>.supabase.co/auth/v1/callback` como URI de redirección en Google. En Authentication → URL
  Configuration agrega la URL del sitio (y `http://localhost:3000` para pruebas).

## Tipos de usuario
- **Comprador** (`user`): busca, guarda favoritos y envía consultas.
- **Vendedor** (`seller`): publica sus propiedades desde `/panel`, recibe consultas y tiene su vitrina.
- **Administrador** (`admin`): administra todo desde `/admin` y confirma los pagos.

## Cómo se cobra
1. El vendedor crea su cuenta gratis y prepara sus propiedades (quedan en **borrador**).
2. Toca **Publicar**, elige un plan y escribe la referencia de su transferencia (la propiedad pasa a **pendiente**).
3. El administrador confirma el pago en `/admin?tab=pagos`: la propiedad se publica por 30 días y el vendedor recibe su **link profesional** (`/propiedades/<slug>`).
4. Al vencer, la publicación se oculta sola hasta que se renueve.
5. La **vitrina** (`/vendedores/<slug>`) es una página propia del vendedor con todas sus propiedades; se activa con el plan Vitrina.

Los precios de los planes están en `src/lib/site.ts` (`plans`). La base de datos impide que un vendedor se publique sin pago (`protect_listing` en `supabase/schema.sql`).

## Secciones
- `/ingresar`: registro (comprador o vendedor), ingreso y recuperación de contraseña.
- `/cuenta`: favoritos, mis consultas, mis datos y “Quiero vender”.
- `/panel`: panel del vendedor (propiedades, consultas, vitrina, planes y pagos).
- `/vender`: página de planes y precios para vendedores.
- `/vendedores/<slug>`: vitrina pública del vendedor.
- `/admin`: resumen con renovaciones e ingresos por plan, propiedades (aprobar, destacar), pagos, vendedores, consultas, usuarios y precios y ajustes.
- `/comparar`, `/proyectos`, `/guias`, `/servicios`: comparador, desarrolladores, guías y servicios.

## Dónde cambiar cosas
- `src/lib/site.ts`: número de WhatsApp, correo, horario, menú y precios iniciales de los planes.
- Precios de los planes, tipo de cambio y datos bancarios: desde el panel, en `/admin?tab=ajustes`.
- `src/lib/backend/`: conexión a datos (`supabase.ts` y `demo.ts`).
- `src/data/properties.ts`: tipos y propiedades iniciales.
- `src/app/globals.css`: colores y estilos.

## Nota para compilar en Linux sin glibc detectada
Si `next build` dice que Turbopack no tiene bindings nativos, instala el binario correcto sin guardarlo:
`npm install --no-save @next/swc-linux-x64-gnu@16.3.6`.
