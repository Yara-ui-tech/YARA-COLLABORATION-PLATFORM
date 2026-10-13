// YARA Edge Function: send-member-emails
// Processes queued member email messages via Resend
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';
const MAIL_FROM = Deno.env.get('MAIL_FROM') || 'YARA <notifications@yara.org>';
const CRON_SECRET = Deno.env.get('CRON_SECRET') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

serve(async (req: Request) => {
  try {
    // 1. Verify cron authorization or admin request
    const authHeader = req.headers.get('x-cron-secret');
    if (CRON_SECRET && authHeader !== CRON_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: 'RESEND_API_KEY not configured' }), { status: 500 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 2. Fetch pending message recipients
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

    // 3. Dispatch each pending email via Resend
    for (const recipient of pendingRecipients) {
      const message = (recipient as any).member_messages;
      if (!message || !recipient.recipient_email) continue;

      const personalizedBody = (message.body || '')
        .replace(/{{name}}/g, recipient.recipient_name || 'Innovator')
        .replace(/{{email}}/g, recipient.recipient_email);

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
            html: `<div style="font-family: sans-serif; line-height: 1.6; color: #1e293b;">
              <h2 style="color: #0f172a;">Young Africans Robotics Association</h2>
              <div>${personalizedBody.replace(/\n/g, '<br/>')}</div>
              <hr style="margin-top: 24px; border: none; border-top: 1px solid #e2e8f0;"/>
              <p style="font-size: 11px; color: #64748b;">Innovate Local, Build Global · YARA Official Notification</p>
            </div>`
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
