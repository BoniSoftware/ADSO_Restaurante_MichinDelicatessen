
const mysql = require("mysql2/promise");
require("dotenv").config();

const produccion = process.env.NODE_ENV === "production";

const host =
  process.env.DB_HOST ||
  process.env.MYSQLHOST ||
  (produccion ? undefined : "localhost");

const port = Number(
  process.env.DB_PORT ||
  process.env.MYSQLPORT ||
  (produccion ? undefined : 3305)
);

const user =
  process.env.DB_USER ||
  process.env.MYSQLUSER ||
  (produccion ? undefined : "root");

const password =
  process.env.DB_PASSWORD ??
  process.env.MYSQLPASSWORD ??
  "";

const database =
  process.env.DB_NAME ||
  process.env.MYSQLDATABASE ||
  (produccion ? undefined : "restaurante_michin");

if (produccion && (!host || !user || !database || !password)) {
  throw new Error(
    "Faltan variables de conexión MySQL en el entorno de producción."
  );
}

const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
});

module.exports = pool;
