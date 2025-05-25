import type { Handler } from "aws-lambda";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

interface GetSecretEvent {
  secretKey?: string;
}

export const handler: Handler = async (event: GetSecretEvent, context) => {
  console.log("Event: ", event);
  console.log("Context: ", context);

  const { secretKey } = event;
  const secretArn = process.env.SECRET_ARN;

  try {
    const command = new GetSecretValueCommand({
      SecretId: secretArn,
    });

    const result = await client.send(command);

    if (!result.SecretString) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Secret not found or empty",
        }),
      };
    }

    const secrets = JSON.parse(result.SecretString);
    if (secretKey) {
      if (secrets[secretKey]) {
        return {
          statusCode: 200,
          body: JSON.stringify({
            secretKey: secretKey,
            secretValue: secrets[secretKey],
            versionId: result.VersionId,
            createdDate: result.CreatedDate,
          }),
        };
      } else {
        return {
          statusCode: 404,
          body: JSON.stringify({
            error: `Secret key '${secretKey}' not found`,
          }),
        };
      }
    }
    const secretKeys = Object.keys(secrets);

    return {
      statusCode: 200,
      body: JSON.stringify({
        secretKeys: secretKeys,
        versionId: result.VersionId,
        createdDate: result.CreatedDate,
        secrets: secrets,
      }),
    };
  } catch (error) {
    console.error("Error retrieving secret:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to retrieve secret",
        details: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
