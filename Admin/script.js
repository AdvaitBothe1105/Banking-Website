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
async function fetchVerificationData() {
    try {
        const response = await fetch('http://localhost:3000/admin/verification');
        const data = await response.json();

        const tableBody = document.querySelector('#verification-table tbody');
        tableBody.innerHTML = ''; // Clear any existing rows

        data.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.crn}</td>
                <td>${user.cust_name}</td>
                <td><a href="/uploads/${user.aadhar_file}">${user.aadhar_file}</a></td>
                <td><a href="/uploads/${user.pan_file}">${user.pan_file}</a></td>
                <td>${user.verified ? 'Yes' : 'No'}</td>
                <td>
                    <button class = "ver-btn" onclick="verifyUser('${user.crn}')">Verify</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching verification data:', error);
    }
}

// Call the function to fetch data on page load
fetchVerificationData();

async function verifyUser(crn) {
    try {
        const response = await fetch(`http://localhost:3000/verify-user/${crn}`, {
            method: 'POST',
        });

        if (response.ok) {
            alert('User verified successfully!');
            fetchVerificationData(); // Refresh the table
        } else {
            alert('Failed to verify user.');
        }
    } catch (error) {
        console.error('Error verifying user:', error);
    }
}
