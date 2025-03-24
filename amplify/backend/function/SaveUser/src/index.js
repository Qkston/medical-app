const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid'); // Import the UUID library
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { email, role, cognitoId } = JSON.parse(event.body);

  // Generate a unique ID for the user record
  const userId = uuidv4();

  const usersParams = {
    TableName: "users",
    Item: {
      id: userId, // Add the unique ID
      email: email,
      role: role,
      cognitoId: cognitoId,
    },
  };

  try {
    // Save to Users table
    await dynamoDb.put(usersParams).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ message: "User saved successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ message: "Error saving user", error }),
    };
  }
};
