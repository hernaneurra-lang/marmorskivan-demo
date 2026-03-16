import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  const { customer, summaryHtml, summaryText } = req.body || {};
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT||587), secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    // backoffice
    await transporter.sendMail({
      from: `"marmorskivan.se" <${process.env.MAIL_FROM||process.env.SMTP_USER}>`,
      to: process.env.MAIL_TO,
      subject: `Ny offert – ${customer?.namn||"kund"}`,
      html: summaryHtml || "<p>Offert</p>",
      text: summaryText || "Offert"
    });

    // kund
    if (customer?.email) {
      await transporter.sendMail({
        from: `"marmorskivan.se" <${process.env.MAIL_FROM||process.env.SMTP_USER}>`,
        to: customer.email,
        subject: "Tack! Din offert hos marmorskivan.se",
        html: "<p>Tack! Vi återkommer snarast med detaljer.</p>",
        text: "Tack! Vi återkommer snarast med detaljer."
      });
    }

    res.status(200).json({ ok:true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "send failed" });
  }
}
