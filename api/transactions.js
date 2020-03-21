/* eslint-disable no-console */
const uuid = require('uuid');
const AWS = require('aws-sdk');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function saveTransaction(transaction) {
  console.log('saving transaction...');
  const tableItem = {
    TableName: process.env.TRANSACTIONS_TABLE,
    Item: transaction,
  };

  return dynamoDb.put(tableItem);
}

function transactionInfo(date, amount, description, category) {
  const timeStampUtc = new Date().getTime();
  return {
    id: uuid.v1(),
    date,
    amount,
    description,
    category,
    timeStampUtc,
  };
}

async function post(event, context, callback) {
  const requestBody = JSON.parse(event.body);
  const {
    date,
    amount,
    description,
    category,
  } = requestBody;

  if (typeof date !== 'string'
    || typeof amount !== 'number'
    || typeof description !== 'string'
    || typeof category !== 'string'
  ) {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit candidate because of validation errors.'));
  }

  try {
    const response = await saveTransaction(transactionInfo(date, amount, description, category));
    callback(null, {
      statusCode: 200,
      body: JSON.stringify({
        message: `Successfully saved transaction ${description} of $${amount}`,
        transactionId: response.id,
      }),
    });
  } catch (error) {
    console.log(error);
    callback(null, {
      statusCode: 500,
      body: JSON.stringify({
        message: `Unable to save transaction ${description} of $${amount}`,
      }),
    });
  }
}

module.exports = { post };
