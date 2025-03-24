const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log("event: ", event);
  // Перевірка наявності queryStringParameters
  if (!event.queryStringParameters || !event.queryStringParameters.doctorId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing doctorId in query parameters' }),
    };
  }

  const { doctorId } = event.queryStringParameters;

  const params = {
    TableName: 'Doctors',
    KeyConditionExpression: 'doctorId = :doctorId',
    ExpressionAttributeValues: {
      ':doctorId': doctorId,
    },
  };

  try {
    const result = await dynamoDb.query(params).promise();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Додати підтримку CORS
        "Access-Control-Allow-Methods": "OPTIONS,GET",
      },
      body: JSON.stringify(result.Items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Додати підтримку CORS
        "Access-Control-Allow-Methods": "OPTIONS,GET",
      },
      body: JSON.stringify({ message: 'Error retrieving patients', error }),
    };
  }
};
