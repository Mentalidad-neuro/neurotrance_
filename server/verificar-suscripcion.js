// Verificador de suscripción de NeuroTrance (Cloudflare Worker, plan gratis).
// Revisa en Mercado Pago si un correo tiene una suscripción activa o en prueba.
//
// Variables que se configuran en Cloudflare (nunca en el código ni en GitHub):
//   MP_ACCESS_TOKEN  -> credencial de producción de Mercado Pago (Tus integraciones > Credenciales)
//   MP_PLAN_ID       -> id del plan de suscripción (preapproval_plan_id)
//   ALLOWED_ORIGIN   -> dirección donde está publicada la app, p. ej. https://usuario.github.io
//
// La app llama: GET /?email=correo@ejemplo.com  ->  { "active": true | false }

export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGIN || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Content-Type': 'application/json',
    };
    if (request.method === 'OPTIONS') return new Response(null, { headers: cors });

    const email = (new URL(request.url).searchParams.get('email') || '').trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return new Response(JSON.stringify({ active: false, error: 'correo inválido' }), { status: 400, headers: cors });
    }

    const q = new URLSearchParams({ payer_email: email, preapproval_plan_id: env.MP_PLAN_ID, limit: '10' });
    const res = await fetch(`https://api.mercadopago.com/preapproval/search?${q}`, {
      headers: { Authorization: `Bearer ${env.MP_ACCESS_TOKEN}` },
    });
    if (!res.ok) return new Response(JSON.stringify({ active: false, error: 'mercado pago no respondió' }), { status: 502, headers: cors });

    const data = await res.json();
    // "authorized" = suscripción vigente (incluye los días de prueba gratis).
    const active = (data.results || []).some((s) => s.status === 'authorized');
    return new Response(JSON.stringify({ active }), { headers: cors });
  },
};
