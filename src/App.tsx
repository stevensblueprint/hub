import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import { useEffect } from "react";

const client = generateClient<Schema>();
function App() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await client.queries.getSecrets({});
        console.log(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);
  const { signOut } = useAuthenticator();
  return (
    <main>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
