const nodemailer = require("nodemailer");

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_SERVICE_AUTH_USER,
    pass: process.env.NODEMAILER_SERVICE_AUTH_PASS,
  },
});

// Reusable function
const sendEmailFunction = async (
  recipient,
  subject,
  html,
  isAttachment = false, // ✅ default
  attachments = [] // ✅ default
) => {
  try {
    const mailOptions = {
      from: `"${process.env.NODEMAILER_SERVICE_AUTH_NAME}" <${process.env.NODEMAILER_SERVICE_AUTH_USER}>`,
      to: recipient,
      subject,
      html,
    };

    if (isAttachment && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info);

    return info;
  } catch (error) {
    console.error("Error in sendEmailFunction:", error);
    throw error;
  }
};

module.exports = { sendEmailFunction };
