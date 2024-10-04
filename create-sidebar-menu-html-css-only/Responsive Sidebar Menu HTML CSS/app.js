const assets = document.getElementById('assets-btn');
const liab = document.getElementById('liab-btn')
const asset_txt  = document.getElementById('asset-txt')
const liab_txt  = document.getElementById('liab-txt')


assets.addEventListener('click', () => {
    asset_txt.style.display = "block";
})

liab.addEventListener('click', () => {
    liab_txt.style.display = "block";
})

document.getElementById('logout').addEventListener('click', function logout() {
    localStorage.removeItem('cust_name');
    localStorage.removeItem('crn');
    window.location.href = 'login.html';
})


document.addEventListener('DOMContentLoaded', async () => {
    // Retrieve account number from the page
    
    const crn = localStorage.getItem('crn');
    console.log(crn);
        try {
            // First fetch: Get the user's details using CRN
            const userResponse = await fetch(`http://localhost:3000/user-details/${crn}`);
            const userDetails = await userResponse.json();
            console.log(userDetails);
    
            if (userResponse.ok) {
                const accountNumber = userDetails.account_number;
                const sender_name = userDetails.cust_name
                document.getElementById('account_number').textContent = accountNumber;
    
                // Second fetch: Get the user's transactions using the account number
                const transactionResponse = await fetch(`http://127.0.0.1:3000/get-transactions/${accountNumber}`);
                if (!transactionResponse.ok) {
                    throw new Error('Network response for transactions was not ok');
                }
    
                const transactions = await transactionResponse.json();
                console.log(transactions);
    
                // Clear and update transactions in the container
                const transactionsContainer = document.querySelector('.recent-trans .card-body');
                transactionsContainer.innerHTML = '<h5 class="card-title">Recent Transactions</h5>';
    
                transactions.forEach(transaction => {
                    const transactionElement = document.createElement('div'); // Change <p> to <div> for better layout control
                    transactionElement.className = 'item';
                    transactionElement.style.display = 'flex';
                    transactionElement.style.justifyContent = 'space-evenly';
                    transactionElement.style.alignItems = 'center'; // Align items vertically in the center
    
                    // Determine the icon and sign based on whether the account is sender or receiver
                    const isSender = transaction.sender_acc_id === accountNumber;
                    const iconClass = isSender ? 'fa-arrow-trend-up' : 'fa-hand-holding-dollar';
                    const sign = isSender ? '-' : '+';
                    const iconColor = isSender ? 'red' : 'cyan'; // Color for the icon
    
                    transactionElement.innerHTML = `
                        <i class="fa-solid ${iconClass}" style="color:${iconColor};"></i>
                        ${new Date(transaction.transaction_date).toLocaleDateString()}   
                        <span>${transaction.transaction_id} / ${transaction.rec_cust_name} / ${transaction.sender_acc_id} / Online</span>
                        <span>${sign}₹${parseFloat(transaction.amount).toFixed(2)}</span>
                    `;
    
                    transactionsContainer.appendChild(transactionElement);
                    transactionsContainer.appendChild(document.createElement('hr'));
                });
    
                // Add buttons at the end of the list
                transactionsContainer.innerHTML += `
                <a href="fund.html?accountNumber=${accountNumber}" class="money-btn btn btn-primary"><i class="fa-solid fa-hand-holding-dollar"></i> Transfer Money</a>
                <a href="http://127.0.0.1:3000/download-transactions-pdf/${accountNumber}" class="money-btn btn btn-primary" id="download-pdf-btn"><i class="fa-solid fa-newspaper"></i> Download Statements</a>
            `;
            } else {
                document.getElementById('error-message').textContent = userDetails.message;
            }
        } catch (error) {
            console.error('Error fetching user details or transactions:', error);
            document.getElementById('error-message').textContent = 'Error loading user details or transactions.';
        }
    
    
});

document.getElementById('download-pdf-btn').addEventListener('click', function(e) {
    e.preventDefault();

    // Replace `accountNumber` with the actual account number
    const accountNumber = document.getElementById('account_number').textContent;

    // Trigger the download
    window.location.href = `http://127.0.0.1:3000/download-transactions-pdf/${accountNumber}`;
});

