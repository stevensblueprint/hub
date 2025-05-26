import { MdDashboard } from "react-icons/md";
import { Icon } from "@aws-amplify/ui-react";

export const appNavs = [
  {
    eventKey: "secrets",
    icon: <Icon as={MdDashboard} />,
    title: "Secrets",
    to: "/",
  },
];
