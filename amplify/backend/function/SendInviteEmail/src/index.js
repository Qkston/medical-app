const AWS = require('aws-sdk');
const ses = new AWS.SES();

exports.handler = async (event) => {
  const { email, token, doctorId } = JSON.parse(event.body);

  if (!email || !token || !doctorId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ message: 'Missing parameters in request body' }),
    };
  }

  try {
    const emailParams = {
      Source: 'qkston22@gmail.com',
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: 'Запрошення до медичного застосунку',
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: `Вас запросили приєднатися до медичного застосунку. Перейдіть за посиланням для завершення реєстрації: http://localhost:3000/register?token=${token}&email=${encodeURIComponent(email)}&doctorId=${doctorId}`,
            Charset: 'UTF-8',
          },
        },
      },
    };

    await ses.sendEmail(emailParams).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ message: 'Запрошення надіслано успішно' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ message: 'Failed to send invitation', error }),
    };
  }
};
