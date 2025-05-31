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

    // const telefone = sender.replace('@s.whatsapp.net', '')

    console.log('📩 Mensagem recebida de:', sender);
    
    // console.log(telefone)
    //  const client = await Client.findOne({ where: { telefone } });
    // const telefone = sender.replace('@s.whatsapp.net', '');

// Remova qualquer +, espaço ou traços (se necessário)
// const telefoneLimpo = telefone.replace(/\D/g, '');

// Buscar com telefone limpo
const client = await Client.findOne({ where: { telefone: '5562984815157'  } });

       if (!client) {
    await sock.sendMessage(sender, { text: 'Cliente não encontrado. Por favor, cadastre-se.' });
    return;
  }
   console.log('client' , client)
        const { v4: uuidv4 } = await import('uuid');
        client.tokenAcess = uuidv4();
        await client.save();
    const agendaLink = `http://localhost:3000/client/acesso/${client.tokenAcess}`; 
 

    await sock.sendMessage(sender, {
      text: `Olá! 👋\nClique no link abaixo para agendar um horário querido cliente:\n${agendaLink}`,
    });

    console.log(`Mensagem de ${sender} respondida com link de agenda.`);
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
