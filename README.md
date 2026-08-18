# Web de AUREAS Ingeniería

Sitio estático, sin frameworks ni build. Cinco páginas + robots.txt +
sitemap.xml, listo para desplegar en Cloudflare Pages.

## Estructura

```
aureas-web/
├── index.html              → Inicio
├── servicios/index.html    → Servicios
├── quienes-somos/index.html→ Equipo (trayectoria, visión y perfiles)
├── contacto/index.html     → Contacto
├── aviso-legal/index.html
├── privacidad/index.html
├── 404.html                → página de error (Cloudflare la sirve solo)
├── _headers                → caché de assets y cabeceras de seguridad
├── assets/
│   ├── css/styles.css      → todo el sistema de diseño, un solo archivo
│   ├── js/main.js          → menú móvil + año del footer + animación de scroll
│   └── img/
│       ├── logo-aureas.png     → logo completo, fondo transparente
│       ├── logo-mark.png       → solo el símbolo (la "A" + espiral)
│       ├── favicon.svg
│       ├── favicon-32.png
│       ├── apple-touch-icon.png
│       ├── icon-512.png
│       └── og-image.png        → imagen que se ve al compartir el enlace
├── robots.txt
└── sitemap.xml
```

Cada página es un `index.html` independiente dentro de su carpeta — así
las rutas quedan limpias (`aureasingenieria.es/servicios/`, sin
`.html` al final).

## Qué falta rellenar

**Números de colegiado de Ausiàs y Lucas.** Están en
`quienes-somos/index.html`, marcados con comentarios
`<!-- AUREAS_COLEGIADO_AUSIAS -->` y `<!-- AUREAS_COLEGIADO_LUCAS -->`.
Busca `[pendiente]` en ese archivo y sustitúyelo por el número real.

**Contenido de "Quiénes somos".** El bloque grande de la página está
marcado con un comentario `BLOQUE "NUESTRA HISTORIA / OBJETIVOS" —
CONTENIDO PENDIENTE`. Cuando Ausiàs tenga el PowerPoint, sustituye el
texto de dentro de `<div class="placeholder-block">` por el
definitivo. La estructura (etiqueta + título + párrafo) ya está
montada, solo hay que cambiar las palabras.

## Cómo editarlo

Todo el color, la tipografía y el espaciado salen de las variables
definidas al principio de `assets/css/styles.css` (bloque `:root`).
Para cambiar el turquesa en todo el sitio de una vez, por ejemplo,
solo hay que tocar `--turquoise` ahí — no hace falta ir página por
página.

Cabecera y pie están repetidos en cada `index.html` (es HTML plano,
sin plantillas). Si cambias un enlace del menú o el correo de
contacto, tócalo en las seis páginas — usa "buscar y reemplazar en
todos los archivos" de tu editor para no hacerlo a mano seis veces.

## Desplegar en Cloudflare Pages

1. Crea un repositorio **privado** en GitHub y sube esta carpeta
   entera (todo lo que hay dentro de `aureas-web/`, no la carpeta en
   sí).
2. En Cloudflare, ve a **Workers & Pages → Create → Pages → Connect to
   Git**, autoriza tu cuenta de GitHub y elige el repositorio.
3. En la configuración de build: **framework preset "None"**, build
   command vacío, output directory `/` (la raíz). No hay nada que
   compilar.
4. Despliega. Cloudflare te da una URL tipo `aureas-web.pages.dev`
   para comprobar que todo carga bien antes de conectar el dominio.

## Conectar el dominio (sin tocar el correo)

El DNS de `aureasingenieria.es` se queda en DonDominio — el correo ya
funciona ahí con Zoho (MX, SPF, DKIM) y **no hay que tocar esos
registros**.

1. En Cloudflare Pages, pestaña **Custom domains → Set up a custom
   domain**, escribe `aureasingenieria.es` y también `www.aureasingenieria.es`.
2. Cloudflare te dará el valor exacto a apuntar (normalmente un
   CNAME para `www` y un registro para la raíz, tipo ANAME/CNAME
   flattening o una IP si pide un registro A).
3. En DonDominio, Parking & Zona DNS, edita:
   - El **CNAME de `www`** para que apunte a lo que indique Cloudflare
     (en vez de a `parkingsrv0.dondominio.com`).
   - El **ANAME de la raíz** (`aureasingenieria.es`) para que apunte
     a lo que indique Cloudflare (en vez de al parking).
4. **No toques ningún registro MX, ni el TXT del SPF, ni el TXT del
   DKIM (`zmail._domainkey`).** Esos son del correo y no tienen nada
   que ver con la web.
5. Espera a que se propague (puede tardar de minutos a un par de
   horas) y comprueba que `aureasingenieria.es` carga la web y que el
   correo sigue funcionando.

Si en algún paso Cloudflare te pide "cambiar los servidores de
nombres" (nameservers) a los suyos, **no lo hagas** — eso movería
todo el DNS a Cloudflare, incluidos los registros del correo, y
tendrías que recrear ahí el correo de Zoho entero. Usa siempre la vía
de CNAME/ANAME manteniendo el DNS en DonDominio.
