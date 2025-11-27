<!-- Manage Routes -->
<div class="card">
    <div class="h2">Manage Routes</div>

    <div class="form-row">
        <div class="col">
            <input id="routeName" class="input" type="text" placeholder="Enter route name">
        </div>
    </div>

    <div class="form-row" style="margin-top:10px;">
        <div class="col">
            <input id="routeBusNumber" class="input" type="text" placeholder="Enter bus number for route">
        </div>
        <div style="width:150px">
            <button class="btn" onclick="addRoute()">Add Route</button>
        </div>
    </div>

    <div id="routeList" style="margin-top:16px"></div>
</div>
