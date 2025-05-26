import type { Handler } from "aws-lambda";
import {
  SecretsManagerClient,
  PutSecretValueCommand,
  UpdateSecretCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: process.env.AWS_REGION });

interface SetSecretsEvent {
  secrets: Record<string, string> | string;
  description?: string;
}

export const handler: Handler<SetSecretsEvent> = async (event, context) => {
  console.log("Event:", event);
  console.log("Context:", context);

  const raw = event.secrets;
  let secretsMap: Record<string, string>;
  try {
    secretsMap = typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return {
      statusCode: 400,
      body: {
        error: "Invalid JSON in `secrets` argument",
      },
    };
  }

  if (
    !secretsMap ||
    typeof secretsMap !== "object" ||
    Object.values(secretsMap).some((v) => typeof v !== "string")
  ) {
    return {
      statusCode: 400,
      body: {
        error:
          '`secrets` must be a map of string→string, e.g. { key1: "val1", key2: "val2" }',
      },
    };
  }

  const secretArn = process.env.SECRET_ARN!;
  try {
    const putCmd = new PutSecretValueCommand({
      SecretId: secretArn,
      SecretString: JSON.stringify(secretsMap),
    });
    const result = await client.send(putCmd);

    if (event.description) {
      const updateCmd = new UpdateSecretCommand({
        SecretId: secretArn,
        Description: event.description,
      });
      await client.send(updateCmd);
    }

    return {
      statusCode: 200,
      body: {
        secrets: secretsMap,
        versionId: result.VersionId,
      },
    };
  } catch (err) {
    console.error("Error replacing secrets:", err);
    return {
      statusCode: 500,
      body: {
        error: "Failed to replace secrets",
        details: err instanceof Error ? err.message : String(err),
      },
    };
  }
};
