import { makeWASocket, DisconnectReason, initAuthCreds } from '@whiskeysockets/baileys';
import { DataTypes} from 'sequelize';
import db from '../models/initModels.js'; 


const FRONT_URL =
  process.env.NODE_ENV === "production"
    ? process.env.FRONT_URL_PROD
    : process.env.FRONT_URL_LOCAL;

//     console.log("NODE_ENV:", process.env.NODE_ENV);
// console.log("FRONT_URL_PROD:", process.env.FRONT_URL_PROD);
// console.log("FRONT_URL usado:", FRONT_URL);


let sock;
let isReconnecting = false;
let currentQR = "";
let qrAlreadyGenerated = false
let tentativasReconexao = 0;
const MAX_TENTATIVAS = 5;


//Crinade a tabela para armazenar credenciais
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


//  Função para restaurar Buffers
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
};

//  Versão estilo useMultiFileAuthState, mas no Postgres
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
  };

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const data = {}
          for (const id of ids) {
            if (keys[type]?.[id]) {
              data[id] = reviveBuffers(keys[type][id]) 
            }
          }
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
  };
};

// fazendo conexão
export async function connectToWhatsApp() {

  const { state, saveCreds } = await usePostgresAuth()
   
  
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false, 
    qrTimeout: 60000,         
    connectTimeoutMs: 6000,
    browser:["MyApp" , "Chrome" , "1.0"]
  });


  sock.ev.on('creds.update', saveCreds);


  sock.ev.on('connection.update', (update) => {
    const { qr, connection, lastDisconnect } = update;
         console.log("🔄 Conexão atualizada:", update);

    if (qr && !qrAlreadyGenerated && connection !== 'open') {
        console.log("📸 QR Code gerado:", qr);
        // qrcode.generate(qr, { small: true });

        currentQR = qr;
        qrAlreadyGenerated = true
        
    }

    if (connection === 'open') {
      console.log('📱 Conectado ao WhatsApp');
      isReconnecting = false;
      qrAlreadyGenerated = false
    } 

  
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

  // pegando a mensagem enviada para o contato
  
  const clientesQueReceberamLink = new Set();
  
  sock.ev.on('messages.upsert', async ({ messages }) => {

    const msg = messages[0];

    if (!msg.message || msg.key.fromMe ) return;

      const fullJid = msg.key.remoteJid;

      if(fullJid && !clientesQueReceberamLink.has(fullJid)){

        
         console.log('⚠️ Cliente não encontrado na base. Solicitando cadastro.');
          const linkCadastro = `${FRONT_URL}/cliente/cadastro`;

          await sock.sendMessage(fullJid, {
           text: `Olá! 👋 se ja possui cadastro, clique no botão ja cadastrado e digite o seu numero de telefone que ja foi cadastrado:\n${linkCadastro}`
         } , { quoted: msg });
          clientesQueReceberamLink.add(fullJid);
      }
      return;
  });

  return sock;
};

// pegando o qrcode e enviando para o front
export function getCurrentQR() {
  return currentQR;
};


// enviando a mensagem
export async function sendMessage(jid, message) {
  if (!sock) throw new Error('WhatsApp não conectado ainda.');

   if (!jid.includes('@s.whatsapp.net')) {
    jid = `${jid}@s.whatsapp.net`;
  }

  console.log("Enviando mensagem para:", jid);

  try {
    await sock.presenceSubscribe(jid); 
    await sock.sendMessage(jid, { text: message });
  } catch (err) {
    if (err?.message === 'Invalid PreKey ID') {
      console.log('⚠️ Invalid PreKey ID detectado. Recriando sessão...');
      await sock.logout();
      await connectToWhatsApp(); 
      await sendMessage(jid, message); 
    } else {
      console.error('Erro ao enviar mensagem:', err);
    }
  }
};



