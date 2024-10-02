require('dotenv').config();
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const client = require('twilio')(process.env.acc_sid, process.env.auth_token);
const PDFDocument = require('pdfkit');
const fs = require('fs');


const path = require('path');
const app = express();
app.use(express.static('public'));

// Create an Express app


// Middleware
app.use(cors());
app.use(bodyParser.json());

// Set up PostgreSQL connection
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'Bank',
    password: 'bank1234',
    port: 5432, // Default PostgreSQL port
});

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // Limit file size to 1MB
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).fields([{ name: 'aadhar', maxCount: 1 }, { name: 'pan', maxCount: 1 }]);


function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Only images or PDFs are allowed');
    }
}



app.get('/download-transactions-pdf/:accountNumber', async (req, res) => {
    const accountNumber = req.params.accountNumber;

    try {
        // Fetch transactions for the given account number
        const result = await pool.query(
            `SELECT transaction_id, sender_acc_id, reciever_acc_id, amount, transaction_date, status FROM transactions WHERE sender_acc_id = $1 OR reciever_acc_id = $1 ORDER BY transaction_date DESC LIMIT 10`,
            [accountNumber]
        );

        // Create a new PDF document
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, 'transactions.pdf');

        // Pipe the PDF to a file
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add title to the document
        doc.fontSize(18).text('Recent Transactions', { align: 'center' });

        // Add some spacing
        doc.moveDown();

        // Add table header
        doc.fontSize(12).text('Transaction ID | Sender Account | Receiver Account | Amount | Date | Status', {
            underline: true
        });

        // Add each transaction as a row in the PDF
        result.rows.forEach(transaction => {
            const { transaction_id, sender_acc_id, reciever_acc_id, amount, transaction_date, status } = transaction;
            const formattedRow = `${transaction_id} | ${sender_acc_id} | ${reciever_acc_id} | ₹${amount} | ${transaction_date} | ${status}`;
            doc.text(formattedRow);
        });

        // Finalize the PDF and end the stream
        doc.end();

        // Wait for the stream to finish before sending the file
        writeStream.on('finish', () => {
            res.download(filePath, 'transactions.pdf', (err) => {
                if (err) {
                    console.error('Error sending PDF:', err);
                }

                // Optionally delete the PDF file after sending it to the client
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.error('Error deleting PDF file:', err);
                    }
                });
            });
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ message: 'Failed to generate PDF' });
    }
});

// Route to handle file upload
app.post('/upload', (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            res.status(400).send(err);
        } else {
            if (req.files.aadhar && req.files.pan) {
                const aadharPath = req.files.aadhar[0].filename;
                const panPath = req.files.pan[0].filename;
                
                const { cust_name } = req.body;

                try {
                    const query = `UPDATE cust_login
                    SET aadhar_file = $1, pan_file = $2, verified = $3
                    WHERE cust_name = $4`;
                    await pool.query(query, [aadharPath, panPath, false, cust_name]);
                    return res.status(200).json({ message: 'Files uploaded successfully!' });
                } catch (error) {
                    console.error('Database error:', error);
                    res.status(500).send('Database error');
                }
            } else {
                res.send('Please upload both files');
            }
        }
    });
});

app.use('/uploads', express.static('uploads'));


// Helper function to generate random CRN
function generateCRN() {
    return Math.floor(1000000000 + Math.random() * 9000000000); // Generate a random 10-digit number
}

// API endpoint to handle form submissions
app.post('/submit-form', async (req, res) => {
    try {
        const { name, mobileNumber, email, pass, pincode, city, acctype } = req.body;

        // Generate a random CRN
        const crn = generateCRN();

        // Insert the data into the database
        const query = `
            INSERT INTO cust_login (crn, cust_name, cust_mobile, cust_email, pass, cust_pincode, cust_city)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await pool.query(query, [crn, name, mobileNumber, email, pass, pincode, city]);
        const acc_id = Math.floor (100000 + Math.random() * 900000);
        const accountNumber = Math.floor(1000000000 + Math.random() * 9000000000); // 10-digit unique number

        // Insert the account details into accounts table
        const accountQuery = `
            INSERT INTO accounts (account_id, crn, account_type, account_number, balance, cust_name)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const balance = 5000.00;
        await pool.query(accountQuery, [acc_id, crn, acctype, accountNumber, balance, name]);

        // Send success response
        res.status(200).json({ message: 'Data inserted successfully', crn });
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).json({ message: 'Server error', error: error.message }); // More detailed error message
    }
});


