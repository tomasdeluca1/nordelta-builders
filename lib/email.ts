import { Resend } from 'resend';
import { getSetting } from './settings';
import { registrationReceivedHtml } from './email-templates/registration-received';
import { acceptedEmailHtml } from './email-templates/accepted';
import { rejectedEmailHtml } from './email-templates/rejected';
import { adminNewRegistrationHtml } from './email-templates/admin-notification';

let resendClient: Resend | undefined;

function getResend(): Resend {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) throw new Error('Missing RESEND_API_KEY environment variable');
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM?.trim() || 'Nordelta Tech <onboarding@huevsite.studio>';
}

function getAppUrl(): string {
  return process.env.APP_URL?.trim() || 'https://nordelta.tech';
}

/** Builder se registró → "recibimos tu registro" (sin credenciales). */
export async function sendRegistrationReceivedEmail(params: { to: string; name: string }): Promise<void> {
  const appUrl = getAppUrl();
  await getResend().emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: 'Recibimos tu registro en Nordelta Tech ⏳',
    html: registrationReceivedHtml({ name: params.name, appUrl }),
  });
}

/** Aviso interno al admin de un nuevo registro pendiente. */
export async function sendAdminNewRegistrationEmail(params: {
  name: string;
  email: string;
  role: string;
  company?: string | null;
}): Promise<void> {
  const appUrl = getAppUrl();
  const to = await getSetting('admin_notification_email');
  if (!to) return;
  await getResend().emails.send({
    from: getFromAddress(),
    to,
    subject: `🛎️ Nuevo registro pendiente: ${params.name}`,
    html: adminNewRegistrationHtml({
      name: params.name,
      email: params.email,
      role: params.role,
      company: params.company,
      adminUrl: `${appUrl}/admin`,
      appUrl,
    }),
  });
}

/** Builder aceptado → credenciales + invitación al grupo de WhatsApp. */
export async function sendAcceptedEmail(params: {
  to: string;
  name: string;
  defaultPassword: string;
}): Promise<void> {
  const appUrl = getAppUrl();
  const whatsappUrl = await getSetting('whatsapp_group_url');
  await getResend().emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: '¡Entraste a Nordelta Tech! 🚀',
    html: acceptedEmailHtml({
      name: params.name,
      email: params.to,
      password: params.defaultPassword,
      loginUrl: `${appUrl}/login`,
      whatsappUrl,
      appUrl,
    }),
  });
}

/** Builder rechazado → mensaje cordial. */
export async function sendRejectedEmail(params: { to: string; name: string }): Promise<void> {
  const appUrl = getAppUrl();
  await getResend().emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: 'Sobre tu registro en Nordelta Tech',
    html: rejectedEmailHtml({ name: params.name, appUrl }),
  });
}
