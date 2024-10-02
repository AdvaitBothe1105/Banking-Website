const transfer_btn = document.getElementById('one-time')
const transfer_opt = document.getElementById('one-time-opt')
const ben_btn = document.getElementById('beneficiaries')
const ben_opt = document.getElementById('ben-opt')
const man_btn = document.getElementById('manage-funds')
const man_opt = document.getElementById('manage-funds-opt')
const select_opt = document.getElementById('location')

transfer_btn.addEventListener('click', () => {
    transfer_opt.style.display = "block"
    transfer_opt.style.display = "flex";
    ben_opt.style.display = "none"
    man_opt.style.display = "none"
})

ben_btn.addEventListener('click', () => {
    ben_opt.style.display = "block"
    ben_opt.style.display = "flex"
    transfer_opt.style.display = "none"
    man_opt.style.display = "none"

})

man_btn.addEventListener('click', () => {
    man_opt.style.display = "block"
    ben_opt.style.display = "none"
    transfer_opt.style.display = "none"
})

document.addEventListener('DOMContentLoaded', function() {
    const oneTimeTransferButton = document.getElementById('tranfer-wo');
    const transferForm = document.getElementById('transferForm');
    const contentSections = document.querySelectorAll('.content > *:not(#nav-placeholder)');
    const sidebarPlaceholder = document.getElementById('nav-placeholder');
    const otp_sec = document.getElementById('otp-form');
    const submitMsg = document.getElementById('submitMsg');
    const transferFormSubmit = document.getElementById('sub-btn');
    const oneTimeOpt = document.getElementById('one-time-opt'); // To hide transfer options

    function showTransferForm() {
        contentSections.forEach(section => section.classList.add('hidden'));
        transferForm.classList.remove('hidden');
        transferForm.classList.add('visible');
        oneTimeOpt.style.display = "none";
    }

    function showotp_sec() {
        contentSections.forEach(section => section.classList.add('hidden'));

        otp_sec.classList.remove('hidden');
        otp_sec.classList.add('visible');

        transferForm.classList.remove('visible');
        transferForm.classList.add('hidden');
    }
    function showContent() {
        contentSections.forEach(section => section.classList.remove('hidden'));

        transferForm.classList.remove('visible');
        transferForm.classList.add('hidden');

        otp_sec.classList.remove('visible');
        otp_sec.classList.add('hidden');
    }

    oneTimeTransferButton.addEventListener('click', function() {
        showTransferForm();
    });

    document.getElementById('back-button').addEventListener('click', function() {
        showContent();
    });

    transferFormSubmit.addEventListener('click', function(event) {
        
        event.preventDefault();
        showotp_sec(); 
    });

    transferForm.classList.add('hidden');
    otp_sec.classList.add('hidden');
    submitMsg.classList.add('hidden');

});

document.addEventListener('DOMContentLoaded', function() {
    const transferFormSubmit = document.getElementById('sub-btn');
    const recipientAccount = document.getElementById('recipientAccount');
    const confirmRecipientAccount = document.getElementById('confirmRecipientAccount');
    const ifscCode = document.getElementById('ifscCode');
    const amount = document.getElementById('amount');
    const bankSelect = document.getElementById('location');
    const passwordMessage = document.getElementById('passwordMessage');

    // Disable submit button initially
    transferFormSubmit.disabled = true;

    // Function to validate the form
    function validateForm() {
        const isAccountMatch = recipientAccount.value === confirmRecipientAccount.value;
        const isFormComplete = recipientAccount.value && confirmRecipientAccount.value && ifscCode.value && amount.value && bankSelect.value;
        
        if (!isAccountMatch) {
            passwordMessage.style.display = 'block';
        } else {
            passwordMessage.style.display = 'none';
        }

        // Enable submit button only if all fields are filled and account numbers match
        transferFormSubmit.disabled = !(isFormComplete && isAccountMatch);
    }

    // Listen for input changes and validate form
    recipientAccount.addEventListener('input', validateForm);
    confirmRecipientAccount.addEventListener('input', validateForm);
    ifscCode.addEventListener('input', validateForm);
    amount.addEventListener('input', validateForm);
    bankSelect.addEventListener('change', validateForm);
});




