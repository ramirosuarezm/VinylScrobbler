# VinylScrobbler

PWA mobile-first para recorrer tu colección de vinilos de Discogs y scrobblear los discos
que escuchás a Last.fm. Sin build, sin dependencias, sin backend: HTML, CSS y JavaScript.

**Demo:** https://ramirosuarezm.github.io/VinylScrobbler/

## Funciona así

1. Cargás tus credenciales de Discogs y Last.fm en **Ajustes** (quedan solo en tu dispositivo).
2. La colección se baja de Discogs y queda guardada localmente: las próximas aperturas son instantáneas.
3. Tocás un disco, destildás los tracks que no sonaron y **Scrobblear**.
   Los timestamps se calculan hacia atrás desde ahora usando la duración de cada track,
   así que el disco queda registrado como recién escuchado.

## Características

- Colección de Discogs con búsqueda (ignora acentos, acepta varias palabras) y orden por artista, título, año o fecha de alta.
- Detalle del disco con tracklist, artistas invitados (`feat.`) y artistas por track.
- Scrobbling a Last.fm en tandas de 50 tracks, con timestamps por duración real.
- **Funciona offline:** app, tapas y colección quedan en caché; los scrobbles sin red se encolan y se envían solos al volver la conexión.
- Historial local de lo scrobbleado, con marca de pendientes.
- Tema claro/oscuro (sigue al sistema hasta que elegís uno).
- Instalable como app en Android/iOS/escritorio.

## Configuración

| Dato | Dónde se obtiene |
| --- | --- |
| Usuario + token de Discogs | https://www.discogs.com/settings/developers |
| API Key + Shared Secret de Last.fm | https://www.last.fm/api/account/create |
| Usuario + contraseña de Last.fm | tu cuenta |

La contraseña de Last.fm se usa **una sola vez** para pedir la clave de sesión (`auth.getMobileSession`)
y no se guarda: en el dispositivo queda esa clave, que no expira. El resto de las credenciales
vive en `localStorage` y no sale del navegador — las llamadas van directo a `api.discogs.com`
y `ws.audioscrobbler.com`.

> Ojo: al ser una app 100% cliente, el Shared Secret de Last.fm queda en el dispositivo,
> que es lo que exige firmar las llamadas sin servidor propio. Usá una API key tuya, no compartida.

## Estructura

```
index.html    markup y shell de la app
styles.css    estilos (variables CSS para los dos temas)
app.js        lógica: Discogs, Last.fm, MD5 para la firma, render y estado
sw.js         service worker: caché del shell y de las tapas
manifest.json metadatos de la PWA
```

## Desarrollo

Necesita servirse por HTTP (el service worker no corre con `file://`):

```bash
npx serve .
```

Después de tocar `index.html`, `styles.css` o `app.js`, subí `VERSION` en `sw.js`
para invalidar la caché de quienes ya tienen la app instalada.
