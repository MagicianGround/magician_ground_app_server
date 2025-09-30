const nodemailer = require("nodemailer");

// Transporter (ejemplo con Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "iraldejordan10@gmail.com",
    pass: "fsbm iuhr faja xuqv"
  },
  tls: {
    rejectUnauthorized: false
  }
});


async function sendRecoveryEmail(to, recoveryKey) {
  const resetLink = `http://192.168.40.166:8080/user/reset-password?token=${recoveryKey}`;

  const info = await transporter.sendMail({
    from: `"Soporte" <iraldejordan10@gmail.com>`,
    to,
    subject: "Recuperación de contraseña",
    html: `
      <h3>Recuperación de contraseña</h3>
      <p>Has solicitado restablecer tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para continuar:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>Si no solicitaste este cambio, ignora este mensaje.</p>
    `
  });

  console.log("📧 Email enviado: %s", info.messageId);
}

module.exports = { sendRecoveryEmail };
