const Inquiry = require("../models/Inquiry");
const sendEmail = require("../utils/email");

exports.createInquiry = async (req, res) => {
  try {
    const newInquiry = await Inquiry.create(req.body);

    // Notify Admin (Async)
    sendEmail({
      subject: `✉️ [${newInquiry.subject || 'Inquiry'}] New Message from ${newInquiry.name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 20px;">
          <h2 style="font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin-bottom: 25px;">${newInquiry.subject || 'Masterpiece Inquiry'}</h2>
          
          <div style="background: #fcfcfc; padding: 25px; border-radius: 15px; border: 1px solid #eee; margin-bottom: 30px;">
             <p style="margin: 0; font-size: 10px; text-transform: uppercase; font-weight: 900; color: #999;">Client Message</p>
             <p style="margin: 10px 0 0; font-size: 15px; color: #000; line-height: 1.6; font-style: italic;">"${newInquiry.message}"</p>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
             <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                   <p style="margin: 0; font-size: 10px; text-transform: uppercase; font-weight: 900;">Name</p>
                   <p style="margin: 2px 0 0; font-size: 14px; color: #666;">${newInquiry.name}</p>
                </td>
             </tr>
             <tr>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                   <p style="margin: 0; font-size: 10px; text-transform: uppercase; font-weight: 900;">Email</p>
                   <p style="margin: 2px 0 0; font-size: 14px; color: #666;">${newInquiry.email}</p>
                </td>
             </tr>
          </table>

          <div style="margin-top: 40px; text-align: center;">
             <a href="${process.env.ADMIN_URL || '#'}/inquiries" style="display: inline-block; padding: 15px 30px; background: #000; color: #fff; text-decoration: none; border-radius: 10px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Open Communication Log</a>
          </div>
        </div>
      `
    }).catch(err => console.error("Inquiry Email Failed:", err.message));

    res.status(201).json({
      status: "success",
      data: {
        inquiry: newInquiry
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort("-createdAt");

    res.status(200).json({
      status: "success",
      results: inquiries.length,
      data: {
        inquiries
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
};
