# Ixmitasti

_Ixmitasti_ es una aplicación móvil y web desarrollada con [Expo](https://expo.dev) y React Native, que conecta a comerciantes y clientes para impulsar la economía local de Ixmiquilpan. Permite a los usuarios explorar negocios, registrar nuevos comercios y a los administradores aprobar negocios para su publicación.

## Características principales

- **Explora negocios:** Lista de negocios locales aprobados, con detalles, imágenes y productos.
- **Registro de negocios:** Los usuarios pueden registrar su propio negocio, agregar productos y esperar aprobación.
- **Autenticación:** Registro e inicio de sesión con correo y Google.
- **Panel de administración:** Los administradores pueden aprobar negocios pendientes.
- **Diseño adaptativo:** Interfaz moderna y responsiva para dispositivos móviles y web.

## Instalación

1. Clona el repositorio:

   ```bash
   git clone <(https://github.com/Reyirel/ixmiventas.git)>
   cd ixmitasti
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia la aplicación:

   ```bash
   npx expo start
   ```

   Puedes abrir la app en un emulador Android/iOS, en Expo Go o en la web.

## Estructura del proyecto

- `/app`: Rutas y pantallas principales (negocios, auth, admin, etc).
- `/components`: Componentes reutilizables (tarjetas, formularios, etc).
- `/hooks`: Hooks personalizados para temas y colores.
- `/constants`: Colores y constantes globales.
- `/lib`: Configuración de Supabase.
- `/assets`: Imágenes y fuentes.

## Variables de entorno

Configura tus claves de Supabase en [`lib/supabase.ts`](lib/supabase.ts).

## Scripts útiles

- `npm run reset-project`: Restaura el proyecto a un estado inicial.
- `npm run lint`: Linting del código.
- `npm run test`: Ejecuta los tests.

## Contribuciones

¡Las contribuciones son bienvenidas! Abre un issue o pull request para sugerencias y mejoras.

## Licencia

MIT

---

Desarrollado con ❤️ para Ixmiquilpan.
