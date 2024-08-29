const User = require("../models/userModel");
const express = require("express");
const Mailjet = require('node-mailjet');

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  console.log(email);

  try {
    const mailjet = Mailjet.apiConnect(
      process.env.MAILJET_API_KEY,
      process.env.MAILJET_SECRET_KEY,
      {
        config: {},
        options: {}
      }
    );

    const request = mailjet
      .post('send', { version: 'v3.1' })
      .request({
        Messages: [
          {
            From: {
              Email: "singh.shivam2238@gmail.com",
              Name: "Shivam Singh"
            },
            To: [
              {
                Email: email,
                Name: "HELLO USER"
              }
            ],
            Subject: "FORGOT PASSWORD!",
            TextPart: "Dear user, you forgot your password I guess!",
            HTMLPart: "<h3>Dear user, Welcome to EXPENSE TRACKER. YOU FORGOT YOUR PASSWORD IT SEEMS. </a>!</h3><br />HOLD TIGHT"
          }
        ]
      });

    const result = await request;
    console.log(result.body);

    res.status(200).json({ message: 'Password reset email sent successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email, please try again later.' });
  }
};
