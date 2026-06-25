let transactions = JSON.parse(localStorage.getItem("transactions")) || [];


const form = document.getElementById("transaction-form");
const list = document.getElementById("transaction-list");


form.addEventListener("submit", addTransaction);



function addTransaction(e){

    e.preventDefault();


    let title = document.getElementById("title").value;

    let amount = Number(
        document.getElementById("amount").value
    );

    let type = document.getElementById("type").value;



    let transaction = {

        id: Date.now(),
        title,
        amount,
        type

    };


    transactions.push(transaction);


    saveData();

    updateUI();

    form.reset();

}




function updateUI(){

    list.innerHTML="";

    let income = 0;
    let expense = 0;


    let searchText = document.getElementById("search").value.toLowerCase();
    let filterValue = document.getElementById("filter").value;


    transactions.forEach(item => {

        // FILTER LOGIC
        if(filterValue !== "all" && item.type !== filterValue){
            return;
        }

        // SEARCH LOGIC
        if(!item.title.toLowerCase().includes(searchText)){
            return;
        }


        let li = document.createElement("li");

        li.innerHTML = `
        <div>
            <b>${item.title}</b>
            <br>
            ₹${item.amount}
        </div>

        <button onclick="deleteTransaction(${item.id})">
            Delete
        </button>
        `;


        if(item.type === "expense"){
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
    document.getElementById("search").addEventListener("input", updateUI);
    document.getElementById("filter").addEventListener("change", updateUI);
}




function deleteTransaction(id){


    transactions =
    transactions.filter(
        item => item.id !== id
    );


    saveData();

    updateUI();

}




function saveData(){

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );

}



updateUI();