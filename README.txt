MONACO 98.7 FM — INSTALACIÓN EN NETLIFY

ARCHIVOS
- index.html: página pública (tudominio.netlify.app/)
- admin.html: administración (tudominio.netlify.app/admin.html)
- netlify/functions/api.mjs: inicio de sesión y guardado de noticias/programación
- netlify/functions/proxy.mjs: proxy HTTPS del streaming
- assets/monaco.png y assets/portada.png: imágenes de marca

PUBLICACIÓN
1. Subí TODO el contenido de esta carpeta al repositorio de GitHub, respetando las carpetas.
2. En Netlify, conectá ese repositorio. Build command: vacío. Publish directory: .
3. En Site configuration > Environment variables agregá:
   ADMIN_PASSWORD = Monaco2028
   SESSION_SECRET = una cadena larga, privada y aleatoria (mínimo 32 caracteres).
4. Volvé a desplegar (Deploys > Trigger deploy > Clear cache and deploy site).
5. Abrí /admin.html para administrar. Cambiá ADMIN_PASSWORD cuando quieras reforzar la seguridad.

IMPORTANTE SOBRE EL AUDIO
El reproductor usa https://TU-SITIO/radio-stream y el proxy consulta el origen HTTP indicado.
El proxy evita que el navegador bloquee contenido mixto, pero no puede garantizar la continuidad si
Listen2MyRadio corta la conexión, limita conexiones o cambia el servidor. Probá el audio luego del
despliegue. Si Netlify corta la respuesta larga, hará falta un proxy de streaming externo compatible
con conexiones persistentes; no se arregla desde el HTML.

IMÁGENES
Los archivos incluidos monaco.png y portada.png son imágenes provisorias para que el sitio abra.
Reemplazalos por tus PNG originales conservando exactamente:
  assets/monaco.png
  assets/portada.png

NOTICIAS Y PROGRAMACIÓN
Se guardan en Netlify Blobs, no en el navegador del visitante. Las imágenes se guardan como datos
en el registro de contenido. Cada imagen debe pesar menos de 3 MB.

SEGURIDAD
La contraseña se valida en una función del servidor; no está escrita en el HTML.
No publiques ni compartas SESSION_SECRET. Configurá las variables de entorno antes de usar el panel.
