const AWS = require("aws-sdk");
const SES = new AWS.SES();

exports.handler = async (event) => {
  const { patientEmail, callLink } = JSON.parse(event.body);

  if (!patientEmail || !callLink) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ message: "Missing patientEmail or callLink" }),
    };
  }

  const emailParams = {
    Source: "qkston22@gmail.com",
    Destination: {
      ToAddresses: [patientEmail],
    },
    Message: {
      Subject: {
        Data: "Ви отримали посилання на відеодзвінок",
      },
      Body: {
        Text: {
          Data: `Перейдіть за посиланням, щоб приєднатися до відеодзвінка: ${callLink}`,
        },
      },
    },
  };

  try {
    await SES.sendEmail(emailParams).promise();
    return { 
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ message: "Email sent" }) };
  } catch (error) {
    console.error("Error sending email:", error);
    return { 
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ message: "Failed to send email" }) };
  }
};
