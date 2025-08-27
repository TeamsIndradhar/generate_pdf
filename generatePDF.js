const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

// HTML Template code for PDF generation
const pdfHtmlContent = `
      <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Purchase / Job Order</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 14px;
      margin: 20px;
      display:flex;
      justify-content:center;
    }
    .outer_container{
      border:1px solid black;
      padding:10px;
      width:75%;
    }
    .header {
      text-align: center;
      font-weight: bold;
    }
    .flex{
      display:flex;
      justify-content:space-between;
    }
    .sub-header {
      text-align: center;
      margin-bottom: 10px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    table, th, td {
      border: 1px solid black;
    }
    th, td {
      padding: 6px;
      text-align: start;
      height:15px;
    }
    .no-border {
      border: none !important;
    }
    .terms {
      font-size: 12px;
      margin-top: 10px;
    }
    .signature {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      font-size: 12px;
    }
    .slNo{
      width:5%
    }
    .amount{
      width:13%;
    }
  </style>
</head>
<body>

 <div class="outer_container">
	 <div class="header">PURCHASE / JOB ORDER</div>
  <div class="sub-header">
    <strong>LTS INTERNATIONAL</strong><br>
    <div class="flex">
      <p>Add.: B-13, Hosiery Complex,<br> Phase-II, NOIDA (U.P.)</p>
      <p>GSTIN : 09AAAF L2094B3ZL</p><p>Tel: 0120-2462013</p>
    </div>
  </div>

  <table>
    <tr>
      <!-- <td>Order No. LTS / <strong>{{orderNumber}}</strong></td> -->
      <td>J.O. No.: <strong>{{jobOrderNumber}}</strong></td>
      <td>Date: <strong>{{date}}</strong></td>
    </tr>
  </table>

  <table>
    <tr>
      <td>Supplier’s Name : <strong>{{vendorName}}</strong></td>
    </tr>
    <tr>
      <td>Address : <strong>{{vendorAddress}}</strong></td>
    </tr>
  </table>

  <p>Please supply the following, as per terms mentioned below:</p>

  <table>
    <tr>
      <th class="slNo">Sl. No.</th>
      <th>PARTICULARS</th>
      <th class="amount">QTY.</th>
      <th class="amount">RATE</th>
      <th class="amount">AMOUNT</th>
    </tr>
    <tr>
      <td class="slNo">1</td>
      <td>{{particulars}}</td>
      <td class="amount">{{quantity}}</td>
      <td class="amount">{{rate}}</td>
      <td class="amount">{{amount}}</td>
    </tr>
    <tr>
      <td class="slNo"></td>
      <td></td>
      <td class="amount"></td>
      <td class="amount"></td>
      <td class="amount"></td>
    </tr>
    <tr>
      <td class="slNo"></td>
      <td></td>
      <td class="amount"></td>
      <td class="amount"></td>
      <td class="amount"></td>
    </tr>
    <tr>
      {{notes}}
    </tr>
    <tr>
      <td class="slNo"></td>
      <td></td>
      <td class="amount"></td>
      <td class="amount"></td>
      <td class="amount"></td>
    </tr>
    <tr>
      <td class="slNo"></td>
      <td></td>
      <td class="amount"></td>
      <td class="amount"></td>
      <td class="amount"></td>
    </tr>
    <tr>
      <td class="slNo"></td>
      <td></td>
      <td class="no-border amount" colspan=2 style="text-align: center"><strong>TOTAL</strong></td>
      <td class="amount" style="text-align: center;"><strong>{{amount}}</strong></td>
    </tr>
  </table>

  <div class="terms">
    <strong>Terms & Conditions:</strong><br>
    1. Quality : The quality of the product has to be as per the specifications and / or LTS approved sample.<br>
    2. Delivery : <strong>{{deliveryTerms}}</strong><br>
    3. Penalty : If the supplier fails to deliver goods within above mentioned specified time penalty @ <strong>{{penalty}}</strong> per piece per day would be imposed.<br>
    4. Payment Terms : <strong>{{paymentTerms}}</strong><br>
    5. Remarks : <strong>{{remarks}}</strong><br>
  </div>

  <div class="signature">
    <div>Supplier's Signature</div>
    <div>For LTS International<br>Manager</div>
  </div>
</div>

</body>
</html>
    `;

const replaceVariablesInHtmlTemplate = async (htmlTemplate, details) => {
  try {
    let replacedTemplate = htmlTemplate;

    for (const key in details) {
      const placeholder = "{{" + key + "}}";
      const value = details[key];

      if (value && replacedTemplate.includes(placeholder)) {
        replacedTemplate = replacedTemplate.replace(
          new RegExp(placeholder, "g"),
          value
        );
      }
    }

    return replacedTemplate;
  } catch (error) {
    console.log(
      ">>>>> the error in the replace variables in HTML template is : ",
      error
    );
    throw error;
  }
};

function formatJobOrderNumber(input) {
  // Normalize input to Date
  const date = typeof input === "string" ? new Date(input) : input;

  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedHours = hours.toString().padStart(2, "0");

  return `${day}-${month}-${year}--${formattedHours}-${minutes}${ampm}`;
}

/**
 * Generates a PDF in memory (Buffer) using pdf-lib
 */
async function generatePDF(pdfValues) {
  try {
    // 1. Launch Playwright browser
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // 2. Provide your HTML content
    const htmlContent = await replaceVariablesInHtmlTemplate(
      pdfHtmlContent,
      pdfValues
    );

    await page.setContent(htmlContent, { waitUntil: "load" });

    // Pick storage path
    const folder =
      process.env.NODE_ENV === "production"
        ? "/tmp" // for Vercel
        : path.join(process.cwd(), "internal-job-orders"); // local dev inside project

    // Ensure folder exists
    await fs.mkdirSync(folder, { recursive: true });

    // Generating file name
    const fileName = `job-order-${formatJobOrderNumber(new Date())}.pdf`;
    // Generate file path
    const filePath = path.join(folder, fileName);

    // 4. Generate PDF and save
    await page.pdf({ path: filePath, format: "A4" });

    await browser.close();

    return {
      filename: fileName, // name to show in email
      path: filePath, // local file path
      contentType: "application/pdf",
    };
  } catch (err) {
    console.log(">>>>> the error in the Generate PDF function is : ", err);
    throw err;
  }
}

module.exports = { generatePDF };
