// Proxy HTTPS para el origen HTTP de la radio. Requiere soporte de streaming de Netlify.
export default async (req) => {
  const source = "http://uk2freenew.listen2myradio.com:29986/stream";
  try {
    const upstream = await fetch(source, {
      headers: {
        "user-agent": "Mozilla/5.0 MonacoRadio/1.0",
        ...(req.headers.get("range") ? { "range": req.headers.get("range") } : {})
      },
      signal: req.signal
    });
    if (!upstream.body) return new Response("El servidor de radio no entregó audio",{status:502});
    const h = new Headers();
    h.set("Content-Type",upstream.headers.get("content-type") || "audio/mpeg");
    h.set("Cache-Control","no-store, no-cache, must-revalidate");
    h.set("Access-Control-Allow-Origin","*");
    h.set("Access-Control-Allow-Headers","Range");
    h.set("Access-Control-Expose-Headers","Content-Length, Content-Range");
    return new Response(upstream.body,{status:upstream.status,headers:h});
  } catch (e) {
    return new Response("No se pudo conectar con el servidor de MONACO 98.7 FM",{status:502});
  }
};
export const config = { path: "/radio-stream", streaming: true };
