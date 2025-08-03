// import { Resend } from 'resend';

// const resend = new Resend('re_AcoVh9cJ_JjGkjgxkpGoD484sWVgangnz');

// export const emails = {
//   sendProjectInvitation: async ({
//     to,
//     projectId,
//     role,
//     username,
//     projectName,
//     invitedByUsername,
//   }: {
//     to: string;
//     projectId: string;
//     role: Role;
//     username: string;
//     projectName: string;
//     invitedByUsername: string;
//   }) => {
//     const response = await fetch('/api/invite-user', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         to,
//         projectId,
//         role,
//         username,
//         projectName,
//         invitedByUsername,
//       }),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to send invitation email');
//     }

//     return response.json();
//   },
// };


// lib/emails.ts

// utils/emails.ts
import { Resend } from 'resend';
import { InviteUserEmail } from '@/emails/invite-user'; // Correct path
import React from 'react'; // Needed for JSX + typing

const resend = new Resend('re_AcoVh9cJ_JjGkjgxkpGoD484sWVgangnz');

export const emails = {
  sendProjectInvitation: async ({
    to,
    projectId,
    role,
    username,
    projectName,
    invitedByUsername,
  }: {
    to: string;
    projectId: string;
    role: Role;
    username: string;
    projectName: string;
    invitedByUsername: string;
  }) => {
    const inviteLink = `https://taskly-green-ten.vercel.app/projects/${projectId}/invite`;

    return await resend.emails.send({
      from: 'Taskly <no-reply@yourdomain.com>', // Must be a verified domain
      to,
      subject: `You’ve been invited to join ${projectName} on Taskly`,
      react: InviteUserEmail({
        username,
        invitedByUsername,
        projectName,
        inviteLink,
         
      }) as React.ReactElement,
    });
  },
};
