const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const CONNECTIONS_TABLE = "WebSocketConnections";

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;

  let userType, email;

  try {
    // Розбір вхідних даних із queryStringParameters
    if (event.queryStringParameters) {
      userType = event.queryStringParameters.userType;
      email = event.queryStringParameters.email;
    } else {
      return {
        statusCode: 400,
        body: "Missing query parameters: userType and email",
      };
    }

    if (!userType || !email) {
      return {
        statusCode: 400,
        body: "Invalid parameters: userType and email are required",
      };
    }

    const params = {
      TableName: CONNECTIONS_TABLE,
      Item: {
        connectionId,
        userType,
        email,
      },
    };

    await dynamoDB.put(params).promise();
    console.log("Connection saved:", params);

    return { statusCode: 200 };
  } catch (err) {
    console.error("Error saving connection:", err);
    return { statusCode: 500, body: "Failed to connect." };
  }
};