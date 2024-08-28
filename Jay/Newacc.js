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
    alert('Form submitted successfully!');
});
