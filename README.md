# CRONO

Prototipo móvil de reloj mundial, temporizador y cronómetro construido con React, TypeScript y Vite. La interfaz aplica una dirección neobrutalista mediante colores planos y saturados, contornos gruesos, sombras duras, tipografía monoespaciada y una composición de papel recortado.

**[Abrir la demostración interactiva](https://r3neer.github.io/crono-neobrutal/)**

## Demostraciones

### Tiempo, físicas y respuesta

![Temporizador de diez segundos, arena física y controles del cronómetro](./public/demos/01-time-and-physics.gif)

### Relojes mundiales y paletas

![Selección, eliminación, búsqueda y paletas de relojes mundiales](./public/demos/02-world-palettes.gif)

## Ejecutar localmente

```powershell
npm install
npm run dev -- --port 5173
```

Abre `http://127.0.0.1:5173/`. Para comprobar la versión de producción:

```powershell
npm run build
npm run preview
```

## Publicar con GitHub Pages

El repositorio incluye `.github/workflows/deploy-pages.yml` y usa rutas relativas de Vite, por lo que funciona bajo `https://usuario.github.io/nombre-del-repositorio/`.

1. Crea un repositorio público vacío en GitHub.
2. Inicializa Git en esta carpeta, añade los archivos, crea el primer commit y sube la rama `main`.
3. En **Settings → Pages**, selecciona **GitHub Actions** como fuente.
4. Cada `push` a `main` compilará y publicará automáticamente la carpeta `dist`.

Ejemplo con GitHub CLI, sustituyendo el nombre:

```powershell
git init
git add .
git commit -m "Publish CRONO"
git branch -M main
gh repo create crono-neobrutal --public --source . --remote origin --push
```

## Regenerar los GIF

Con el servidor local abierto en el puerto `5173`:

```powershell
npm run capture:demos
```

El script captura los recorridos en Microsoft Edge y escribe los GIF finales en `public/demos/`. Los fotogramas intermedios se guardan bajo `artifacts/demo-frames/` y están excluidos del repositorio.

## Estructura

- `src/main.tsx`: relojes digitales, temporizador, físicas de arena, cronómetro y gestión de ciudades.
- `src/style.css`: lienzo de iPhone, collage, recortes, sombras, paletas y animaciones.
- `public/demos/`: demostraciones animadas listas para el README.
- `scripts/capture-demos.cjs`: recorridos reproducibles con Playwright.
- `scripts/build-gifs.py`: paleta compartida y empaquetado de fotogramas.
- `DESIGN.md`: brief original y decisiones de diseño posteriores.

## Alcance

Las ciudades y el reloj principal se guardan en `localStorage`. Los temporizadores activos sobreviven a la navegación interna, pero no a una recarga del navegador. Los relojes mundiales utilizan zonas IANA reales. No existe backend, alarma en segundo plano ni sonido.

JetBrains Mono se incluye localmente con su licencia OFL. Impact usa la fuente del sistema con una alternativa condensada.
