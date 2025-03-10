const twilio = require('twilio');
const dotenv = require('dotenv');

dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendWhatsAppMessage = async (to, message) => {
  try {
    const response = await client.messages.create({
      from: 'whatsapp:+14155238886',
      to: `whatsapp:${to}`,
      body: message,
    });
    console.log('Mensaje enviado: ', response.sid);
    return response;
  } catch (error) {
    console.error('Error enviando mensaje: ', error);
    throw error;
  }
};

module.exports = { sendWhatsAppMessage };
