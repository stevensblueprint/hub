import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

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
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
});
