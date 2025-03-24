const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { email } = event.queryStringParameters;

  if (!email) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
      },
      body: JSON.stringify({ message: "Missing email in query parameters" }),
    };
  }

  const userParams = {
    TableName: "users",
    FilterExpression: "email = :emailValue",
    ExpressionAttributeValues: {
      ":emailValue": email,
    },
  };

  try {
    // Отримати користувача з таблиці "users"
    const result = await dynamoDb.scan(userParams).promise();
    const user = result.Items[0]; // Передбачається, що email унікальний

    if (!user) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,GET",
        },
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    let doctorEmail = null;

    // Якщо користувач є пацієнтом, знайти його лікаря
    if (user.role === "patient") {
      const doctorParams = {
        TableName: "Doctors",
        FilterExpression: "patientEmail = :emailValue",
        ExpressionAttributeValues: {
          ":emailValue": email,
        },
      };

      const doctorResult = await dynamoDb.scan(doctorParams).promise();
      const doctorRecord = doctorResult.Items[0]; // Передбачається, що пацієнт закріплений за одним лікарем

      if (doctorRecord && doctorRecord.doctorId) {
        // Отримати email лікаря
        const doctorUserParams = {
          TableName: "users",
          Key: {
            id: doctorRecord.doctorId, // Використовуємо doctorId як первинний ключ
          },
        };

        const doctorUserResult = await dynamoDb.get(doctorUserParams).promise();
        doctorEmail = doctorUserResult.Item ? doctorUserResult.Item.email : null;
      }
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
      },
      body: JSON.stringify({
        user: {
          ...user,
          doctorEmail: doctorEmail || undefined,
        },
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,GET",
      },
      body: JSON.stringify({ message: "Error retrieving user role", error }),
    };
  }
};
