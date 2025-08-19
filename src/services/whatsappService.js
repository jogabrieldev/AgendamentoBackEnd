import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
const { v4: uuidv4 } = await import('uuid');
import Client from '../models/client.js';
import { normalizarTelefone } from '../utils/phone.js';


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

 
    const numeroDeTelefone = msg.key.remoteJid;

    const telefone = normalizarTelefone(numeroDeTelefone)

 
  if (!telefone) {
    console.log("⚠️ Mensagem veio de um grupo ou JID inválido:", numeroDeTelefone);
    return;
  }


  console.log('📩 Mensagem recebida de:', telefone);


    let client = await Client.findOne({ where: { telefone:telefone} });
 
    console.log('Cliente encontrado:', client);

    if (!client) {
      console.log('⚠️ Cliente não encontrado na base. Solicitando cadastro.');
      
      const tokenAcess = uuidv4();

      const linkCadastro = `http://localhost:4200/cliente/cadastro/${tokenAcess}`;

      await sock.sendMessage(numeroDeTelefone, {
        text: `Olá! 👋 Não encontramos seu cadastro. Por favor, complete seus dados no link:\n${linkCadastro}`
      });

      return; // encerra aqui
    }


  try { 
     const agendaLink = `http://localhost:4200/client/acesso/${client.tokenAcess}`;

  await sock.sendMessage(numeroDeTelefone, {
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
