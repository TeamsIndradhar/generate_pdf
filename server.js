const express = require("express");
const { generatePDF } = require("./common_functions/generatePDF");
const { sendEmailFunction } = require("./common_functions/sendEmail");
require("dotenv").config();

const app = express();
const cors = require("cors");

const PORT = process.env.PORT || 8090;

app.use(cors());
app.use(express.json());

app.use("/generate-pdf", async (req, res) => {
  try {
    const input = req.body;
    console.log(">>>> the value of the INPUT is : ", input);
    const { pdfValues, otherData } = input;
    console.log(">>>> the value of the pdfValues is : ", pdfValues);

    const pdfData = await generatePDF(pdfValues);
    console.log(">>>> the value of the PDF DATA is : ", pdfData);

    const { recipient, subject, html, isAttachment, mobile_number } = otherData;

    let isEmailSentSuccessfully = false;

    try {
      const sendEmail = await sendEmailFunction(
        recipient,
        subject, // Subject
        html,
        isAttachment, // isAttachment = true
        [pdfData] // attachments
      );

      console.log(">>>>>> the value of the SEND EMAIL is : ", sendEmail);

      // assume sendEmailFunction returns { success: true/false } or something similar
      if (sendEmail && sendEmail.success) {
        isEmailSentSuccessfully = true;
      }
    } catch (emailError) {
      console.log(">>>>> Error while sending email:", emailError);
      isEmailSentSuccessfully = false;
    }

    return res.status(200).json({
      message: "Pdf generated successfully.",
      isEmailSentSuccessfully,
    });
  } catch (error) {
    console.log(">>>>> the error in the GENERATE pdf api is : ", error);
    return res
      .status(500)
      .json({ message: error.message, isEmailSentSuccessfully: false });
  }
});

app.use("/", (req, res) => {
  return res.status(200).send("This is the test Api..");
});

app.listen(PORT, () => {
  console.log(">>>>> the SERVER is running on the PORT - ", PORT);
});
