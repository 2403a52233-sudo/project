require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* ============================================================= */
/* 🔥 FILE-BASED STORAGE ONLY (NO MONGODB)                      */
/* ============================================================= */
const DATA_FILE = path.join(__dirname, "data.json");

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE));
  } catch (e) {
    return {
      buses: [],
      routes: [],
      drivers: [],
      students: [],
      status: {},
      location: {},
      attendance: []
    };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

console.log("MongoDB DISABLED — using data.json only.");

/* ------------------------ BUS ------------------------ */
app.get("/buses", (req, res) => {
  const d = readData();
  res.json(d.buses);
});

app.post("/buses", (req, res) => {
  const d = readData();
  d.buses.push(req.body);
  writeData(d);
  res.json({ ok: true });
});

/* ------------------------ ROUTES ------------------------ */
app.get("/routes", (req, res) => {
  const d = readData();
  res.json(d.routes);
});

app.post("/routes", (req, res) => {
  const d = readData();
  d.routes.push(req.body);
  writeData(d);
  res.json({ ok: true });
});

/* ------------------------ DRIVERS ------------------------ */
app.get("/drivers", (req, res) => {
  const d = readData();
  res.json(d.drivers);
});

app.post("/drivers", (req, res) => {
  const d = readData();
  d.drivers.push(req.body);
  writeData(d);
  res.json({ ok: true });
});

/* ------------------------ STUDENTS ------------------------ */
app.get("/students", (req, res) => {
  const d = readData();
  res.json(d.students);
});

app.post("/students", (req, res) => {
  const d = readData();
  d.students.push(req.body);
  writeData(d);
  res.json({ ok: true });
});

/* ------------------------ STATUS ------------------------ */
app.post("/status", (req, res) => {
  const { bus, status } = req.body;
  const d = readData();
  if (!d.status) d.status = {};
  d.status[bus] = { status, updatedAt: new Date().toISOString() };
  writeData(d);
  res.json({ ok: true });
});

app.get("/status", (req, res) => {
  const d = readData();
  res.json(d.status || {});
});

/* ------------------------ LOCATION ------------------------ */
app.post("/location", (req, res) => {
  const { bus, location } = req.body;
  const d = readData();
  if (!d.location) d.location = {};
  d.location[bus] = { location, updatedAt: new Date().toISOString() };
  writeData(d);
  res.json({ ok: true });
});

app.get("/location", (req, res) => {
  const d = readData();
  res.json(d.location || {});
});

/* ------------------------ ATTENDANCE ------------------------ */
app.post("/attendance", (req, res) => {
  const d = readData();
  d.attendance.push({ time: new Date().toISOString(), meta: req.body });
  writeData(d);
  res.json({ ok: true });
});

/* ------------------------ HEALTH CHECK ------------------------ */
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

/* ------------------------ DELETE ------------------------ */
app.delete("/:type/:index", (req, res) => {
  const { type, index } = req.params;
  const d = readData();

  if (!d[type]) return res.status(400).json({ error: "Invalid type" });

  d[type].splice(index, 1);
  writeData(d);
  res.json({ ok: true });
});

/* ------------------------ UPDATE ------------------------ */
app.put("/:type/:index", (req, res) => {
  const { type, index } = req.params;
  const d = readData();

  if (!d[type]) return res.status(400).json({ error: "Invalid type" });

  d[type][index] = req.body;
  writeData(d);
  res.json({ ok: true });
});

/* ============================================================= */
/* 🔥 SERVE FRONTEND                                             */
/* ============================================================= */

app.use(express.static(path.join(__dirname, "..", "frontend")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "index.html"));
});

/* ============================================================= */
/* 🔥 START SERVER                                               */
/* ============================================================= */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Backend running on port", PORT));
