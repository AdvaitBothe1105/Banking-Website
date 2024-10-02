document.addEventListener('DOMContentLoaded', function() {
    const contentSections = document.querySelectorAll('.content > *:not(#nav-placeholder)');
    const depform = document.getElementById('dep-form');
    const dep_sec = document.getElementById('dep-sec');
    const customDurationOption = document.getElementById('customDurationOption');
    const customDurationDiv = document.getElementById('customDurationDiv');
    const amountInput = document.getElementById('amount');
    const errorMessage = document.getElementById('amount-error');
    const balanceElement = document.getElementById('balance');
    const otp_form = document.querySelector('.otp-box');
    const submitButton = document.getElementById('sub-btn');

    // Ensure the button has type="button" to prevent form submission
    submitButton.setAttribute('type', 'button');

    // Initially hide the deposit form and OTP form
    depform.classList.add('hidden');
    otp_form.classList.add('hidden');

    // Function to show the deposit form
    function showDepForm() {
        contentSections.forEach(section => section.classList.add('hidden'));
        depform.classList.remove('hidden');
        dep_sec.classList.add('hidden');
    }

    // Event listener to show the deposit form when "Fixed Deposit" is clicked
    document.getElementById('fix-dep').addEventListener('click', function() {
        showDepForm();
    });

    // Function to show the OTP form and hide the deposit form
    function showOtpForm() {
        otp_form.classList.remove('hidden');
        otp_form.classList.add('visible');
        depform.classList.add('hidden');  // Hide the deposit form
        depform.classList.remove('visible');
    }

    // Prevent form submission and show OTP form
    submitButton.addEventListener('click', function(event) {
        event.preventDefault();  // Prevent the form from reloading the page
        console.log("Submit button clicked");  // Debugging message
        showOtpForm();  // Show OTP form and hide deposit form
    });

    // Show or hide custom duration fields based on radio button selection
    document.querySelectorAll('input[name="investmentOption"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (customDurationOption.checked) {
                customDurationDiv.style.display = 'block';
            } else {
                customDurationDiv.style.display = 'none';
            }
        });
    });
    // Validate amount input (show error if less than 5000 or more than balance)
    amountInput.addEventListener('input', function() {
        
        // Check if the amount entered is less than 5000
        if (amountInput.value && amountInput.value < 5000) {
            errorMessage.style.display = 'block';  // Show error message
        } else {
            errorMessage.style.display = 'none';  // Hide error message
        }

        if (balanceElement.value < amountInput.value) {
            errorMessage.style.display = "block";
            errorMessage.textContent = "Entered amount is less than the balance"
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const submitButton = document.getElementById('sub-btn');
    const amountInput = document.getElementById('amount');
    const balanceElement = document.getElementById('balance');
    const investmentOptions = document.querySelectorAll('input[name="investmentOption"]');
    const customDurationDiv = document.getElementById('customDurationDiv');
    const yearsDropdown = document.getElementById('yearsDropdown');
    const monthsDropdown = document.getElementById('monthsDropdown');
    const interestSelect = document.getElementById('location');
    const amountError = document.getElementById('amount-error');


    submitButton.disabled = true;

    // Function to check if the custom duration option is selected
    function isCustomDurationSelected() {
        return document.getElementById('customDurationOption').checked;
    }

    // Function to validate form
    function validateForm() {
        const amountValue = parseFloat(amountInput.value);
        const isAmountValid = amountValue >= 5000;
        const isInvestmentOptionSelected = Array.from(investmentOptions).some(option => option.checked);
        const isInterestSelectFilled = interestSelect.value !== '';
        
        // Show error message if amount is invalid
        if (!isAmountValid) {
            amountError.style.display = 'block';
        } else {
            amountError.style.display = 'none';
        }

        // Enable submit button only if all fields are valid
        if (isAmountValid && isInvestmentOptionSelected && isInterestSelectFilled) {
            submitButton.disabled = false;
        } else {
            submitButton.disabled = true;
        }
    }

    // Show/Hide custom duration options based on radio selection
    investmentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (isCustomDurationSelected()) {
                customDurationDiv.style.display = 'block';
            } else {
                customDurationDiv.style.display = 'none';
            }
            validateForm(); // Re-validate when changing options
        });
    });

    // Add event listeners to inputs
    amountInput.addEventListener('input', validateForm);
    yearsDropdown.addEventListener('change', validateForm);
    monthsDropdown.addEventListener('change', validateForm);
    interestSelect.addEventListener('change', validateForm);
});

document.querySelectorAll('input[name="investmentOption"]').forEach(option => {
    option.addEventListener('change', function () {
        let interestRate;

        // Determine the interest rate based on the selected option
        if (this.value === '1-year') {
            interestRate = 7.4;
        } else if (this.value === '1-year-11-months') {
            interestRate = 7.3;
        } else if (this.value === 'custom') {
            interestRate = null;  // Handle custom case if needed
        }

        // Display the interest rate if an option is selected
        if (interestRate) {
            document.getElementById('interest-rate-display').style.display = 'block';
            document.getElementById('interest-rate-value').innerText = interestRate;
        } else {
            document.getElementById('interest-rate-display').style.display = 'none';
        }
    });
});


document.getElementById('sub-btn').addEventListener('click', async function(e) {
    e.preventDefault();
    // showOtpSec();
    // const amount = document.getElementById('amount').value;
    // console.log(amount);
    


    // Send a request to your backend to trigger SMS sending
    const senderAccNo = document.getElementById('account_number').textContent; 
    console.log(senderAccNo);
    
    const amount = document.getElementById('amount').value;
    console.log(amount);
    const investmentOption = document.querySelector('input[name="investmentOption"]:checked')?.value;
    const customYears = document.getElementById('yearsDropdown').value;
    const customMonths = document.getElementById('monthsDropdown').value;
    const interestRate = document.getElementById('interest-rate-value').innerText;

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

document.getElementById('pay-btn').addEventListener('click', async function (e) {

    const senderAccNo = document.getElementById('acc_no').textContent // Sender account number (you should set this when they log in)
    const receiverAccNo = '9987027807';
    const amount = document.getElementById('amount').value;
    const otp = document.getElementById('otp').value;
    const investmentOption = document.querySelector('input[name="investmentOption"]:checked')?.value;
    const customYears = document.getElementById('yearsDropdown').value;
    const customMonths = document.getElementById('monthsDropdown').value;
    const interestRate = document.getElementById('interest-rate-value').innerText;
    const dep_type = 'Fixed';



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
                const response = await fetch('http://127.0.0.1:3000/make-deposit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        senderAccNo,
                        dep_type,
                        amount,
                        investmentOption,
                        interestRate,
                    }),
                });
        
                const data = await response.json();
                
                if (response.ok) {
                    alert('Deposit successful! We will send you all the details regarding it on your phone and email.');
                    window.location.href = "Investments.html";
                } else {
                    alert('Failed to make deposit: ' + data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred while processing your deposit.');
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
    
})
