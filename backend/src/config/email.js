const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error("SMTP ERROR:", err);
  } else {
    console.log("SMTP CONNECTED");
  }
});

exports.sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: "doandbefitness@gmail.com",
    to,
    subject,
    html,
  });
};
