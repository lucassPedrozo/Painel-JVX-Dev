// ============================================
// PROTEÇÃO SSRF — destinos permitidos para requisições de saída
// ============================================
import dns from "dns";
import net from "net";

// Faixas não roteáveis publicamente (loopback, redes privadas, link-local,
// metadados de nuvem, CGNAT, multicast, reservadas etc.)
const blockedAddresses = new net.BlockList();
[
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.88.99.0", 24], ["192.168.0.0", 16], ["198.18.0.0", 15], ["198.51.100.0", 24],
  ["203.0.113.0", 24], ["224.0.0.0", 4], ["240.0.0.0", 4],
].forEach(([addr, prefix]) => blockedAddresses.addSubnet(addr, prefix, "ipv4"));
[
  // ::/96 inclui :: e ::1. IPv4 mapeado (::ffff:x) é tratado em isBlockedIp.
  ["::", 96], ["64:ff9b::", 96], ["100::", 64], ["2001:db8::", 32],
  ["fc00::", 7], ["fe80::", 10], ["ff00::", 8],
].forEach(([addr, prefix]) => blockedAddresses.addSubnet(addr, prefix, "ipv6"));

const ALLOWED_PORTS = new Set(["", "80", "443", "8080", "8443"]);
const BLOCKED_HOSTNAME_SUFFIXES = [".localhost", ".local", ".internal", ".lan", ".home.arpa"];

// Extrai o IPv4 de um IPv6 mapeado: ::ffff:10.0.0.1 ou ::ffff:a00:1
function mappedIpv4(ip) {
  const match = ip.toLowerCase().match(/^(?:0{0,4}:){0,5}:?ffff:(.+)$/);
  if (!match) return null;
  const tail = match[1];
  if (net.isIPv4(tail)) return tail;
  const hex = tail.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (!hex) return null;
  const hi = parseInt(hex[1], 16);
  const lo = parseInt(hex[2], 16);
  return [hi >> 8, hi & 255, lo >> 8, lo & 255].join(".");
}

export function isBlockedIp(ip) {
  const family = net.isIP(ip);
  if (family === 0) return true;
  if (family === 4) return blockedAddresses.check(ip, "ipv4");
  const v4 = mappedIpv4(ip);
  if (v4) return blockedAddresses.check(v4, "ipv4");
  return blockedAddresses.check(ip, "ipv6");
}

// Validação estática da URL (sem DNS). Retorna a URL normalizada ou lança erro.
export function validateMonitorUrl(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl.trim() || rawUrl.length > 500) {
    throw new Error("URL inválida");
  }
  let parsed;
  try { parsed = new URL(rawUrl.trim()); } catch { throw new Error("URL inválida"); }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("Apenas URLs http ou https são permitidas");
  }
  if (parsed.username || parsed.password) {
    throw new Error("URLs com credenciais não são permitidas");
  }
  if (!ALLOWED_PORTS.has(parsed.port)) {
    throw new Error("Porta não permitida (use 80, 443, 8080 ou 8443)");
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) throw new Error("Endereço de rede interna não permitido");
  } else if (
    hostname === "localhost" ||
    !hostname.includes(".") ||
    BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => hostname.endsWith(suffix))
  ) {
    throw new Error("Endereço de rede interna não permitido");
  }

  return parsed.toString();
}

// DNS lookup usado nas conexões de saída: rejeita se qualquer IP resolvido for
// interno. Como a conexão usa o IP validado aqui, também evita DNS rebinding.
export function safeLookup(hostname, options, callback) {
  if (typeof options === "function") { callback = options; options = {}; }
  dns.lookup(hostname, { ...options, all: true }, (err, addresses) => {
    if (err) return callback(err);
    if (!addresses.length || addresses.some((a) => isBlockedIp(a.address))) {
      const blockedErr = new Error(`Destino bloqueado: ${hostname}`);
      blockedErr.code = "EBLOCKEDDEST";
      return callback(blockedErr);
    }
    if (options && options.all) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
}
