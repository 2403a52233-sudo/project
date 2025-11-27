const API = "https://bus-system-s4fq.onrender.com";

/* Load and display totals in the college page */
async function loadStats() {
    try {
        const [buses, routes, drivers] = await Promise.all([
            fetch(API + "/buses").then(r => r.json()),
            fetch(API + "/routes").then(r => r.json()),
            fetch(API + "/drivers").then(r => r.json())
        ]);

        document.getElementById("totalBuses").textContent = buses.length;
        document.getElementById("totalRoutes").textContent = routes.length;
        document.getElementById("totalDrivers").textContent = drivers.length;
    } catch (err) {
        console.error("Failed to load stats:", err);
    }
}

/* Generate a detailed HTML report and open in a new tab */
async function generateReport() {
    try {
        // fetch all data
        const [buses, routes, drivers, statusData, locationData] = await Promise.all([
            fetch(API + "/buses").then(r => r.json()),
            fetch(API + "/routes").then(r => r.json()),
            fetch(API + "/drivers").then(r => r.json()),
            fetch(API + "/status").then(r => r.json()).catch(()=>({})),
            fetch(API + "/location").then(r => r.json()).catch(()=>({}))
        ]);

        // build HTML for lists
        const busListHtml = buses.length
            ? `<ol>${buses.map(b => `<li>${escapeHtml(String(b.number))}</li>`).join("")}</ol>`
            : "<p>No buses found.</p>";

        const routeListHtml = routes.length
            ? `<ol>${routes.map(r => `<li>${escapeHtml(r.name)}</li>`).join("")}</ol>`
            : "<p>No routes found.</p>";

        const driverListHtml = drivers.length
            ? `<ol>${drivers.map((d, i) => `<li>${escapeHtml(String(d.number || "—"))} &ndash; ${escapeHtml(d.name || "—")}</li>`).join("")}</ol>`
            : "<p>No drivers found.</p>";

        // Build status table rows (by bus number if keys exist) and driver-location mapping
        let statusRows = "";
        if (Object.keys(statusData).length || Object.keys(locationData).length) {
            // Try to iterate by bus numbers found in buses[] to present consistent order
            for (let i = 0; i < buses.length; i++) {
                const busNo = String(buses[i].number);
                const stat = statusData[busNo]?.status || "No update";
                const loc = locationData[busNo]?.location || "No update";
                const driver = drivers[i] ? `${escapeHtml(String(drivers[i].number || "—"))} — ${escapeHtml(drivers[i].name || "—")}` : "No driver assigned";
                statusRows += `
                    <tr>
                        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${escapeHtml(busNo)}</td>
                        <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(stat)}</td>
                        <td style="padding:8px;border:1px solid #ddd;">${escapeHtml(loc)}</td>
                        <td style="padding:8px;border:1px solid #ddd;">${driver}</td>
                    </tr>
                `;
            }
        } else {
            // if no keyed status/location data, show per-index info
            for (let i = 0; i < Math.max(buses.length, drivers.length); i++) {
                const busNo = buses[i] ? String(buses[i].number) : "—";
                const driver = drivers[i] ? `${escapeHtml(String(drivers[i].number || "—"))} — ${escapeHtml(drivers[i].name || "—")}` : "No driver assigned";
                statusRows += `
                    <tr>
                        <td style="padding:8px;border:1px solid #ddd;text-align:center;">${escapeHtml(busNo)}</td>
                        <td style="padding:8px;border:1px solid #ddd;">No update</td>
                        <td style="padding:8px;border:1px solid #ddd;">No update</td>
                        <td style="padding:8px;border:1px solid #ddd;">${driver}</td>
                    </tr>
                `;
            }
        }

        // Report HTML content
        const reportHtml = `
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Campus Transport System Report</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
    body { font-family: Inter, Roboto, Arial, sans-serif; color:#222; padding:24px; background:#f7f9fb; }
    .container { max-width:1100px; margin:0 auto; background:white; border-radius:10px; padding:22px; box-shadow:0 6px 18px rgba(0,0,0,0.06);}
    h1 { margin:0 0 8px 0; font-size:22px; }
    .meta { color:#666; margin-bottom:18px; }
    .row { display:flex; gap:12px; margin-bottom:18px; }
    .stat { flex:1; background:#fafbff; border-radius:8px; padding:16px; text-align:center; box-shadow: 0 2px 6px rgba(0,0,0,0.03);}
    .stat .num { font-size:28px; font-weight:700; margin-bottom:6px; }
    .section { margin-top:18px; }
    .section h2 { font-size:16px; margin-bottom:8px; }
    table { width:100%; border-collapse:collapse; margin-top:8px; }
    th, td { padding:8px; border:1px solid #eee; }
    th { background:#f1f5f9; text-align:left; }
    .controls { margin-top:18px; display:flex; gap:10px; }
    .btn { background:#0b63ff; color:white; padding:10px 14px; border-radius:8px; text-decoration:none; display:inline-block; }
    .btn.secondary { background:#666; }
    .small { font-size:13px; color:#666; }
    .logo { display:inline-block; background:#0b63ff; color:white; padding:8px 10px; border-radius:8px; margin-right:10px; font-weight:700;}
    .note { margin-top:10px; color:#666; font-size:13px;}
</style>
</head>
<body>
<div class="container">
    <div style="display:flex;align-items:center;justify-content:space-between;">
        <div>
            <div style="display:flex;align-items:center;">
                <div class="logo">SR</div>
                <div>
                    <h1>Campus Transport System Report</h1>
                    <div class="meta">Generated: ${new Date().toLocaleString()}</div>
                </div>
            </div>
        </div>
        <div class="controls">
            <a class="btn" id="printBtn" href="#">Print / Save</a>
            <a class="btn secondary" id="closeBtn" href="#">Close</a>
        </div>
    </div>

    <div class="row" style="margin-top:16px;">
        <div class="stat">
            <div class="num">${buses.length}</div>
            <div class="small">Total Buses</div>
        </div>
        <div class="stat">
            <div class="num">${routes.length}</div>
            <div class="small">Total Routes</div>
        </div>
        <div class="stat">
            <div class="num">${drivers.length}</div>
            <div class="small">Total Drivers</div>
        </div>
    </div>

    <div class="section">
        <h2>Buses</h2>
        ${busListHtml}
    </div>

    <div class="section">
        <h2>Routes</h2>
        ${routeListHtml}
    </div>

    <div class="section">
        <h2>Drivers</h2>
        ${driverListHtml}
    </div>

    <div class="section">
        <h2>Current Status / Driver Location</h2>
        <table>
            <thead>
                <tr>
                    <th style="width:12%;">Bus #</th>
                    <th style="width:24%;">Status</th>
                    <th style="width:34%;">Location</th>
                    <th style="width:30%;">Driver (Number — Name)</th>
                </tr>
            </thead>
            <tbody>
                ${statusRows}
            </tbody>
        </table>
        <div class="note">Status and location are pulled from the system's current status and location endpoints.</div>
    </div>

    <div style="margin-top:22px;color:#777;font-size:13px;">
        Report generated by Campus Transport — ${new Date().getFullYear()}.
    </div>
</div>

<script>
    // Escape HTML helper (also present in parent page code)
    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    document.getElementById("printBtn").addEventListener("click", function(e){
        e.preventDefault();
        window.print();
    });

    document.getElementById("closeBtn").addEventListener("click", function(e){
        e.preventDefault();
        window.close();
    });
</script>
</body>
</html>
        `;

        // open new tab and write report
        const newWindow = window.open("", "_blank");
        if (!newWindow) {
            alert("Popup blocked. Please allow popups for this site to open the report.");
            return;
        }
        newWindow.document.open();
        newWindow.document.write(reportHtml);
        newWindow.document.close();

    } catch (err) {
        console.error("Failed to generate report:", err);
        alert("Failed to generate report. See console for details.");
    }
}

/* Utility: simple HTML escape for safety */
function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* Initialize page stats on load */
document.addEventListener("DOMContentLoaded", () => {
    loadStats();

    // Optionally, if you want stats to refresh every minute:
    // setInterval(loadStats, 60000);
});
