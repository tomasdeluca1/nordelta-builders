import { emailShell, escapeHtml, escapeAttr, headingRow, paragraphRow, buttonRow } from './layout';

export function welcomeEmailHtml(params: {
  name: string;
  email: string;
  password: string;
  loginUrl: string;
  whatsappUrl: string;
  appUrl: string;
  needsWebsite: boolean;
}): string {
  const { name, email, password, loginUrl, whatsappUrl, appUrl, needsWebsite } = params;
  const firstName = name.split(/\s+/)[0] || name;

  const whatsappBlock = whatsappUrl
    ? `<tr><td style="padding:28px 40px 0 40px;">
        <div style="background:rgba(37,211,102,0.08);border:1px solid rgba(37,211,102,0.35);border-radius:12px;padding:20px 24px;">
          <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#25d366;margin-bottom:8px;">Grupo de WhatsApp</div>
          <p style="margin:0 0 14px 0;font-size:14px;line-height:1.6;color:#a9b6c0;">Entrá al grupo de la comunidad. Ahí se arma todo: presentaciones, eventos y la previa de los co-works.</p>
          <a href="${escapeAttr(whatsappUrl)}" style="display:inline-block;background:#25d366;color:#000000;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.04em;padding:12px 26px;border-radius:6px;">Entrar al grupo de WhatsApp &rarr;</a>
        </div>
      </td></tr>`
    : '';

  const websiteBlock = needsWebsite
    ? `<tr><td style="padding:28px 40px 0 40px;">
        <div style="background:#131920;border:1px solid #252e35;border-radius:12px;padding:18px 22px;">
          <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7a8f9e;margin-bottom:8px;">Una cosa más</div>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#a9b6c0;">No nos dejaste tu web. Cuando entres al dashboard, sumá el link de tu proyecto así el resto de la comunidad sabe qué estás construyendo.</p>
        </div>
      </td></tr>`
    : '';

  const body = `
    ${headingRow(`BIENVENIDO, ${escapeHtml(firstName.toUpperCase())} 🚀`)}
    ${paragraphRow(
      `Ya estás adentro de <strong style="color:#00e5a0;">Nordelta Tech</strong>, la comunidad de founders, devs y makers de la zona norte. Sin esperas: tu acceso está listo.`,
    )}
    <tr><td style="padding:24px 40px 0 40px;">
      <div style="background:#131920;border:1px solid #252e35;border-radius:12px;padding:20px 24px;">
        <div style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#7a8f9e;margin-bottom:12px;">Tu acceso</div>
        <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:14px;color:#dde4ea;margin-bottom:8px;">Email: <span style="color:#00e5a0;">${escapeHtml(email)}</span></div>
        <div style="font-family:'SF Mono',Menlo,Consolas,monospace;font-size:14px;color:#dde4ea;">Contraseña: <span style="color:#00e5a0;background:rgba(0,229,160,0.08);padding:2px 8px;border-radius:4px;">${escapeHtml(password)}</span></div>
        <p style="margin:14px 0 0 0;font-size:13px;color:#7a8f9e;line-height:1.5;">Es temporal. Te la pedimos cambiar la primera vez que entres.</p>
      </div>
    </td></tr>
    ${buttonRow(loginUrl, 'Iniciar sesión')}
    ${whatsappBlock}
    ${websiteBlock}
  `;

  return emailShell({ appUrl, bodyHtml: body });
}
