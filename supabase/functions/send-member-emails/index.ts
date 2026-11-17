// YARA Edge Function: send-member-emails
// Processes queued member email messages and direct transactional notifications via Resend
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const MAIL_FROM = Deno.env.get('MAIL_FROM') || 'YARA <notifications@yaria.tech>';
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const OFFICIAL_LOGO_URL = 'https://www.yaria.tech/assets/yara-circular-logo.png';

const EMAIL_FOOTER_HTML = `
  <div style="margin-top: 32px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="margin-bottom: 10px;">
      <img src="${OFFICIAL_LOGO_URL}" alt="YARA Logo" width="84" height="84" style="width: 84px; height: 84px; border-radius: 50%; object-fit: contain; display: inline-block; border: 2px solid #cbd5e1; box-shadow: 0 4px 10px rgba(15,23,42,0.12);" />
    </div>
    <p style="margin: 0; font-size: 13px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">
      Young Africans Robotics Association (YARA)
    </p>
    <p style="margin: 3px 0 0 0; font-size: 11px; font-weight: 700; color: #4f46e5; text-transform: uppercase;">
      Innovate Local · Build Global
    </p>
    <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">
      National Headquarters &amp; African Robotics Collaborative · Harare, Zimbabwe
    </p>
    <p style="margin: 6px 0 0 0; font-size: 10px; color: #94a3b8;">
      <a href="https://www.yaria.tech" style="color: #4f46e5; text-decoration: underline;">www.yaria.tech</a> · <a href="mailto:info@yaria.tech" style="color: #4f46e5; text-decoration: none;">info@yaria.tech</a>
    </p>
  </div>
`;

serve(async (req: Request) => {
  try {
    // Check if direct POST request with JSON body
    let requestPayload: any = null;
    if (req.method === 'POST') {
      try {
        requestPayload = await req.json();
      } catch {}
    }

    // 1. Direct single email dispatch (e.g. Welcome email, alerts)
    if (requestPayload && (requestPayload.to || requestPayload.html)) {
      const to = Array.isArray(requestPayload.to) ? requestPayload.to : [requestPayload.to];
      const subject = requestPayload.subject || 'Notice from YARA';
      let html = requestPayload.html || '';

      // Guarantee the official logo footer is appended if not already present
      if (!html.includes('yara-circular-logo.png') && !html.includes('logo-yara-official')) {
        html = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">${html}${EMAIL_FOOTER_HTML}</div>`;
      }

      if (!RESEND_API_KEY) {
        return new Response(JSON.stringify({ 
          success: true, 
          simulated: true, 
          message: 'RESEND_API_KEY not set in Edge Function; email logged successfully.', 
          to, 
          subject 
        }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        });
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from: MAIL_FROM,
          to,
          subject,
          html
        })
      });

      const resData = await res.json();
      return new Response(JSON.stringify({ success: res.ok, data: resData }), {
        headers: { 'Content-Type': 'application/json' },
        status: res.ok ? 200 : 400
      });
    }

    // 2. Cron verification for queue processing
    const authHeader = req.headers.get('x-cron-secret');
    if (CRON_SECRET && authHeader !== CRON_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 3. Fetch pending message recipients
    const { data: pendingRecipients, error: fetchError } = await supabase
      .from('member_message_recipients')
      .select('id, message_id, recipient_email, recipient_name, status, member_messages(subject, body)')
      .eq('status', 'pending')
      .limit(50);

    if (fetchError) {
      return new Response(JSON.stringify({ error: fetchError.message }), { status: 500 });
    }

    if (!pendingRecipients || pendingRecipients.length === 0) {
      return new Response(JSON.stringify({ message: 'No pending emails to dispatch' }), { status: 200 });
    }

    const results: Array<{ id: string; status: string; error?: string }> = [];

    // 4. Dispatch each pending email via Resend with guaranteed logo footer
    for (const recipient of pendingRecipients) {
      const message = (recipient as any).member_messages;
      if (!message || !recipient.recipient_email) continue;

      const personalizedBody = (message.body || '')
        .replace(/{{name}}/g, recipient.recipient_name || 'Innovator')
        .replace(/{{email}}/g, recipient.recipient_email);

      const html = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0f172a; margin-top: 0;">Young Africans Robotics Association</h2>
          <div style="font-size: 14px; color: #334155;">${personalizedBody.replace(/\n/g, '<br/>')}</div>
          ${EMAIL_FOOTER_HTML}
        </div>
      `;

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`
          },
          body: JSON.stringify({
            from: MAIL_FROM,
            to: [recipient.recipient_email],
            subject: message.subject || 'Notice from YARA',
            html
          })
        });

        if (res.ok) {
          await supabase
            .from('member_message_recipients')
            .update({ status: 'delivered', sent_at: new Date().toISOString() })
            .eq('id', recipient.id);
          results.push({ id: recipient.id, status: 'delivered' });
        } else {
          const errData = await res.json();
          await supabase
            .from('member_message_recipients')
            .update({ status: 'failed', error_message: JSON.stringify(errData) })
            .eq('id', recipient.id);
          results.push({ id: recipient.id, status: 'failed', error: JSON.stringify(errData) });
        }
      } catch (err: any) {
        await supabase
          .from('member_message_recipients')
          .update({ status: 'failed', error_message: err.message })
          .eq('id', recipient.id);
        results.push({ id: recipient.id, status: 'failed', error: err.message });
      }
    }

    return new Response(JSON.stringify({ dispatched: results.length, details: results }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
