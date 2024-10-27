const Mailjet = require('node-mailjet');
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const User = require("../models/userModel");
const ForgotPassword = require("../models/forgotPassModel");

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email: email } });

    console.log(user);

    if (user) {
      const id = uuid.v4();
      await user.createForgotPasswordRequest({ id: id, active: true, expiresby: new Date(Date.now() + 3600000) });

      const mailjet = new Mailjet({
        apiKey: process.env.MAILJET_API_KEY,
        apiSecret: process.env.MAILJET_SECRET_KEY
      });

      const request = await mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: process.env.SENDER_EMAIL,
              Name: 'Expense Tracker',
            },
            To: [
              {
                Email: email,
                Name: user.username,
              },
            ],
            Subject: 'Password Reset for Expense Tracker',
            TextPart: `Click the following link to reset your password: http://localhost:3000/password/resetpassword/${id}`,
            HTMLPart: `<h3>Reset Your Password</h3><p>Click <a href="http://localhost:3000/password/resetpassword/${id}">here</a> to reset your password.</p>`,
          },
        ],
      });

      console.log(request.body);
      res.status(200).json({ message: "Reset password link sent to email" });
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ message: "Couldn't process forgot password request", error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { id } = req.params;

    const forgotpasswordrequest = await ForgotPassword.findOne({
      where: { id: id },
    });

    if (!forgotpasswordrequest) {
      return res.status(404).json({ message: "Invalid password reset link" });
    }

    if (forgotpasswordrequest.active) {
      await forgotpasswordrequest.update({ active: false });
      
      // Set CSP headers
      res.setHeader(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline';"
      );

      res.status(200).send(`<html>
        <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
        <script>
            function formsubmitted(event){
                event.preventDefault();
                const newPassword = document.getElementById('newpassword').value;

                axios.post('/password/updatepassword/${id}', { newpassword: newPassword })
                    .then(response => {
                        console.log('Password reset successful:', response.data);
                        alert('Password reset successful!');
                    })
                    .catch(error => {
                        console.error('There was an error resetting the password:', error);
                        alert('Failed to reset password: ' + (error.response ? error.response.data.message : error.message));
                    });
            }
        </script>

        <form onsubmit="formsubmitted(event)">
           <label for="newpassword">Enter New password</label>
           <input id="newpassword" name="newpassword" type="password" required />
           <button>Reset Password</button>
        </form>
    </html>`);
    } else {
      return res.status(403).json({ message: "Link has already been used" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { resetpasswordid } = req.params;
    let newpassword = req.body.newpassword || req.query.newpassword;

    console.log('Received request to update password:');
    console.log('Reset password ID: >>>>>>  ', resetpasswordid);
    console.log('New password received:', newpassword ? 'Yes' : 'No');

    if (!newpassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    const resetPasswordRequest = await ForgotPassword.findOne({ 
      where: { id: resetpasswordid }
    });

    if (!resetPasswordRequest) {
      console.log('No reset password request found for ID:', resetpasswordid);
      return res.status(404).json({ message: "Invalid reset link" });
    }

    console.log('Reset password request found:', resetPasswordRequest.toJSON());

    const user = await User.findOne({ where: { id: resetPasswordRequest.userId } });

    if (!user) {
      console.log('No user found for userId:', resetPasswordRequest.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log('User found:', user.toJSON());

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newpassword, 10);

    // Update user's password
    await user.update({ password: hashedPassword });

    console.log('Password updated successfully for user:', user.id);

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ message: "Couldn't update password", error: error.message });
  }
};

