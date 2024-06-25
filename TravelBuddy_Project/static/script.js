let totalAmount = document.getElementById("total-amount");
let userAmount = document.getElementById("user-amount");
const checkAmountButton = document.getElementById("check-amount");
const totalAmountButton = document.getElementById("total-amount-button");
const productTitle = document.getElementById("product-title");
const errorMessage = document.getElementById("budget-error");
const productTitleError = document.getElementById("product-title-error");
const productCostError = document.getElementById("product-cost-error");
const amount = document.getElementById("amount");
const expenditureValue = document.getElementById("expenditure-value");
const balanceValue = document.getElementById("balance-amount");
const list = document.getElementById("list");
let tempAmount = 0;


totalAmountButton.addEventListener("click", () => {
  tempAmount = totalAmount.value;
 
  if (tempAmount === "" || tempAmount < 0) {
    errorMessage.classList.remove("hide");
  } else {
    errorMessage.classList.add("hide");
    
    amount.innerHTML = tempAmount;
   
    balanceValue.innerText = tempAmount - expenditureValue.innerText;
    
    totalAmount.value = "";
  }
});

//edit delete 
const disableButtons = (bool) => {
  let editButtons = document.getElementsByClassName("edit");
  Array.from(editButtons).forEach((element) => {
    element.disabled = bool;
  });
};

//modyfikacja elementow listy
const modifyElement = (element, edit = false) => {
  let parentDiv = element.parentElement;
  let currentBalance = balanceValue.innerText;
  let currentExpense = expenditureValue.innerText;
  let parentAmount = parentDiv.querySelector(".amount").innerText;
  if (edit) {
    let parentText = parentDiv.querySelector(".product").innerText;
    productTitle.value = parentText;
    userAmount.value = parentAmount;
    disableButtons(true);
  }
  balanceValue.innerText = parseInt(currentBalance) + parseInt(parentAmount);
  expenditureValue.innerText =
    parseInt(currentExpense) - parseInt(parentAmount);
  parentDiv.remove();
};

//tworzenie listy
const listCreator = (expenseName, expenseValue) => {
  let sublistContent = document.createElement("div");
  sublistContent.classList.add("sublist-content", "flex-space");
  list.appendChild(sublistContent);
  sublistContent.innerHTML = `<p class="product">${expenseName}</p><p class="amount">${expenseValue}</p>`;
  let editButton = document.createElement("button");
  editButton.classList.add("fa-solid", "fa-pen-to-square", "edit");
  editButton.style.fontSize = "1.2em";
  editButton.addEventListener("click", () => {
    modifyElement(editButton, true);
  });
  let deleteButton = document.createElement("button");
  deleteButton.classList.add("fa-solid", "fa-trash-can", "delete");
  deleteButton.style.fontSize = "1.2em";
  deleteButton.addEventListener("click", () => {
    modifyElement(deleteButton);
  });
  sublistContent.appendChild(editButton);
  sublistContent.appendChild(deleteButton);
  document.getElementById("list").appendChild(sublistContent);
};

//dodawanie wydatkow
checkAmountButton.addEventListener("click", () => {
  
  if (!userAmount.value || !productTitle.value) {
    productTitleError.classList.remove("hide");
    return false;
  }
  
  disableButtons(false);
  
  let expenditure = parseInt(userAmount.value);
  
  let sum = parseInt(expenditureValue.innerText) + expenditure;
  expenditureValue.innerText = sum;
  
  const totalBalance = tempAmount - sum;
  balanceValue.innerText = totalBalance;
  
  listCreator(productTitle.value, userAmount.value);
 
  productTitle.value = "";
  userAmount.value = "";
});

document.getElementById('search-form').addEventListener('submit', function(event) {
    event.preventDefault();

    let formData = new FormData(this);

    fetch('/search', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        let resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        if (data.error) {
            resultsDiv.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
            return;
        }

        let flights = data.flights;
        let html = `
            <div class="flight-results">
                <ul class="list-group">`;

        flights.forEach((flight, index) => {
            let lastFlightSegment = flight.flights[flight.flights.length - 1];
            html += `
                <li class="list-group-item">
                    <div class="flight-info">
                        <strong>Flight:</strong> ${flight.flights[0].departure_airport.name} to ${lastFlightSegment.arrival_airport.name}<br>
                        <strong>Price:</strong> ${flight.price} USD<br>
                        <strong>Duration:</strong> ${flight.total_duration} minutes<br>
                        <strong>Departure:</strong> ${flight.flights[0].departure_airport.time}<br>
                        <strong>Arrival:</strong> ${lastFlightSegment.arrival_airport.time}<br>
                        <strong>Airline:</strong> <img src="${flight.airline_logo}" alt="Airline logo" class="airline-logo"> ${lastFlightSegment.airline}<br>
                        <button class="add-to-expenses" onclick="addFlightToExpenses('${flight.price}', 'Flight from ${flight.flights[0].departure_airport.name} to ${lastFlightSegment.arrival_airport.name}')">
                            🛒
                        </button>
                        <button class="toggle-details" onclick="toggleFlightDetails(${index})">
                            📋
                        </button>
                    </div>
                    <div class="flight-details" id="flight-details-${index}" style="display:none;">
                        <!-- Detailed flight information will go here -->
                        <strong>Segments:</strong>
                        <ul>`;
            flight.flights.forEach(segment => {
                html += `
                    <li>
                        <strong>${segment.airline}</strong>: ${segment.departure_airport.name} (${segment.departure_airport.time}) 
                        to ${segment.arrival_airport.name} (${segment.arrival_airport.time})<br>
                        <strong>Duration:</strong> ${segment.duration} minutes<br>
                    </li>`;
            });
            html += `
                        </ul>
                    </div>
                </li>
                <hr>`;
        });

        html += `
                </ul>
            </div>`;
        resultsDiv.innerHTML = html;
    })
    .catch(error => console.error('Error:', error));
});

