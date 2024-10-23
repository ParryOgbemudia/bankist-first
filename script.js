'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2024-10-06T17:01:17.194Z',
    '2024-10-10T23:36:17.929Z',
    '2024-10-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2024-10-08T14:43:26.374Z',
    '2024-10-07T18:49:59.371Z',
    '2024-10-13T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

///////// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const formatMovemetDate = function (date, locale) {
  const calcDaysPassed = function (date1, date2) {
    return Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
  };

  const daysPassed = calcDaysPassed(new Date(), date);
  console.log(daysPassed);
  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    // const day = `${date.getDate()}`.padStart(2, '0');
    // const month = `${date.getMonth()}`.padStart(2, '0');
    // const year = date.getFullYear();

    // return `${day} /${month} /${year}`;
    return new Intl.DateTimeFormat(locale).format(date);
  }
};

//format currrency function(reuseable)
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

//Display movements
const displayMovements = function (currentAccount) {
  containerMovements.innerHTML = '';
  currentAccount.movements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(currentAccount.movementsDates[i]);

    const displayDate = formatMovemetDate(date, currentAccount.locale);

    const formattedCur = formatCur(
      mov,
      currentAccount.locale,
      currentAccount.currency
    );

    const html = `
        <div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formattedCur} </div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

//DIaplay balance
const calcDisplayBalance = function (currentAccount) {
  currentAccount.balance = currentAccount.movements.reduce(
    (acc, mov) => acc + mov,
    0
  );

  labelBalance.textContent = formatCur(
    currentAccount.balance,
    currentAccount.locale,
    currentAccount.currency
  );
};

//Display summary
const calcDisplaySummary = function (currentAccount) {
  const incomes = currentAccount.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumIn.textContent = formatCur(
    Math.abs(incomes),
    currentAccount.locale,
    currentAccount.currency
  );

  const out = currentAccount.movements
    .filter(mov => mov <= 0)
    .reduce((acc, mov) => acc + mov, 0);

  labelSumOut.textContent = formatCur(
    Math.abs(out),
    currentAccount.locale,
    currentAccount.currency
  );

  const interest = currentAccount.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * currentAccount.interestRate) / 100)
    .filter(mov => mov >= 1)
    .reduce((acc, int) => acc + int, 0);

  labelSumInterest.textContent = formatCur(
    Math.abs(interest),
    currentAccount.locale,
    currentAccount.currency
  );
};

//Create username
const createUsernames = function (accs) {
  accs.forEach(acc => {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};

console.log(createUsernames(accounts));

const updateUI = function (accs) {
  //display current account movement
  displayMovements(accs);

  //display current account balance
  calcDisplayBalance(accs);

  //display current account summary
  calcDisplaySummary(accs);
};

const startLogoutTimer = function () {
  //set time to 5mins
  let time = 120;
  let min = String(Math.trunc(time / 60)).padStart(2, 0);
  let sec = String(time % 60).padStart(2, 0);

  const tick = () => {
    labelTimer.textContent = `${min}: ${sec}`;

    //decrease 1s

    if (time === 0) {
      labelWelcome.textContent = `Login to get started`;
      containerApp.style.opacity = 0;

      clearInterval(timer);
    }

    time--;
    min = String(Math.trunc(time / 60)).padStart(2, 0);
    sec = String(time % 60).padStart(2, 0);
    //when 0s, stop timer and log out user
  };

  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

//Event handlers
let currentAccount, timer;

//To login user
btnLogin.addEventListener('click', function (e) {
  //prevents form from submitting
  e.preventDefault();

  const checkLogin = function (accounts) {
    currentAccount = accounts.find(
      acc => acc.username === inputLoginUsername.value
    );
    if (currentAccount?.pin === +inputLoginPin.value) {
      //display UI and Message
      labelWelcome.textContent = `Welcome back, ${
        currentAccount.owner.split(' ')[0]
      }`;
      labelWelcome.style.color = 'green';
      containerApp.style.opacity = 1;

      const now = new Date();

      const options = {
        hour: 'numeric',
        minute: 'numeric',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      };

      labelDate.textContent = new Intl.DateTimeFormat(
        currentAccount.locale,
        options
      ).format(now);
      // const day = `${now.getDate()}`.padStart(2, '0');
      // const month = `${now.getMonth()}`.padStart(2, '0');
      // const year = now.getFullYear();
      // const hour = `${now.getHours()}`.padStart(2, '0');
      // const minutes = `${now.getMinutes()}`.padStart(2, '0');

      // labelDate.textContent = `${day} /${month} /${year}, ${hour}:${minutes}`;

      //clear input fields
      inputLoginUsername.value = inputLoginPin.value = '';
      inputLoginPin.blur();

      if (timer) clearInterval(timer);
      timer = startLogoutTimer();

      updateUI(currentAccount);
    }
  };

  checkLogin(accounts);
});

//To transfer
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;

  const receiverAcc = function (accts) {
    const receivedAccnt = accts.find(
      acc => acc.username === inputTransferTo.value
    );

    inputTransferAmount.value = inputTransferTo.value = '';

    if (
      receivedAccnt &&
      amount > 0 &&
      amount <= currentAccount.balance &&
      receivedAccnt?.username !== currentAccount.username
    ) {
      //doing transfers
      receivedAccnt.movements.push(amount);
      currentAccount.movements.push(-amount);

      //updating transfer dates
      receivedAccnt.movementsDates.push(new Date().toISOString());
      currentAccount.movementsDates.push(new Date().toISOString());

      //update UI
      updateUI(currentAccount);

      //reset timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }
  };
  receiverAcc(accounts);
});

//Request a loan
btnLoan.addEventListener('click', e => {
  e.preventDefault();

  const requestedAmount = Math.floor(inputLoanAmount.value);

  setTimeout(() => {
    if (
      requestedAmount > 0 &&
      currentAccount.movements.some(dep => dep >= 0.1 * requestedAmount)
    ) {
      currentAccount.movements.push(requestedAmount);

      //update loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      //update UI
      updateUI(currentAccount);
    }

    inputLoanAmount.value = '';

    //reset timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }, 2500);
});

//Close account
btnClose.addEventListener('click', e => {
  e.preventDefault();
  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );

    console.log(index);
    accounts.splice(index, 1);

    containerApp.style.opacity = 0;
  }
});

let sorted = false; // Flag to track sort state

// Function to toggle sorting
const sortMovements = function (movements, ascending = true) {
  return ascending
    ? movements.slice().sort((a, b) => a - b) // Ascending
    : movements.slice().sort((a, b) => b - a); // Descending
};

// Sort button event handler
btnSort.addEventListener('click', e => {
  e.preventDefault();

  // Toggle sorting flag
  sorted = !sorted;

  // Sort movements based on current sorting state
  const sortedMovements = sortMovements(currentAccount.movements, sorted);

  // Clone the currentAccount object and update its movements with sorted ones
  const accountWithSortedMovements = {
    ...currentAccount,
    movements: sortedMovements,
  };

  // Display sorted movements
  displayMovements(accountWithSortedMovements);

  // Optionally change button label/icon
  btnSort.innerHTML = sorted ? `&uparrow; SORT` : `&downarrow; SORT`;
});
