/**
 * Detecta automaticamente a URL da API baseado no host atual.
 * Quando acessado via IP da rede (ex: http://192.168.0.10:5173),
 * aponta a API para o mesmo IP (ex: http://192.168.0.10:3001).
 * Quando acessado via localhost, usa a variável de ambiente ou fallback.
 */
export function getApiUrl(): string {
  const { hostname } = window.location
  // Se acessado via IP (não localhost), aponta API para o mesmo IP
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:3001`
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3001'
}

export const API_URL = getApiUrl()
