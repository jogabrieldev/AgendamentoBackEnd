 export function normalizarTelefone(numeroJid) {
  if (!numeroJid) return null;

 
  let numero = numeroJid.split("@")[0];

  numero = numero.replace(/\D/g, "");

  if (numero.startsWith("55")) {
    numero = numero.substring(2);
  }

  if (numero.length === 11 && numero[2] === "9") {
    numero = numero.slice(0, 2) + numero.slice(3); 
  }

  if (numero.length !== 10) return null;

  return numero;
};

