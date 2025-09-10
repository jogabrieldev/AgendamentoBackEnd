import { makeWASocket, DisconnectReason, useMultiFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
const { v4: uuidv4 } = await import('uuid');
import Client from '../models/client.js';
import { normalizarTelefone } from '../utils/phone.js';
import QRCode from 'qrcode';
import { Sequelize, DataTypes } from 'sequelize';
import db from '../models/initModels.js'; // ajusta para seu init real

const FRONT_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FRONT_URL_PROD
    : process.env.FRONT_URL_LOCAL;

let sock;
let isReconnecting = false;
let currentQR = "";

// 🔹 Modelo para salvar a sessão
const WhatsAppSession = db.sequelize.define("WhatsAppSession", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
}, {
  tableName: "whatsapp_sessions",
  timestamps: false,
});

// garante que a tabela exista
await WhatsAppSession.sync();

export async function connectToWhatsApp() {
  // 🔹 Função customizada de storage
  const { state, saveCreds } = await (async () => {
    let session = await WhatsAppSession.findByPk("default");
    let creds = session ? session.data : {};

    return {
      state: creds,
      saveCreds: async (updatedCreds) => {
        await WhatsAppSession.upsert({
          id: "default",
          data: updatedCreds,
        });
      }
    };
  })();

  sock = makeWASocket({
    auth: state,
  });

  sock.ev.on('creds.update', saveCreds);

  let qrImpressa = false;

  sock.ev.on('connection.update', (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr && connection !== 'open' && !qrImpressa) {
      QRCode.toDataURL(qr, { margin: 1 }, (err, url) => {
        if (err) return console.error(err);
        currentQR = qr;
        qrImpressa = true;
      });
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
        console.log('Logout detectado, limpe sessão no banco para reautenticar.');
        isReconnecting = false;
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const numeroDeTelefone = msg.key.remoteJid;
    const telefone = normalizarTelefone(numeroDeTelefone);

    if (!telefone) {
      console.log("⚠️ Mensagem veio de um grupo ou JID inválido:", numeroDeTelefone);
      return;
    }

    console.log('📩 Mensagem recebida de:', telefone);

    let client = await Client.findOne({ where: { telefone: telefone.trim() } });

    if (!client) {
      console.log('⚠️ Cliente não encontrado na base. Solicitando cadastro.');
      const tokenAcess = uuidv4();
      const linkCadastro = `${FRONT_URL}/cliente/cadastro/${tokenAcess}`;

      await sock.sendMessage(numeroDeTelefone, {
        text: `Olá! 👋 Não encontramos seu cadastro no sistema. Por favor, clique no LINK e faça seu cadastro:\n${linkCadastro}`
      });

      return;
    }

    try {
      const agendaLink = `${FRONT_URL}/client/acesso/${client.tokenAcess}`;
      await sock.sendMessage(numeroDeTelefone, {
        text: `Olá, ${client.name}! 👋\n Clique no link abaixo para agendar seu horário:\n${agendaLink}`
      });
    } catch (error) {
      console.error('Erro ao enviar');
    }
  });

  return sock;
}

export function getCurrentQR() {
  return currentQR;
}

export async function sendMessage(phoneNumber, message) {
  if (!sock) {
    throw new Error('WhatsApp não conectado ainda.');
  }

  const jid = `${phoneNumber}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text: message });
}
