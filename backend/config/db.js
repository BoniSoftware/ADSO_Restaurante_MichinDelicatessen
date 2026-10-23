const mysql = require("mysql2/promise");
require("dotenv").config();

const produccion = process.env.NODE_ENV === "production";

const config = {
  host:
    process.env.DB_HOST ||
    process.env.MYSQLHOST ||
    (produccion ? undefined : "localhost"),

  port: Number(
    process.env.DB_PORT ||
    process.env.MYSQLPORT ||
    (produccion ? 3306 : 3305)
  ),

  user:
    process.env.DB_USER ||
    process.env.MYSQLUSER ||
    (produccion ? undefined : "root"),

  password:
    process.env.DB_PASSWORD ??
    process.env.MYSQLPASSWORD ??
    "",

  database:
    process.env.DB_NAME ||
    process.env.MYSQLDATABASE ||
    (produccion ? undefined : "restaurante_michin"),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4"
};

if (produccion) {
  const faltantes = [];

  if (!config.host) faltantes.push("DB_HOST/MYSQLHOST");
  if (!config.user) faltantes.push("DB_USER/MYSQLUSER");
  if (!config.password) faltantes.push("DB_PASSWORD/MYSQLPASSWORD");
  if (!config.database) faltantes.push("DB_NAME/MYSQLDATABASE");

  if (faltantes.length > 0) {
    throw new Error(
      `Faltan variables MySQL: ${faltantes.join(", ")}`
    );
  }
}

const pool = mysql.createPool(config);

module.exports = pool;
