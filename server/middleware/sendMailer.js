import nodemailer from "nodemailer";
// use while registration and use in resend otp
const sendRegisterAndResendOtpMail = async (email, subject, data) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL,
      pass: process.env.PASSWORD,
    },
  });

  const html = `<body style="font-family: Arial, sans-serif; line-height: 1.3; margin: 10px; padding: 14px; background-color: #f4f4f4; text-align: left; display: flex; justify-content: center; align-items: center; height: fit-content;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; padding: 15px; border-radius: 6px; box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #333; font-size: 20px; margin-bottom: 10px;">Verify Your Email – Complete Your Registration</h2>
        <h3 style="color: #333; font-size: 16px; margin-bottom: 5px;">Dear</h3>
        <p style="color: #555; font-size: 13px; margin-bottom: 5px;">
            Thank you for signing up with <b>Real state </b>! To complete your registration, please verify your email address using the OTP below:
        </p>
        <h2 style="padding: 8px; display: inline-block; border-radius: 4px; font-size: 18px; margin-bottom: 8px;">
            Your OTP: <b> ${data.otp} </b>
        </h2>
        <p style="color: #555; font-size: 13px; margin-bottom: 5px;">
            This OTP is valid for <b>5 minutes</b>. Please enter this code on the verification page to activate your account.
        </p>
        <p style="color: #555; font-size: 13px; margin-bottom: 5px;">
            If you did not request this, please ignore this email or contact our support team at 
            <a href="mailto:nehayadav.com" style="color: #007bff; text-decoration: none;">nehayadav.com</a>.
        </p>
        <h4 style="color: #333; font-size: 14px; margin-bottom: 3px;">Best Regards,</h4>
        <h4 style="color: #d9534f; font-size: 14px; margin-bottom: 8px;">Study material</h4>
        <p style="margin-bottom: 5px;">
            <a href="https://realState.com/" style="color: #007bff; text-decoration: none; font-size: 14px;">
                www.realState.com
            </a>
        </p>
        <p style="color: #333; font-size: 14px; font-weight: bold; margin-bottom: 3px;">📞 951288145901</p> 
      </div>
    </body>`;

  await transporter.sendMail({
    from: process.env.GMAIL,
    to: email,
    subject,
    html,
  });
};

export default sendRegisterAndResendOtpMail;
