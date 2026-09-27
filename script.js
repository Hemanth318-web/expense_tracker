/* =====================================================
   EXPENSIFY - SMART FINANCE TRACKER
   Frontend learning project
   Data storage: localStorage
===================================================== */


/* ================= GLOBAL STATE ================= */

let currentUser = localStorage.getItem("tracker_user");

let expenses = [];

let chart = null;

let editingId = null;

let selectedType = "expense";


/* ================= INITIALIZATION ================= */

document.addEventListener("DOMContentLoaded", () => {

    setToday();

    setupAuthForms();

    setupTransactionForm();

    setupFilters();

    setupTypeSelector();

    if (currentUser) {
        startDashboard();
    }

});


/* ================= DATE ================= */

function setToday() {

    const dateInput = document.getElementById("date");

    if (dateInput) {
        dateInput.value = getToday();
    }

    const currentDate = document.getElementById("current-date");

    if (currentDate) {

        currentDate.textContent =
            new Date().toLocaleDateString(
                "en-IN",
                {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
            );

    }

}


function getToday() {

    const now = new Date();

    const offset =
        now.getTimezoneOffset() * 60000;

    return new Date(
        now.getTime() - offset
    )
        .toISOString()
        .split("T")[0];

}


/* ================= AUTH ================= */

function setupAuthForms() {

    const loginForm =
        document.getElementById("login-form");

    const registerForm =
        document.getElementById("register-form");


    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        handleLogin();

    });


    registerForm.addEventListener("submit", function (event) {

        event.preventDefault();

        handleRegister();

    });

}


function handleLogin() {

    const username =
        document
            .getElementById("login-user")
            .value
            .trim();

    const password =
        document
            .getElementById("login-pass")
            .value;


    if (!username || !password) {

        showToast(
            "Please enter username and password.",
            "error"
        );

        return;
    }


    const users =
        JSON.parse(
            localStorage.getItem("tracker_users") || "[]"
        );


    const user =
        users.find(
            item =>
                item.u === username &&
                item.p === password
        );


    if (!user) {

        showToast(
            "Invalid username or password.",
            "error"
        );

        return;
    }


    currentUser = username;

    localStorage.setItem(
        "tracker_user",
        username
    );


    showToast(
        "Login successful."
    );


    startDashboard();

}


function handleRegister() {

    const username =
        document
            .getElementById("reg-user")
            .value
            .trim();

    const password =
        document
            .getElementById("reg-pass")
            .value;


    if (username.length < 3) {

        showToast(
            "Username must contain at least 3 characters.",
            "error"
        );

        return;
    }


    if (password.length < 4) {

        showToast(
            "Password must contain at least 4 characters.",
            "error"
        );

        return;
    }


    let users =
        JSON.parse(
            localStorage.getItem("tracker_users") || "[]"
        );


    const exists =
        users.some(
            user =>
                user.u.toLowerCase() ===
                username.toLowerCase()
        );


    if (exists) {

        showToast(
            "Username already exists.",
            "error"
        );

        return;
    }


    users.push({
        u: username,
        p: password
    });


    localStorage.setItem(
        "tracker_users",
        JSON.stringify(users)
    );


    document
        .getElementById("register-form")
        .reset();


    toggleAuth(false);


    document
        .getElementById("login-user")
        .value = username;


    showToast(
        "Account created. You can now login."
    );

}


function toggleAuth(showRegister) {

    document
        .getElementById("login-box")
        .classList.toggle(
            "hidden",
            showRegister
        );


    document
        .getElementById("reg-box")
        .classList.toggle(
            "hidden",
            !showRegister
        );

}


function togglePassword(inputId, button) {

    const input =
        document.getElementById(inputId);

    const icon =
        button.querySelector("i");


    if (input.type === "password") {

        input.type = "text";

        icon.className =
            "fa-solid fa-eye-slash";

    } else {

        input.type = "password";

        icon.className =
            "fa-solid fa-eye";

    }

}


function logout() {

    localStorage.removeItem(
        "tracker_user"
    );

    if (chart) {
        chart.destroy();
        chart = null;
    }

    location.reload();

}


/* ================= DASHBOARD ================= */

function startDashboard() {

    document
        .getElementById("auth-section")
        .classList.add("hidden");


    document
        .getElementById("dashboard-section")
        .classList.remove("hidden");


    const username =
        document.getElementById("welcome-msg");

    username.textContent =
        currentUser;


    const avatar =
        document.getElementById("user-avatar");

    avatar.textContent =
        currentUser
            .charAt(0)
            .toUpperCase();


    loadExpenses();

    render();

}


function loadExpenses() {

    const saved =
        localStorage.getItem(
            "data_" + currentUser
        );


    try {

        expenses =
            saved
                ? JSON.parse(saved)
                : [];

    } catch {

        expenses = [];

    }


    if (!Array.isArray(expenses)) {
        expenses = [];
    }

}