function updateIFSC() {
    const bankSelect = document.getElementById("location");
    const ifscInput = document.getElementById("ifscCode");

    const bankIFSC = {
        "VYOMA": "VYOMA12334",
        "KOTAK": "KOTAK56789",
        "SBI": "SBI98765"
    };

    const selectedBank = bankSelect.value;
    ifscInput.value = bankIFSC[selectedBank] || "";
}


const accountNumber = document.getElementById('recipientAccount');
const confirmAccountNumber = document.getElementById('confirmRecipientAccount');
const message = document.getElementById('passwordMessage');

confirmAccountNumber.addEventListener('input', function() {
    // Compare the two values
    if (accountNumber.value !== confirmAccountNumber.value) {
        message.style.display = 'block'; // Show error message if they don't match
    } else {
        message.style.display = 'none'; // Hide the error message if they match
    }
});

// function sendOtp () {

//     let otp_val = Math.floor(Math.random() * 10000);
//     let email_body = `Your OTP is ${otp_val}`;
    
//     Email.send({
//         SecureToken: "14d4ecbe-0b05-47a5-882d-8e3f57f644ee",
//         To: 'leoadvait12@gmail.com',
//         From: "leoadvait12@gmail.com",
//         Subject: "This is the subject",
//         Body: email_body,
//     }).then(
//         message => {
//             // Try to log the full response from the API
//             console.log("API Response: ", message);
    
//             if (message === "OK") {
//                 alert("OTP sent to email successfully");
//             } else {
//                 alert("Something went wrong");
//             }
//         }
//     ).catch(error => {
//         console.error("Error in sending email: ", error);
//     });
    
    
// }

document.getElementById('pay-btn').addEventListener('click', async function () {
    // Capture the necessary details for the payment
    const senderAccNo = document.getElementById('acc_no').textContent // Sender account number (you should set this when they log in)
    const receiverAccNo = document.getElementById('recipientAccount').value;
    const amount = document.getElementById('amount').value;
    const otp = document.getElementById('otp').value;

    // Send the OTP for verification
    try {
        const response = await fetch('http://localhost:3000/verify-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ otp })
        });

        if (response.ok) {
            try {
                // Send a POST request to the backend to complete the payment
                const response = await fetch('http://localhost:3000/complete-payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ senderAccNo, receiverAccNo, amount }),
                });
        
                const result = await response.json();
        
                if (response.ok) {
                    alert(result.message);
                    console.log(amount);
                     // Display success message
                } else {
                    alert("Reciever not found");
                }
            } catch (error) {
                console.error('Error during payment:', error);
            }

            showSubmitMsg();
            alert('OTP verified. Transaction complete.');
            // Here, complete the transaction
        } else {
            alert('OTP verification failed.');
        }
    } catch (error) {
        console.error('Error:', error);
    }

    
});


document.getElementById('trans-btn').addEventListener('click', async () => {
    // Retrieve account number from the page
    
    // Retrieve the account number from the URL
    

        try {
            // First fetch: Get the user's details using CRN
            const crn = localStorage.getItem('crn');
            console.log(crn);
            const userResponse = await fetch(`http://localhost:3000/user-details/${crn}`);
            const userDetails = await userResponse.json();
            console.log(userDetails);
    
            if (userResponse.ok) {
                const accountNumber = userDetails.account_number;
                console.log(accountNumber);
                
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
                    const transactionElement = document.createElement('p');
                    transactionElement.className = 'item';
    
                    // Determine the icon and sign based on whether the account is sender or receiver
                    const isSender = transaction.sender_acc_id === accountNumber;
                    const iconClass = isSender ? 'fa-arrow-trend-up' : 'fa-hand-holding-dollar';
                    const sign = isSender ? '-' : '+';
                    const iconColor = isSender ? 'red' : 'cyan'; // Color for the icon
    
                    transactionElement.innerHTML = `
                        <i class="fa-solid ${iconClass}" style="color:${iconColor};"></i>
                        ${new Date(transaction.transaction_date).toLocaleDateString()}   
                        <span>${transaction.transaction_id}</span>
                        <span>${sign}₹${parseFloat(transaction.amount).toFixed(2)}</span>
                    `;
    
                    transactionsContainer.appendChild(transactionElement);
                    transactionsContainer.appendChild(document.createElement('hr'));
                });
    
                // Add buttons at the end of the list
                transactionsContainer.innerHTML += `
                    <a href="http://127.0.0.1:3000/download-transactions-pdf/${accountNumber}" class="money-btn btn btn-primary" id="download-pdf-btn"><i class="fa-solid fa-newspaper"></i> Download Statements</a>
                    <a href="fund.html" class="money-btn btn btn-primary"><i class="fa-solid fa-hand-holding-dollar"></i> Transfer Money</a>
                `;
            } else {
                document.getElementById('error-message').textContent = userDetails.message;
            }
        } catch (error) {
            console.error('Error fetching user details or transactions:', error);
            document.getElementById('error-message').textContent = 'Error loading user details or transactions.';
        }
    
    
});

