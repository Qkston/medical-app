const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  // Determine HTTP method
  const httpMethod = event.httpMethod;

  // Parse request body
  let body;
  if (event.body) {
    body = JSON.parse(event.body);
  }

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "OPTIONS,GET,PUT",
  };

  // Variables for parameters
  const patientEmail = body?.patientEmail || event.queryStringParameters?.patientEmail;
  const doctorEmail = body?.doctorEmail || event.queryStringParameters?.doctorEmail;
  const content = body?.content;

  // Validate inputs
  if (!patientEmail || !doctorEmail) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Missing patientEmail or doctorEmail" }),
    };
  }

  const tableName = "PatientCards"; // Table Name

  try {
    if (httpMethod === "GET") {
      // GET Request - Retrieve record
      const params = {
        TableName: tableName,
        Key: {
          patientEmail: patientEmail,
        },
        FilterExpression: "doctorEmail: :doctorEmail",
        ExpressionAttributeValues: {
          ":doctorEmail": doctorEmail,
        },
      };

      const result = await dynamoDb.get(params).promise();
      if (!result.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ message: "Record not found" }),
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result.Item),
      };

    } else if (httpMethod === "PUT") {
      // PUT Request - Create or Update record
      if (!content) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ message: "Missing content in request body" }),
        };
      }

      const params = {
        TableName: tableName,
        Item: {
          patientEmail: patientEmail,
          doctorEmail: doctorEmail,
          content: content,
        },
      };

      await dynamoDb.put(params).promise();

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "Record created/updated successfully" }),
      };
    } else {
      // Unsupported Method
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
