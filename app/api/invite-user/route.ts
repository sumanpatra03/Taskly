// import { InviteUserEmail } from '@/emails/invite-user';
// import { NextResponse } from 'next/server';

// import { Resend } from 'resend';

// const resend = new Resend('re_AcoVh9cJ_JjGkjgxkpGoD484sWVgangnz');

// export async function POST(request: Request) {
//   try {
//     const { to, username, projectName, invitedByUsername, projectId, role } =
//       await request.json();

//     console.log('Sending email to:', to);

//     const { data, error } = await resend.emails.send({
//       from: 'Taskly <noreply@mrshadrack.com>',
//       to,
//       subject: 'Invitation to join a project',
//       react: InviteUserEmail({
//         username,
//         projectName,
//         invitedByUsername,
//         inviteLink: `${process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin')}/invites/${projectId}?role=${role}`,
//       }),
//     });

//     if (error) {
//       console.error('Resend error:', JSON.stringify(error, null, 2));
//       return NextResponse.json({ error: error.message || 'Failed to send email' }, { status: 400 });
//     }

//     console.log('Email sent successfully:', data);
//     return NextResponse.json({ data });
//   } catch (error) {
//     console.error('Server error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const { to, username, projectName, invitedByUsername, projectId, role } =
      await request.json();

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invites/${projectId}?role=${role}`;

    await transporter.sendMail({
      from: `Taskly <${process.env.GMAIL_USER}>`,
      to,
      subject: `You've been invited to join ${projectName} on Taskly`,
      html: `
        <div style="font-family:sans-serif;max-width:465px;margin:40px auto;border:1px solid #eaeaea;border-radius:4px;padding:20px">
          <h1 style="font-size:24px;font-weight:400;text-align:center">
            Join <strong>${projectName}</strong> on <strong>Taskly</strong>
          </h1>
          <p>Hello ${username},</p>
          <p><strong>${invitedByUsername}</strong> has invited you to the <strong>${projectName}</strong> project on <strong>Taskly</strong>.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${inviteLink}" style="background-color:rgb(34,197,94);border-radius:4px;color:white;font-size:12px;font-weight:600;text-decoration:none;padding:12px 20px">
              Accept Invite
            </a>
          </div>
          <p>Or copy this URL: <a href="${inviteLink}">${inviteLink}</a></p>
          <p style="color:#666;font-size:12px">Team at Taskly</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

