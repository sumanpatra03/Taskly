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
    const {
      to,
      assigneeName,
      assignedByName,
      projectName,
      taskTitle,
      taskDescription,
      projectId,
      taskId,
    } = await request.json();

    const taskLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/projects/${projectId}/${taskId}`;

    const isMockMode =
      !process.env.GMAIL_USER ||
      !process.env.GMAIL_APP_PASSWORD ||
      process.env.GMAIL_APP_PASSWORD === 'your_16_char_app_password';

    if (isMockMode) {
   
      return NextResponse.json({ success: true, mocked: true });
    }

    await transporter.sendMail({
      from: `Taskly <${process.env.GMAIL_USER}>`,
      to,
      subject: `New Task Assigned: "${taskTitle}" in ${projectName}`,
      html: `
        <div style="font-family:sans-serif;max-width:465px;margin:40px auto;border:1px solid #eaeaea;border-radius:4px;padding:20px;color:#333;">
          <h1 style="font-size:22px;font-weight:600;text-align:center;color:#111;margin-bottom:24px;">
            New Task Assigned on <strong>Taskly</strong>
          </h1>
          <p>Hello <strong>${assigneeName}</strong>,</p>
          <p><strong>${assignedByName}</strong> has assigned a task to you in the project <strong>${projectName}</strong>:</p>
          <div style="background-color:#f9f9f9;border-left:4px solid rgb(59,130,246);padding:15px;margin:20px 0;border-radius:0 4px 4px 0">
            <h2 style="font-size:16px;margin:0 0 8px 0;color:#111">${taskTitle}</h2>
            <p style="font-size:14px;color:#555;margin:0">${taskDescription || 'No description provided.'}</p>
          </div>
          <div style="text-align:center;margin:32px 0">
            <a href="${taskLink}" style="background-color:rgb(59,130,246);border-radius:4px;color:white;font-size:14px;font-weight:600;text-decoration:none;padding:12px 24px;display:inline-block">
              View Task Details
            </a>
          </div>
          <p style="font-size:12px;color:#888;">Or copy this URL: <br/><a href="${taskLink}" style="color:rgb(59,130,246);">${taskLink}</a></p>
          <hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0" />
          <p style="color:#666;font-size:12px">Team at Taskly</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Email error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}
