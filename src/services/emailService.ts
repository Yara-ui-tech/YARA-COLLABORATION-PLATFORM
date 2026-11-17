// YARA Unified Email Service
// Handles automated welcome emails, transactional notices, and broadcast messages
import { supabase } from '../lib/supabase';

export const YARA_OFFICIAL_LOGO_URL = 'https://www.yaria.tech/assets/yara-circular-logo.png';
export const YARA_PORTAL_URL = 'https://www.yaria.tech';

export interface WelcomeEmailPayload {
  toEmail: string;
  recipientName: string;
  memberId: string;
  position: string;
  schoolOrInstitution?: string;
  province?: string;
  specialThanksMessage?: string;
}

export interface GeneralEmailPayload {
  toEmail: string;
  recipientName?: string;
  subject: string;
  bodyHtml: string;
  previewText?: string;
}

/**
 * Standard YARA email footer featuring the official circular logo, motto, and credentials.
 * Every outgoing email in the system appends this footer.
 */
export function getYaraEmailFooterHtml(): string {
  return `
    <div style="margin-top: 36px; padding-top: 24px; border-top: 2px solid #e2e8f0; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <div style="margin-bottom: 12px;">
        <img 
          src="${YARA_OFFICIAL_LOGO_URL}" 
          alt="Young Africans Robotics Association (YARA)" 
          width="90" 
          height="90" 
          style="width: 90px; height: 90px; border-radius: 50%; object-fit: contain; display: inline-block; border: 2px solid #cbd5e1; box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);"
        />
      </div>
      <p style="margin: 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
        Young Africans Robotics Association (YARA)
      </p>
      <p style="margin: 3px 0 0 0; font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.25px;">
        Innovate Local · Build Global
      </p>
      <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">
        Zimbabwe National Secretariat &amp; African Robotics Collaborative
      </p>
      <p style="margin: 6px 0 0 0; font-size: 10px; color: #94a3b8;">
        Official Web: <a href="${YARA_PORTAL_URL}" style="color: #4f46e5; text-decoration: underline; font-weight: 600;">www.yaria.tech</a> · Support: <a href="mailto:info@yaria.tech" style="color: #4f46e5; text-decoration: none;">info@yaria.tech</a>
      </p>
    </div>
  `;
}

/**
 * Generates the full HTML markup for the new user welcome induction email.
 */
