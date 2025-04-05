import { createTransport } from 'nodemailer';

const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendApprovalEmail = async (req, res) => {
    const {to, username} = req.body;

    try {
        const info = await transporter.sendMail({
          from: `"GradAcad Admin" <${process.env.EMAIL_USER}>`, // Sender
          to, // Recipient's email
          subject: "GradAcad Registration Approved ✅",
          text: `Dear ${username},\n\nYour registration application for GradAcad has been approved! 🎉\n\nYou can now log in to your account and access the system.\n\nBest Regards,\nGradAcad Team`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2>🎉 Registration Approved!</h2>
              <p>Dear <strong>${username}</strong>,</p>
              <p>We are pleased to inform you that your registration application for <strong>GradAcad</strong> has been approved.</p>
              <p>You can now log in to your account and start using the system.</p>
              <a href="https://your-gradacad-login.com" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                Log in Now
              </a>
              <p>If you have any questions, feel free to contact our support team.</p>
              <p>Best Regards,<br><strong>GradAcad Team</strong></p>
            </div>
          `,
        });

    

        if (info.messageId) {
            console.log("Approval email sent: ", info.messageId);
            return res.status(200).json({ success: true, message: "Approval email sent successfully!" });
        } else {
            return res.status(404).json({ success: false, message: "No data found for the given email or name" });
        }
        
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }

}

export const sendRejectionEmail = async (req, res) => {
    const {to, username} = req.body;

    try {
        const info = await transporter.sendMail({
          from: `"GradAcad Admin" <${process.env.EMAIL_USER}>`,
          to, // Recipient's email
          subject: "GradAcad Registration Rejected ❌",
          text: `Dear ${username},\n\nWe regret to inform you that your registration application for GradAcad has been rejected`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2>❌ Registration Rejected</h2>
              <p>Dear <strong>${username}</strong>,</p>
              <p>We regret to inform you that your registration application for <strong>GradAcad</strong> has been rejected.</p>
              <p>If you believe this was a mistake or have any questions, feel free to contact our support team.</p>
              <p>Best Regards,<br><strong>NC-MIS</strong></p>
            </div>
          `,
        });

        if (info.messageId) {
            console.log("Rejection email sent: ", info.messageId);
            return res.status(200).json({ success: true, message: "Rejection email sent successfully!" });
        } else {
            return res.status(404).json({ success: false, message: "No data found for the given email or name" });
        }
      } catch (error) {
        console.error("Error sending rejection email: ", error);
        return { success: false, message: "Failed to send rejection email." };
      }
}