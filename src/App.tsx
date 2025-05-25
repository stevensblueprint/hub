import { useAuthenticator } from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../amplify/data/resource";
import { useEffect, useState } from "react";

const client = generateClient<Schema>();

interface SecretsData {
  secretKeys: string[];
  versionId: string;
  createdDate: string;
  secrets: Record<string, string>;
}

function App() {
  const [secretsData, setSecretsData] = useState<SecretsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await client.queries.getSecrets();
        if (response.data?.body) {
          const parsedData = JSON.parse(response.data.body as string);
          setSecretsData(parsedData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error instanceof Error ? error.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { signOut } = useAuthenticator();

  if (loading) {
    return (
      <main>
        <p>Loading secrets...</p>
        <button onClick={signOut}>Sign out</button>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <p>Error: {error}</p>
        <button onClick={signOut}>Sign out</button>
      </main>
    );
  }

  return (
    <main>
      <h1>Secrets Manager</h1>
      {secretsData && (
        <div>
          <h2>Available Secret Keys:</h2>
          <ul>
            {secretsData.secretKeys.map((key) => (
              <li key={key}>{key}</li>
            ))}
          </ul>
          <p>Version ID: {secretsData.versionId}</p>
          <p>Created: {new Date(secretsData.createdDate).toLocaleString()}</p>
        </div>
      )}
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
