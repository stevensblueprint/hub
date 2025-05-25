import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource";
import { data } from "./data/resource";
import { setSecrets } from "./functions/set-secrets/resource";
import { getSecrets } from "./functions/get-secrets/resource";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as iam from "aws-cdk-lib/aws-iam";

const backend = defineBackend({
  auth,
  data,
  setSecrets,
  getSecrets,
});

const stack = backend.createStack("secretsmanager");
const secret = new secretsmanager.Secret(stack, "secret-blueprint", {
  secretName: "blueprint-secrets",
  description: "Secrets for the blueprint application",
  generateSecretString: {
    secretStringTemplate: JSON.stringify({ username: "admin" }),
    generateStringKey: "password",
    excludeCharacters: '"@/\\',
  },
});

const secretsPolicy = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: [
    "secretsmanager:GetSecretValue",
    "secretsmanager:PutSecretValue",
    "secretsmanager:UpdateSecret",
    "secretsmanager:DescribeSecret",
  ],
  resources: [secret.secretArn],
});

backend.setSecrets.resources.lambda.addToRolePolicy(secretsPolicy);
backend.getSecrets.resources.lambda.addToRolePolicy(secretsPolicy);

backend.setSecrets.addEnvironment("SECRET_ARN", secret.secretArn);
backend.setSecrets.addEnvironment("SECRET_NAME", "blueprint-secrets");

backend.getSecrets.addEnvironment("SECRET_ARN", secret.secretArn);
backend.getSecrets.addEnvironment("SECRET_NAME", "blueprint-secrets");
