const express = require('express');
const multer = require("multer");
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
// const cors = require('cors');
const app = express();

const upload = multer();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://pharmmaex.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(bodyParser.json());

// Configure nodemailer transporter
let transporter = nodemailer.createTransport({
    host: "smtp.zoho.in",  
    secureConnection: true,
    port: 465,
    auth: {
      user: 'info@pharmmaex.com',
      pass: '6h.gRlwx'
    }
  });

// API endpoint for sending emails
app.post('/send-registration-mail', async (req, res) => {
  const { firstName,lastName,email,phone,jobTitle,company,keyMail } = req.body;

 

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
  }

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.post('/send-exbitor-mail',upload.single("file"), async (req, res) => {
  const { firstName,email,phone,jobTitle,company,companyAdd,city,state,pin,website,Fascia,selectedPaymentMode,space,Sqrm,Charges,totalCharge,StallNo } = JSON.parse(req.body.jsonData);
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
                  <td>${totalCharge} + 18% GST</td>
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
    attachments: file ? [{ filename: file.originalname, content: file.buffer }] : [],
  }

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!', });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email' });
  }

});
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});