const Mailjet = require("node-mailjet");
const uuid = require("uuid");
const bcrypt = require("bcrypt");

const User = require("../models/userModel");
const ForgotPassword = require("../models/forgotPassModel");

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    console.log(email);

    const user = await User.findOne({ where: { email: email } });
    console.log(user);

    if (user) {
      const id = uuid.v4();
      user
        .createForgotPasswordRequest({ id: id, active: true })
        .catch((err) => {
          throw new Error(err);
        });

      const mailjet = Mailjet.apiConnect(
        process.env.MAILJET_API_KEY,
        process.env.MAILJET_SECRET_KEY,
        {
          config: {},
          options: {},
        }
      );

      const request = mailjet.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "singh.shivam2238@gmail.com",
              Name: "Shivam Singh",
            },
            To: [
              {
                Email: email,
                Name: "HELLO USER",
              },
            ],
            Subject: "Expense Tacker - FORGOT PASSWORD!",
            TextPart: "Dear user, you forgot your password I guess!",
            HTMLPart: `<a href="http://localhost:3000/password/resetpassword/${id}">Reset password</a>`,
          },
        ],
      });
      const result = await request;
      console.log(result.body);

      res
        .status(200)
        .json({ message: "Password reset email sent successfully!" });
    } else {
      throw new Error();
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to send email, please try again later." });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;

    const forgotpasswordrequest = await ForgotPassword.findOne({
      where: { id: id },
    });

    if (!forgotpasswordrequest) {
      res.status(404).json({ message: "forgot pass id not found" });
    }

    if (forgotpasswordrequest.active == true) {
     forgotpasswordrequest.update({ active: false });
      res.status(200).send(`<html>
        <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
        <script>
            function formsubmitted(event){
                event.preventDefault();
                const newPassword = document.getElementById('newpassword').value;

                // Send the new password using Axios
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

      res.end();
    } else {
      res.status(500).json({ message: "couldnt send pass update request" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset password." });
  }
};

exports.updatePassword = async (req, res, next) => {
    try {
      const { newpassword } = req.body;
      console.log("New Password:",newpassword);
      const { resetpasswordid } = req.params;
      console.log("Reset Password ID:", resetpasswordid);
      
      const resetpasswordrequest = await ForgotPassword.findOne({
        where: { id: resetpasswordid },
      });
      console.log("Reset Password Request:", resetpasswordrequest);
      if (!resetpasswordrequest) {
        return res.status(404).json({ message: "Couldn't find reset password request" });
      }
  
      const user = await User.findOne({
        where: { id: resetpasswordrequest.userId },
      });
  
      if (user) {
        const saltRounds = 10;
        bcrypt.hash(newpassword, saltRounds, async (err, hash) => {
          if (err) {
            console.error('Hashing error:', err);
            return res.status(500).json({ message: "Error hashing password", error: err });
          }
          try {
            await user.update({ password: hash });
            return res.status(201).json({ message: "Successfully updated the new password" });
          } catch (err) {
            console.error('User update error:', err);
            return res.status(500).json({ message: "Could not update user", error: err });
          }
        });
      } else {
        return res.status(404).json({ error: "No user exists", success: false });
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      return res.status(403).json({ message: "SORRY", error, success: false });
    }
  };
  
