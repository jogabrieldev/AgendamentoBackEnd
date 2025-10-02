import Client from "../models/client.js";
import { normalizarTelefone } from "../utils/phone.js";

// cache para numero do cliente
const clientsCache = new Map()

export async function getClientByPhone(telefone) {
  const normalized = normalizarTelefone(telefone);

  if(!normalized) return null


  if (clientsCache.has(normalized)) {
    return clientsCache.get(normalized);
  }

  const client = await Client.findOne({ where: { telefone: normalized } });

  if (client) {
    clientsCache.set(normalized, client); 
  }

  return client;
}

export function updateClientCache(client) {
  const normalized = normalizarTelefone(client.telefone);
  clientsCache.set(normalized, client);
}


