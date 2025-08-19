 export function normalizarTelefone(numeroJid) {
  if (!numeroJid) return null;

  // 1. Remove sufixo (@s.whatsapp.net ou @g.us)
  let numero = numeroJid.split("@")[0];

  // 2. Mantém só dígitos
  numero = numero.replace(/\D/g, "");

  // 3. Remove DDI "55" caso exista
  if (numero.startsWith("55")) {
    numero = numero.substring(2);
  }

  // 4. Se sobrar mais de 11 dígitos ou menos de 10, não é válido
  if (numero.length < 10 || numero.length > 11) return null;

  return numero;
}

