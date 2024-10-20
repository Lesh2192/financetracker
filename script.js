let transactions = [];
const transactionList = document.getElementById("transactionList");
const totalBalance = document.getElementById("totalBalance");
const filterType = document.getElementById("filterType");
const startDateInput = document.getElementById("startDate");
const endDateInput = document.getElementById("endDate");
const addTransactionButton = document.getElementById("addTransaction");

addTransactionButton.addEventListener("click", addTransaction);
document
  .getElementById("filterTransactions")
  .addEventListener("click", displayTransactions);

function addTransaction() {
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const type = document.getElementById("type").value;

  if (description === "" || isNaN(amount) || amount <= 0) {
    alert("Veuillez entrer une description et un montant valide.");
    return;
  }

  const transaction = {
    description,
    amount,
    type,
    date: new Date().toISOString().split("T")[0],
  };

  transactions.push(transaction);
  displayTransactions();

  // Réinitialiser les champs avec animation
  const inputs = [
    document.getElementById("description"),
    document.getElementById("amount"),
  ];
  inputs.forEach((input) => {
    input.style.transition = "all 0.3s ease";
    input.style.backgroundColor = "#e6ffe6";
    setTimeout(() => {
      input.value = "";
      input.style.backgroundColor = "";
    }, 300);
  });
}

function displayTransactions() {
  transactionList.innerHTML = "";
  let balance = 0;

  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);
  endDate.setHours(23, 59, 59, 999);

  const expensesData = {};
  let hasTransactions = false;

  transactions.forEach((transaction, index) => {
    const transactionDate = new Date(transaction.date);
    if (
      (filterType.value === "all" || transaction.type === filterType.value) &&
      (isNaN(startDate) || transactionDate >= startDate) &&
      (isNaN(endDate) || transactionDate <= endDate)
    ) {
      hasTransactions = true;

      const li = document.createElement("li");
      li.innerHTML = `
        ${transaction.date} - ${transaction.description}: 
        ${transaction.type === "income" ? "+" : "-"}${transaction.amount} €
        <div>
          <button onclick="editTransaction(${index})">Éditer</button>
          <button onclick="deleteTransaction(${index})">Supprimer</button>
        </div>
      `;
      li.style.animation = `fadeIn 0.5s ease ${index * 0.1}s both`;
      transactionList.appendChild(li);

      balance +=
        transaction.type === "income"
          ? transaction.amount
          : -transaction.amount;

      if (transaction.type === "expense") {
        const category = transaction.description;
        expensesData[category] =
          (expensesData[category] || 0) + transaction.amount;
      }
    }
  });

  // Animer le changement de solde
  animateNumber(totalBalance, parseFloat(totalBalance.innerText), balance);

  if (!hasTransactions) {
    const li = document.createElement("li");
    li.innerText = "Aucune transaction à afficher pour cette période.";
    li.style.animation = "slideIn 0.5s ease";
    transactionList.appendChild(li);
  }

  updateChart(expensesData);
}

function updateChart(data) {
  const ctx = document.getElementById("expensesChart").getContext("2d");
  const labels = Object.keys(data);
  const values = Object.values(data);

  if (window.expensesChart) {
    window.expensesChart.destroy();
  }

  if (labels.length === 0) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }

  window.expensesChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Dépenses par catégorie",
          data: values,
          backgroundColor: "rgba(94, 106, 210, 0.6)",
          borderColor: "rgba(94, 106, 210, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
      animation: {
        duration: 1000,
        easing: "easeOutQuart",
      },
    },
  });
}

function editTransaction(index) {
  const transaction = transactions[index];
  document.getElementById("description").value = transaction.description;
  document.getElementById("amount").value = transaction.amount;
  document.getElementById("type").value = transaction.type;
  deleteTransaction(index);
}

function deleteTransaction(index) {
  transactions.splice(index, 1);
  displayTransactions();
}

function animateNumber(element, start, end) {
  let current = start;
  const increment = (end - start) / 50;
  const timer = setInterval(() => {
    current += increment;
    element.innerText = current.toFixed(2);
    if (
      (increment > 0 && current >= end) ||
      (increment < 0 && current <= end)
    ) {
      clearInterval(timer);
      element.innerText = end.toFixed(2);
    }
  }, 20);
}
