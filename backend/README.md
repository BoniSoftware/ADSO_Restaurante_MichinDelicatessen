# Backend Restaurante Michin - MySQL

Este backend reemplaza el `localStorage` del `App.js` original por una API REST conectada a MySQL.

## Tecnologías

- Node.js
- Express
- MySQL
- mysql2
- CORS
- dotenv

## 1. Crear la base de datos

Abre MySQL Workbench, phpMyAdmin o la consola de MySQL y ejecuta el contenido de:

```text
database.sql
```

Esto crea:

```text
restaurante_michin
└── pedidos
```

La tabla `pedidos` contiene:

- `id`
- `fecha`
- `sopa`
- `plato`
- `bebida`
- `postre`
- `adicional`
- `total`
- `created_at`
- `updated_at`

## 2. Instalar dependencias

Desde la carpeta del backend:

```bash
npm install
```

## 3. Configurar MySQL

Copia:

```text
.env.example
```

como:

```text
.env
```

Ejemplo:

```env
PORT=8000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=restaurante_michin
FRONTEND_URL=http://127.0.0.1:5500
```

Si tu usuario `root` tiene contraseña, colócala en:

```env
DB_PASSWORD=TU_CONTRASEÑA
```

## 4. Iniciar el backend

```bash
npm start
```

Para desarrollo:

```bash
npm run dev
```

La API estará disponible en:

```text
http://localhost:8000
```

## 5. Comprobar el backend

Abre:

```text
http://localhost:8000/api
```

Deberías obtener:

```json
{
  "mensaje": "API Restaurante Michin con MySQL funcionando correctamente"
}
```

También puedes comprobar MySQL:

```text
http://localhost:8000/api/estado-db
```

## 6. Endpoints

| Método | Endpoint | Función |
|---|---|---|
| GET | `/api` | Comprobar API |
| GET | `/api/estado-db` | Comprobar MySQL |
| GET | `/api/pedidos` | Listar pedidos |
| GET | `/api/pedidos/:id` | Consultar pedido |
| POST | `/api/pedidos` | Crear pedido |
| DELETE | `/api/pedidos/:id` | Eliminar pedido |
| DELETE | `/api/pedidos` | Borrar historial |

## 7. Conectar el frontend

El archivo:

```text
App_backend_mysql.js
```

es la versión adaptada de tu `App.js`.

Copia su contenido a tu `App.js` o reemplaza el archivo por él.

La comunicación queda:

```text
HTML / App.js
       |
       | fetch()
       v
Node.js + Express
       |
       | mysql2
       v
MySQL
       |
       v
restaurante_michin
       |
       v
pedidos
```

## 8. Importante

Ya no se utiliza:

```javascript
localStorage.setItem(...)
localStorage.getItem(...)
localStorage.removeItem(...)
```

Los pedidos quedan almacenados en MySQL.

La fecha se genera automáticamente en el servidor mediante:

```sql
DEFAULT CURRENT_TIMESTAMP
```

El ID se genera automáticamente mediante:

```sql
AUTO_INCREMENT
```