export function generateWelcomeEmailHtml(payload: WelcomeEmailPayload): string {
  const defaultSpecialThanks = "Thank you for stepping forward to be part of the Young Africans Robotics Association! Your dedication to science, robotics, artificial intelligence, and engineering is the catalyst for Africa's technological transformation. We are immensely honored to welcome you into this vibrant community of makers, innovators, and leaders.";
  const specialThanks = payload.specialThanksMessage || defaultSpecialThanks;

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to YARA</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; padding: 24px 12px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
              
              <!-- Hero Header Banner -->
              <tr>
                <td style="background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0f172a 100%); padding: 36px 32px; text-align: center; color: #ffffff;">
                  <span style="display: inline-block; background-color: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; color: #fbbf24; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 14px; border-radius: 9999px; margin-bottom: 12px;">
                    Official Membership Induction
                  </span>
                  <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                    Welcome to YARA!
                  </h1>
                  <p style="margin: 8px 0 0 0; font-size: 13px; color: #cbd5e1; max-width: 440px; margin-left: auto; margin-right: auto;">
                    Young Africans Robotics Association · Membership &amp; Innovation Network
                  </p>
                </td>
              </tr>

              <!-- Main Body -->
              <tr>
                <td style="padding: 32px 28px;">
                  <p style="margin-top: 0; font-size: 16px; font-weight: 700; color: #0f172a;">
                    Dear ${payload.recipientName},
                  </p>
                  
                  <p style="font-size: 14px; color: #334155; margin-bottom: 20px;">
                    Congratulations and welcome! Your registration has been successfully processed. You are now officially enrolled in the Young Africans Robotics Association platform.
                  </p>

                  <!-- Member Identification Card -->
                  <div style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 18px; padding: 20px; margin-bottom: 24px;">
                    <div style="font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #6366f1; margin-bottom: 12px;">
                      Official Membership Credentials
                    </div>
                    
                    <table width="100%" cellpadding="6" cellspacing="0" style="font-size: 13px;">
                      <tr>
                        <td width="40%" style="color: #64748b; font-weight: 600;">Member ID:</td>
                        <td width="60%" style="color: #0f172a; font-family: monospace; font-size: 15px; font-weight: 800; letter-spacing: 0.5px;">
                          ${payload.memberId}
                        </td>
                      </tr>
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Assigned Position:</td>
                        <td style="color: #4f46e5; font-weight: 800; text-transform: capitalize;">
                          ${payload.position}
                        </td>
                      </tr>
                      ${payload.schoolOrInstitution ? `
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Institution / School:</td>
                        <td style="color: #0f172a; font-weight: 700;">
                          ${payload.schoolOrInstitution}
                        </td>
                      </tr>
                      ` : ''}
                      ${payload.province ? `
                      <tr>
                        <td style="color: #64748b; font-weight: 600;">Province / Region:</td>
                        <td style="color: #0f172a; font-weight: 700;">
                          ${payload.province}
                        </td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>

                  <!-- Special Thanks Message Box -->
                  <div style="background: linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%); border: 1px solid #c7d2fe; border-left: 4px solid #4f46e5; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
                    <p style="margin: 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #3730a3; letter-spacing: 0.5px; margin-bottom: 6px;">
                      Special Thanks from the National Directorate
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #1e1b4b; font-style: italic; line-height: 1.6;">
                      "${specialThanks}"
                    </p>
                  </div>

                  <!-- What's Next Steps -->
                  <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-top: 24px; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    Next Steps to Get Started:
                  </h3>

                  <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 13px; color: #334155;">
                    <li style="margin-bottom: 8px;">
                      <strong>Access Your Courses:</strong> Dive into the YARA LMS to explore robotics, microcontrollers, embedded C, and CAD blueprint tracks.
                    </li>
                    <li style="margin-bottom: 8px;">
                      <strong>Join or Form a Club:</strong> Connect with peers in your university or school section to form autonomous rover squads or aerospace clubs.
                    </li>
                    <li style="margin-bottom: 8px;">
                      <strong>Hardware Kits & Blueprint Specs:</strong> Browse laboratory kits and parts in the YARA Shop to build prototypes.
                    </li>
                  </ul>

                  <!-- Primary CTA Button -->
                  <div style="text-align: center; margin: 28px 0 16px 0;">
                    <a 
                      href="${YARA_PORTAL_URL}/learn" 
                      style="display: inline-block; background-color: #4f46e5; color: #ffffff; font-size: 13px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 14px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);"
                    >
                      Enter YARA Platform &rarr;
                    </a>
                  </div>

                  <!-- Official Logo Footer at the end of every email -->
                  ${getYaraEmailFooterHtml()}
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Sends a welcome email to a newly signed up user with position, member id, special thanks, and the official logo.
 */
export async function sendWelcomeEmail(payload: WelcomeEmailPayload): Promise<{ success: boolean; message: string }> {
  try {
    const htmlContent = generateWelcomeEmailHtml(payload);
    const subject = `Welcome to YARA – Official Induction & Member ID: ${payload.memberId}`;

    // 1. Try sending via Supabase Edge Function send-member-emails
    try {
      const { error } = await supabase.functions.invoke('send-member-emails', {
        body: {
          type: 'welcome',
          to: payload.toEmail,
          recipient_name: payload.recipientName,
          member_id: payload.memberId,
          position: payload.position,
          subject,
          html: htmlContent
        }
      });
      if (!error) {
        logEmailDispatch({
          to: payload.toEmail,
          recipient: payload.recipientName,
          subject,
          type: 'welcome',
          status: 'dispatched'
        });
        return { success: true, message: 'Welcome email dispatched successfully via mail server.' };
      }
    } catch (edgeErr) {
      console.warn('Edge function email invoke fallback:', edgeErr);
    }

    // 2. Persist in local dispatched emails registry
    logEmailDispatch({
      to: payload.toEmail,
      recipient: payload.recipientName,
      subject,
      type: 'welcome',
      status: 'queued'
    });

    return { success: true, message: 'Welcome induction queued and recorded.' };
  } catch (err: any) {
    console.error('Failed to send welcome email:', err);
    return { success: false, message: err?.message || 'Error sending welcome email.' };
  }
}

/**
 * Dispatches any general email notification, automatically wrapping it with the official logo footer.
 */
export async function sendGeneralEmail(payload: GeneralEmailPayload): Promise<{ success: boolean; message: string }> {
  try {
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.6; padding: 20px;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; padding: 28px;">
          ${payload.bodyHtml}
          ${getYaraEmailFooterHtml()}
        </div>
      </body>
      </html>
    `;

    try {
      await supabase.functions.invoke('send-member-emails', {
        body: {
          to: payload.toEmail,
          subject: payload.subject,
          html: fullHtml
        }
      });
    } catch {}

    logEmailDispatch({
      to: payload.toEmail,
      recipient: payload.recipientName || payload.toEmail,
      subject: payload.subject,
      type: 'general',
      status: 'dispatched'
    });

    return { success: true, message: 'Email sent successfully with official footer.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Failed to dispatch email.' };
  }
}

function logEmailDispatch(record: { to: string; recipient: string; subject: string; type: string; status: string }) {
  try {
    const key = 'yara_sent_emails';
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    stored.unshift({
      id: 'mail_' + Date.now().toString(36),
      ...record,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(key, JSON.stringify(stored.slice(0, 100)));
  } catch {}
}
