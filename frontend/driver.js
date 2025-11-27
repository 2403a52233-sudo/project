const API = "http://localhost:3000";

/* store fetched bus numbers for validation */
let driverBuses = [];

/* Load bus list for driver dropdown */
async function loadDriverBuses() {
    const res = await fetch(API + "/buses");
    const buses = await res.json();

    driverBuses = buses.map(b => String(b.number));

    const select = document.getElementById("driverBus");
    // Start with a placeholder so nothing is selected by default
    const options = [`<option value="" disabled selected>Select a bus</option>`];
    options.push(...buses.map(b => `<option value="${b.number}">${b.number}</option>`));
    select.innerHTML = options.join("");
}

loadDriverBuses();

/* Update status for selected bus */
async function updateStatus() {
    const bus = document.getElementById("driverBus").value;
    if(!bus){ return alert('Please select a bus first'); }
    if(!driverBuses.includes(String(bus))){
        return alert('Bus not found in the system. Please select a valid bus.');
    }
    const status = document.getElementById("routeStatus").value;

    await fetch(API + "/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bus, status })
    });

    alert("Status updated for " + bus);
}

/* Update location for selected bus */
async function updateLocation() {
    const bus = document.getElementById("driverBus").value;
    if(!bus){ return alert('Please select a bus first'); }
    if(!driverBuses.includes(String(bus))){
        return alert('Bus not found in the system. Please select a valid bus.');
    }
    const location = document.getElementById("location").value;

    await fetch(API + "/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bus, location })
    });

    alert("Location updated for " + bus);

    document.getElementById("location").value = "";
}
