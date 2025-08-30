import express from "express";
// import Razorpay from "razorpay";
import crypto from "crypto";
// import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import Payment from "./models/Payment.js";
import multer from "multer";
import nodemailer from "nodemailer";

const app = express();

const upload = multer();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://pharmmaex.com");
  // res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST,PUT,  OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// ✅ Middleware
// app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ✅ MongoDB connection
mongoose
  // .connect("mongodb://127.0.0.1:27017/pharmmaex", {
  .connect(
    "mongodb+srv://pharmmaex:NizmLk6z8rx1l5Yx@pharmmaex.nqjap2b.mongodb.net/pharmmaex",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("MongoDB Error:", err));

// ✅ Razorpay instance
// const razorpay = new Razorpay({
//   key_id: "rzp_test_R7z6dY1nMfTwQu", // replace with your key_id
//   key_secret: "ye4Q5XBW3BYXLoQVfYsR0Y5t", // replace with your key_secret
// });

// Configure nodemailer transporter
let transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  secureConnection: true,
  port: 465,
  auth: {
    user: "info@pharmmaex.com",
    pass: "6h.gRlwx",
  },
});

// ------------------- PAYMENT APIS ------------------- //
// 1️⃣ Create Order API
app.post("/create-order", async (req, res) => {
  try {
    const { amount, name, email, phone, cart } = req.body;

    // save in DB
    const orderId =
      "ORD-" +
      Date.now() + // current timestamp
      "-" +
      crypto.randomBytes(4).toString("hex");

    const payment = new Payment({
      orderId,
      name,
      email,
      phone,
      amount,
      currency: "INR",
      status: "pending",
      cart,
    });

    await payment.save();

    res.json({ message: "Successfully created", status: 200 });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get("/orders", async (req, res) => {
  try {
    const orders = await Payment.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
});

app.post("/change-status", async (req, res) => {
  try {
    const { status } = req.body;
    const { orderId } = req.body;

    // Find the order first (using orderId, not _id)
    const order = await Payment.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Prepare mail options (use order data)
    const mailOptions = {
      from: "info@pharmmaex.com",
      to: order.email,
      bcc: ["info@pharmmaex.com", "shivam.sharma@pharmmaex.com"],
      subject: "PharmmaEx - Payment Received & Order Confirmed",
      html: `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Order Confirmation</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f6f6f6; padding: 0; margin: 0; }
            .container { max-width: 600px; margin: 20px auto; background: #fff; border-radius: 6px; overflow: hidden; }
            .header { background: #73BF45; color: #fff; padding: 20px; text-align: center; font-size: 22px; font-weight: bold; }
            .content { padding: 20px; }
            .content p { font-size: 14px; line-height: 1.6; }
            .highlight { color: #73BF45; font-weight: bold; }
            .footer { text-align: center; padding: 15px; font-size: 12px; color: #888; }
            table { border-collapse: collapse; width: 100%; margin-top: 15px; }
            td { border: 1px solid #73BF45; padding: 8px; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">PharmmaEx - Order Confirmed</div>
            <div class="content">
              <p>Hi <b>${order.name}</b>,</p>
              <p>We are happy to inform you that we have <span class="highlight">received your payment</span>. Your order has been confirmed successfully ✅</p>
              <p class="section-title">Exhibition Details:</p>
              <p class="section-desc">
                <strong>Date:</strong> 03–04 October, 2025<br/>
                <strong>Time:</strong> 10am to 6:00pm<br/>
                <strong>Venue:</strong> Bombay Exhibition Centre, Mumbai
              </p>
              <p>Here are your order details:</p>
              <table>
                <tr><td><b>Order ID</b></td><td>${order.orderId}</td></tr>
                <tr><td><b>Amount Paid</b></td><td>₹${order.amount}</td></tr>
                <tr><td><b>Status</b></td><td><span class="highlight">Confirmed</span></td></tr>
              </table>

               <p class="section-title">No Refund Policy</p>
              <p class="section-desc">All registration fees are non-refundable. No refunds for cancellations or no-shows.</p>
              
              <p>Our team will process your order shortly. You will receive another update once your order is dispatched.</p>
              <p>Thank you for shopping with <span class="highlight">PharmmaEx</span>.</p>
              <p>Best Regards,<br/>PharmmaEx Team</p>
            </div>
            <div class="footer">© 2025 PharmmaEx. All rights reserved.</div>
          </div>
        </body>
      </html>`,
    };

    // Try sending mail first
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending mail:", error);
      } else {
        console.log("Mail sent:", info.response);
      }
    });

    // If mail successful → update DB
    order.status = status;
    await order.save();

    res.json({ success: true, order });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

// ------------------- EMAIL APIS ------------------- //

// API endpoint for sending emails
app.post("/send-registration-mail", async (req, res) => {
  const { firstName, lastName, email, phone, jobTitle, company, keyMail } =
    req.body;

  const mailOptions = {
    from: "info@pharmmaex.com",
    subject: "Pharmmaex - Thanks for contacting us.",
    to: email,
    bcc: ["info@pharmmaex.com", "shivam.sharma@pharmmaex.com"],
    html: `<!DOCTYPE html>
    <html>
      <head>
        <title>Registration Form Submit</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
         <style>
          /* -------------------------------------
              GLOBAL RESETS
          ------------------------------------- */
          
          /*All the styling goes here*/
          
          img {
            border: none;
            -ms-interpolation-mode: bicubic;
            max-width: 100%; 
          }
    
          body {
            background-color: #f6f6f6;
            font-family: sans-serif;
            -webkit-font-smoothing: antialiased;
            font-size: 14px;
            line-height: 1.4;
            margin: 0;
            padding: 0;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%; 
          }
    
          table {
            border-collapse: separate;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
            width: 100%; }
            table td {
              font-family: sans-serif;
              font-size: 14px;
              vertical-align: top; 
          }
    
          /* -------------------------------------
              BODY & CONTAINER
          ------------------------------------- */
    
          .body {
            background-color: #f6f6f6;
            width: 100%; 
          }
    
          /* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
          .container {
            display: block;
            margin: 0 auto !important;
            /* makes it centered */
            max-width: 580px;
            padding: 10px;
            width: 580px; 
          }
    
          /* This should also be a block element, so that it will fill 100% of the .container */
          .content {
            box-sizing: border-box;
            display: block;
            margin: 0 auto;
            max-width: 580px;
            padding: 10px; 
          }
    
          /* -------------------------------------
              HEADER, FOOTER, MAIN
          ------------------------------------- */
          .main {
            background: #ffffff;
            border-radius: 3px;
            width: 100%; 
          }
    
          .wrapper {
            box-sizing: border-box;
            padding: 20px; 
          }
    
          .content-block {
            padding-bottom: 10px;
            padding-top: 10px;
          }
    
          .footer {
            clear: both;
            margin-top: 10px;
            text-align: center;
            width: 100%; 
          }
            .footer td,
            .footer p,
            .footer span,
            .footer a {
              color: #999999;
              font-size: 12px;
              text-align: center; 
          }
    
          /* -------------------------------------
              TYPOGRAPHY
          ------------------------------------- */
          h1,
          h2,
          h3,
          h4 {
            color: #000000;
            font-family: sans-serif;
            font-weight: 400;
            line-height: 1.4;
            margin: 0;
            margin-bottom: 30px; 
          }
    
          h1 {
            font-size: 35px;
            font-weight: 300;
            text-align: center;
            text-transform: capitalize; 
          }
    
          p,
          ul,
          ol {
            font-family: sans-serif;
            font-size: 14px;
            font-weight: normal;
            margin: 0;
            margin-bottom: 15px; 
          }
            p li,
            ul li,
            ol li {
              list-style-position: inside;
              margin-left: 5px; 
          }
    
          a {
            color: #3498db;
            text-decoration: underline; 
          }
    
          /* -------------------------------------
              BUTTONS
          ------------------------------------- */
          .btn {
            box-sizing: border-box;
            width: 100%; }
            .btn > tbody > tr > td {
              padding-bottom: 15px; }
            .btn table {
              width: auto; 
          }
            .btn table td {
              background-color: #ffffff;
              border-radius: 5px;
              text-align: center; 
          }
            .btn a {
              background-color: #ffffff;
              border: solid 1px #3498db;
              border-radius: 5px;
              box-sizing: border-box;
              color: #3498db;
              cursor: pointer;
              display: inline-block;
              font-size: 14px;
              font-weight: bold;
              margin: 0;
              padding: 12px 25px;
              text-decoration: none;
              text-transform: capitalize; 
          }
    
          .btn-primary table td {
            background-color: #3498db; 
          }
    
          .btn-primary a {
            background-color: #3498db;
            border-color: #3498db;
            color: #ffffff; 
          }
    
          /* -------------------------------------
              OTHER STYLES THAT MIGHT BE USEFUL
          ------------------------------------- */
          .last {
            margin-bottom: 0; 
          }
    
          .first {
            margin-top: 0; 
          }
    
          .align-center {
            text-align: center; 
          }
    
          .align-right {
            text-align: right; 
          }
    
          .align-left {
            text-align: left; 
          }
    
          .clear {
            clear: both; 
          }
    
          .mt0 {
            margin-top: 0; 
          }
    
          .mb0 {
            margin-bottom: 0; 
          }
    
          .preheader {
            color: transparent;
            display: none;
            height: 0;
            max-height: 0;
            max-width: 0;
            opacity: 0;
            overflow: hidden;
            mso-hide: all;
            visibility: hidden;
            width: 0; 
          }
    
          .powered-by a {
            text-decoration: none; 
          }
    
          hr {
            border: 0;
            border-bottom: 1px solid #f6f6f6;
            margin: 20px 0; 
          }
          .mainHeadPharma {
        text-align: center;
        background: #73BF45;
        padding: 40px;
        color: #fff;
        font-size: 31px;
        font-weight: 800;
    }
    .colorGreen{
        color: #73BF45;
        font-weight: 600;
    }
    .contactTable {
        border-collapse: collapse;
        border: 1px solid #73BF45;
    }
    
   
    
    .contactTable td {
        padding: 5px;
        min-width:128px;
        font-size: 12px;
    }
          /* -------------------------------------
              RESPONSIVE AND MOBILE FRIENDLY STYLES
          ------------------------------------- */
          @media only screen and (max-width: 620px) {
            table.body h1 {
              font-size: 28px !important;
              margin-bottom: 10px !important; 
            }
            table.body p,
            table.body ul,
            table.body ol,
            table.body td,
            table.body span,
            table.body a {
              font-size: 16px !important; 
            }
            table.body .wrapper,
            table.body .article {
              padding: 10px !important; 
            }
            table.body .content {
              padding: 0 !important; 
            }
            table.body .container {
              padding: 0 !important;
              width: 100% !important; 
            }
            table.body .main {
              border-left-width: 0 !important;
              border-radius: 0 !important;
              border-right-width: 0 !important; 
            }
            table.body .btn table {
              width: 100% !important; 
            }
            table.body .btn a {
              width: 100% !important; 
            }
            table.body .img-responsive {
              height: auto !important;
              max-width: 100% !important;
              width: auto !important; 
            }
            .mainHeadPharma {
        text-align: center;
        background: #73BF45;
        padding: 30px;
        color: #fff;
        font-size: 25px;
        font-weight: 800;
    }
    .contactTable td {
      padding: 5px;
      font-size: 12px;
  }
    
    
          }
    
          /* -------------------------------------
              PRESERVE THESE STYLES IN THE HEAD
          ------------------------------------- */
          @media all {
            .ExternalClass {
              width: 100%; 
            }
            .ExternalClass,
            .ExternalClass p,
            .ExternalClass span,
            .ExternalClass font,
            .ExternalClass td,
            .ExternalClass div {
              line-height: 100%; 
            }
            .apple-link a {
              color: inherit !important;
              font-family: inherit !important;
              font-size: inherit !important;
              font-weight: inherit !important;
              line-height: inherit !important;
              text-decoration: none !important; 
            }
            #MessageViewBody a {
              color: inherit;
              text-decoration: none;
              font-size: inherit;
              font-family: inherit;
              font-weight: inherit;
              line-height: inherit;
            }
            .btn-primary table td:hover {
              background-color: #34495e !important; 
            }
            .btn-primary a:hover {
              background-color: #34495e !important;
              border-color: #34495e !important; 
            } 
            .contactTable td {
              padding: 5px;
              font-size: 12px;
          }
          }
    
        </style>
      </head>
      <body>
        <span class="preheader">This is preheader text. Some clients will show this text as a preview.</span>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
          <tr>
            <td>&nbsp;</td>
            <td class="container">
              <div class="content">
    
                <!-- START CENTERED WHITE CONTAINER -->
                <table role="presentation" class="main">
    
                  <!-- START MAIN CONTENT AREA -->
                  <tr>
                    <td class="wrapper">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p class="mainHeadPharma">Welcome to PharmmaEx</p>
                      
                            <p>You are now registered to take part in <b>PharmmaEx</b>.</p>
    
                                <p>"Our in-person event, set to unfold at the No. 91/4, 102/3, Opp BEL Corporate Office, Hebbal Flyover, Veerannapalya Rd,
                                Manayata Tech Park, Nagavara, Bengaluru, Karnataka 560024 from February 2nd   to February 3rd, 2024, will be complemented by an engaging online experience. Stay tuned for further details on this virtual aspect, coming your way shortly!"</p>
                          </td>
                        </tr>
                        <tr>
                            <td>
                                <p >YOUR REGISTRATION KEY IS: <span class="colorGreen" >${keyMail}</span></p>
                                <p>Your registration will allow you access to both the online event as well as the in-person event.</p>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <hr>
                                <p><strong>Your registration contact details are as follows:</strong></p>
                                
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <table border="1" class="contactTable">
                                    
                                    <tr>
                                        <td><strong>Name :</strong></td>
                                        <td>${firstName + " " + lastName}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Job Title :</strong></td>
                                        <td>${jobTitle}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Company Name :</strong></td>
                                        <td>${company}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Email :</strong></td>
                                        <td>${email}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Phone:</strong></td>
                                        <td>
                                            ${phone}</td>
                                    </tr>
                                </table>
                            </td>
                            <tr>
                                <td>
                                    <br/>
                                    <p><strong>Stay up to date on event news</strong></p>
    
                                       <p><i> Visit our website for the latest exhibitor list, conference schedule and other features. We look forward to seeing you at the event!</i></p>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <p >Best regards<br> <span class="colorGreen" >PharmmaEx</span></p>
                                   
                                </td>
                            </tr>
                        </tr>
                        
                      </table>
                    </td>
                  </tr>
    
                <!-- END MAIN CONTENT AREA -->
                </table>
                <!-- END CENTERED WHITE CONTAINER -->
    
                <!-- START FOOTER -->
             
                <!-- END FOOTER -->
    
              </div>
            </td>
            <td>&nbsp;</td>
          </tr>
        </table>
      </body>
    </html>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post("/send-exbitor-mail", upload.single("file"), async (req, res) => {
  const {
    firstName,
    email,
    phone,
    jobTitle,
    company,
    companyAdd,
    city,
    state,
    pin,
    website,
    gst,
    Fascia,
    selectedPaymentMode,
    space,
    Sqrm,
    Charges,
    totalCharge,
    StallNo,
  } = JSON.parse(req.body.jsonData);
  const bodyData = JSON.parse(req.body.jsonData); // Parse the JSON string associated with the key 'jsonData'
  //console.log(bodyData); // Access the 'firstName' property from the parsed data

  const file = req.file;
  const mailOptions = {
    from: "info@pharmmaex.com",
    subject: "Pharmmaex - Thanks for contacting us.",
    to: email,
    bcc: ["info@pharmmaex.com", "shivam.sharma@pharmmaex.com"],
    html: `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Exhibitor Space Registration</title>
        <style>
            /* Add your CSS styling here */
            .html {
    background-color: #eaebed;
}


    
            .body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
                padding: 15px;
            }
    
            .container {
                width: 100%;
                max-width: 600px;


                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                background: #ffffff;
    border-radius: 3px;
    padding: 15px;
    margin: 0 auto;
            }
    
            h2 {
                color: #333333;
            }
    
            h3 {
                color: #444444;
                margin-bottom: 10px;
            }
    
            p {
                color: #666666;
                margin-bottom: 5px;
            }
    
            strong {
                color: #222222;
            }
    
            .details {
                margin-bottom: 20px;
            }
    
            .payment-options {
                margin-top: 20px;
                margin-bottom: 10px;
            }
    
            .payment-options p {
                display: inline-block;
                margin-right: 20px;
            }
    
            .footer {
                color: #888888;
                font-size: 14px;
                margin-top: 20px;
                border-top: 1px solid #dddddd;
                padding-top: 10px;
            }
              .privacyDesign {
              border: 1px dashed #ccc;
              padding: 10px;
              margin: 15px 0;
              background:#ddd;
              }
              .privacyDesign h2 {
              font-size: 20px;
              margin:0
              }
              .privacyDesign ol {
              padding-left:20px;
              margin:0
              }
              .privacyDesign li {
              font-size: 14px;
              }
              .privacyDesign p {
              font-size: 12px;
              }
              tbody {}

table {background: #262626;color: #47e2cc;border-collapse: collapse;width: 100%;}

table td strong {
    color: white;
}

table tr td {
    border: 1px solid #3b3b3b;
    padding: 5px;
}



        </style>
    </head>
    
    <body>
        <div class="html">
            <div class="body">
                <div class="container">
                    <h2>Exhibitor Space Registration Form</h2>
                    <p>Dear <strong>[${firstName}]</strong>,</p>
                    <p>Thank you for your interest in participating in our upcoming exhibition. Please find below the details for the Exhibitor Space Registration:</p>
            
                    <div class="details">
                        <h3>Exhibition Details:</h3>
                        <p>
                            <strong>Date & Time:</strong> [October 3rd–4th, 2025, 10.00 AM to 6.00 PM]<br>
                            <strong>Venue & Address:</strong>  Bombay Exhibition Centre NESCO, Goregaon, Mumbai, Maharashtra 400063
                        </p>
            
                        <h3>Details:</h3>
                        <table border="1">
                          <tr>
                              <td><strong>Contact Person Name:</strong></td>
                              <td>${firstName}</td>
                          </tr>
                          <tr>
                            <td><strong>Designation:</strong></td>
                            <td>${jobTitle}</td>
                        </tr>
                          <tr>
                              <td><strong>Company Name:</strong></td>
                              <td>${bodyData.company}</td>
                          </tr>
                          
                          <tr>
                              <td><strong>Phone:</strong></td>
                              <td>${phone}</td>
                          </tr>
                          <tr>
                              <td><strong>Email Address:</strong></td>
                              <td>${email}</td>
                          </tr>
                          <tr>
                              <td><strong>Company Address:</strong></td>
                              <td>${companyAdd}</td>
                          </tr>
                          <tr>
                              <td><strong>City:</strong></td>
                              <td>${city}</td>
                          </tr>
                          <tr>
                              <td><strong>State:</strong></td>
                              <td>${state}</td>
                          </tr>
                          <tr>
                              <td><strong>Pin:</strong></td>
                              <td>${pin}</td>
                          </tr>
                          <tr>
                              <td><strong>Website:</strong></td>
                              <td>${website}</td>
                          </tr>
                          <tr>
                            <td><strong>GST:</strong></td>
                            <td>${gst}</td>
                        </tr>
                          <tr>
                            <td><strong>Stall Fascia Name:</strong></td>
                            <td>${Fascia}</td>
                        </tr>
                        <tr>
                          <td><strong>Space Choosen:</strong></td>
                          <td>[${space}]</td>
                      </tr>
                      <tr>
                        <td><strong>Space Size W X L:</strong></td>
                        <td>${Sqrm} sq.m.</td>
                    </tr>
                    <tr>
                      <td><strong>Stall No:</strong></td>
                      <td>${StallNo}</td>
                  </tr>
                  <tr>
                    <td><strong>Charges:</strong></td>
                    <td>${Charges} + 18% GST</td>
                </tr>
                <tr>
                  <td><strong>Total Charges:</strong></td>
                  <td>${totalCharge} </td>
              </tr>
              <tr>
                <td><strong>Payment Mode:</strong></td>
                <td>[√] ${selectedPaymentMode}</td>
            </tr>
                      </table>
                      
                      
        
                    </div>
            
        
            
                    <p>Please review the details provided above. If everything is accurate, proceed with the payment using your chosen mode.</p>
            
                    <p>Feel free to contact us for any further assistance or clarification regarding the registration process.</p>
                    <div class='privacyDesign'>
                      <div>
                          <h2>No Refund Policy</h2>
        
                          <ol>
                              <li>All registration fees are non-refundable.</li>
                              <li>No refunds will be issued for cancellations, no-shows, or withdrawals from the exhibition.</li>
                              <li>Participants are responsible for the full payment of registration fees, regardless of attendance or participation.</li>
                              <li>In the event of unforeseen circumstances or the cancellation of the exhibition by the organizers, a refund policy may be reviewed and communicated at the discretion of the organizing committee.</li>
                              <li>Any requests for exceptions to this policy must be submitted in writing to the event organizers for consideration.</li>
                          </ol>
                      </div>
        
                      <div>
                          <p>
                              By submitting the registration form, participants affirm that they have read, understood, and accepted the "No Refund Policy" outlined above.
                          </p>
                      </div>
                  </div>
            
                    <div class="footer">
                        <p>Thank you,</p>
                        <p>[Shivam Sharma]<br>[Organizer]<br>[pharmmaex]<br>[pharmmaex.com]</p>
                    </div>
                </div>
            </div>
        </div>

    </body>
    
    </html>
    `,
    attachments: file
      ? [{ filename: file.originalname, content: file.buffer }]
      : [],
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

app.post("/extra-product-list", async (req, res) => {
  const {
    firstName,
    email,
    phone,
    company,
    city,
    state,
    productTable = [],
    totalPrices = 0,
  } = req.body;

  // console.log(totalPrices,'totalPrices');

  const mailOptions = {
    from: "info@pharmmaex.com",
    to: email,
    bcc: ["info@pharmmaex.com", "shivam.sharma@pharmmaex.com"],
    subject: "Pharmmaex - Thanks for order.",
    html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>Order Successful</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f9f9f9; color: #ccc; margin: 0; padding: 0; }
            .emailTempArea {background: #f9f9f9; padding: 20px; margin: auto;}
            .container {font-family: Arial, sans-serif; background: #111; padding: 20px; max-width: 600px; margin: auto; color: #ccc;}
            .header { text-align: center; background: #222; color: #fff; padding: 15px; }
            .section-title { color: #73BF45; margin-top: 20px; font-weight: bold; }
            .section-desc { color: #fff; }
            .section-desc strong { color:rgb(255, 255, 255); }
            .header h1 { color: #73BF45; }
            .header h2, .header p { color: #fff; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            table, th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .footer { margin-top: 20px; font-size: 14px; }
            .footer p { color: #fff; }
            .footer a { color: #73BF45; }
            .footer a:hover { color: #73BF45; }
            .span-text { color: red; }
          </style>
        </head>
        <body>
         <div class="emailTempArea">
          <div class="container">
            <div class="header">
              <h1>Pharmmaex</h1>
              <h2>EXHIBITOR REQUIREMENTS PRODUCT’S LIST</h2>
              <p>Thank you for your recent order.<span class="span-text">Your order will be verified and processed soon.</span></p>
            </div>

            <div>
              <p class="section-title">Exhibition Details:</p>
              <p class="section-desc">
                <strong>Date:</strong> 03–04 October, 2025<br/>
                <strong>Time:</strong> 10am to 6:00pm<br/>
                <strong>Venue:</strong> Bombay Exhibition Centre, Mumbai
              </p>

              <p class="section-title">Order Details:</p>
              <table>
                <tr><th>Name</th><td>${firstName}</td></tr>
                <tr><th>Phone</th><td>${phone}</td></tr>
                <tr><th>Email</th><td style="color: #73BF45;">${email}</td></tr>
                <tr><th>Company</th><td>${company}</td></tr>
              </table>

              <table style="margin-top: 20px;">
                <thead>
                  <tr>
                    <th style="color:#73BF45;">Product</th>
                    <th style="color:#73BF45;">Quantity</th>
                  </tr>
                </thead>
                <tbody>
  ${Object.entries(productTable)
    .map(
      ([name, qty]) =>
        `<tr><td style="color: ##fff;">${name}</td><td style="color: ##fff;">${qty}</td></tr>`
    )
    .join("")}
</tbody>

              </table>

              <p><strong>Total Price:</strong> ₹${totalPrices}</p>

              <p class="section-title">No Refund Policy</p>
              <p class="section-desc">All registration fees are non-refundable. No refunds for cancellations or no-shows.</p>

              <div class="footer">
                <p>Thank you,</p>
                <p><strong>Shivam Sharma</strong><br/>Organizer<br/><a href="https://pharmmaex.com">pharmmaex.com</a></p>
              </div>
            </div>
          </div>
         </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to send email" });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
