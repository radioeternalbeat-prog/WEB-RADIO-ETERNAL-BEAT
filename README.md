# 🏎️ Eternal Beat Radio Chile

Sitio web oficial de **Eternal Beat Radio Chile** — "El ritmo que nunca se apaga".

Diseño inspirado en los colores de McLaren F1 (papaya clásico + papaya/azul marino actual). Sitio 100% estático, responsive (PC, celular y Chromecast vía casting del navegador).

**Sitio en vivo:** https://radioeternalbeat-prog.github.io/WEB-RADIO-ETERNAL-BEAT/
**Panel de administración:** https://radioeternalbeat-prog.github.io/WEB-RADIO-ETERNAL-BEAT/admin/

## 🎛️ Panel de administración (recomendado)

Ya **no necesitas editar archivos a mano**. Entra al panel y cambia todo desde el navegador:

| Pestaña | Qué puedes cambiar |
|---|---|
| **General** | Nombre de la radio, eslogan, país |
| **Stream** | URL del stream, URL de metadatos, frecuencia de actualización (con botones de prueba) |
| **Video** | Plataforma (YouTube/Twitch/ninguna) y datos del canal |
| **Chat** | Activar/desactivar chat y el ID del grupo de Chatango |
| **Redes** | Facebook, Instagram, TikTok, WhatsApp, YouTube, email |
| **Fondo** | Subir nueva imagen de fondo y ajustar cuán oscura se ve |
| **Publicidad** | Subir las 4 imágenes de banners publicitarios |
| **Noticias** | Agregar, editar y eliminar noticias |

Cuando guardas, el panel hace un commit en este repositorio y el sitio se vuelve a publicar automáticamente (tarda 1-2 minutos).

### Cómo obtener tu token de acceso

El panel necesita un token de GitHub para poder guardar los cambios:

1. Entra a [github.com/settings/personal-access-tokens/new](https://github.com/settings/personal-access-tokens/new)
2. **Token name:** `Panel Radio`
3. **Expiration:** 90 días (o lo que prefieras)
4. **Repository access:** *Only select repositories* → selecciona `WEB-RADIO-ETERNAL-BEAT`
5. **Permissions → Repository permissions → Contents:** *Read and write*
6. Click en **Generate token** y copia el código
7. Pégalo en el panel de administración

> ⚠️ **Importante sobre seguridad:** el token se guarda únicamente en tu navegador (nunca se sube al sitio ni pasa por otro servidor). Quien tenga ese token puede modificar el sitio, así que no lo compartas ni lo uses en computadores públicos. Si crees que se filtró, ve a la configuración de tokens en GitHub y elimínalo — luego generas uno nuevo.

## 📁 Estructura del proyecto

```
├── index.html            → Página principal
├── config.js             → Configuración de respaldo (si falla settings.json)
├── manifest.json         → Configuración PWA
├── netlify.toml          → Configuración de despliegue en Netlify
├── robots.txt            → Oculta /admin/ de los buscadores
├── admin/                ⭐ PANEL DE ADMINISTRACIÓN
│   ├── index.html
│   ├── admin.css
│   └── admin.js
├── css/
│   └── style.css         → Estilos visuales
├── js/
│   └── main.js           → Reproductor, metadatos, video, chat, noticias
├── data/
│   ├── settings.json     ⭐ Configuración del sitio (la edita el panel)
│   └── news.json         ⭐ Noticias (las edita el panel)
└── assets/
    ├── logo.png          → Logo de la radio
    ├── favicon.png       → Ícono del navegador
    ├── bg-hero.jpg       → Imagen de fondo del sitio
    └── ads/              → Banners publicitarios
```

## ✏️ Editar a mano (alternativa al panel)

Si prefieres editar archivos directamente en GitHub:

- **Configuración:** `data/settings.json`
- **Noticias:** `data/news.json`

```json
{
  "title": "Título de la noticia",
  "date": "2026-08-01",
  "summary": "Breve resumen de la noticia.",
  "image": "https://link-a-una-imagen.jpg",
  "link": "https://link-a-la-noticia-completa.com"
}
```

Puedes dejar `"image"` y `"link"` vacíos (`""`) si no aplican.

- **Logo:** sube `logo.png` en `assets/`
- **Fondo:** sube `bg-hero.jpg` en `assets/`
- **Banners:** sube tus imágenes en `assets/ads/` con los nombres indicados en `assets/ads/README.md`

## 🎧 Sobre el stream (Centova Cast)

El reproductor usa la URL configurada en `streamUrl`. Para mostrar el nombre de la canción actual ("Sonando ahora") y el historial, el sitio consulta la URL de `metadataUrl`.

Si el nombre de la canción no aparece:
- Verifica la URL de metadatos con tu proveedor de hosting (usualmente `/status-json.xsl` o `/stats?json=1`)
- Usa el botón **"Probar metadatos"** en el panel para diagnosticar
- Si el formato de tu servidor es distinto, hay que ajustar la función `parseMetadata()` en `js/main.js`

> Nota: algunos servidores bloquean el acceso desde el navegador (CORS). En ese caso los metadatos no se podrán leer aunque la URL sea correcta — hay que pedir al proveedor que habilite CORS.

## 💬 Chat en vivo

Se usa **Chatango** (gratis, sin servidor propio):
1. Crea tu grupo en [chatango.com/creategroup](https://chatango.com/creategroup)
2. En el panel → pestaña **Chat**, activa el chat y pega el ID del grupo

## 📺 Video en vivo

En el panel → pestaña **Video**:
- **YouTube:** pon el ID del canal (recomendado, muestra el directo activo automáticamente) o el ID de un video específico
- **Twitch:** pon el nombre exacto del canal

> Si el canal no está transmitiendo en vivo, YouTube muestra "This video is unavailable" — es normal, aparecerá el directo cuando empiecen a transmitir.

## 🚀 Despliegue

Actualmente el sitio está publicado con **GitHub Pages** (Settings → Pages → rama `main`, carpeta `/ (root)`).

También es compatible con **Netlify** (ya incluye `netlify.toml`): conecta el repositorio, deja el build command vacío y el publish directory en `.`

En ambos casos, cada cambio subido a `main` republica el sitio automáticamente.

## 📱 Compatibilidad

- ✅ PC / notebook (todos los navegadores modernos)
- ✅ Celular (diseño responsive, menú adaptado)
- ✅ Chromecast: usa el botón "Transmitir" de Google Chrome para enviar la pestaña del sitio a tu TV

---
Hecho con 🧡 para Eternal Beat Radio Chile.
