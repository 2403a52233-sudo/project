const API = "https://bus-system-s4fq.onrender.com";

/* store fetched bus numbers for validation */
let studentBuses = [];

/* ===== LOAD ALL ROUTES IMMEDIATELY ===== */
async function loadAllRoutes() {
    const routes = await fetch(API + "/routes").then(r => r.json());

    document.getElementById("studentRoutes").innerHTML =
        routes.length === 0
            ? "<p>No routes available.</p>"
            : routes.map(r => `<p>${r.name}</p>`).join("");
}

/* ===== Load bus list for student dropdown ===== */
async function loadBusList() {
    const buses = await fetch(API + "/buses").then(r => r.json());

    studentBuses = buses.map(b => String(b.number));

    const select = document.getElementById("studentBus");

    const options = [`<option value="" disabled selected>Select a bus</option>`];
    options.push(...buses.map(b => `<option value="${b.number}">${b.number}</option>`));

    select.innerHTML = options.join("");
}

/* ===== Load notifications + FILTER ROUTES when bus is selected ===== */
async function loadStudentData() {
    const bus = document.getElementById("studentBus").value;

    if (!bus) {
        document.getElementById("notifications").innerHTML = `<p>Select a bus to view updates.</p>`;
        return;
    }

    if (!studentBuses.includes(String(bus))) {
        alert("Selected bus not found.");
        document.getElementById("notifications").innerHTML = "";
        return;
    }

    /* ===== FILTER ROUTES FOR THIS BUS ONLY ===== */
    const allRoutes = await fetch(API + "/routes").then(r => r.json());

    const filteredRoutes = allRoutes.filter(
        r => String(r.bus) === String(bus)
    );

    document.getElementById("studentRoutes").innerHTML =
        filteredRoutes.length === 0
            ? "<p>No routes for this bus.</p>"
            : filteredRoutes.map(r => `<p>${r.name}</p>`).join("");

    /* ===== NOTIFICATIONS (UNCHANGED) ===== */
    const statusData = await fetch(API + "/status").then(r => r.json());
    const locationData = await fetch(API + "/location").then(r => r.json());
    const drivers = await fetch(API + "/drivers").then(r => r.json());

    const status = statusData[bus]?.status || "No update";
    const location = locationData[bus]?.location || "No update";

    const busIndex = studentBuses.indexOf(String(bus));
    const driverNumber = drivers[busIndex]?.number || "No update";
    const driverName = drivers[busIndex]?.name || "No update";

    document.getElementById("notifications").innerHTML = `
        <p><b>Bus Status:</b> ${status}</p>
        <p><b>Driver Location:</b> ${location}</p>
        <p><b>Driver Number:</b> ${driverNumber}</p>
        <p><b>Driver Name:</b> ${driverName}</p>
    `;
}

/* Initialize student panel */
async function initStudent() {
    await loadBusList();
    await loadAllRoutes();  
    document.getElementById("notifications").innerHTML = `<p>Select a bus to view updates.</p>`;
}

initStudent();
