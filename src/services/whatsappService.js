import { makeWASocket, DisconnectReason, initAuthCreds } from '@whiskeysockets/baileys';
const { v4: uuidv4 } = await import('uuid');
import Client from '../models/client.js';
import { normalizarTelefone } from '../utils/phone.js';
import { DataTypes} from 'sequelize';
import db from '../models/initModels.js'; 

const FRONT_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FRONT_URL_PROD
    : process.env.FRONT_URL_LOCAL;

    console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("FRONT_URL_PROD:", process.env.FRONT_URL_PROD);
console.log("FRONT_URL usado:", FRONT_URL);


let sock;
let isReconnecting = false;
let currentQR = "";
let qrAlreadyGenerated = false


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

await WhatsAppSession.sync();


// 🔹 Função para restaurar Buffers
function reviveBuffers(obj) {
  if (!obj) return obj

  const revive = (val) => {
    if (val && typeof val === "object") {
      if (val.type === "Buffer" && Array.isArray(val.data)) {
        return Buffer.from(val.data)
      }
      for (const k of Object.keys(val)) {
        try {
          val[k] = revive(val[k])
        } catch {
        
        }
      }
    }
    return val
  }

  return revive(obj)
}

// 🔹 Versão estilo useMultiFileAuthState, mas no Postgres
export async function usePostgresAuth() {
  let session = await WhatsAppSession.findByPk("default")

  let creds, keys

  if (session) {
    const raw = reviveBuffers(session.data)
    creds = raw.creds
    keys = raw.keys || {}
  } else {
    creds = initAuthCreds()
    keys = {}
  }

  const saveCreds = async () => {
    await WhatsAppSession.upsert({
      id: "default",
      data: JSON.parse(JSON.stringify({ creds, keys })),
    })
  }

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const data = ids.map(id => keys[type]?.[id] || null)
          return data
        },
        set: (data) => {
          for (const type in data) {
            keys[type] = keys[type] || {}
            Object.assign(keys[type], data[type])
          }
          saveCreds()
        },
      },
    },
    saveCreds,
  }
}


export async function connectToWhatsApp() {

  const { state, saveCreds } = await usePostgresAuth()
   
  
  sock = makeWASocket({
    auth: state,
    browser:["MyApp" , "Chrome" , "1.0"]
  });


  sock.ev.on('creds.update', saveCreds);


  sock.ev.on('connection.update', (update) => {
    const { qr, connection, lastDisconnect } = update;
         console.log("🔄 Conexão atualizada:", update);

    if (qr && !qrAlreadyGenerated && connection !== 'open') {
        console.log("📸 QR Code gerado:", qr);

        currentQR = qr;
        qrAlreadyGenerated = true
        
    }

    if (connection === 'open') {
      console.log('📱 Conectado ao WhatsApp');
      isReconnecting = false;
      qrAlreadyGenerated = false
    } 

    let tentativasReconexao = 0;
    const MAX_TENTATIVAS = 5;

    if (connection === 'close' && !isReconnecting) {
      isReconnecting = true;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
     
       if (statusCode !== DisconnectReason.loggedOut && tentativasReconexao < MAX_TENTATIVAS) {
    tentativasReconexao++;
    console.log(`🔁 Tentativa de reconexão #${tentativasReconexao}`);
    setTimeout(connectToWhatsApp, 5000);
  } else {
    console.log('❌ Reconexão falhou ou logout detectado.');
    isReconnecting = false;
    tentativasReconexao = 0;
  }

    }
  });

  
  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0];

     console.log('Mensagem recebida raw:', msg);
    if (!msg.message || msg.key.fromMe|| msg.message.protocolMessage ) return;

    const numeroDeTelefone = msg.key.remoteJid;

    const telefone = normalizarTelefone(numeroDeTelefone);
    console.log('📞 JID recebido:', numeroDeTelefone);

    if (!telefone) {
      console.log("⚠️ Mensagem veio de um grupo ou JID inválido:", numeroDeTelefone);
      return;
    }

    console.log('📩 Mensagem recebida de:', telefone);

    let client = await Client.findOne({ where: { telefone: telefone.trim() } });

    if (!client) {
      console.log('⚠️ Cliente não encontrado na base. Solicitando cadastro.');
      const linkCadastro = `${FRONT_URL}/cliente/cadastro`;

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
      console.error('Erro ao enviar o link' , error);
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
