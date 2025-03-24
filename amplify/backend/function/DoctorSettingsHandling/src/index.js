const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // Get HTTP method from the event
  const httpMethod = event.httpMethod;

  // Set up response headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT",
  };

  const tableName = "users";

  try {
    if (httpMethod === "GET") {
      // ------------------
      // Handle GET Request
      // ------------------

      // Get doctorEmail from query parameters
      const doctorEmail = event.queryStringParameters?.email;

      // Validate email parameter
      if (!doctorEmail) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Missing doctorEmail in query parameters" }),
        };
      }

      // Query parameters for DynamoDB
      const params = {
        TableName: tableName,
        FilterExpression: "email = :emailValue",
        ExpressionAttributeValues: {
          ":emailValue": doctorEmail,
        },
      };

      // Scan for matching entry
      const result = await dynamoDb.scan(params).promise();
      const user = result.Items[0];

      if (!user) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: "User not found" }),
        };
      }

      // Return the settings parameter
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ settings: user.settings }),
      };
    } else if (httpMethod === "PUT") {
      // ------------------
      // Handle PUT Request
      // ------------------

      // Parse body of the request
      const body = JSON.parse(event.body);

      // Extract userId and settings
      const userId = body.id;
      const settings = body.settings;

      // Validate inputs
      if (!userId || !settings) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Missing userId or settings in request body" }),
        };
      }

      // Update settings in the record
      const params = {
        TableName: tableName,
        Key: { id: userId },
        UpdateExpression: "SET settings = :settingsValue",
        ExpressionAttributeValues: {
          ":settingsValue": settings,
        },
        ReturnValues: "UPDATED_NEW",
      };

      await dynamoDb.update(params).promise();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Settings updated successfully" }),
      };
    } else {
      // Unsupported HTTP Method
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ message: `Unsupported method: ${httpMethod}` }),
      };
    }
  } catch (error) {
    // Handle errors
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Error processing request", error }),
    };
  }
};