/* ================= TRANSACTION FORM ================= */

function setupTransactionForm() {

    const form =
        document.getElementById(
            "expense-form"
        );


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            saveTransaction();

        }
    );

}


function setupTypeSelector() {

    const buttons =
        document.querySelectorAll(
            ".type-btn"
        );


    buttons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                selectedType =
                    this.dataset.type;


                document
                    .getElementById(
                        "transaction-type"
                    )
                    .value =
                    selectedType;


                buttons.forEach(btn => {

                    btn.classList.remove(
                        "active"
                    );

                });


                this.classList.add("active");


                updateCategoryOptions();

            }
        );

    });

}


function updateCategoryOptions() {

    const category =
        document.getElementById("cat");


    if (selectedType === "income") {

        category.innerHTML = `
            <option value="Salary">Salary</option>
            <option value="Freelance">Freelance</option>
            <option value="Business">Business</option>
            <option value="Investment">Investment</option>
            <option value="Other">Other</option>
        `;

    } else {

        category.innerHTML = `
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Bills">Bills</option>
            <option value="Shopping">Shopping</option>
            <option value="Education">Education</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Health">Health</option>
            <option value="Other">Other</option>
        `;

    }

}


function saveTransaction() {

    const description =
        document
            .getElementById("desc")
            .value
            .trim();


    const amount =
        parseFloat(
            document.getElementById("amt").value
        );


    const category =
        document.getElementById("cat").value;


    const date =
        document.getElementById("date").value;


    if (!description) {

        showToast(
            "Please enter a description.",
            "error"
        );

        return;
    }


    if (
        isNaN(amount) ||
        amount <= 0
    ) {

        showToast(
            "Enter a valid amount.",
            "error"
        );

        return;
    }


    if (!date) {

        showToast(
            "Please select a date.",
            "error"
        );

        return;
    }


    if (editingId !== null) {

        const index =
            expenses.findIndex(
                item =>
                    item.id === editingId
            );


        if (index !== -1) {

            expenses[index] = {

                ...expenses[index],

                desc: description,

                amt: amount,

                cat: category,

                date: date,

                type: selectedType

            };

        }


        showToast(
            "Transaction updated."
        );

    } else {

        const transaction = {

            id:
                Date.now() +
                Math.floor(
                    Math.random() * 1000
                ),

            desc: description,

            amt: amount,

            cat: category,

            date: date,

            type: selectedType

        };


        expenses.push(transaction);


        showToast(
            selectedType === "income"
                ? "Income added successfully."
                : "Expense added successfully."
        );

    }


    saveData();

    resetForm();

    render();

}


/* ================= EDIT ================= */

function editItem(id) {

    const item =
        expenses.find(
            transaction =>
                transaction.id === id
        );


    if (!item) return;


    editingId = id;

    selectedType =
        item.type || "expense";


    document
        .getElementById(
            "transaction-type"
        )
        .value =
        selectedType;


    document
        .querySelectorAll(".type-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.type ===
                    selectedType
            );

        });


    updateCategoryOptions();


    document.getElementById("desc").value =
        item.desc;

    document.getElementById("amt").value =
        item.amt;

    document.getElementById("cat").value =
        item.cat;

    document.getElementById("date").value =
        item.date;


    document.getElementById(
        "form-title"
    ).textContent =
        "Edit Transaction";


    document.getElementById(
        "submit-btn"
    ).innerHTML = `
        <i class="fa-solid fa-check"></i>
        Update Transaction
    `;


    document
        .getElementById("cancel-edit")
        .classList.remove("hidden");


    scrollToForm();

}


function cancelEdit() {

    resetForm();

}


function resetForm() {

    editingId = null;

    selectedType = "expense";


    document
        .getElementById("expense-form")
        .reset();


    document
        .getElementById("date")
        .value =
        getToday();


    document
        .getElementById(
            "transaction-type"
        )
        .value =
        "expense";


    document
        .querySelectorAll(".type-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.type ===
                    "expense"
            );

        });


    updateCategoryOptions();


    document.getElementById(
        "form-title"
    ).textContent =
        "Add Transaction";


    document.getElementById(
        "submit-btn"
    ).innerHTML = `
        <i class="fa-solid fa-plus"></i>
        Add Transaction
    `;


    document
        .getElementById("cancel-edit")
        .classList.add("hidden");

}


/* ================= DELETE ================= */

function deleteItem(id) {

    const item =
        expenses.find(
            transaction =>
                transaction.id === id
        );


    if (!item) return;


    const confirmed =
        confirm(
            `Delete "${item.desc}"?`
        );


    if (!confirmed) return;


    expenses =
        expenses.filter(
            transaction =>
                transaction.id !== id
        );


    saveData();

    render();


    showToast(
        "Transaction deleted."
    );

}


