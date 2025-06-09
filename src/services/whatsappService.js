import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import Client from '../models/client.js';

let sock;

export async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  sock = makeWASocket({
    auth: state,
   
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr && connection !== 'open') {
      console.log('🔐 Escaneie o QR Code abaixo para se conectar:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      console.log('📱 Conectado ao WhatsApp');
     
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const reason = DisconnectReason[statusCode] || 'unknown';

      console.log(`Conexão encerrada, motivo: ${reason}`);


      if (statusCode !== DisconnectReason.loggedOut) {
        console.log('Reconectando...');
        connectToWhatsApp();
      } else {
        console.log('Logout detectado, remova os arquivos de sessão para reautenticar.');
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
  const msg = messages[0];
  if (!msg.message || msg.key.fromMe) return;

  const sender = msg.key.remoteJid;
  console.log('📩 Mensagem recebida de:', sender);

  const telefone = sender.replace('@s.whatsapp.net', ''); // remove o sufixo
  const client = await Client.findOne({ where: { telefone } });

  // if (!client) {
  //   await sock.sendMessage(sender, {
  //     text: '⚠️ Você ainda não está cadastrado. Por favor, entre em contato com o atendente.'
  //   });
  //   return;
  // }

  console.log('✅ Cliente encontrado:', client.name);

  const { v4: uuidv4 } = await import('uuid');
  client.tokenAcess = uuidv4();
  await client.save();

  const agendaLink = `http://localhost:3000/client/acesso/${client.tokenAcess}`;

  await sock.sendMessage(sender, {
    text: `Olá, ${client.name}! 👋\nClique no link abaixo para agendar seu horário:\n${agendaLink}`
  });

  console.log(`✅ Link de agendamento enviado para ${telefone}`);
});

  return sock;
}

export async function sendMessage(phoneNumber, message) {
  if (!sock) {
    throw new Error('WhatsApp não conectado ainda.');
  }

  const jid = `${phoneNumber}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text: message });
}
