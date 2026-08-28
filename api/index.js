// api/index.js — Vercel Serverless Function wrapping the Fastify app
// Vercel routes all /api/* requests here via vercel.json rewrites

import { buildApp } from "../backend/src/app.js";

let _app = null;

async function getApp() {
  if (_app) return _app;
  _app = await buildApp({ logger: false });
  await _app.ready();
  return _app;
}

export default async function handler(req, res) {
  const app = await getApp();
  app.server.emit("request", req, res);
}
