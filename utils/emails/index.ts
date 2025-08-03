import { Resend } from 'resend';
import { InviteUserEmail } from '@/emails/invite-user'; 
import type { NextRequest } from 'next/server'; // If using Next.js App Router

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    to,
    username,
    invitedByUsername,
    projectName,
    inviteLink,
  } = body;

  try {
    const data = await resend.emails.send({
      from: 'Taskly <no-reply@yourdomain.com>',
      to,
      subject: `You've been invited to join ${projectName} on Taskly`,
      react: InviteUserEmail({
        username,
        invitedByUsername,
        projectName,
        inviteLink,
      }) as React.ReactElement,
    });

    return Response.json(data);
  } catch (error) {
    console.error('Failed to send email:', error);
    return new Response('Email sending failed', { status: 500 });
  }
}
