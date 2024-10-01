const { log } = require('console');

require('dotenv').config();

const acc_sid = process.env.account_sid;
const aut_token = process.env.auth_token;

const client = require('twilio')(acc_sid, aut_token);

const sendSMS = async (body) => {
    let msgOptions = {
        from: process.env.acc_no,
        to: +917710950799,
        body

    }
    try {
        const message = await client.messages.create(msgOptions);
        console.log(message);
    } catch (error) {
        console.log(error)
    }
}

sendSMS("Hello from Node.js App");
