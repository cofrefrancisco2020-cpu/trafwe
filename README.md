# TRAFWE — Sitio Web
## Restaurante · Malalcahuello, Chile

---

## Estructura de archivos

```
trafwe/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── images/
    │   ├── logo.png                         ← logo limpio oficial
    │   ├── logo_trafwe_exterior.png         ← foto del letrero exterior
    │   ├── trafwe_foto_cielo.png            ← hero / cierre
    │   ├── cabaña.jpeg
    │   ├── cabañanieve.png
    │   ├── tinyhouse.jpeg
    │   ├── tinyhousenieve.png
    │   ├── comida_1_Trucha_arcoiris_ensalada_de_estacion.png
    │   ├── comida_2_Crepes_con_helado_artesanal_o_pie_de_limon.png
    │   ├── comida_3_trilogia_de_sorrentinos_y_ravioles_en_salsa_pesto_nuez_de_la_casa.png
    │   └── tragos_tropical_gin.png
    ├── videos/
    │   └── scroll.mp4
    └── frames/                              ← OPCIONAL: frames del video scroll
        ├── frame_0001.jpg
        └── ...
```

---

## Cómo usar localmente

```bash
# 1. Entra a la carpeta del proyecto
cd trafwe/

# 2. Lanza el servidor local (OBLIGATORIO para que funcionen los frames)
python3 -m http.server 8765

# 3. Abre en el navegador
open http://localhost:8765
```

> **Importante:** NO abras index.html directamente con doble clic.
> Chrome bloquea la carga de imágenes locales por políticas CORS.

---

## Activar el efecto de video scroll

Por defecto el video scroll muestra el archivo `assets/videos/scroll.mp4` como fallback.

Para activar la **animación sincronizada con scroll** necesitas extraer los frames:

### Paso 1 — Analizar el video
```bash
ffprobe -v quiet -print_format json -show_streams assets/videos/scroll.mp4
```
Anota: `nb_frames`, `width x height`, `r_frame_rate`.

### Paso 2 — Extraer frames
```bash
mkdir -p assets/frames
ffmpeg -i assets/videos/scroll.mp4 \
  -an \
  -vf "fps=24,scale=540:960" \
  -c:v mjpeg \
  -q:v 3 \
  "assets/frames/frame_%04d.jpg"
```
> Escala a la mitad de la resolución nativa para mejor rendimiento.
> Ajusta `fps` según los fps del video original.

### Paso 3 — Configurar index.html
En `index.html` busca la sección `#video-scroll` y actualiza los atributos:

```html
<section id="video-scroll"
         data-total="192"   ← número total de frames generados
         data-w="540"       ← ancho de los frames
         data-h="960">      ← alto de los frames
```

---

## Personalización rápida

| Qué cambiar | Dónde |
|---|---|
| Colores | Variables CSS en `style.css` `:root {}` |
| Textos hero | `index.html` → sección `#hero` |
| Instagram URL | Buscar `instagram.com/trafwe_malalcahuello` |
| Google Maps | Buscar `maps.app.goo.gl/E2eqrYHEqk7Czc8T9` |
| Video de hero | `index.html` → comentario "Opción A" en sección `#hero` |

---

## GitHub Pages

1. Sube todos los archivos al repositorio (rama `main` o `gh-pages`).
2. En Settings → Pages → Source: `main / (root)`.
3. Listo. Las rutas relativas funcionan sin cambios.

---

*Trafwe — "Lugar de encuentro" · Malalcahuello, Araucanía, Chile*
