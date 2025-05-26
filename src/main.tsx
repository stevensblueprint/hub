import React from "react";
import ReactDOM from "react-dom/client";
import { Authenticator } from "@aws-amplify/ui-react";
import App from "./App.tsx";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);
const formFields = {
  signUp: {
    email: {
      order: 1,
    },
    givenName: {
      order: 2,
    },
    familyName: {
      order: 3,
    },
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Authenticator hideSignUp formFields={formFields}>
      <App />
    </Authenticator>
  </React.StrictMode>
);
