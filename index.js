const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const axios = require('axios');
const http = require('http');

const N8N_WEBHOOK_URL = 'https://primary-production-590c.up.railway.app/webhook/66b96567-06c1-474e-9de7-c9717528d891';

let qrCodeData = '';

const server = http.createServer(async (req, res) => {
    if (qrCodeData) {
        const qrImage = await qrcode.toDataURL(qrCodeData);
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(`<html><body style="text-align:center"><h2>Scan with WhatsApp</h2><img src="${qrImage}"/></body></html>`);
    } else {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end('<html><body><h2>Waiting for QR code... Refresh in 10 seconds</h2></body></html>');
    }
});

server.listen(process.env.PORT || 3000);

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

client.on('qr', (qr) => { qrCodeData = qr; console.log('QR Ready - open the web page to scan'); });
client.on('ready', () => { qrCodeData = ''; console.log('WhatsApp bot is ready!'); });

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
