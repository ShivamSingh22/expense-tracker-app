const Mailjet = require("node-mailjet");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const User = require("../models/userModel");
const ForgotPassword = require("../models/forgotPassModel");

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const id = uuid.v4();
      const forgotPassRequest = new ForgotPassword({
        id,
        active: true,
        userId: user._id,
        expiresby: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });
      await forgotPassRequest.save();

      const mailjet = Mailjet.apiConnect(
        process.env.MAILJET_API_KEY,
        process.env.MAILJET_SECRET_KEY,
        { config: {}, options: {} }
      );

      const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [{
          From: {
            Email: "singh.shivam2238@gmail.com",
            Name: "Shivam Singh",
          },
          To: [{
            Email: email,
            Name: "HELLO USER",
          }],
          Subject: "Expense Tacker - FORGOT PASSWORD!",
          TextPart: "Dear user, you forgot your password I guess!",
          HTMLPart: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`,
        }],
      });
      await request;
      res.status(200).json({ message: "Password reset email sent successfully!" });
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email, please try again later." });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const forgotpasswordrequest = await ForgotPassword.findOne({ id });

    if (!forgotpasswordrequest) {
      return res.status(404).json({ message: "forgot pass id not found" });
    }

    if (forgotpasswordrequest.active) {
      await ForgotPassword.updateOne({ id }, { active: false });
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
                        alert('Failed to reset password.');
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
      res.status(500).json({ message: "couldn't send pass update request" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset password." });
  }
};

exports.updatePassword = async (req, res, next) => {
    try {
      const { newpassword } = req.body;
      const { resetpasswordid } = req.params;

      const resetpasswordrequest = await ForgotPassword.findOne({ id: resetpasswordid });
      if (!resetpasswordrequest) {
        return res.status(404).json({ message: "Couldn't find reset password request" });
      }

      const user = await User.findById(resetpasswordrequest.userId);
      if (user) {
        const hash = await bcrypt.hash(newpassword, 10);
        await User.updateOne({ _id: user._id }, { password: hash });
        return res.status(201).json({ message: "Successfully updated the new password" });
      } else {
        return res.status(404).json({ error: "No user exists", success: false });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(403).json({ message: "SORRY", error, success: false });
    }
  };
  
