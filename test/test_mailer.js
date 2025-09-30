const { sendRecoveryEmail } = require("../src/utils/mailer");

(async () => {
  try {
    // Probá enviarte un correo a tu dirección
    await sendRecoveryEmail("iraldejordan10@gmail.com", "123456789TOKEN");
    console.log("✅ Email enviado correctamente");
  } catch (err) {
    console.error("❌ Error al enviar email:", err);
  }
})();
