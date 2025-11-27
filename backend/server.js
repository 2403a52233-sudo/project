require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

const MONGO_URI = process.env.MONGO_URI || "";
const useMongo = !!MONGO_URI;

let Bus, Route, Driver, Student, Status, Location, Attendance;

async function initMongo() {
  if (!useMongo) return;
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  const AnySchema = new mongoose.Schema({}, { strict: false, timestamps: true });
  const StatusSchema = new mongoose.Schema({ bus: String, status: mongoose.Schema.Types.Mixed, updatedAt: Date }, { strict: false });
  const LocationSchema = new mongoose.Schema({ bus: String, location: mongoose.Schema.Types.Mixed, updatedAt: Date }, { strict: false });
  const AttendanceSchema = new mongoose.Schema({ time: Date, meta: mongoose.Schema.Types.Mixed }, { strict: false });

  Bus = mongoose.model("Bus", AnySchema);
  Route = mongoose.model("Route", AnySchema);
  Driver = mongoose.model("Driver", AnySchema);
  Student = mongoose.model("Student", AnySchema);
  Status = mongoose.model("Status", StatusSchema);
  Location = mongoose.model("Location", LocationSchema);
  Attendance = mongoose.model("Attendance", AttendanceSchema);
}

if (useMongo) {
  initMongo().then(() => console.log("Connected to MongoDB")).catch(err => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });
} else {
  console.log("MONGO_URI not set — using file-based storage (data.json)");
}

/* ------------------------ BUS ------------------------ */
app.get("/buses", async (req, res) => {
  if (useMongo) {
    const docs = await Bus.find().lean();
    return res.json(docs);
  }
  const d = readData();
  res.json(d.buses);
});

app.post("/buses", async (req, res) => {
  if (useMongo) {
    const created = await Bus.create(req.body);
    return res.json({ ok: true, id: created._id });
  }
  const d = readData();
  d.buses.push(req.body);
  writeData(d);
  res.json({ ok: true });
});

/* ------------------------ ROUTES ------------------------ */
app.get("/routes", async (req, res) => {
  if (useMongo) {
    const docs = await Route.find().lean();
    return res.json(docs);
  }
  const d = readData();
  res.json(d.routes);
});

app.post("/routes", async (req, res) => {
  if (useMongo) {
    const created = await Route.create(req.body);
    return res.json({ ok: true, id: created._id });
  }
  const d = readData();
  d.routes.push(req.body);
  writeData(d);
  res.json({ ok: true });
});

/* ------------------------ DRIVERS ------------------------ */
app.get("/drivers", async (req, res) => {
  if (useMongo) {
    const docs = await Driver.find().lean();
    return res.json(docs);
  }
  const d = readData();
  res.json(d.drivers);
});

app.post("/drivers", async (req, res) => {
  if (useMongo) {
    const created = await Driver.create(req.body);
    return res.json({ ok: true, id: created._id });
  }
  const d = readData();
  d.drivers.push(req.body);
  writeData(d);
  res.json({ ok: true });
});

/* ------------------------ STUDENTS ------------------------ */
app.get("/students", async (req, res) => {
  if (useMongo) {
    const docs = await Student.find().lean();
    return res.json(docs);
  }
  const d = readData();
  res.json(d.students);
});

app.post("/students", async (req, res) => {
  if (useMongo) {
    const created = await Student.create(req.body);
    return res.json({ ok: true, id: created._id });
  }
  const d = readData();
  d.students.push(req.body);
  writeData(d);
  res.json({ ok: true });
});

