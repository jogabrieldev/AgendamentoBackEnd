
// normalização de telefones no software
export function normalizarTelefone(numeroJid) {
  if (!numeroJid) return null;


  let numero = numeroJid.replace(/\D/g, "");

  if (numero.length != 11) {
    return null; 
  }

  return numero;
}

export function formatToWhatsAppJid(phone) {

  let number = phone.replace(/\D/g, "");

  return `55${number}@s.whatsapp.net`;
}

