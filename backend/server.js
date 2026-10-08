require("dotenv").config();

const express = require("express");
const cors = require("cors");
const pool = require("./config/db");

const app = express();
const PORT = Number(process.env.PORT || 8000);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*"
  })
);

app.use(express.json());

app.get("/api", (req, res) => {
  res.json({
    mensaje: "API Restaurante Michin con MySQL funcionando correctamente"
  });
});

// Probar conexión con MySQL
app.get("/api/estado-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS conectado");

    res.json({
      conectado: rows[0].conectado === 1,
      baseDatos: process.env.DB_NAME || "restaurante_michin"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      conectado: false,
      mensaje: "No se pudo conectar con MySQL"
    });
  }
});

// Obtener todos los pedidos
app.get("/api/pedidos", async (req, res) => {
  try {
    const [pedidos] = await pool.query(`
      SELECT
      id,
        fecha,
        nombre,
        telefono,
        direccion,
        sopa,
        plato,
        bebida,
        postre,
        adicional,
        observaciones,
        total
      FROM pedidos
      ORDER BY fecha DESC, id DESC
    `);

    res.json(pedidos);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al obtener los pedidos"
    });
  }
});

// Obtener un pedido por ID
app.get("/api/pedidos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "ID de pedido no válido"
      });
    }

    const [pedidos] = await pool.query(
      `
      SELECT
        id,
        fecha,
        nombre,
        telefono,
        direccion,
        sopa,
        plato,
        bebida,
        postre,
        adicional,
        observaciones,
        total
      FROM pedidos
      WHERE id = ?
      `,
      [id]
    );

    if (pedidos.length === 0) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }

    res.json(pedidos[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al consultar el pedido"
    });
  }
});

// ============================================================
// POST /api/pedidos
// Registrar un nuevo pedido
// ============================================================
app.post("/api/pedidos", async (req, res) => {
    try {
        const {
            nombre,
            telefono,
            direccion,

            sopa,
            plato,
            bebida,
            postre,
            adicional,

            observaciones,
            total
        } = req.body;

        // --------------------------------------------------------
        // Validar datos del cliente
        // --------------------------------------------------------
        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                mensaje: "El nombre del cliente es obligatorio"
            });
        }

        if (!telefono || !telefono.trim()) {
            return res.status(400).json({
                mensaje: "El teléfono del cliente es obligatorio"
            });
        }

        if (!direccion || !direccion.trim()) {
            return res.status(400).json({
                mensaje: "La dirección del cliente es obligatoria"
            });
        }

        // --------------------------------------------------------
        // Validar que haya al menos un producto
        // --------------------------------------------------------
        const tieneProducto =
            sopa ||
            plato ||
            bebida ||
            postre ||
            adicional;

        if (!tieneProducto) {
            return res.status(400).json({
                mensaje: "Debe seleccionar al menos un producto"
            });
        }

        // --------------------------------------------------------
        // Validar total
        // --------------------------------------------------------
        const totalNumerico = Number(total);

        if (
            isNaN(totalNumerico) ||
            totalNumerico <= 0
        ) {
            return res.status(400).json({
                mensaje: "El total debe ser un número mayor que cero"
            });
        }

        // --------------------------------------------------------
        // Insertar pedido en MySQL
        //
        // La fecha NO se envía porque MySQL la genera
        // automáticamente mediante CURRENT_TIMESTAMP.
        // --------------------------------------------------------
        const sql = `
            INSERT INTO pedidos (
                nombre,
                telefono,
                direccion,
                sopa,
                plato,
                bebida,
                postre,
                adicional,
                observaciones,
                total
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const valores = [
            nombre.trim(),
            telefono.trim(),
            direccion.trim(),

            sopa || null,
            plato || null,
            bebida || null,
            postre || null,
            adicional || null,

            observaciones && observaciones.trim()
                ? observaciones.trim()
                : null,

            totalNumerico
        ];

        const [resultado] = await pool.query(sql, valores);

        // --------------------------------------------------------
        // Obtener el pedido recién creado
        // --------------------------------------------------------
        const [pedidoCreado] = await pool.query(
            `
            SELECT
                id,
                fecha,
                nombre,
                telefono,
                direccion,
                sopa,
                plato,
                bebida,
                postre,
                adicional,
                observaciones,
                total
            FROM pedidos
            WHERE id = ?
            `,
            [resultado.insertId]
        );

        // --------------------------------------------------------
        // Respuesta exitosa
        // --------------------------------------------------------
        res.status(201).json({
            mensaje: "Pedido registrado correctamente",
            pedido: pedidoCreado[0]
        });

    } catch (error) {
        console.error("Error al registrar el pedido:", error);

        res.status(500).json({
            mensaje: "Error interno del servidor",
            error: error.message
        });
    }
});

// Eliminar un pedido
app.delete("/api/pedidos/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        mensaje: "ID de pedido no válido"
      });
    }

    const [resultado] = await pool.execute(
      "DELETE FROM pedidos WHERE id = ?",
      [id]
    );

    if (resultado.affectedRows === 0) {
      return res.status(404).json({
        mensaje: "Pedido no encontrado"
      });
    }

    res.json({
      mensaje: "Pedido eliminado correctamente"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al eliminar el pedido"
    });
  }
});

// Borrar todo el historial
app.delete("/api/pedidos", async (req, res) => {
  try {
    await pool.query("DELETE FROM pedidos");

    // Reiniciar el AUTO_INCREMENT para que el próximo pedido empiece en 1.
    await pool.query("ALTER TABLE pedidos AUTO_INCREMENT = 1");

    res.json({
      mensaje: "Historial eliminado correctamente"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      mensaje: "Error al eliminar el historial"
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    mensaje: "Ruta no encontrada"
  });
});

async function iniciarServidor() {
  console.log("===== VARIABLES RECIBIDAS POR NODE =====");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("DB_HOST:", process.env.DB_HOST);
  console.log("DB_PORT:", process.env.DB_PORT);
  console.log("DB_USER:", process.env.DB_USER);
  console.log("DB_NAME:", process.env.DB_NAME);
  console.log("DB_PASSWORD EXISTE:", !!process.env.DB_PASSWORD);
  console.log("========================================");

  try {
    const conexion = await pool.getConnection();
    console.log("MySQL conectado correctamente");
    conexion.release();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error("No se pudo conectar a MySQL:");
    console.error(error);
    process.exit(1);
  }
}

iniciarServidor();
