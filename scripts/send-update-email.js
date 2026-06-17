/* eslint-disable */
// One-off broadcast: tells every active member that Nordelta Tech is live, gives
// them their default password + recover link, and invites them to connect their
// huevsite (or create one) so they show up on the landing.
//
// Usage:
//   node scripts/send-update-email.js --dry            # preview, no send
//   node scripts/send-update-email.js --only=x@y.com   # send to one
//   node scripts/send-update-email.js                  # send to ALL active
//
// Requires RESEND_API_KEY, EMAIL_FROM, APP_URL, DATABASE_URL in .env.local.

const fs = require('fs');
const path = require('path');
const { Resend } = require('resend');
const { neon } = require('@neondatabase/serverless');

function loadDotEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/i);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
}

function slugifyName(name) {
  return (name || '').normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function defaultPasswordFor(name) {
  return `${slugifyName(name) || 'builder'}.nordelta.tech`;
}
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function buildHtml({ name, email, password, hasHuevsite, huevsiteUsername, loginUrl, recoverUrl, dashboardUrl, huevsiteUrl, appUrl }) {
  const firstName = (name || '').split(/\s+/)[0] || name || 'Builder';
  const year = new Date().getFullYear();
  const huevLine = hasHuevsite
    ? `<div style="background:rgba(0,229,160,0.08);border:1px solid rgba(0,229,160,0.3);border-radius:12px;padding:16px 20px;font-size:14px;color:#a9b6c0;line-height:1.6;">Tu huevsite <span style="color:#00e5a0;">@${esc(huevsiteUsername)}</span> ya está conectado. ¡Buenísimo! Si querés, actualizalo cuando quieras.</div>`
    : `<div style="background:#131920;border:1px solid #252e35;border-radius:12px;padding:16px 20px;font-size:14px;color:#a9b6c0;line-height:1.6;">
         <strong style="color:#dde4ea;">Conectá tu huevsite</strong> y aparecés en la landing de nordelta.tech con tu perfil.
         <br/>¿No tenés uno? Armalo gratis en <a href="${esc(huevsiteUrl)}" style="color:#00e5a0;text-decoration:none;">huevsite.io</a> y después pegá tu link en el dashboard.
       </div>`;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="color-scheme" content="dark"/><title>Nordelta Tech está on</title></head>
<body style="margin:0;padding:0;background:#080b0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#dde4ea;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#080b0d;padding:40px 16px;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background:#0e1215;border:1px solid #1c2328;border-radius:16px;overflow:hidden;">
<tr><td style="padding:32px 40px 0 40px;">
<table cellpadding="0" cellspacing="0" border="0" role="presentation"><tr>
<td style="padding-right:12px;vertical-align:middle;"><img src="${appUrl}/assets/logo.png" width="40" height="40" alt="" style="display:block;border:0;"/></td>
<td style="vertical-align:middle;">
<div style="font-family:'Bebas Neue',Impact,sans-serif;font-size:28px;letter-spacing:0.06em;color:#00e5a0;line-height:1;">NORDELTA <span style="color:#dde4ea;">TECH</span></div>
<div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7a8f9e;margin-top:4px;">nordelta.tech</div>
</td></tr></table></td></tr>
<tr><td style="padding:32px 40px 8px 40px;">
<h1 style="margin:0;font-family:'Bebas Neue',Impact,sans-serif;font-size:42px;line-height:1.05;letter-spacing:0.02em;color:#ffffff;">NORDELTA TECH ESTÁ ON 🟢</h1>
<p style="margin:16px 0 0 0;font-size:16px;line-height:1.6;color:#a9b6c0;">Hola, ${esc(firstName)}. La comunidad ya está <strong style="color:#00e5a0;">activa</strong>: dashboard, perfiles y la red de builders andando. Varios ya conectaron su <strong style="color:#00e5a0;">huevsite</strong> y aparecen en la landing — te toca a vos.</p>
</td></tr>
<tr><td style="padding:24px 40px 0 40px;">
<div style="background:#131920;border:1px solid #252e35;border-radius:12px;padding:20px 24px;">
<div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7a8f9e;margin-bottom:12px;">Tu acceso</div>
<div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:14px;color:#dde4ea;margin-bottom:8px;">Email: <span style="color:#00e5a0;">${esc(email)}</span></div>
<div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:14px;color:#dde4ea;">Contraseña por defecto: <span style="color:#00e5a0;background:rgba(0,229,160,0.08);padding:2px 8px;border-radius:4px;">${esc(password)}</span></div>
<p style="margin:14px 0 0 0;font-size:13px;color:#7a8f9e;line-height:1.5;">Te invitamos a cambiarla por una tuya desde el dashboard. ¿Ya la cambiaste o no te acordás? <a href="${esc(recoverUrl)}" style="color:#00e5a0;text-decoration:none;">Recuperala acá →</a></p>
</div></td></tr>
<tr><td align="center" style="padding:28px 40px 0 40px;"><a href="${esc(loginUrl)}" style="display:inline-block;background:#00e5a0;color:#000000;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;padding:14px 32px;border-radius:6px;">Entrar al dashboard &rarr;</a></td></tr>
<tr><td style="padding:28px 40px 0 40px;">${huevLine}</td></tr>
<tr><td align="center" style="padding:18px 40px 0 40px;"><a href="${esc(huevsiteUrl)}" style="display:inline-block;border:1px solid #25406b;color:#dde4ea;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.04em;padding:12px 26px;border-radius:6px;">Armá / editá tu huevsite &rarr;</a></td></tr>
<tr><td style="padding:32px 40px 32px 40px;">
<div style="border-top:1px solid #1c2328;padding-top:20px;font-size:12px;color:#52626e;line-height:1.6;">Recibís este email porque sos parte de Nordelta Tech. Cualquier duda, respondé a este mismo mail.</div>
</td></tr></table>
<div style="margin-top:16px;font-size:11px;color:#52626e;letter-spacing:0.12em;text-transform:uppercase;">© ${year} Nordelta Tech · nordelta.tech</div>
</td></tr></table></body></html>`;
}

async function main() {
  loadDotEnv();
  const dry = process.argv.includes('--dry');
  const onlyArg = process.argv.find(a => a.startsWith('--only='));
  const onlyEmail = onlyArg ? onlyArg.split('=')[1].toLowerCase() : null;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || 'Nordelta Tech <onboarding@huevsite.studio>';
  const appUrl = process.env.APP_URL || 'https://nordelta.tech';
  const dbUrl = process.env.DATABASE_URL;
  const huevsiteUrl = 'https://huevsite.io';
  if (!apiKey) throw new Error('Set RESEND_API_KEY in .env.local');
  if (!dbUrl) throw new Error('Set DATABASE_URL in .env.local');

  const sql = neon(dbUrl);
  const resend = new Resend(apiKey);

  const rows = await sql`SELECT id, name, email, huevsite_username, huevsite_approved FROM members WHERE status = 'active' ORDER BY id`;
  const targets = onlyEmail ? rows.filter(r => r.email.toLowerCase() === onlyEmail) : rows;
  console.log(`→ ${targets.length} destinatario(s)${dry ? ' (DRY RUN)' : ''}${onlyEmail ? ` filtro=${onlyEmail}` : ''}`);

  for (const r of targets) {
    const password = defaultPasswordFor(r.name);
    const hasHuevsite = Boolean(r.huevsite_username);
    const html = buildHtml({
      name: r.name, email: r.email, password,
      hasHuevsite, huevsiteUsername: r.huevsite_username,
      loginUrl: `${appUrl}/login`, recoverUrl: `${appUrl}/login`,
      dashboardUrl: `${appUrl}/dashboard`, huevsiteUrl, appUrl,
    });
    if (dry) {
      console.log(`  • ${r.email}  pwd=${password}  huevsite=${hasHuevsite ? '@' + r.huevsite_username : 'no'}`);
      continue;
    }
    try {
      const res = await resend.emails.send({ from, to: r.email, subject: 'Nordelta Tech está on 🟢 — conectá tu huevsite', html });
      console.log(res.error ? `  ✗ ${r.email}: ${JSON.stringify(res.error)}` : `  ✓ ${r.email}  id=${res.data?.id}`);
    } catch (e) {
      console.error(`  ✗ ${r.email}: ${e.message || e}`);
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });
