export function welcomeEmailHtml(params: {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
  appUrl: string;
}): string {
  const { name, email, password, loginUrl, appUrl } = params;
  const firstName = name.split(/\s+/)[0] || name;

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>Bienvenido a Nordelta Tech</title>
  </head>
  <body style="margin:0;padding:0;background:#080b0d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#dde4ea;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#080b0d;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="560" style="max-width:560px;width:100%;background:#0e1215;border:1px solid #1c2328;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:32px 40px 0 40px;">
                <table cellpadding="0" cellspacing="0" border="0" role="presentation"><tr>
                  <td style="padding-right:12px;vertical-align:middle;"><img src="${appUrl}/assets/logo.png" width="40" height="40" alt="" style="display:block;border:0;outline:0;text-decoration:none;"/></td>
                  <td style="vertical-align:middle;">
                    <div style="font-family:'Bebas Neue',Impact,sans-serif;font-size:28px;letter-spacing:0.06em;color:#00e5a0;line-height:1;">NORDELTA <span style="color:#dde4ea;">TECH</span></div>
                    <div style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#7a8f9e;margin-top:4px;">nordelta.tech</div>
                  </td>
                </tr></table>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 8px 40px;">
                <h1 style="margin:0;font-family:'Bebas Neue',Impact,sans-serif;font-size:44px;line-height:1;letter-spacing:0.02em;color:#ffffff;">
                  HOLA, ${escapeHtml(firstName.toUpperCase())} 👋
                </h1>
                <p style="margin:16px 0 0 0;font-size:16px;line-height:1.6;color:#a9b6c0;">
                  Bienvenido a <strong style="color:#00e5a0;">Nordelta Tech</strong>, la comunidad de founders, devs y makers de Nordelta y zona norte.
                  Ya sos parte de la base de builders.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 40px 0 40px;">
                <div style="background:#131920;border:1px solid #252e35;border-radius:12px;padding:20px 24px;">
                  <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7a8f9e;margin-bottom:12px;">Tus credenciales</div>
                  <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:14px;color:#dde4ea;margin-bottom:8px;">
                    Email: <span style="color:#00e5a0;">${escapeHtml(email)}</span>
                  </div>
                  <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:14px;color:#dde4ea;">
                    Contraseña: <span style="color:#00e5a0;background:rgba(0,229,160,0.08);padding:2px 8px;border-radius:4px;">${escapeHtml(password)}</span>
                  </div>
                  <p style="margin:14px 0 0 0;font-size:13px;color:#7a8f9e;line-height:1.5;">
                    Es una contraseña temporal. Vas a tener que cambiarla la primera vez que entres al dashboard.
                  </p>
                </div>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:28px 40px 0 40px;">
                <a href="${escapeAttr(loginUrl)}" style="display:inline-block;background:#00e5a0;color:#000000;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;padding:14px 32px;border-radius:6px;">
                  Iniciar sesión &rarr;
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 0 40px;">
                <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7a8f9e;margin-bottom:12px;">¿Qué sigue?</div>
                <ul style="margin:0;padding-left:20px;color:#a9b6c0;font-size:14px;line-height:1.7;">
                  <li>Entrá al dashboard y cambiá tu contraseña</li>
                  <li>Completá tu perfil si te faltan datos</li>
                  <li>Te avisamos cuando confirmemos el kick-off de la comunidad</li>
                </ul>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px 32px 40px;">
                <div style="border-top:1px solid #1c2328;padding-top:20px;font-size:12px;color:#52626e;line-height:1.6;">
                  Recibís este email porque te sumaste a Nordelta Tech en
                  <a href="${escapeAttr(appUrl)}" style="color:#00e5a0;text-decoration:none;">nordelta.tech</a>.
                  Si no fuiste vos, ignorá este mensaje.
                </div>
              </td>
            </tr>
          </table>
          <div style="margin-top:16px;font-size:11px;color:#52626e;letter-spacing:0.12em;text-transform:uppercase;">
            © ${new Date().getFullYear()} Nordelta Tech · nordelta.tech
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s);
}
