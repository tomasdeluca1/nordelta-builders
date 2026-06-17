import { emailShell, escapeHtml, headingRow, paragraphRow } from './layout';

export function registrationReceivedHtml(params: { name: string; appUrl: string }): string {
  const { name, appUrl } = params;
  const firstName = name.split(/\s+/)[0] || name;

  const body = `
    ${headingRow(`HOLA, ${escapeHtml(firstName.toUpperCase())} 👋`)}
    ${paragraphRow(
      `Recibimos tu registro en <strong style="color:#00e5a0;">Nordelta Tech</strong>, la comunidad de founders, devs y makers de Nordelta y zona norte. 🙌`,
    )}
    ${paragraphRow(
      `Ahora un admin va a revisar tu solicitud. <strong style="color:#dde4ea;">Cuando te aceptemos te llega otro email con tu acceso al dashboard y la invitación al grupo de WhatsApp.</strong>`,
    )}
    <tr><td style="padding:24px 40px 0 40px;">
      <div style="background:#131920;border:1px solid #252e35;border-radius:12px;padding:18px 22px;font-size:14px;color:#a9b6c0;line-height:1.6;">
        <span style="font-family:'SF Mono',Menlo,Consolas,monospace;color:#00e5a0;">$ status</span><br/>
        → solicitud recibida · pendiente de aprobación
      </div>
    </td></tr>
    ${paragraphRow(`No tenés que hacer nada más por ahora. Si tenés alguna duda, respondé a este mismo email.`)}
  `;

  return emailShell({ appUrl, bodyHtml: body });
}
