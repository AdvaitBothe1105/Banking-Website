document.getElementById('application-form').addEventListener('submit', function(event) {
    event.preventDefault();
    var mobileNumber = document.getElementById('mobile-number').value;
    var mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(mobileNumber)) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
    }
    var pincode = document.getElementById('pincode').value;
    var pincodePattern = /^[0-9]{6}$/;
    if (!pincodePattern.test(pincode)) {
        alert('Please enter a valid 6-digit PINCODE.');
        return;
    }
    openKycForm();
    alert('Form submitted successfully!');

});

document.getElementById('application-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Capture form data
    const formData = {
        name: document.getElementById('name').value,
        mobileNumber: document.getElementById('mobile-number').value,
        email: document.getElementById('email').value,
        pass: document.getElementById('pass').value,
        acctype: document.getElementById('acc-type').value,
        pincode: document.getElementById('pincode').value,
        city: document.getElementById('city').value,
    };

    try {
        // Send data to the server
        const response = await fetch('http://localhost:3000/submit-form', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok) {
            alert(`Form submitted successfully! Your CRN is: ${result.crn}`);
                // Hide the form section
            document.getElementById('form-sec').classList.add('hidden');

            // Show the KYC form
            document.getElementById('kyc-card').classList.remove('hidden');
            document.getElementById('kyc-card').classList.add('visible');
            
        } else {
            alert('There was a problem with your submission.');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
        alert('There was a problem submitting the form.');
    }
});

document.getElementById('pass').addEventListener('input', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const password = document.getElementById('pass').value;
    const passwordError = document.getElementById('password-error');

    const hasNumber = /\d/;
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

  
    if (password.length < 8) {
        passwordError.textContent = 'Password must be at least 8 characters long.';
    } else if (!hasNumber.test(password)) {
        passwordError.textContent = 'Password must contain at least one number.';
    } else if (!hasSpecialChar.test(password)) {
        passwordError.textContent = 'Password must contain at least one special character.';
    } else {

        passwordError.textContent = '';

    }
});


function openKycForm() {
    // Get the name value from the first form
    const nameValue = document.getElementById('name').value;

    // Set the name in the KYC form
    document.getElementById('kyc-cust-name').value = nameValue;
    // document.getElementById('hidden-cust-name').value = nameValue;


    // Show the KYC form
}

document.getElementById('kyc-form').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent form submission

    // Hide the form section
    
    const formData = new FormData();
    
    // Append form fields and files to FormData
    formData.append('cust_name', document.getElementById('kyc-cust-name').value);
    formData.append('aadhar', document.getElementById('aadhar').files[0]);
    formData.append('pan', document.getElementById('pan').files[0]);

    try {
        // Send the FormData to the server via fetch
        const response = await fetch('http://localhost:3000/upload', {
            method: 'POST',
            body: formData, // FormData object includes the files
        });

        // Handle the server response
        const result = await response.json();

        console.log('Response status:', response.status);
        console.log('Response data:', result);

        if (response.ok) {
            alert('Files uploaded successfully! Please wait for 30-35 mins while your account is being verified. Please check your phone for further updates.');
            document.getElementById('form-sec').classList.add('hidden')
            document.getElementById('kyc-card').classList.remove('visible');
            document.getElementById('kyc-card').classList.add('hidden');

            // Show the KYC form
            document.getElementById('otp-box').classList.remove('hidden');
            document.getElementById('otp-box').classList.add('visible');   
        } else {
            console.log(result);
            alert('There was a problem with your submission.');
        }
    } catch (error) {
        console.error('Error submitting form:', error);
    }

    // Ensure no page reload occurs
    return false; // Explicitly return false to prevent any default form actions

    // try {
    //     const response = await fetch('http://127.0.0.1:3000/send-sms', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         // body: JSON.stringify({})
    //     });

    //     if (response.ok) {
    //         const data = await response.json();
    //         alert('OTP sent. Please check your phone.');

    //         // Show OTP verification form
    //         // const contentSections = document.querySelectorAll('.content > *:not(#nav-placeholder)');
    //         // contentSections.forEach(section => section.classList.add('hidden'));
    //         // document.getElementById('transaction-form').style.display = 'none';
    //         // document.getElementById('otp-form').style.display = 'block';
    //     } else {
    //         alert('Failed to send OTP.');
    //     }
    // } catch (error) {
    //     console.error('Error:', error);
    // }

});

document.getElementById('pay-btn').addEventListener('click', async function () {
    // Capture the necessary details for the payment
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
            alert('OTP verified. Please check your phone or email for further updates.');
            // Here, complete the transaction
        } else {
            alert('OTP verification failed.');
        }
    } catch (error) {
        console.error('Error:', error);
    }

    
});



