export function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export const escapeAttr = escapeHtml;

/**
 * Shared dark-themed email shell (Nordelta Tech brand). `bodyHtml` is injected
 * between the logo header and the footer; it should be a sequence of <tr> rows
 * built with the helpers below.
 */
export function emailShell(params: { appUrl: string; bodyHtml: string; footerNote?: string }): string {
  const { appUrl, bodyHtml } = params;
  const footerNote =
    params.footerNote ??
    `Recibís este email porque te sumaste a Nordelta Tech en <a href="${escapeAttr(appUrl)}" style="color:#00e5a0;text-decoration:none;">nordelta.tech</a>.`;
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="dark" />
    <meta name="supported-color-schemes" content="dark" />
    <title>Nordelta Tech</title>
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
            ${bodyHtml}
            <tr>
              <td style="padding:32px 40px 32px 40px;">
                <div style="border-top:1px solid #1c2328;padding-top:20px;font-size:12px;color:#52626e;line-height:1.6;">
                  ${footerNote}
                </div>
              </td>
            </tr>
          </table>
          <div style="margin-top:16px;font-size:11px;color:#52626e;letter-spacing:0.12em;text-transform:uppercase;">
            © ${year} Nordelta Tech · nordelta.tech
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Big Bebas-style heading row. */
export function headingRow(html: string): string {
  return `<tr><td style="padding:32px 40px 8px 40px;">
    <h1 style="margin:0;font-family:'Bebas Neue',Impact,sans-serif;font-size:44px;line-height:1.05;letter-spacing:0.02em;color:#ffffff;">${html}</h1>
  </td></tr>`;
}

/** Paragraph row. */
export function paragraphRow(html: string): string {
  return `<tr><td style="padding:16px 40px 0 40px;">
    <p style="margin:0;font-size:16px;line-height:1.6;color:#a9b6c0;">${html}</p>
  </td></tr>`;
}

/** Primary CTA button row. */
export function buttonRow(href: string, label: string, opts?: { bg?: string; color?: string }): string {
  const bg = opts?.bg ?? '#00e5a0';
  const color = opts?.color ?? '#000000';
  return `<tr><td align="center" style="padding:28px 40px 0 40px;">
    <a href="${escapeAttr(href)}" style="display:inline-block;background:${bg};color:${color};text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.06em;text-transform:uppercase;padding:14px 32px;border-radius:6px;">${escapeHtml(label)} &rarr;</a>
  </td></tr>`;
}
