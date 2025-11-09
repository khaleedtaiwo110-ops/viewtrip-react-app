import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const {
    name,
    email,
    type,
    itemName,
    passengers,
    travelClass,
    checkIn,
    checkOut,
    guests,
    travelers,
    specialRequests,
    country,
  } = req.body;

  // Validate fields
  if (!name || !email || !type || !itemName) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Setup transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASS, // your Gmail app password
    },
  });

  const mailOptions = {
    from: `"Booking Bot" <${process.env.EMAIL_USER}>`,
    to: process.env.RECEIVER_EMAIL, // your business email
    subject: `New ${type.toUpperCase()} Booking from ${name}`,
    text: `
New Booking Received!

Name: ${name}
Email: ${email}
Booking Type: ${type}
Item: ${itemName}

--- Details ---
Passengers: ${passengers || "-"}
Class: ${travelClass || "-"}
Check-In: ${checkIn || "-"}
Check-Out: ${checkOut || "-"}
Guests: ${guests || "-"}
Travelers: ${travelers || "-"}
Special Requests: ${specialRequests || "-"}
Country: ${country || "-"}
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Mail error:", error);
    return res.status(500).json({ message: "Failed to send email" });
  }
}
