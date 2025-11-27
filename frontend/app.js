function login(){
	const username = (document.getElementById('username')||{}).value?.trim();
	const password = (document.getElementById('password')||{}).value?.trim();
	const role = document.getElementById("role").value;

	if(!username) return alert('Please enter username');
	if(!password) return alert('Please enter password');

	// Accept ANY non-empty username/password. (Client-side only.)
	localStorage.setItem('role', role);
	localStorage.setItem('username', username);
	window.location.href = role + ".html";
}

function logout(){
	localStorage.removeItem('role');
	window.location.href = "index.html";
}

function requireRole(expected){
	const role = localStorage.getItem('role');
	if(!role || role !== expected){
		alert('Access denied. Please login with the correct role.');
		window.location.href = 'index.html';
	}
}

function loadData(k){return JSON.parse(localStorage.getItem(k))||[];}
function saveData(k,v){localStorage.setItem(k,JSON.stringify(v));}