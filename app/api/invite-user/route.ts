import { InviteUserEmail } from '@/emails/invite-user';
import { NextResponse } from 'next/server';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { to, username, projectName, invitedByUsername, projectId, role } =
      await request.json();

    console.log('Sending email to:', to);

    const { data, error } = await resend.emails.send({
      from: 'Taskly <noreply@mrshadrack.com>',
      to,
      subject: 'Invitation to join a project',
      react: InviteUserEmail({
        username,
        projectName,
        invitedByUsername,
        inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')}/invites/${projectId}?role=${role}`,
      }),
    });

    if (error) {
      console.error('Resend error:', JSON.stringify(error, null, 2));
      return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 400 });
    }

    console.log('Email sent successfully:', data);
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
