const AWS = require("aws-sdk");
const ApiGatewayManagementApi = AWS.ApiGatewayManagementApi;
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const CONNECTIONS_TABLE = "WebSocketConnections";
const MESSAGES_TABLE = "ChatMessages";

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;
  let body;

  try {
    body = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing sendMessage event body:", error);
    return { statusCode: 400, body: "Invalid request body" };
  }

  const { message, recipientEmail } = body;

  const senderParams = {
    TableName: CONNECTIONS_TABLE,
    Key: { connectionId },
  };

  try {
    // Get sender info
    const senderData = await dynamoDB.get(senderParams).promise();
    const senderEmail = senderData.Item.email;

    // Save message in DynamoDB
    const saveMessageParams = {
      TableName: MESSAGES_TABLE,
      Item: {
        connectionId,
        timestamp: new Date().toISOString(),
        sender: senderEmail,
        recipient: recipientEmail,
        message,
      },
    };

    await dynamoDB.put(saveMessageParams).promise();

    // Get recipient connections
    const recipientParams = {
      TableName: CONNECTIONS_TABLE,
      FilterExpression: "email = :email",
      ExpressionAttributeValues: {
        ":email": recipientEmail,
      },
    };

    const recipientConnections = await dynamoDB.scan(recipientParams).promise();

    const apiGateway = new ApiGatewayManagementApi({
      endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    const postCalls = recipientConnections.Items.map(async ({ connectionId }) => {
      try {
        await apiGateway
          .postToConnection({
            ConnectionId: connectionId,
            Data: JSON.stringify({
              sender: senderEmail,
              message,
              timestamp: new Date().toISOString(),
            }),
          })
          .promise();
      } catch (err) {
        if (err.statusCode === 410) {
          console.log(`Stale connection detected: ${connectionId}`);
          await dynamoDB
            .delete({
              TableName: CONNECTIONS_TABLE,
              Key: { connectionId },
            })
            .promise();
        } else {
          console.error(`Failed to send message to ${connectionId}:`, err);
        }
      }
    });

    await Promise.all(postCalls);

    return { statusCode: 200 };
  } catch (err) {
    console.error("Error sending message:", err);
    return { statusCode: 500, body: "Failed to send message." };
  }
};
