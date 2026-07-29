/* ==========================================================================
   ETERNAL BEAT RADIO CHILE — ARCHIVO DE CONFIGURACIÓN
   ==========================================================================
   Este es el ÚNICO archivo que necesitas editar para la mayoría de cambios:
   stream, metadatos, video en vivo, chat y redes sociales.
   No requiere conocimientos de programación, solo reemplaza los valores
   entre comillas ' '.
   ========================================================================== */

window.RADIO_CONFIG = {

  /* -----------------------------------------------------------------------
     1. STREAM DE AUDIO (Centova Cast)
     ----------------------------------------------------------------------- */
  // URL directa de tu stream (la que usas para escuchar la radio)
  // NOTA: esta es una URL DE PRUEBA. Reemplázala por la URL real de tu
  // stream de Centova Cast cuando esté lista para producción.
  streamUrl: 'https://topradio.us/proxy/eternalbeat/stream',

  // URL para obtener los METADATOS (canción/artista actual).
  // Centova Cast normalmente expone esta info en una de estas rutas
  // (pregunta a tu proveedor de hosting cuál usa tu servidor):
  //   - Formato Icecast:   https://topradio.us/status-json.xsl
  //   - Formato Shoutcast: https://topradio.us/stats?sid=1  (o /7.html)
  // Déjalo tal como está si no estás seguro; el sitio funcionará igual,
  // solo no mostrará el nombre de la canción hasta que definas esta URL.
  // NOTA (confirmado por el usuario): la URL de prueba actual NO expone
  // metadatos todavía. El "now playing" mostrará "Conectando..." o quedará
  // vacío hasta reemplazar esta URL por la del stream real con metadatos.
  metadataUrl: 'https://topradio.us/proxy/eternalbeat/stats?json=1',

  // Cada cuántos segundos se actualizan los metadatos / historial
  metadataRefreshSeconds: 15,

  /* -----------------------------------------------------------------------
     2. VIDEO EN VIVO (YouTube o Twitch)
     ----------------------------------------------------------------------- */
  video: {
    // Elige 'youtube', 'twitch' o 'none'
    provider: 'youtube',

    // Si usas YouTube: pon el ID del canal (recomendado, siempre muestra
    // el live actual) o el ID de un video en vivo específico.
    youtubeChannelId: 'UCwrSb2vBHAPZ8kAwnxa5vSg',   // canal: @eternalbeatmedioscl
    youtubeVideoId: '',     // ej: 'dQw4w9WgXcQ' (opcional, si no usas channelId)

    // Si usas Twitch: pon el nombre exacto del canal
    // NOTA: no pude confirmar un canal de Twitch real para la radio, así que
    // lo dejo vacío. Como 'provider' está en 'youtube', esto no afecta nada
    // ahora. Si tienes canal de Twitch, escribe aquí el nombre exacto.
    twitchChannel: '',      // ej: 'eternalbeatradiotv'
  },

  /* -----------------------------------------------------------------------
     3. CHAT EN VIVO (widget Chatango — gratis, sin backend)
     ----------------------------------------------------------------------- */
  chat: {
    // IMPORTANTE: pon 'true' solo cuando hayas creado tu grupo real en
    // Chatango (ver instrucciones abajo). Mientras esté en 'false', el sitio
    // mostrará un aviso en vez de intentar cargar un chat que no existe.
    enabled: false,
    // Crea un grupo gratis en https://chatango.com/register (2 minutos)
    // y pega aquí el ID de tu grupo. Luego cambia 'enabled' a true arriba.
    chatangoGroupId: '',
  },

  /* -----------------------------------------------------------------------
     4. REDES SOCIALES Y CONTACTO
     ----------------------------------------------------------------------- */
  social: {
    facebook: '',
    instagram: '',
    tiktok: '',
    whatsapp: '',
    youtube: '',
    email: 'contacto@eternalbeatradio.cl',
  },

  /* -----------------------------------------------------------------------
     5. INFORMACIÓN GENERAL
     ----------------------------------------------------------------------- */
  station: {
    name: 'Eternal Beat Radio Chile',
    slogan: 'El ritmo que nunca se apaga',
    country: 'Chile',
  },
};

