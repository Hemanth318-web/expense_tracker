let currentUser = localStorage.getItem('tracker_user');
let expenses = [];
let chart = null;


window.onload = () => {
    if (currentUser) {
        startDashboard();
    }
};

function startDashboard() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('dashboard-section').classList.remove('hidden');
    document.getElementById('welcome-msg').innerText = "Hello, " + currentUser;
    
    
    const saved = localStorage.getItem('data_' + currentUser);
    expenses = saved ? JSON.parse(saved) : [];

    
    const form = document.getElementById('expense-form');
    form.onsubmit = (e) => {
        e.preventDefault();
        addExpense();
    };

    render();
}

function addExpense() {
    const d = document.getElementById('desc').value;
    const a = parseFloat(document.getElementById('amt').value);
    const c = document.getElementById('cat').value;
    const dt = document.getElementById('date').value;

    if (!d || isNaN(a) || !dt) return alert("Fill all fields");

    const item = { id: Date.now(), desc: d, amt: a, cat: c, date: dt };
    expenses.push(item);
    
    
    localStorage.setItem('data_' + currentUser, JSON.stringify(expenses));
    
    
    document.getElementById('expense-form').reset();
    render();
}

function render() {
    const query = document.getElementById('search').value.toLowerCase();
    const listBody = document.getElementById('list');
    listBody.innerHTML = '';

    let total = 0;
    let filteredTotal = 0;
    let catSummary = {};

    
    expenses.forEach(ex => total += ex.amt);

    
    expenses.filter(ex => 
        ex.desc.toLowerCase().includes(query) || 
        ex.cat.toLowerCase().includes(query)
    ).forEach(ex => {
        filteredTotal += ex.amt;
        catSummary[ex.cat] = (catSummary[ex.cat] || 0) + ex.amt;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ex.date}</td>
            <td>${ex.desc}</td>
            <td>${ex.cat}</td>
            <td>₹${ex.amt.toLocaleString('en-IN')}</td>
            <td><button onclick="deleteItem(${ex.id})" class="del-btn">X</button></td>
        `;
        listBody.appendChild(tr);
    });

    document.getElementById('total-val').innerText = "₹" + total.toLocaleString('en-IN');
    document.getElementById('filter-val').innerText = "₹" + filteredTotal.toLocaleString('en-IN');
    
    updateChart(catSummary);
}

function deleteItem(id) {
    expenses = expenses.filter(ex => ex.id !== id);
    localStorage.setItem('data_' + currentUser, JSON.stringify(expenses));
    render();
}

function updateChart(data) {
    const ctx = document.getElementById('myChart').getContext('2d');
    if (chart) chart.destroy();
    if (Object.keys(data).length === 0) return;

    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(data),
            datasets: [{
                data: Object.values(data),
                backgroundColor: ['#ff6384', '#36a2eb', '#cc65fe', '#ffce56', '#4bc0c0']
            }]
        }
    });
}


function handleLogin() {
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const users = JSON.parse(localStorage.getItem('tracker_users') || '[]');
    const user = users.find(x => x.u === u && x.p === p);
    
    if (user) {
        currentUser = u;
        localStorage.setItem('tracker_user', u);
        startDashboard();
    } else alert("Wrong login");
}

function handleRegister() {
    const u = document.getElementById('reg-user').value;
    const p = document.getElementById('reg-pass').value;
    if (!u || !p) return alert("Enter details");
    
    let users = JSON.parse(localStorage.getItem('tracker_users') || '[]');
    if (users.find(x => x.u === u)) return alert("Exists");
    
    users.push({ u, p });
    localStorage.setItem('tracker_users', JSON.stringify(users));
    alert("Saved! Now Login.");
    toggleAuth(false);
}

function toggleAuth(isReg) {
    document.getElementById('login-box').classList.toggle('hidden', isReg);
    document.getElementById('reg-box').classList.toggle('hidden', !isReg);
}

function logout() {
    localStorage.removeItem('tracker_user');
    location.reload();
}