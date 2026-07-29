/* ==========================================================================
   ETERNAL BEAT RADIO CHILE — ARCHIVO DE CONFIGURACIÓN
   ==========================================================================
   Este es el ÚNICO archivo que necesitas editar para la mayoría de cambios:
   stream, metadatos, video en vivo, chat y redes sociales.
   No requiere conocimientos de programación, solo reemplaza los valores
   entre comillas ' '.
   ========================================================================== */

const RADIO_CONFIG = {

  /* -----------------------------------------------------------------------
     1. STREAM DE AUDIO (Centova Cast)
     ----------------------------------------------------------------------- */
  // URL directa de tu stream (la que usas para escuchar la radio)
  streamUrl: 'https://topradio.us/proxy/eternalbeat/stream',

  // URL para obtener los METADATOS (canción/artista actual).
  // Centova Cast normalmente expone esta info en una de estas rutas
  // (pregunta a tu proveedor de hosting cuál usa tu servidor):
  //   - Formato Icecast:   https://topradio.us/status-json.xsl
  //   - Formato Shoutcast: https://topradio.us/stats?sid=1  (o /7.html)
  // Déjalo tal como está si no estás seguro; el sitio funcionará igual,
  // solo no mostrará el nombre de la canción hasta que definas esta URL.
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
    youtubeChannelId: '',   // ej: 'UCxxxxxxxxxxxxxxxxxxxxxx'
    youtubeVideoId: '',     // ej: 'dQw4w9WgXcQ' (opcional, si no usas channelId)

    // Si usas Twitch: pon el nombre exacto del canal
    twitchChannel: '',      // ej: 'eternalbeatradio'
  },

  /* -----------------------------------------------------------------------
     3. CHAT EN VIVO (widget Chatango — gratis, sin backend)
     ----------------------------------------------------------------------- */
  chat: {
    enabled: true,
    // Crea un grupo gratis en https://chatango.com/register (2 minutos)
    // y pega aquí el ID de tu grupo.
    chatangoGroupId: 'eternalbeatradiochile',
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
