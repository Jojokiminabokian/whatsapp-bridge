const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const N8N_WEBHOOK_URL = 'https://primary-production-590c.up.railway.app/webhook/66b96567-06c1-474e-9de7-c9717528d891';

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
});

client.on('message', async (message) => {
    if (message.fromMe) return;
    
    try {
        const response = await axios.post(N8N_WEBHOOK_URL, {
            message: message.body,
            from: message.from
        });
        
        const reply = response.data.output || response.data.text || response.data;
        await message.reply(String(reply));
    } catch (error) {
        console.error('Error:', error.message);
    }
});

client.initialize();