// API endpoint to handle login
// API endpoint to handle login
app.post('/login', async (req, res) => {
    try {
        const { identifier, pass } = req.body;

        if (!pass) {
            return res.status(400).json({ message: 'Password is required' });
        }

        // Query to find user with the provided identifier (CRN, email, or mobile number) and password, and check if verified
        const query = `
            SELECT crn, cust_name, verified FROM cust_login 
            WHERE (crn = $1 OR cust_email = $1 OR cust_mobile = $1) AND pass = $2
        `;
        const result = await pool.query(query, [identifier, pass]);

        if (result.rows.length > 0) {
            const { crn, cust_name, verified } = result.rows[0];

            if (!verified) {
                // User found but not verified
                return res.status(403).json({ message: 'Your account is not verified yet.' });
            }

            // User found and verified, respond with the name and CRN
            res.status(200).json({ message: 'Login successful', crn, cust_name });
        } else {
            // User not found
            res.status(401).json({ message: 'Invalid CRN or password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


app.get('/user-details/:crn', async (req, res) => {
    const { crn } = req.params;

    try {
        // Query to retrieve user's name and account type based on the CRN
        const query = `
        SELECT cl.cust_name, a.account_type, a.account_number, a.balance 
        FROM cust_login cl
        JOIN accounts a ON cl.crn = a.crn
        WHERE cl.crn = $1;
        `;
        const result = await pool.query(query, [crn]);

        if (result.rows.length > 0) {
            const { cust_name, account_type, account_number, balance } = result.rows[0];
            res.status(200).json({ cust_name, account_type, account_number, balance });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('Error retrieving user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/make-deposit', async (req, res) => {
    const { senderAccNo, dep_type, amount, investmentOption, interestRate } = req.body;
    
    const MINIMUM_BALANCE = 5000;  // Minimum balance for deposit

    try {
        await pool.query('BEGIN');  // Start a transaction

        // Fetch sender balance
        const senderResult = await pool.query(
            'SELECT balance FROM accounts WHERE account_number = $1 FOR UPDATE',
            [senderAccNo]
        );
        
        if (senderResult.rows.length === 0) {
            throw new Error('Sender account not found');
        }

        const senderBalance = senderResult.rows[0].balance;
        const senderBalanceNumeric = parseFloat(senderBalance);  // Convert to number
        const depositAmountNumeric = parseFloat(amount);  // Corrected variable
        const receiverAccNo = '9987027807';

        console.log('Sender Balance:', senderBalance, 'Deposit Amount:', depositAmountNumeric);

        // Check if balance after deposit would be above the minimum balance
        if (senderBalanceNumeric - depositAmountNumeric < MINIMUM_BALANCE) {
            throw new Error(`Insufficient funds. A minimum balance of ${MINIMUM_BALANCE} must be maintained.`);
        }

        // Update sender account balance
        await pool.query(
            'UPDATE accounts SET balance = balance - $1 WHERE account_number = $2',
            [depositAmountNumeric, senderAccNo]
        );

        const receiverResult = await pool.query(
            'SELECT account_number FROM accounts WHERE account_number = $1 FOR UPDATE',
            [receiverAccNo]
        );
        
        // Add the deposit to receiver's account
        await pool.query(
            'UPDATE accounts SET balance = balance + $1 WHERE account_number = $2',
            [depositAmountNumeric, receiverAccNo]
        );

        const transactionId = Math.floor(10000000 + Math.random() * 90000000); // Generate random 8-digit transaction ID
        const transactionDate = new Date().toISOString(); // Current timestamp

        await pool.query(
            'INSERT INTO transactions (transaction_id, sender_acc_id, reciever_acc_id, amount, transaction_date, sender_desc, reciever_desc, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [transactionId, senderAccNo, receiverAccNo, depositAmountNumeric, transactionDate, 'debited', 'credited', 'completed']
        );

        // Insert deposit record into deposits table
        const depositId = Math.floor(10000000 + Math.random() * 90000000); // Generate random deposit ID
        const depositDate = new Date().toISOString();  // Current timestamp

        await pool.query(
            'INSERT INTO deposits (deposit_id, account_number, deposit_type, deposit_amount, deposit_date, maturity_date, interest_rate ) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [depositId, senderAccNo, dep_type, depositAmountNumeric, depositDate, investmentOption, interestRate ]
        );
        await pool.query(
            `UPDATE deposits
             SET cust_name = accounts.cust_name,
                 crn = accounts.crn
             FROM accounts
             WHERE deposits.account_number = accounts.account_number`
        );

        await pool.query('COMMIT');  // Commit the transaction

        return res.status(200).json({ message: 'Deposit completed successfully', depositId });

    } catch (error) {
        // In case of any error, rollback the transaction
        await pool.query('ROLLBACK');
        console.error('Error during deposit:', error);

        return res.status(500).json({ message: 'Deposit failed', error: error.message });
    }
});


app.post('/complete-payment', async (req, res) => {
    const { senderAccNo, receiverAccNo, amount } = req.body;
    const MINIMUM_BALANCE = 5000; // Minimum balance to maintain

    try {
        await pool.query('BEGIN'); // Start a transaction

        // Fetch sender balance
        const senderResult = await pool.query(
            'SELECT balance FROM accounts WHERE account_number = $1 FOR UPDATE',
            [senderAccNo]
        );
        
        if (senderResult.rows.length === 0) {
            throw new Error('Sender account not found');
        }

        const senderBalance = senderResult.rows[0].balance;

        const senderBalanceNumeric = parseFloat(senderBalance);  // Convert to number
        const amountNumeric = parseFloat(amount); 
        console.log('Sender Balance:', senderBalance, 'Transfer Amount:', amount);

        // Check if balance after deduction would fall below minimum balance
        if (senderBalanceNumeric - amountNumeric < MINIMUM_BALANCE) {
            throw new Error(`Insufficient funds. A minimum balance of ${MINIMUM_BALANCE} must be maintained.`);
        }

        // Deduct amount from sender account
        await pool.query(
            'UPDATE accounts SET balance = balance - $1 WHERE account_number = $2',
            [amountNumeric, senderAccNo]
        );

        // Fetch receiver account to ensure it exists
        const receiverResult = await pool.query(
            'SELECT account_number FROM accounts WHERE account_number = $1 FOR UPDATE',
            [receiverAccNo]
        );

        if (receiverResult.rows.length === 0) {
            throw new Error('Receiver account not found');
        }

        // Add amount to receiver account
        await pool.query(
            'UPDATE accounts SET balance = balance + $1 WHERE account_number = $2',
            [amountNumeric, receiverAccNo]
        );

        // Transaction completed successfully, now log the transaction
        const transactionId = Math.floor(10000000 + Math.random() * 90000000); // Generate random 8-digit transaction ID
        const transactionDate = new Date().toISOString(); // Current timestamp

        await pool.query(
            'INSERT INTO transactions (transaction_id, sender_acc_id, reciever_acc_id, amount, transaction_date, sender_desc, reciever_desc, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [transactionId, senderAccNo, receiverAccNo, amountNumeric, transactionDate, 'debited', 'credited', 'completed']
        );

        await pool.query('COMMIT'); // Commit the transaction
        return res.status(200).json({ message: 'Transfer completed successfully', transactionId });

    } catch (error) {
        // In case of any error, rollback the transaction
        await pool.query('ROLLBACK');
        console.error('Error during fund transfer:', error);

        // Log the failed transaction
        const transactionId = Math.floor(10000000 + Math.random() * 90000000); // Generate random 8-digit transaction ID
        const transactionDate = new Date().toISOString(); // Current timestamp

        await pool.query(
            'INSERT INTO transactions (transaction_id, sender_acc_id, reciever_acc_id, amount, transaction_date, sender_desc, reciever_desc, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [transactionId, senderAccNo, receiverAccNo, parseFloat(amount), transactionDate, 'debited', 'credited', 'failed']
        );

        // Send error response
        return res.status(500).json({ message: 'Fund transfer failed', error: error.message });
    }
});

app.post('/check-balance', async (req, res) => {
    const { senderAccNo, amount, MINIMUM_BALANCE } = req.body;

    try {
        // Fetch sender balance
        const senderResult = await pool.query(
            'SELECT balance FROM accounts WHERE account_number = $1',
            [senderAccNo]
        );

        if (senderResult.rows.length === 0) {
            return res.status(404).json({ message: 'Sender account not found' });
        }

        const senderBalance = senderResult.rows[0].balance;
        const senderBalanceNumeric = parseFloat(senderBalance); // Convert balance to number

        // Check if the sender has enough balance
        if (senderBalanceNumeric - parseFloat(amount) < MINIMUM_BALANCE) {
            return res.status(400).json({ sufficientBalance: false, message: 'Insufficient balance' });
        }

        // If balance is sufficient
        return res.status(200).json({ sufficientBalance: true });

    } catch (error) {
        console.error('Error checking balance:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/get-transactions/:accountNumber', async (req, res) => {
    const accountNumber = req.params.accountNumber;
  
    try {
      // Fetch transactions for the given account number
      const result = await pool.query(
        `SELECT * FROM transactions WHERE sender_acc_id = $1 OR reciever_acc_id = $1 ORDER BY transaction_date DESC LIMIT 10`,
        [accountNumber]
      );
  
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: 'Failed to fetch transactions' });
    }
});


let generatedOtp = '';
app.post('/send-sms', async (req, res) => {
    // const { amount } = req.body;

    // Generate OTP
    generatedOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const body = `Your OTP is ${generatedOtp} for the transaction.`;
    console.log(generatedOtp);
    

    const msgOptions = {
        from: process.env.twilio_phone,
        to: process.env.to_phone,
        body
    }

    try {
        const message = await client.messages.create(msgOptions);
        console.log(message);
        res.status(200).json({ success: true, message: 'OTP sent successfully' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Error sending OTP' });
    }
});


app.post('/verify-otp', (req, res) => {
    const { otp } = req.body;

    if (otp === generatedOtp) {
        res.status(200).json({ success: true, message: 'OTP verified' });
        // Here you can proceed with the transaction logic
    } else {
        res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
});

// API endpoint to fetch user verification data
app.get('/admin/verification', async (req, res) => {
    try {
        const query = `
            SELECT crn, cust_name, aadhar_file, pan_file, verified 
            FROM cust_login
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching verification data:', error);
        res.status(500).json({ message: 'Server error' });
    }
});
// API endpoint to verify user
app.post('/verify-user/:crn', async (req, res) => {
    const { crn } = req.params;

    try {
        const userResult = await pool.query(`
            SELECT cust_name FROM cust_login WHERE crn = $1
        `, [crn]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = userResult.rows[0];
        const userName = user.cust_name;

        const query = `
            UPDATE cust_login
            SET verified = true
            WHERE crn = $1
        `;
        await pool.query(query, [crn]);

        const body = `Hello ${userName}, your account with CRN ${crn} has been successfully verified. You can now log in to our services.`;

        const msgOptions = {
            from: process.env.twilio_phone,
            to: process.env.to_phone,
            body
        }
        const message = await client.messages.create(msgOptions);
        console.log('SMS sent:', message.sid);

        


        res.status(200).json({ message: 'User verified successfully!' });
    } catch (error) {
        console.error('Error verifying user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});




// // Route to serve "index.html" when accessing the root URL
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'index.html'));  // Adjust the path if index.html is in another location
// });


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
