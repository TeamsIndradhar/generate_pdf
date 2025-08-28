const { default: axios } = require("axios");

const sendWhatsappfunction = async ({
  vendorName,
  mobileNumber,
  productName,
  finalPrice,
  expectedCompletionTime,
  attachment,
}) => {
  try {
    // have to call the Whatsaap API with the input details to send the JOB-ORDER on whatsapp
    const sendStatus = await axios.post("whatsapp_url", {});

    if (!sendStatus) throw "Whatsapp sending failed.";

    return { messageId: "1234", message: "Send successfully" };
  } catch (error) {
    console.log(">>>> the error in the send whatsapp function is : ", error);
    return error;
  }
};

module.exports = { sendWhatsappfunction };
