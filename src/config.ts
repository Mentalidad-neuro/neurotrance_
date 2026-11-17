// Ajustes que se completan cuando estén las cuentas.

// Enlace del plan de suscripción creado en Mercado Pago (Suscripciones > Planes).
// Ejemplo: 'https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=XXXX'
export const MERCADO_PAGO_PLAN_URL = 'https://mpago.la/1jeh4FN';

// Dirección del verificador de suscripción (carpeta server/). Vacío = aún no activo.
export const VERIFY_URL = '';

// Días con todo libre desde la primera vez que se abre la app (sin pedir tarjeta).
export const TRIAL_DAYS = 7;

// true = después de la prueba, los audios marcados "free" siguen gratis.
// false = después de la prueba todo se bloquea hasta suscribirse.
export const FREE_AFTER_TRIAL = false;

// Precio que se muestra, por ejemplo '$2.990 al mes'. Vacío = no se muestra.
export const PRICE_TEXT = '$2.999 al mes';
export const PRICE_TEXT_EN = 'CLP 2,999 per month';
