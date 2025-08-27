const express = require("express");
const { generatePDF } = require("./generatePDF");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 8090;

app.use(express.json());

app.use("/generate-pdf", async (req, res) => {
  try {
    const input = req.body;
    console.log(">>>> the value of the INPUT is : ", input);
    const { pdfValues } = input;
    console.log(">>>> the value of the pdfValues is : ", pdfValues);

    const pdfData = await generatePDF(pdfValues);
    console.log(">>>> the value of the PDF DATA is : ", pdfData);

    return res
      .status(200)
      .json({ message: "Pdf generated successfully.", data: pdfData });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.use("/", (req, res) => {
  return res.status(200).send("This is the test Api..");
});

app.listen(PORT, () => {
  console.log(">>>>> the SERVER is running on the PORT - ", PORT);
});
