# EcoRecicla – Frontend (G1)

Angular 21 standalone + Angular Material. Backend: `EcoRecicla_backend` (Spring Boot, puerto 8080).

## Cómo empezar
```cmd
git clone https://github.com/Dayanna14/EcoRecicla_Frontend.git
cd EcoRecicla_Frontend
git checkout TU_RAMA
npm install
ng serve -o
```
Usar la terminal **Command Prompt** en VS Code (no PowerShell).

## Reglas para no chocar en GitHub
1. Trabaja **solo en tu rama** y **solo en tus carpetas**.
2. **No instales librerías** sin avisar: ya están Material, Leaflet, ngx-charts y TensorFlow.
3. En `app.routes.ts` y `menucomponent.html` escribe **solo dentro de tu bloque comentado**.
4. No modifiques: `app.config.ts`, `environments/`, `material-theme.scss`, `styles.css`, `index.html`, `angular.json`.

## Nombres (estilo de la profesora)
| Qué | Comando | Ejemplo |
|---|---|---|
| Padre | `ng g c components/xxxcomponent --skip-tests` | `rolcomponent` |
| Hijos | `ng g c components/xxxcomponent/xxxlistcomponent --skip-tests` | `rollistcomponent`, `rolinsertcomponent` |
| Servicio | `ng g s services/xxxservice --skip-tests` | `rolservice` |
| Modelo | archivo en `src/app/models/` | `Rol.ts` |

## Quién hace qué
| Integrante | Entidades |
|---|---|
| Dayana | roles, centros de acopio |
| Nayara | usuarios, recompensas |
| Axel | tipos de recompensa, materiales |
| Jhon | entregas |
| Franco | canjes |

## Importante
- La URL del backend está en `environment.base`: `${environment.base}/api/...`
- Angular 21 no refresca la vista sola después de un `subscribe`: usa `this.cdr.detectChanges()` (como en el demoAPI de la profesora).
- Colores: usa las variables de `styles.css` (`var(--eco-verde-bosque)`, `var(--eco-ambar)`…). Números y códigos con la clase `mono`.
