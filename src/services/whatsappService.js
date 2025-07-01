import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
const { v4: uuidv4 } = await import('uuid');
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
  let client = await Client.findOne({ where: { telefone } });

if (!client) {
    // 👉 Se cliente não existe, cria com token novo
    const tokenAcess = uuidv4();

    client = await Client.create({
      name: '',              // Nome vazio, ele vai cadastrar depois
      telefone: telefone,
      dataCadastro: new Date(),
      idUser: 1,             // Ajuste: coloque o idUser dono do barbeiro (exemplo: 1)
      tokenAcess: tokenAcess
    });

    console.log('🆕 Novo cliente criado:', client);
  } else {
    // 👉 Se cliente já existe, só atualiza o token
    client.tokenAcess = uuidv4();
    await client.save();
  }

  console.log('✅ Cliente encontrado:', client.name);

  try { 
     const agendaLink = `http://localhost:4200/client/acesso/${client.tokenAcess}`;

  await sock.sendMessage(sender, {
    text: `Olá, ${client.name}! 👋\nClique no link abaixo para agendar seu horário:\n${agendaLink}`
  });

  console.log(`✅ Link de agendamento enviado para ${telefone}`);
    
  } catch (error) {
    console.error('Erro ao ennviar')
  }

 
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