document.getElementById('sub-btn').addEventListener('click', async function(e) {
    e.preventDefault();
    // showOtpSec();
    // const amount = document.getElementById('amount').value;
    // console.log(amount);
    


    // Send a request to your backend to trigger SMS sending
    const senderAccNo = document.getElementById('account_number').textContent; 
    console.log(senderAccNo);
    // Fetch sender account number
    const amount = document.getElementById('amount').value;
    console.log(amount);
     // Fetch transfer amount
    const MINIMUM_BALANCE = 5000;

    try {
        // Step 1: Check the balance first
        const balanceResponse = await fetch('http://127.0.0.1:3000/check-balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ senderAccNo, amount, MINIMUM_BALANCE })
        });

        if (balanceResponse.ok) {
            const balanceData = await balanceResponse.json();

            if (balanceData.sufficientBalance) {
                // Step 2: If balance is sufficient, send SMS
                const smsResponse = await fetch('http://127.0.0.1:3000/send-sms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (smsResponse.ok) {
                    const smsData = await smsResponse.json();
                    alert('OTP sent. Please check your phone.');
                } else {
                    alert('Failed to send OTP.');
                }
            } else {
                alert('Insufficient balance. Please maintain a minimum balance of 5000.');
                window.location.href = "fund.html";
            }
        } else {
            alert('Insufficient balance. Please maintain a minimum balance of 5000.');
            window.location.href = "fund.html";
            
        }

    } catch (error) {
        console.error('Error:', error);
    }
});

function showOtpSec() {
        const contentSections = document.querySelectorAll('.content > *:not(#nav-placeholder)');
        const transferForm = document.getElementById('transferForm');
        const otp_sec = document.getElementById('otp-form');
        contentSections.forEach(section => section.classList.add('hidden'));

        otp_sec.classList.remove('hidden');
        otp_sec.classList.add('visible');

        transferForm.classList.remove('visible');
        transferForm.classList.add('hidden');
}

// document.getElementById('pay-btn').addEventListener('click', async function(e) {
//     e.preventDefault();
//     const otp = document.getElementById('otp').value;

//     // Send the OTP for verification
//     try {
//         const response = await fetch('/verify-otp', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ otp })
//         });

//         if (response.ok) {

//             showSubmitMsg();
//             alert('OTP verified. Transaction complete.');
//             // Here, complete the transaction
//         } else {
//             alert('OTP verification failed.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// });

function showSubmitMsg() {
    const submitMsg = document.getElementById('submitMsg');
    const otp_sec = document.getElementById('otp-form');
    const transferForm = document.getElementById('transferForm');
    const contentSections = document.querySelectorAll('.content > *:not(#nav-placeholder)');

    contentSections.forEach(section => section.classList.add('hidden'));

    submitMsg.classList.remove('hidden');
    submitMsg.classList.add('visible');
    
    otp_sec.classList.remove('visible');
    otp_sec.classList.add('hidden');

    transferForm.classList.remove('visible');
    transferForm.classList.add('hidden');
    }


    document.getElementById('download-pdf-btn').addEventListener('click', function(e) {
        e.preventDefault();
    
        // Replace `accountNumber` with the actual account number
        const accountNumber = document.getElementById('account_number').textContent;
    
        // Trigger the download
        window.location.href = `http://127.0.0.1:3000/download-transactions-pdf/${accountNumber}`;
    });
    

    // document.getElementById('logout').addEventListener('click', function logout() {
    //     localStorage.removeItem('cust_name');
    //     localStorage.removeItem('crn');
    //     window.location.href = 'login.html';
    // })