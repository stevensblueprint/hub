import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { getSecrets } from "../functions/get-secrets/resource";
import { setSecrets } from "../functions/set-secrets/resource";

const schema = a.schema({
  Deployment: a
    .model({
      id: a.id(),
      name: a.string(),
      description: a.string(),
      config: a.json(),
      createdAt: a.timestamp(),
      updatedAt: a.timestamp(),
    })
    .authorization((allow) => [
      allow.groups(["DEPLOYER"]).to(["read", "update", "delete", "create"]),
    ]),
  SecretsResponse: a.customType({
    statusCode: a.integer(),
    body: a.json(),
  }),
  getSecrets: a
    .query()
    .returns(a.ref("SecretsResponse"))
    .authorization((allow) => [allow.authenticated()]) // TODO: add admin group
    .handler(a.handler.function(getSecrets)),
  setSecrets: a
    .query()
    .arguments({
      secrets: a.json(),
    })
    .returns(a.ref("SecretsResponse"))
    .authorization((allow) => [allow.authenticated()]) // TODO: add admin group,
    .handler(a.handler.function(setSecrets)),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
});