/* ------------------------ STATUS ------------------------ */
app.post("/status", async (req, res) => {
  const { bus, status } = req.body;
  if (useMongo) {
    const updated = await Status.findOneAndUpdate(
      { bus }, { bus, status, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    return res.json({ ok: true, id: updated._id });
  }
  const d = readData();
  if (!d.status) d.status = {};
  d.status[bus] = { status, updatedAt: new Date().toISOString() };
  writeData(d);
  res.json({ ok: true });
});

app.get("/status", async (req, res) => {
  if (useMongo) {
    const docs = await Status.find().lean();
    const obj = {};
    docs.forEach(d => obj[d.bus] = { status: d.status, updatedAt: d.updatedAt });
    return res.json(obj);
  }
  const d = readData();
  res.json(d.status || {});
});

/* ------------------------ LOCATION ------------------------ */
app.post("/location", async (req, res) => {
  const { bus, location } = req.body;
  if (useMongo) {
    const updated = await Location.findOneAndUpdate(
      { bus }, { bus, location, updatedAt: new Date() },
      { upsert: true, new: true }
    );
    return res.json({ ok: true, id: updated._id });
  }
  const d = readData();
  if (!d.location) d.location = {};
  d.location[bus] = { location, updatedAt: new Date().toISOString() };
  writeData(d);
  res.json({ ok: true });
});

app.get("/location", async (req, res) => {
  if (useMongo) {
    const docs = await Location.find().lean();
    const obj = {};
    docs.forEach(d => obj[d.bus] = { location: d.location, updatedAt: d.updatedAt });
    return res.json(obj);
  }
  const d = readData();
  res.json(d.location || {});
});

/* ------------------------ ATTENDANCE ------------------------ */
app.post("/attendance", async (req, res) => {
  if (useMongo) {
    const entry = { time: new Date(), meta: req.body || {} };
    const created = await Attendance.create(entry);
    return res.json({ ok: true, id: created._id });
  }
  const d = readData();
  d.attendance.push({ time: new Date().toISOString() });
  writeData(d);
  res.json({ ok: true });
});

/* ------------------------ HEALTH ------------------------ */
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

/* ------------------------ DELETE ------------------------ */
app.delete("/:type/:index", async (req, res) => {
  const { type, index } = req.params;
  const mapping = { buses: Bus, routes: Route, drivers: Driver, students: Student };

  if (useMongo && mapping[type]) {
    const Model = mapping[type];
    try {
      if (/^[0-9a-fA-F]{24}$/.test(index)) {
        await Model.findByIdAndDelete(index);
        return res.json({ ok: true });
      }
      const idx = parseInt(index, 10);
      if (isNaN(idx)) return res.status(400).json({ error: "Invalid index" });
      const doc = await Model.find().skip(idx).limit(1);
      if (!doc || !doc[0]) return res.status(404).json({ error: "Not found" });
      await Model.findByIdAndDelete(doc[0]._id);
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  const d = readData();
  if (!d[type]) return res.status(400).json({ error: "Invalid type" });
  d[type].splice(index, 1);
  writeData(d);
  res.json({ ok: true });
});

/* ------------------------ UPDATE ------------------------ */
app.put("/:type/:index", async (req, res) => {
  const { type, index } = req.params;
  const mapping = { buses: Bus, routes: Route, drivers: Driver, students: Student };

  if (useMongo && mapping[type]) {
    const Model = mapping[type];
    try {
      if (/^[0-9a-fA-F]{24}$/.test(index)) {
        await Model.findByIdAndUpdate(index, req.body, { new: true });
        return res.json({ ok: true });
      }
      const idx = parseInt(index, 10);
      if (isNaN(idx)) return res.status(400).json({ error: "Invalid index" });
      const doc = await Model.find().skip(idx).limit(1);
      if (!doc || !doc[0]) return res.status(404).json({ error: "Not found" });
      await Model.findByIdAndUpdate(doc[0]._id, req.body, { new: true });
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  const d = readData();
  if (!d[type]) return res.status(400).json({ error: "Invalid type" });
  d[type][index] = req.body;
  writeData(d);
  res.json({ ok: true });
});

/* ============================================================= */
/* 🔥 SERVE FRONTEND (YOU NEEDED THIS PART)                      */
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
