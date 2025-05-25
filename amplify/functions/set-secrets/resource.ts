import { defineFunction } from "@aws-amplify/backend";

export const setSecrets = defineFunction({
  name: "set-secrets",
  entry: "./handler.ts",
});
