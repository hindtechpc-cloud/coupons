// src/config/env.js
const { pipe, prop, defaultTo } = require("ramda");
const dotenv = require("dotenv");
dotenv.config();
const getEnvVar = (key, defaultValue = "") =>
  pipe(prop(key), defaultTo(defaultValue))(process.env);

module.exports = {
  PORT: getEnvVar("PORT", "5000"),
  MONGODB_URI: getEnvVar("MONGODB_URI"),
  JWT_SECRET: getEnvVar("JWT_SECRET", "your-secret-key"),
};
