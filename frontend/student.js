const API = "https://bus-system-s4fq.onrender.com";

/* store fetched bus numbers for validation */
let studentBuses = [];

/* Load bus list for student dropdown */
async function loadBusList() {
    const buses = await fetch(API + "/buses").then(r => r.json());

    studentBuses = buses.map(b => String(b.number));

    const select = document.getElementById("studentBus");

    // Add placeholder so nothing is selected by default
    const options = [`<option value="" disabled selected>Select a bus</option>`];
    options.push(...buses.map(b => `<option value="${b.number}">${b.number}</option>`));

    select.innerHTML = options.join("");
}

/* Load routes + notifications when bus is selected */
async function loadStudentData() {
    const bus = document.getElementById("studentBus").value;

    // If no bus selected → clear content
    if (!bus) {
        document.getElementById("studentRoutes").innerHTML = '';
        document.getElementById("notifications").innerHTML = '';
        return;
    }

    // Validate selected bus exists
    if (!studentBuses.includes(String(bus))) {
        alert('Selected bus not found in the system. Please choose a valid bus.');
        document.getElementById("studentRoutes").innerHTML = '';
        document.getElementById("notifications").innerHTML = '';
        return;
    }

    const routes = await fetch(API + "/routes").then(r => r.json());
    const statusData = await fetch(API + "/status").then(r => r.json());
    const locationData = await fetch(API + "/location").then(r => r.json());
    const drivers = await fetch(API + "/drivers").then(r => r.json());

    // Show list of routes
    document.getElementById("studentRoutes").innerHTML =
        routes.map(r => `<p>${r.name}</p>`).join("");

    // Bus status + location for the selected bus
    const status = statusData[bus]?.status || "No update";
    const location = locationData[bus]?.location || "No update";

    // Determine the index of the selected bus
    const busIndex = studentBuses.indexOf(String(bus));

    // Driver details for same index
    const driverNumber = drivers[busIndex]?.number || "No update";
    const driverName = drivers[busIndex]?.name || "No update";

    // UPDATE notification block
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
    // Do NOT auto load data — wait for user to select bus
}

initStudent();
