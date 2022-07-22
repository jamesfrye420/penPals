import nodemailer from 'nodemailer';

export async function sendEmail(to: string, html: string) {
  //   const testAccount = await nodemailer.createTestAccount();
  //   console.log(testAccount);

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: 'k2mgxbj4sljci42s@ethereal.email',
      pass: 'wJpUfaqg38T4mYdrxz',
    },
  });
  const info = await transporter.sendMail({
    from: '"Boo" <boo@example.com>',
    to,
    subject: 'Change Password',
    html,
  });
  console.log(`Message sent ${info.messageId}`);
  console.log(`Preview Url ${nodemailer.getTestMessageUrl(info)}`);
}
