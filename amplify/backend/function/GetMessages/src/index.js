const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const MESSAGES_TABLE = "ChatMessages";

exports.handler = async (event) => {
  console.log(event);
  const { userEmail, companionEmail } = event.queryStringParameters;

  if (!userEmail || !companionEmail) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
      },
      body: JSON.stringify({ message: "Missing userEmail or companionEmail" }),
    };
  }

  const params = {
    TableName: MESSAGES_TABLE,
    FilterExpression: "(sender = :userEmail AND recipient = :companionEmail) OR (sender = :companionEmail AND recipient = :userEmail)",
    ExpressionAttributeValues: {
      ":userEmail": userEmail,
      ":companionEmail": companionEmail,
    },
  };

  try {
    const result = await dynamoDB.scan(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
      },
      body: JSON.stringify({ messages: result.Items }),
    };
  } catch (error) {
    console.error("Error fetching messages:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
      },
      body: JSON.stringify({ message: "Error fetching messages", error }),
    };
  }
};
