

# MyCook

<p align="center">
  <strong>Recetario al estilo Lao Xiang Ji + Guía de cocina para programadores, todo en un solo lugar</strong>
</p>

<p align="center">
  <a href="https://cook.alexander.xin">Acceso en línea</a> •
  <a href="#功能特性">Características</a> •
  <a href="#快速部署">Despliegue rápido</a> •
  <a href="#本地开发">Desarrollo local</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/actions/workflow/status/AlexanderJ-Carter/MyCook/sync-and-build.yml?branch=main&label=Build&style=flat-square" alt="Estado de compilación">
  <img src="https://img.shields.io/github/v/release/AlexanderJ-Carter/MyCook?style=flat-square&display_name=tag" alt="Lanzamiento">
  <img src="https://img.shields.io/github/license/AlexanderJ-Carter/MyCook?style=flat-square" alt="Licencia">
  <img src="https://img.shields.io/github/last-commit/AlexanderJ-Carter/MyCook?style=flat-square" alt="Último commit">
  <img src="https://img.shields.io/docker/pulls/ghcr.io/alexanderj-carter/mycook?style=flat-square" alt="Descargas de Docker">
</p>

---

## Introducción

MyCook es un sitio web estático que combina y organiza dos excelentes proyectos de recetas:

- **[CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC)** - Informe de rastreo de platos de Lao Xiang Ji, clasificado por método de cocción
- **[HowToCook](https://github.com/Anduin2017/HowToCook)** - Guía de métodos de cocina en casa para programadores, clasificado por tipo de ingrediente

Construido con VitePress, soporta búsqueda interna, diseño responsivo y modo oscuro, y está desplegado en GitHub Pages.

**Dirección de acceso**：[cook.alexander.xin](https://cook.alexander.xin)

## Características

- 📖 **Recetas de doble fuente** - Integra el rico contenido de ambos proyectos, clasificado por diferentes dimensiones
- 🔍 **Búsqueda interna** - Encuentra rápidamente recetas y técnicas
- 🌙 **Modo oscuro** - Sigue automáticamente al sistema, también se puede cambiar manualmente
- 📱 **Diseño responsivo** - Se adapta perfectamente a escritorio y dispositivos móviles
- ⏰ **Sincronización diaria** - Actualiza automáticamente desde los repositorios upstream
- 🐳 **Soporte para Docker** - Compatible con despliegue en contenedores

## Estructura del proyecto

```
MyCook/
├── .github/workflows/       # Sync & Build (clonar fork → sincronizar → construir → publicar)
├── .vitepress/
│   ├── theme/               # Tema personalizado (colores cálidos, tarjeta de entrada, barra de doble fuente)
│   └── navSidebar.mjs       # Generación automática de navegación y barra lateral
├── scripts/
│   ├── sync-upstream.js     # Sincroniza contenido a cooklikehoc/ y howtocook/, y escribe public/sync-info.json
│   ├── build-howtocook-images.js  # Construye la versión con imágenes a public/howtocook-images/ (subruta interna)
│   ├── generate-recent.js   # Genera public/recent.json (actualizaciones recientes)
│   └── generate-stats.js    # Genera public/stats.json (estadísticas de recetas)
├── public/                  # Recursos estáticos y archivos generados en tiempo de compilación: recent.json, stats.json, sync-info.json, howtocook-images/
├── cooklikehoc/             # Contenido de CookLikeHOC (relleno por sincronización, .gitignore)
├── howtocook/               # Contenido de HowToCook (relleno por sincronización, .gitignore)
├── index.md                 # Portada
├── Dockerfile               # Multi-etapa: clonar fork → sincronizar → construir → nginx
└── docker-compose.yml       # Perfiles de producción + desarrollo
```

> `cooklikehoc/`, `howtocook/` y `public/recent.json`, `public/stats.json`, `public/sync-info.json`, `public/howtocook-images/` se generan durante la sincronización/construcción y ya están en `.gitignore`.

---

## Despliegue rápido

### GitHub Pages (recomendado)

1. Haz Fork de este repositorio
2. Ve a **Settings → Pages → Build and deployment**
3. En **Source** selecciona **GitHub Actions** (no selecciones "Deploy from a branch")
4. Tras enviar el código, se construirá y publicará automáticamente

### Despliegue con Docker

La imagen **incluye clonación y sincronización integradas**：se clonará desde GitHub `AlexanderJ-Carter/CookLikeHOC` y `AlexanderJ-Carter/HowToCook` durante la construcción, sin necesidad de preparar contenido localmente.

```bash
# Construir directamente (recomendado)
docker build -t mycook:latest .
docker run -d -p 80:80 mycook:latest
```

O usar la imagen publicada:

```bash
docker pull ghcr.io/alexanderj-carter/mycook:latest
docker run -d -p 80:80 ghcr.io/alexanderj-carter/mycook:latest
```

Accede a http://localhost . Si necesitas especificar otros repositorios o ramas, puedes usar build-arg：`docker build --build-arg COOKLIKEHOC_BRANCH=main --build-arg HOWTOCOOK_BRANCH=master -t mycook .`

---

## Desarrollo local

### Requisitos del entorno

- Node.js >= 18
- npm

### Inicio rápido

```bash
# Clonar el repositorio
git clone https://github.com/AlexanderJ-Carter/MyCook.git
cd MyCook

# Instalar dependencias
npm install

# Sincronizar contenido upstream (requiere CookLikeHOC y HowToCook en el directorio superior)
COOKLIKEHOC_PATH=../CookLikeHOC HOWTOCOOK_PATH=../HowToCook npm run sync

# Iniciar servidor de desarrollo
npm run docs:dev

# Construir archivos estáticos
npm run docs:build

# Previsualizar resultados de la construcción
npm run docs:preview
```

---

## Mecanismo de sincronización

- **CI**：Con cada push a `main` o diariamente programado (UTC 2:00, Beijing 10:00), se clonan `AlexanderJ-Carter/CookLikeHOC`, `AlexanderJ-Carter/HowToCook`, `king-jingxiang/HowToCook` (versión con imágenes) en `upstream/`, se ejecuta `sync-upstream.js`, `build:images` (salida `public/howtocook-images/`), se generan `recent.json`, `stats.json`, `sync-info.json`, y luego se construye y despliega a GitHub Pages.
- **Local**：Coloca CookLikeHOC y HowToCook en el directorio superior o establece `COOKLIKEHOC_PATH`, `HOWTOCOOK_PATH`, ejecuta `npm run sync` y luego `npm run docs:build`.
- **Activación manual**：**Actions → Sync & Build → Run workflow** sincroniza y publica de inmediato.

| Escenario        | Operación                                                                                      |
| ----------- | ----------------------------------------------------------------------------------------- |
| Actualizar recetas    | Modifica y envía en el fork de CookLikeHOC o HowToCook, luego activa Sync & Build en MyCook o espera la sincronización diaria |
| Cambiar tema/portada | Modifica directamente los archivos dentro de MyCook, se reconstruirá automáticamente al enviar a main                                              |

---

## Solución de problemas

- **Get Pages site failed / Not Found**：Ve al repositorio **Settings → Pages → Build and deployment**, cambia **Source** a **GitHub Actions** (no uses "Deploy from a branch"), guarda y ejecuta Actions nuevamente.
- **/howtocook-images/ 404 o muestra "Construcción no lista"**：La versión con imágenes puede fallar en CI. Abre **Actions → última Sync & Build → Install & Sync & Build** en los registros, busca `build-howtocook-images` para ver el error; corrígelo y ejecuta el workflow nuevamente. El repositorio de imágenes solo tiene `pnpm-lock.yaml`, el script de construcción priorizará `corepack pnpm install --frozen-lockfile && pnpm run build`, y si pnpm no está disponible, volverá automáticamente a `npm install && npm run build`.
- **Settings → Pages** confirma que Source es **GitHub Actions**
- DNS: El registro CNAME de `cook.alexander.xin` apunta a `alexanderj-carter.github.io`
- En **Actions** confirma que la última **Sync & Build** fue exitosa

---

## Agradecimientos

El contenido de este proyecto proviene de los siguientes proyectos de código abierto, extendiendo nuestro sincero agradecimiento a los autores originales:

- **[HowToCook](https://github.com/Anduin2017/HowToCook)** por [Anduin2017](https://github.com/Anduin2017) - Guía de métodos de cocina en casa para programadores
- **[CookLikeHOC](https://github.com/Gar-b-age/CookLikeHOC)** por [Gar-b-age](https://github.com/Gar-b-age) - Cocinar como en Lao Xiang Ji

Este repositorio no es el sitio oficial de los proyectos mencionados, es un mantenimiento personal.

### Derivados (subruta interna)

- **Versión con imágenes de HowToCook** — Integrada en la subruta interna `/howtocook-images/` (al igual que cooklikehoc y howtocook, no redirige a sitios externos), proviene de [king-jingxiang/HowToCook](https://github.com/king-jingxiang/HowToCook). Durante la construcción se clona este repositorio y se ejecuta `build:images` para generar la salida en `public/howtocook-images/`. Localmente puedes establecer `SKIP_IMAGES=1` para omitir la construcción de la versión con imágenes, o `HOWTOCOOK_IMAGES_PATH=../HowToCookImages` para usar un directorio local.

## Licencia

Este proyecto es de código abierto bajo la [MIT License](./LICENSE).

Los derechos de autor del contenido pertenecen a sus respectivos titulares.

## Registro de cambios

### v1.2.0

- Nueva barra de progreso de lectura y botón de volver al inicio
- Nueva página 404 personalizada
- Nuevas páginas de ayuda y acerca de
- Paleta de colores optimizada para modo oscuro
- Datos estructurados mejorados para Open Graph y SEO
- Optimización de la pipeline CI/CD (control de concurrencia, imágenes Docker multi-arquitectura)
- Optimización de carga de fuentes (DNS preconnect)

Consulta [Releases](https://github.com/AlexanderJ-Carter/MyCook/releases) para ver más versiones históricas.

## Contribuir

¡Issues y Pull Requests son bienvenidos!

1. Haz Fork de este repositorio
2. Crea una rama de características (`git checkout -b feature/amazing-feature`)
3. Commit de los cambios (`git commit -m 'feat: add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Envía un Pull Request

## Historial de Estrellas

Si este proyecto te ha sido útil, ¡te invitamos a darle un ⭐ en GitHub para apoyarnos!
