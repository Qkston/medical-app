const AWS = require("aws-sdk");
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const DOCTORS_TABLE = "Doctors";

exports.handler = async (event) => {
  try {
    const { doctorId, patientEmail, isArchived } = event;

    if (!doctorId || !patientEmail || typeof isArchived !== "boolean") {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST",
        },
        body: JSON.stringify({ message: "Invalid input parameters" }),
      };
    }

    // Update the isArchived field in DynamoDB
    const params = {
      TableName: DOCTORS_TABLE,
      Key: {
        doctorId,
        patientEmail,
      },
      UpdateExpression: "set isArchived = :isArchived",
      ExpressionAttributeValues: {
        ":isArchived": isArchived,
      },
      ReturnValues: "UPDATED_NEW",
    };

    await dynamoDB.update(params).promise();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({
        message: isArchived
          ? "Patient archived successfully"
          : "Patient reactivated successfully",
      }),
    };
  } catch (error) {
    console.error("Error archiving/reactivating patient:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST",
      },
      body: JSON.stringify({ message: "Failed to archive/reactivate patient" }),
    };
  }
};