function addFlightToExpenses(price, description) {
    let userAmount = document.getElementById("user-amount");
    let productTitle = document.getElementById("product-title");

    userAmount.value = price;
    productTitle.value = description;

    document.getElementById("check-amount").click();
}

function toggleFlightDetails(index) {
    let details = document.getElementById(`flight-details-${index}`);
    if (details.style.display === 'none') {
        details.style.display = 'block';
    } else {
        details.style.display = 'none';
    }
}


//QUIZZZZZ

          document.getElementById('quiz-form').addEventListener('submit', function(event) {
            event.preventDefault();
    
            const climate = document.querySelector('input[name="climate"]:checked').value;
            const activities = document.querySelector('input[name="activities"]:checked').value;
            const budget = document.querySelector('input[name="budget"]:checked').value;
    
            let destination = '';
            let airportCode = '';
    
            if (climate === 'tropical' && activities === 'beach' && budget === 'low') {
              destination = 'Phuket, Thailand';
              airportCode = 'HKT';
          } else if (climate === 'tropical' && activities === 'beach' && budget === 'medium') {
              destination = 'Cancun, Mexico';
              airportCode = 'CUN';
          } else if (climate === 'tropical' && activities === 'beach' && budget === 'high') {
              destination = 'Maldives';
              airportCode = 'MLE';
          } else if (climate === 'tropical' && activities === 'adventure' && budget === 'low') {
              destination = 'Palawan, Philippines';
              airportCode = 'PPS';
          } else if (climate === 'tropical' && activities === 'adventure' && budget === 'medium') {
              destination = 'Bali, Indonesia';
              airportCode = 'DPS';
          } else if (climate === 'tropical' && activities === 'adventure' && budget === 'high') {
              destination = 'Costa Rica';
              airportCode = 'SJO';
          } else if (climate === 'temperate' && activities === 'beach' && budget === 'low') {
              destination = 'Lisbon, Portugal';
              airportCode = 'LIS';
          } else if (climate === 'temperate' && activities === 'beach' && budget === 'medium') {
              destination = 'Nice, France';
              airportCode = 'NCE';
          } else if (climate === 'temperate' && activities === 'beach' && budget === 'high') {
              destination = 'Santorini, Greece';
              airportCode = 'JTR';
          } else if (climate === 'temperate' && activities === 'adventure' && budget === 'low') {
              destination = 'Portland, Oregon';
              airportCode = 'PDX';
          } else if (climate === 'temperate' && activities === 'adventure' && budget === 'medium') {
              destination = 'Queenstown, New Zealand';
              airportCode = 'ZQN';
          } else if (climate === 'temperate' && activities === 'adventure' && budget === 'high') {
              destination = 'Swiss Alps, Switzerland';
              airportCode = 'ZRH';
          } else if (climate === 'temperate' && activities === 'culture' && budget === 'low') {
              destination = 'Prague, Czech Republic';
              airportCode = 'PRG';
          } else if (climate === 'temperate' && activities === 'culture' && budget === 'medium') {
              destination = 'Florence, Italy';
              airportCode = 'FLR';
          } else if (climate === 'temperate' && activities === 'culture' && budget === 'high') {
              destination = 'Kyoto, Japan';
              airportCode = 'KIX';
          } else if (climate === 'cold' && activities === 'beach' && budget === 'low') {
              destination = 'Newfoundland, Canada';
              airportCode = 'YYT';
          } else if (climate === 'cold' && activities === 'beach' && budget === 'medium') {
              destination = 'Falkland Islands';
              airportCode = 'MPN';
          } else if (climate === 'cold' && activities === 'beach' && budget === 'high') {
              destination = 'South Georgia and the South Sandwich Islands';
              airportCode = 'SGSSI';
          } else if (climate === 'cold' && activities === 'adventure' && budget === 'low') {
              destination = 'Svalbard, Norway';
              airportCode = 'LYR';
          } else if (climate === 'cold' && activities === 'adventure' && budget === 'medium') {
              destination = 'Reykjavik, Iceland';
              airportCode = 'KEF';
          } else if (climate === 'cold' && activities === 'adventure' && budget === 'high') {
              destination = 'Antarctica';
              airportCode = 'ATC';
          } else if (climate === 'cold' && activities === 'culture' && budget === 'low') {
              destination = 'Tallinn, Estonia';
              airportCode = 'TLL';
          } else if (climate === 'cold' && activities === 'culture' && budget === 'medium') {
              destination = 'St. Petersburg, Russia';
              airportCode = 'LED';
          } else if (climate === 'cold' && activities === 'culture' && budget === 'high') {
              destination = 'Vienna, Austria';
              airportCode = 'VIE';
          } else {
              destination = 'Barcelona, Spain';
              airportCode = 'BCN';
          }
    
            document.getElementById('destination').innerText = `Your perfect destination is ${destination}. The airport code is ${airportCode}.`;
            document.getElementById('result').style.display = 'block';
        });
