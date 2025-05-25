import type { Handler } from "aws-lambda";
import {
  SecretsManagerClient,
  PutSecretValueCommand,
  UpdateSecretCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

interface SetSecretEvent {
  secretKey: string;
  secretValue: string;
  description?: string;
}

export const handler: Handler = async (event: SetSecretEvent, context) => {
  console.log("Event: ", event);
  console.log("Context: ", context);

  const { secretKey, secretValue, description } = event;
  const secretArn = process.env.SECRET_ARN;

  if (!secretKey || !secretValue) {
    return {
      statusCode: 400,
      body: {
        error: "Missing required parameters: secretKey and secretValue",
      },
    };
  }

  try {
    let existingSecrets = {};
    try {
      const { GetSecretValueCommand } = await import(
        "@aws-sdk/client-secrets-manager"
      );
      const getCommand = new GetSecretValueCommand({
        SecretId: secretArn,
      });
      const getResult = await client.send(getCommand);
      if (getResult.SecretString) {
        existingSecrets = JSON.parse(getResult.SecretString);
      }
    } catch (error) {
      console.log("No existing secrets found, creating new structure");
    }
    const updatedSecrets = {
      ...existingSecrets,
      [secretKey]: secretValue,
    };
    const putCommand = new PutSecretValueCommand({
      SecretId: secretArn,
      SecretString: JSON.stringify(updatedSecrets),
    });

    const result = await client.send(putCommand);
    if (description) {
      const updateCommand = new UpdateSecretCommand({
        SecretId: secretArn,
        Description: description,
      });
      await client.send(updateCommand);
    }

    return {
      statusCode: 200,
      body: {
        message: "Secret updated successfully",
        secretKey: secretKey,
        versionId: result.VersionId,
      },
    };
  } catch (error) {
    console.error("Error updating secret:", error);
    return {
      statusCode: 500,
      body: {
        error: "Failed to update secret",
        details: error instanceof Error ? error.message : String(error),
      },
    };
  }
};
