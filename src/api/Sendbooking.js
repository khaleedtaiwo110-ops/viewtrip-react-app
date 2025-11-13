// ✅ Send Booking Email + Confirmation
import nodemailer from "nodemailer";

app.post("/api/send-booking", async (req, res) => {
  const booking = req.body;
  console.log("📩 New booking received:", booking);

  try {
    // 🔑 Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // your Gmail App Password
      },
    });

    // ✉️ 1. Email to Admin (you)
    const adminMail = {
      from: `"ViewTrip Travels" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
      subject: `🧳 New ${booking.type?.toUpperCase()} Booking from ${booking.name}`,
      html: `
        <h2>New Booking Details</h2>
        <p><b>Name:</b> ${booking.name}</p>
        <p><b>Email:</b> ${booking.email}</p>
        <p><b>Type:</b> ${booking.type}</p>
        <p><b>Item:</b> ${booking.itemName}</p>
        ${
          booking.type === "flight"
            ? `<p><b>Passengers:</b> ${booking.passengers}</p>
               <p><b>Class:</b> ${booking.travelClass}</p>`
            : ""
        }
        ${
          booking.type === "hotel"
            ? `<p><b>Check-in:</b> ${booking.checkIn}</p>
               <p><b>Check-out:</b> ${booking.checkOut}</p>
               <p><b>Guests:</b> ${booking.guests}</p>`
            : ""
        }
        ${
          booking.type === "tour"
            ? `<p><b>Travelers:</b> ${booking.travelers}</p>
               <p><b>Special Requests:</b> ${booking.specialRequests}</p>`
            : ""
        }
        ${
          booking.type === "visa"
            ? `<p><b>Country:</b> ${booking.country}</p>`
            : ""
        }
        <hr/>
        <p style="color:gray;">Sent automatically from your ViewTrip website.</p>
      `,
    };

    // ✉️ 2. Confirmation email to customer
    const customerMail = {
      from: `"ViewTrip Travels" <${process.env.EMAIL_USER}>`,
      to: booking.email,
      subject: `✅ Booking Confirmation - ViewTrip Travels`,
      html: `
        <h2>Dear ${booking.name},</h2>
        <p>Thank you for booking your ${booking.type} with <b>ViewTrip Travels</b>!</p>
        <p>We’ve received your booking for <b>${booking.itemName}</b>.</p>
        <p>Our team will contact you shortly with more details.</p>
        <br/>
        <p><b>Booking Summary:</b></p>
        <ul>
          <li>Type: ${booking.type}</li>
          <li>Item: ${booking.itemName}</li>
          ${
            booking.type === "flight"
              ? `<li>Passengers: ${booking.passengers}</li><li>Class: ${booking.travelClass}</li>`
              : ""
          }
          ${
            booking.type === "hotel"
              ? `<li>Check-in: ${booking.checkIn}</li><li>Check-out: ${booking.checkOut}</li><li>Guests: ${booking.guests}</li>`
              : ""
          }
          ${
            booking.type === "tour"
              ? `<li>Travelers: ${booking.travelers}</li><li>Special Requests: ${booking.specialRequests}</li>`
              : ""
          }
          ${
            booking.type === "visa"
              ? `<li>Country: ${booking.country}</li>`
              : ""
          }
        </ul>
        <p>We appreciate your trust in us.</p>
        <p>Warm regards,</p>
        <p><b>ViewTrip Travels</b></p>
      `,
    };

    // 🚀 Send both emails
    await transporter.sendMail(adminMail);
    await transporter.sendMail(customerMail);

    console.log("✅ Booking + confirmation emails sent!");
    res.status(200).json({ message: "Booking emails sent successfully!" });
  } catch (error) {
    console.error("❌ Email sending error:", error);
    res.status(500).json({ message: "Failed to send booking emails" });
  }
});