/* ================= CLEAR ALL ================= */

function clearAllTransactions() {

    if (expenses.length === 0) {

        showToast(
            "There are no transactions to clear.",
            "error"
        );

        return;
    }


    const confirmed =
        confirm(
            "Delete ALL transactions? This cannot be undone."
        );


    if (!confirmed) return;


    expenses = [];

    saveData();

    render();


    showToast(
        "All transactions cleared."
    );

}


/* ================= STORAGE ================= */

function saveData() {

    localStorage.setItem(
        "data_" + currentUser,
        JSON.stringify(expenses)
    );

}


/* ================= FILTERS ================= */

function setupFilters() {

    document
        .getElementById("search")
        .addEventListener(
            "input",
            render
        );


    document
        .getElementById("category-filter")
        .addEventListener(
            "change",
            render
        );

}


/* ================= RENDER ================= */

function render() {

    const search =
        document
            .getElementById("search")
            .value
            .trim()
            .toLowerCase();


    const category =
        document.getElementById(
            "category-filter"
        ).value;


    const list =
        document.getElementById("list");


    list.innerHTML = "";


    const filtered =
        expenses.filter(item => {

            const matchesSearch =

                item.desc
                    .toLowerCase()
                    .includes(search)

                ||

                item.cat
                    .toLowerCase()
                    .includes(search);


            const matchesCategory =

                category === "all" ||
                item.cat === category;


            return (
                matchesSearch &&
                matchesCategory
            );

        });


    let filteredTotal = 0;


    filtered.forEach(item => {

        filteredTotal +=
            item.type === "income"
                ? item.amt
                : -item.amt;


        const row =
            document.createElement("tr");


        const safeDescription =
            escapeHTML(item.desc);


        const type =
            item.type || "expense";


        const amountPrefix =
            type === "income"
                ? "+"
                : "-";


        const typeText =
            type === "income"
                ? "Income"
                : "Expense";


        row.innerHTML = `

            <td>
                ${formatDate(item.date)}
            </td>

            <td>
                <span class="transaction-description">
                    ${safeDescription}
                </span>
            </td>

            <td>
                <span class="category-badge">
                    ${escapeHTML(item.cat)}
                </span>
            </td>

            <td>
                <span class="type-badge ${
                    type === "income"
                        ? "type-income"
                        : "type-expense"
                }">
                    ${typeText}
                </span>
            </td>

            <td>
                <span class="${
                    type === "income"
                        ? "amount-income"
                        : "amount-expense"
                }">
                    ${amountPrefix}₹${formatMoney(item.amt)}
                </span>
            </td>

            <td>

                <div class="action-buttons">

                    <button
                        class="action-btn"
                        onclick="editItem(${item.id})"
                        title="Edit"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        class="action-btn delete"
                        onclick="deleteItem(${item.id})"
                        title="Delete"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            </td>

        `;


        list.appendChild(row);

    });


    updateEmptyState(
        filtered.length === 0
    );


    updateDashboard();


    document.getElementById(
        "filter-val"
    ).textContent =
        formatSignedMoney(filteredTotal);


    updateChart();

}


/* ================= DASHBOARD STATS ================= */

function updateDashboard() {

    let income = 0;

    let expense = 0;

    let monthlyExpense = 0;


    const currentMonth =
        getCurrentMonth();


    expenses.forEach(item => {

        if (item.type === "income") {

            income += item.amt;

        } else {

            expense += item.amt;


            if (
                item.date.startsWith(
                    currentMonth
                )
            ) {

                monthlyExpense +=
                    item.amt;

            }

        }

    });


    const balance =
        income - expense;


    document.getElementById(
        "income-val"
    ).textContent =
        "₹" + formatMoney(income);


    document.getElementById(
        "total-val"
    ).textContent =
        "₹" + formatMoney(monthlyExpense);


    document.getElementById(
        "balance-val"
    ).textContent =
        formatSignedMoney(balance);


    document.getElementById(
        "transaction-count"
    ).textContent =
        expenses.length;


    document.getElementById(
        "chart-total"
    ).textContent =
        "₹" + formatMoney(monthlyExpense);


    const status =
        document.getElementById(
            "balance-status"
        );


    if (balance > 0) {

        status.textContent =
            "Positive balance";

    } else if (balance < 0) {

        status.textContent =
            "Expenses exceed income";

    } else {

        status.textContent =
            "No balance yet";

    }


    document.getElementById(
        "month-label"
    ).textContent =
        new Date().toLocaleDateString(
            "en-IN",
            {
                month: "long",
                year: "numeric"
            }
        );

}


/* ================= CHART ================= */

