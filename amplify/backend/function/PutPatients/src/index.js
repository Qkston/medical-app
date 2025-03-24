const AWS = require("aws-sdk");
const { v4: uuidv4 } = require('uuid'); // Import the UUID library
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { doctorId, patientEmail, role, cognitoId, isArchived } = JSON.parse(event.body);

  const doctorsParams = {
    TableName: "Doctors",
    Item: {
      doctorId: doctorId,
      patientEmail: patientEmail,
      isArchived: isArchived,
    },
  };

  // Generate a unique ID for the user record
  const userId = uuidv4();
  
  const usersParams = {
    TableName: "users",
    Item: {
      id: userId, // Add the unique ID
      email: patientEmail,
      role: role,
      cognitoId: cognitoId,
    },
  };

  try {
    await dynamoDb.put(doctorsParams).promise();
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
