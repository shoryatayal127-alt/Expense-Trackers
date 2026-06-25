let editId = null;
let myChart;
let monthlyChart;
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let categoryColor = {
    income: "green",
    expense: "red",
    food: "orange",
    travel: "blue",
    shopping: "purple"
};

const form = document.getElementById("transaction-form");
const list = document.getElementById("transaction-list");

form.addEventListener("submit", addTransaction);

function addTransaction(e) {
    e.preventDefault();

    const title = document.getElementById("title").value;
    const amount = Number(document.getElementById("amount").value);
    const type = document.getElementById("type").value;

    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();

    // ✅ EDIT MODE
    if (editId !== null) {

        transactions = transactions.map(item => {
            if (item.id === editId) {
                return {
                    ...item,
                    title,
                    amount,
                    type,
                    date,
                    time
                };
            }
            return item;
        });

        editId = null;
    }
    // ✅ NORMAL ADD MODE
    else {
        const transaction = {
            id: Date.now(),
            title,
            amount,
            type,
            date,
            time
        };

        transactions.push(transaction);
    }

    saveData();
    updateUI();
    form.reset();
}

function updateUI() {

    list.innerHTML = "";

    let income = 0;
    let expense = 0;

    const searchText = document.getElementById("search").value.toLowerCase();
    const filterValue = document.getElementById("filter").value;

    transactions.forEach(item => {

        if (filterValue !== "all" && item.type !== filterValue) return;

        if (!item.title.toLowerCase().includes(searchText)) return;

        const li = document.createElement("li");

       li.innerHTML = `
    <div>
        <b>${item.title}</b><br>
        ₹${item.amount}<br>
        <small>${item.date} ${item.time}</small><br>
        <span style="color:${categoryColor[item.type]}">
            ${item.type}
        </span>
    </div>

    <button onclick="editTransaction(${item.id})">Edit</button>
    <button onclick="deleteTransaction(${item.id})">X</button>
`;
        if (item.type === "expense") {
            li.classList.add("expense-item");
            expense += item.amount;
        } else {
            income += item.amount;
        }

        list.appendChild(li);
    });

    document.getElementById("income").innerText = "₹" + income;
    document.getElementById("expense").innerText = "₹" + expense;
    document.getElementById("balance").innerText = "₹" + (income - expense);

    updateChart(income, expense);
}

function editTransaction(id) {

    const item = transactions.find(t => t.id === id);

    document.getElementById("title").value = item.title;
    document.getElementById("amount").value = item.amount;
    document.getElementById("type").value = item.type;

    editId = id;
}

function deleteTransaction(id) {
    transactions = transactions.filter(item => item.id !== id);
    saveData();
    updateUI();
}

function saveData() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function updateMonthlyChart() {

    let food = 0, travel = 0, shopping = 0;

    transactions.forEach(item => {

        if (item.type === "food") food += item.amount;
        if (item.type === "travel") travel += item.amount;
        if (item.type === "shopping") shopping += item.amount;

    });

    const ctx = document.getElementById("monthlyChart").getContext("2d");

    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Food", "Travel", "Shopping"],
            datasets: [{
                label: "Expense Analysis",
                data: [food, travel, shopping],
                backgroundColor: ["orange", "blue", "purple"]
            }]
        }
    });
}

function updateChart(income, expense) {

    const ctx = document.getElementById("chart").getContext("2d");

    if (myChart) myChart.destroy();

    myChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Income", "Expense"],
            datasets: [{
                data: [income, expense],
                backgroundColor: ["green", "red"]
            }]
        }
    });
}

/* Dark Mode */
document.getElementById("toggle-dark").addEventListener("click", () => {
    document.body.classList.toggle("dark");
});

/* Search + Filter */
document.getElementById("search").addEventListener("input", updateUI);
document.getElementById("filter").addEventListener("change", updateUI);

updateUI();
document.getElementById("exportPDF").addEventListener("click", function () {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 10;

    doc.setFontSize(16);
    doc.text("Expense Tracker Report", 10, y);

    y += 10;

    transactions.forEach((item, index) => {

        doc.setFontSize(12);

        doc.text(
            `${index + 1}. ${item.title} - ₹${item.amount} (${item.type}) - ${item.date} ${item.time}`,
            10,
            y
        );

        y += 10;

        // new page if overflow
        if (y > 280) {
            doc.addPage();
            y = 10;
        }

    });

    doc.save("expense-report.pdf");
});