function updateChart() {

    const canvas =
        document.getElementById(
            "myChart"
        );


    const empty =
        document.getElementById(
            "chart-empty"
        );


    const currentMonth =
        getCurrentMonth();


    const categoryData = {};


    expenses.forEach(item => {

        if (
            item.type === "expense" &&
            item.date.startsWith(
                currentMonth
            )
        ) {

            categoryData[item.cat] =
                (
                    categoryData[item.cat] ||
                    0
                ) + item.amt;

        }

    });


    if (chart) {

        chart.destroy();

        chart = null;

    }


    if (
        Object.keys(categoryData)
            .length === 0
    ) {

        canvas.classList.add("hidden");

        empty.classList.remove(
            "hidden"
        );

        return;

    }


    canvas.classList.remove("hidden");

    empty.classList.add("hidden");


    const colors = [
        "#8b5cf6",
        "#ec4899",
        "#10b981",
        "#3b82f6",
        "#f59e0b",
        "#ef4444",
        "#06b6d4",
        "#a78bfa"
    ];


    chart =
        new Chart(
            canvas.getContext("2d"),
            {

                type: "doughnut",

                data: {

                    labels:
                        Object.keys(
                            categoryData
                        ),

                    datasets: [

                        {

                            data:
                                Object.values(
                                    categoryData
                                ),

                            backgroundColor:
                                colors,

                            borderColor:
                                "#0d1322",

                            borderWidth: 3,

                            hoverOffset: 8

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    cutout: "68%",

                    plugins: {

                        legend: {

                            position: "bottom",

                            labels: {

                                color: "#cbd5e1",

                                padding: 15,

                                usePointStyle: true,

                                font: {
                                    size: 10
                                }

                            }

                        },

                        tooltip: {

                            callbacks: {

                                label:
                                    function (
                                        context
                                    ) {

                                        return (
                                            " ₹" +
                                            formatMoney(
                                                context.raw
                                            )
                                        );

                                    }

                            }

                        }

                    }

                }

            }
        );

}


/* ================= EMPTY STATE ================= */

function updateEmptyState(isEmpty) {

    const empty =
        document.getElementById(
            "empty-state"
        );


    const table =
        document.getElementById(
            "table-wrapper"
        );


    empty.classList.toggle(
        "hidden",
        !isEmpty
    );


    table.classList.toggle(
        "hidden",
        isEmpty
    );

}


/* ================= EXPORT CSV ================= */

function exportCSV() {

    if (expenses.length === 0) {

        showToast(
            "No transactions to export.",
            "error"
        );

        return;
    }


    const headers = [
        "Date",
        "Description",
        "Category",
        "Type",
        "Amount"
    ];


    const rows =
        expenses.map(item => [

            item.date,

            csvEscape(item.desc),

            csvEscape(item.cat),

            item.type || "expense",

            item.amt

        ]);


    const csv =
        [
            headers.join(","),
            ...rows.map(row =>
                row.join(",")
            )
        ].join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        "expensify-transactions.csv";


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);


    showToast(
        "Transactions exported."
    );

}


/* ================= HELPERS ================= */

function getCurrentMonth() {

    return new Date()
        .toISOString()
        .slice(0, 7);

}


function formatMoney(amount) {

    return Number(amount || 0)
        .toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );

}


function formatSignedMoney(amount) {

    const value =
        Number(amount || 0);


    if (value > 0) {

        return "+₹" + formatMoney(value);

    }


    if (value < 0) {

        return "-₹" + formatMoney(
            Math.abs(value)
        );

    }


    return "₹0.00";

}


function formatDate(date) {

    if (!date) return "-";


    const parts =
        date.split("-");


    if (parts.length !== 3) {
        return date;
    }


    return `${parts[2]}/${parts[1]}/${parts[0]}`;

}


function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function csvEscape(value) {

    return `"${String(value)
        .replaceAll('"', '""')}"`;

}


function scrollToForm() {

    const panel =
        document.getElementById(
            "transaction-panel"
        );


    panel.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });


    setTimeout(() => {

        document
            .getElementById("desc")
            .focus();

    }, 500);

}


/* ================= TOAST ================= */

function showToast(
    message,
    type = "success"
) {

    const container =
        document.getElementById(
            "toast-container"
        );


    const toast =
        document.createElement("div");


    toast.className =
        "toast " +
        (
            type === "error"
                ? "error"
                : ""
        );


    toast.innerHTML = `

        <i class="fa-solid ${
            type === "error"
                ? "fa-circle-exclamation"
                : "fa-circle-check"
        }"></i>

        <span>
            ${escapeHTML(message)}
        </span>

    `;


    container.appendChild(toast);


    setTimeout(() => {

        toast.style.opacity = "0";

        toast.style.transform =
            "translateX(30px)";

        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 3000);

}