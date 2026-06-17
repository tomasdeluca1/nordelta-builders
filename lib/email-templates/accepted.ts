import { emailShell, escapeHtml, escapeAttr, headingRow, paragraphRow, buttonRow } from './layout';

export function acceptedEmailHtml(params: {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
  whatsappUrl: string;
  appUrl: string;
}): string {
  const { name, email, password, loginUrl, whatsappUrl, appUrl } = params;
  const firstName = name.split(/\s+/)[0] || name;

  const whatsappBlock = whatsappUrl
    ? `<tr><td style="padding:28px 40px 0 40px;">
        <div style="background:rgba(37,211,102,0.08);border:1px solid rgba(37,211,102,0.35);border-radius:12px;padding:20px 24px;">
          <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#25d366;margin-bottom:8px;">Grupo de WhatsApp</div>
          <p style="margin:0 0 14px 0;font-size:14px;line-height:1.6;color:#a9b6c0;">Sumate al grupo de la comunidad para enterarte de todo y conocer a los demás builders.</p>
          <a href="${escapeAttr(whatsappUrl)}" style="display:inline-block;background:#25d366;color:#000000;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.04em;padding:12px 26px;border-radius:6px;">Entrar al grupo de WhatsApp →</a>
        </div>
      </td></tr>`
    : '';

  const body = `
    ${headingRow(`¡ENTRASTE, ${escapeHtml(firstName.toUpperCase())}! 🎉`)}
    ${paragraphRow(
      `Tu solicitud fue <strong style="color:#00e5a0;">aceptada</strong>. Ya sos parte de <strong style="color:#00e5a0;">Nordelta Tech</strong>, la comunidad de founders, devs y makers de la zona norte.`,
    )}
    <tr><td style="padding:24px 40px 0 40px;">
      <div style="background:#131920;border:1px solid #252e35;border-radius:12px;padding:20px 24px;">
        <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7a8f9e;margin-bottom:12px;">Tus credenciales</div>
        <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:14px;color:#dde4ea;margin-bottom:8px;">Email: <span style="color:#00e5a0;">${escapeHtml(email)}</span></div>
        <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:14px;color:#dde4ea;">Contraseña: <span style="color:#00e5a0;background:rgba(0,229,160,0.08);padding:2px 8px;border-radius:4px;">${escapeHtml(password)}</span></div>
        <p style="margin:14px 0 0 0;font-size:13px;color:#7a8f9e;line-height:1.5;">Es una contraseña temporal. Te la vamos a pedir cambiar la primera vez que entres al dashboard.</p>
      </div>
    </td></tr>
    ${buttonRow(loginUrl, 'Iniciar sesión')}
    ${whatsappBlock}
    <tr><td style="padding:32px 40px 0 40px;">
      <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7a8f9e;margin-bottom:12px;">¿Qué sigue?</div>
      <ul style="margin:0;padding-left:20px;color:#a9b6c0;font-size:14px;line-height:1.7;">
        <li>Entrá al dashboard y cambiá tu contraseña</li>
        <li>Completá tu perfil y conectá tu huevsite.io</li>
        <li>Sumate al grupo de WhatsApp</li>
      </ul>
    </td></tr>
  `;

  return emailShell({ appUrl, bodyHtml: body });
}
