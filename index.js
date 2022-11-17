const aws = require("aws-sdk");
const ddb = new aws.DynamoDB();
const ses = new aws.SES();

exports.handler = (event) => {
  sendVerificationEmail(event)
    .then(() => console.log("email sent"))
    .catch((error) => console.log(error.toString()));
};

async function sendVerificationEmail(event) {
  let queryParams = {
    TableName: "csye6225",
    Key: {
      id: { S: event.Records[0].Sns.Message },
    },
  };
  const data = await ddb.getItem(queryParams).promise();
  const token = Object.values(data.Item.token)[0];

  const params = {
    Destination: {
      ToAddresses: event.Records[0].Sns.Message,
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data:
            "https://prod.hackerboard.xyz/v1/verifyEmail?email=" +
            event.Records[0].Sns.Message +
            "&token=" +
            token,
        },
        Text: {
          Charset: "UTF-8",
          Data: "TEXT_FORMAT_BODY",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "Email Verification",
      },
    },
    Source: "no-reply@prod.hackerboard.xyz",
  };

  await ses.sendEmail(params).promise();
}
