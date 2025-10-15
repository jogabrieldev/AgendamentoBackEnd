import { makeWASocket, DisconnectReason, initAuthCreds} from '@whiskeysockets/baileys';
import { DataTypes} from 'sequelize';
import qrcode from 'qrcode-terminal'
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
  // logout se socket existente
  if (sock) {
    try {
      await sock.logout();
    } catch (err) {
      console.log("⚠️ Logout anterior falhou, prosseguindo...");
    }
    sock = null;
  }

  // limpa QR antigo
  qrAlreadyGenerated = false;
  currentQR = null;

  // pega credenciais
  const { state, saveCreds } = await usePostgresAuth();

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    qrTimeout: 60000,
    connectTimeoutMs: 10000,
    browser: ["MyApp", "Chrome", "1.0"],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { qr, connection, lastDisconnect } = update;
    console.log("🔄 Conexão atualizada:", update);

    // QR code gerado
    if (qr && !qrAlreadyGenerated && connection !== 'open') {
      console.log("📸 QR Code gerado:", qr);
      currentQR = qr;
      qrAlreadyGenerated = true;
    }

    // conexão aberta
    if (connection === 'open') {
      console.log('📱 Conectado ao WhatsApp');
      isReconnecting = false;
      qrAlreadyGenerated = false;
      tentativasReconexao = 0;
    }

    // conexão fechada
    if (connection === 'close' && !isReconnecting) {
      isReconnecting = true;

      const statusCode = lastDisconnect?.error?.output?.statusCode;

      if (statusCode === DisconnectReason.loggedOut || !state.creds?.me) {
        console.log("❌ Logout detectado ou sessão inválida. Limpando sessão e gerando novo QR...");
        await WhatsAppSession.destroy({ where: { id: 'default' } });
        qrAlreadyGenerated = false;
        currentQR = null;
        tentativasReconexao = 0;

        // força reconexão
        setTimeout(connectToWhatsApp, 1000);
        return;
      }

      if (tentativasReconexao < MAX_TENTATIVAS) {
        tentativasReconexao++;
        console.log(`🔁 Tentativa de reconexão #${tentativasReconexao}`);
        setTimeout(connectToWhatsApp, 5000);
      } else {
        console.log('❌ Reconexão falhou.');
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

      const fullJid = msg.key.remoteJid

      if(fullJid && !clientesQueReceberamLink.has(fullJid)){

        
         console.log('⚠️ Cliente não encontrado na base. Solicitando cadastro.');
          const linkCadastro = `${FRONT_URL}/cliente/cadastro`;

         await sock.sendMessage(fullJid, {
           text: `📌 *Agendamento de Serviços*  

        Olá! 👋  

Se você já possui cadastro, clique no botão *"Já Cadastrado"* e digite seu número de telefone que já está registrado.  
Se ainda não tem cadastro, clique em *"Cadastrar"* e preencha seus dados.  

🔗 Acesse o link para cadastro ou login:  
${linkCadastro}

⚠️ *Regras importantes:*  
- O cancelamento do agendamento só pode ser realizado *até um dia antes* da data marcada.  
- Caso não compareça na data e no horário agendados, *o valor do serviço será cobrado normalmente*.  
- Por favor, evite faltar para não gerar transtornos.  

💬 Pra desmarcar, é só mandar mensagem aqui mesmo nessa conversa, e enviar o codigo gerado na hora do agendamento!

✅ Garantimos que sua experiência será segura e prática!  

Obrigado por escolher nossos serviços! 🌟`
});

          clientesQueReceberamLink.add(fullJid);

          setTimeout(() => {
            clientesQueReceberamLink.delete(fullJid);
           }, 20 * 60 * 1000);
      }
      return;
  });

  return sock;
};

// pegando o qrcode e enviando para o front
export function getCurrentQR() {
  return currentQR;
};

function normalizeJid(jid) {
  if (!jid) return null;

  // grupos ficam iguais
  if (jid.endsWith('@g.us')) return jid;

  // se for LID, converte para o formato padrão
  if (jid.includes('@lid')) {
    const numero = jid.split('@')[0].replace(/[^0-9]/g, '');
    return `${numero}@s.whatsapp.net`;
  }

  return jid;
}




// enviando a mensagem
export async function sendMessage(jid, message) {
  if (!sock) throw new Error('WhatsApp não conectado ainda.');

   jid = normalizeJid(jid);

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



