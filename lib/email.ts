import { Resend } from 'resend';
import { welcomeEmailHtml } from './email-templates/welcome';

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

export async function sendWelcomeEmail(params: {
  to: string;
  name: string;
  defaultPassword: string;
}): Promise<void> {
  const appUrl = getAppUrl();
  const html = welcomeEmailHtml({
    name: params.name,
    email: params.to,
    password: params.defaultPassword,
    loginUrl: `${appUrl}/login`,
    appUrl,
  });

  await getResend().emails.send({
    from: getFromAddress(),
    to: params.to,
    subject: '¡Bienvenido a Nordelta Tech! 🚀',
    html,
  });
}
