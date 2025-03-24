const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

const CONNECTIONS_TABLE = 'WebSocketConnections';

exports.handler = async (event) => {
  const connectionId = event.requestContext.connectionId;

  const params = {
    TableName: CONNECTIONS_TABLE,
    Key: { connectionId },
  };

  try {
    await dynamoDB.delete(params).promise();
    return { statusCode: 200 };
  } catch (err) {
    console.error('Error disconnecting:', err);
    return { statusCode: 500, body: 'Failed to disconnect.' };
  }
};