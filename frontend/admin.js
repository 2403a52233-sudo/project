const API = "http://localhost:3000";

/* Load lists when admin page opens */
loadAll();

async function loadAll() {
    loadBuses();
    loadRoutes();
    loadDrivers();
}

/* Disable listing under each card */
function showList(id, items, type) {
    document.getElementById(id).innerHTML = "";
}

/* ================= BUS ================= */
async function addBus() {
    const number = document.getElementById("busNumber").value.trim();
    if (!number) return alert("Enter bus number");

    await fetch(API + "/buses", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ number })
    });

    document.getElementById("busNumber").value = "";
    loadBuses();
}

async function loadBuses() {
    const res = await fetch(API + "/buses");
    const data = await res.json();
    showList("busList", data, "buses");
}

/* ================= ROUTES ================= */
async function addRoute() {
    const name = document.getElementById("routeName").value.trim();
    if (!name) return alert("Enter route name");

    await fetch(API + "/routes", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name })
    });

    document.getElementById("routeName").value = "";
    loadRoutes();
}

async function loadRoutes() {
    const res = await fetch(API + "/routes");
    const data = await res.json();
    showList("routeList", data, "routes");
}

/* ================= DRIVERS ================= */
async function addDriver() {
    const number = document.getElementById("driverNumber").value.trim();
    const name = document.getElementById("driverName").value.trim();

    if (!number) return alert("Enter driver number");
    if (!name) return alert("Enter driver name");

    await fetch(API + "/drivers", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ number, name })
    });

    document.getElementById("driverNumber").value = "";
    document.getElementById("driverName").value = "";
    loadDrivers();
}

async function loadDrivers() {
    const res = await fetch(API + "/drivers");
    const data = await res.json();
    showList("driverList", data, "drivers");
}

/* ================= EDIT ITEM ================= */
async function editItem(type, index) {
    let newValue = prompt("Enter new value:");
    if (!newValue) return;

    let body =
        type === "buses" ? { number: newValue }
      : type === "drivers" ? { number: newValue } 
      : { name: newValue };

    await fetch(`${API}/${type}/${index}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    });

    loadAll();
}

/* ================= DELETE ITEM ================= */
async function deleteItem(type, index) {
    if (!confirm("Delete this item?")) return;

    await fetch(`${API}/${type}/${index}`, { method: "DELETE" });
    loadAll();
}

/* ================= RESET SYSTEM ================= */
async function resetAll() {
    if (!confirm("This will erase everything. Continue?")) return;

    await fetch(API + "/reset", { method: "POST" });
    loadAll();
}

/* ================= VIEW ALL (WITH DRIVER NUMBER + NAME) ================= */

let viewShown = false;

async function viewAll() {

    // toggle feature
    if (viewShown) {
        document.getElementById("combinedTable").innerHTML = "";
        viewShown = false;
        return;
    }

    viewShown = true;

    const buses = await (await fetch(API + "/buses")).json();
    const routes = await (await fetch(API + "/routes")).json();
    const drivers = await (await fetch(API + "/drivers")).json();

    let maxLen = Math.max(buses.length, routes.length, drivers.length);

    let html = `
        <table border="1" width="100%" style="text-align:center;border-collapse:collapse;">
            <tr style="background:#f0f0f0;">
                <th>Bus Number</th>
                <th>Route</th>
                <th>Driver Number</th>
                <th>Driver Name</th>
                <th>Edit</th>
                <th>Delete</th>
            </tr>
    `;

    for (let i = 0; i < maxLen; i++) {
        html += `
            <tr>
                <td>${buses[i] ? buses[i].number : "—"}</td>
                <td>${routes[i] ? routes[i].name : "—"}</td>
                <td>${drivers[i] ? drivers[i].number : "—"}</td>
                <td>${drivers[i] ? drivers[i].name : "—"}</td>

                <td><button onclick="editCombined(${i})">Edit</button></td>
                <td><button onclick="deleteCombined(${i})" style="background:red;color:white;">Delete</button></td>
            </tr>
        `;
    }

    html += `</table>`;
    document.getElementById("combinedTable").innerHTML = html;
}

/* ================= EDIT FULL ROW ================= */
async function editCombined(index) {
    let newBus = prompt("Enter new bus number:");
    let newRoute = prompt("Enter new route name:");
    let newDriverNumber = prompt("Enter new driver number:");
    let newDriverName = prompt("Enter new driver name:");

    if (newBus)
        await fetch(`${API}/buses/${index}`, {
            method: "PUT",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ number: newBus })
        });

    if (newRoute)
        await fetch(`${API}/routes/${index}`, {
            method: "PUT",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({ name: newRoute })
        });

    if (newDriverNumber || newDriverName)
        await fetch(`${API}/drivers/${index}`, {
            method: "PUT",
            headers: {"Content-Type":"application/json"},
            body: JSON.stringify({
                number: newDriverNumber,
                name: newDriverName
            })
        });

    viewAll();
}

/* ================= DELETE FULL ROW ================= */
async function deleteCombined(index) {
    if (!confirm("Delete bus, route, and driver?")) return;

    await fetch(`${API}/buses/${index}`, { method: "DELETE" });
    await fetch(`${API}/routes/${index}`, { method: "DELETE" });
    await fetch(`${API}/drivers/${index}`, { method: "DELETE" });

    viewAll();
}
