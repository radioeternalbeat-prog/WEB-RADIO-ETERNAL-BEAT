# 🏎️ Eternal Beat Radio Chile

Sitio web oficial de **Eternal Beat Radio Chile** — "El ritmo que nunca se apaga".

Diseño inspirado en los colores de McLaren F1 (papaya clásico + papaya/azul marino actual). Sitio 100% estático, responsive (PC, celular y Chromecast vía casting del navegador), listo para desplegar en **Netlify**.

## 📁 Estructura del proyecto

```
├── index.html          → Página principal (toda la estructura del sitio)
├── config.js            ⭐ ARCHIVO PRINCIPAL DE CONFIGURACIÓN (edítalo tú mismo)
├── manifest.json        → Configuración PWA (ícono, nombre, colores)
├── netlify.toml         → Configuración de despliegue en Netlify
├── css/
│   └── style.css        → Todos los estilos visuales
├── js/
│   └── main.js           → Lógica: reproductor, metadatos, video, chat, noticias
├── data/
│   └── news.json        ⭐ EDITA AQUÍ TUS NOTICIAS (sin tocar código)
└── assets/
    ├── logo.png          ⭐ SUBE AQUÍ TU LOGO
    ├── favicon.png
    └── ads/               ⭐ SUBE AQUÍ TUS BANNERS PUBLICITARIOS
```

## ✏️ Cómo hacer cambios (sin programar)

### 1. Cambiar el stream, video en vivo, chat o redes sociales
Edita **`config.js`**. Cada campo tiene un comentario explicando qué poner.

### 2. Publicar una noticia
Edita **`data/news.json`** y agrega un bloque como este:

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

### 3. Subir tu logo
Sube un archivo llamado exactamente `logo.png` dentro de la carpeta `assets/`.

### 4. Subir banners de publicidad
Sube tus imágenes dentro de `assets/ads/` con los nombres indicados en `assets/ads/README.md`.

## 🎧 Sobre el stream (Centova Cast)

El reproductor usa la URL configurada en `config.js` (`streamUrl`). Para mostrar el nombre de la canción actual ("Now Playing") y el historial, el sitio consulta la URL en `metadataUrl`.

Si el nombre de la canción no aparece, es porque el formato de respuesta de tu servidor Centova Cast es distinto al esperado. Revisa con tu proveedor de hosting cuál es la URL correcta de metadatos (usualmente algo como `/status-json.xsl` o `/stats?json=1`) y ajusta la función `parseMetadata()` en `js/main.js` si es necesario.

## 💬 Chat en vivo

Se usa **Chatango** (gratis, sin necesidad de servidor propio). Para activarlo:
1. Crea una cuenta y un grupo en [chatango.com](https://chatango.com/register).
2. Copia el ID de tu grupo en `config.js` → `chat.chatangoGroupId`.

## 📺 Video en vivo (YouTube / Twitch)

En `config.js`, en la sección `video`, define:
- `provider: 'youtube'` o `'twitch'`
- Los datos del canal correspondientes

## 🚀 Desplegar en Netlify

1. Entra a [app.netlify.com](https://app.netlify.com).
2. "Add new site" → "Import an existing project" → conecta este repositorio de GitHub.
3. Build command: (vacío) — Publish directory: `.`
4. Deploy. ¡Listo!

Cada vez que hagas un cambio y lo subas a GitHub (`main`), Netlify actualizará el sitio automáticamente.

## 📱 Compatibilidad

- ✅ PC / notebook (todos los navegadores modernos)
- ✅ Celular (diseño responsive, menú adaptado)
- ✅ Chromecast: usa el botón "Transmitir" de Google Chrome para enviar la pestaña del sitio a tu TV (el audio y video se transmiten junto con la pestaña).

---
Hecho con 🧡 para Eternal Beat Radio Chile.
