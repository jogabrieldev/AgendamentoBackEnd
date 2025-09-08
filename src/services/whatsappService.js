import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
const { v4: uuidv4 } = await import('uuid');
import Client from '../models/client.js';
import { normalizarTelefone } from '../utils/phone.js';
import QRCode from 'qrcode';

const FRONT_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FRONT_URL_PROD
    : process.env.FRONT_URL_LOCAL;


let sock;
let isReconnecting = false;

export async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth');

  sock = makeWASocket({
    auth: state,
   
  });

  sock.ev.on('creds.update', saveCreds);

 sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr && connection !== 'open') {
    console.clear();
    console.log('📱 Escaneie este QR Code com o WhatsApp:');
    qrcode.generate(qr, { small: true, errorCorrectionLevel: 'L' });
  }
    if (connection === 'open') {
      console.log('📱 Conectado ao WhatsApp');
      isReconnecting = false;
    }

    if (connection === 'close' && !isReconnecting) {
      isReconnecting = true;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const reason = DisconnectReason[statusCode] || 'unknown';

      if (statusCode !== DisconnectReason.loggedOut) {
        console.log('Reconectando...');
        connectToWhatsApp().finally(() => {
          isReconnecting = false;
        });
      } else {
        console.log('Logout detectado, remova os arquivos de sessão para reautenticar.');
        isReconnecting = false;
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


    let client = await Client.findOne({ where: {telefone:telefone.trim()} });
 
    console.log('Cliente encontrado:', client);

    if (!client) {
      console.log('⚠️ Cliente não encontrado na base. Solicitando cadastro.');
      
      const tokenAcess = uuidv4();

       const linkCadastro = `${FRONT_URL}/cliente/cadastro/${tokenAcess}`;

      await sock.sendMessage(numeroDeTelefone, {
        text: `Olá! 👋 Não encontramos seu cadastro no sistema. Por favor, clique no LINK e va ate a pagina de cadastro faça seu cadastro e agende seu horario:\n${linkCadastro}`
      });

      return; // encerra aqui
    }


  try { 
    const agendaLink = `${FRONT_URL}/client/acesso/${client.tokenAcess}`;

  await sock.sendMessage(numeroDeTelefone, {
    text: `Olá, ${client.name}! 👋\n Obrigado por retorna clique no link abaixo para agendar seu horário:\n${agendaLink}`
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
