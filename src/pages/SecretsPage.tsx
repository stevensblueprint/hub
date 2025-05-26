import { useAuthenticator } from "@aws-amplify/ui-react";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Flex,
  View,
  Heading,
  Text,
  Alert,
  Card,
  Divider,
} from "@aws-amplify/ui-react";
import { generateClient } from "aws-amplify/api";
import type { Schema } from "../../amplify/data/resource";
import { useEffect, useState } from "react";
import SideBar from "../components/sidebar";
import { MdContentCopy } from "react-icons/md";

const client = generateClient<Schema>();

interface SecretsData {
  secretKeys: string[];
  versionId: string;
  createdDate: string;
  secrets: Record<string, string>;
}

interface EditableSecret {
  key: string;
  value: string;
  isNew?: boolean;
  toDelete?: boolean;
}

function SecretsPage() {
  const [secretsData, setSecretsData] = useState<SecretsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editableSecrets, setEditableSecrets] = useState<EditableSecret[]>([]);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await client.queries.getSecrets();
        console.log("Response from getSecrets:", response);
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

  const handleEdit = () => {
    if (secretsData) {
      const editable = Object.entries(secretsData.secrets).map(
        ([key, value]) => ({
          key,
          value,
        })
      );
      setEditableSecrets(editable);
      setIsEditing(true);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditableSecrets([]);
  };

  const addNewSecret = () => {
    setEditableSecrets([
      ...editableSecrets,
      { key: "", value: "", isNew: true },
    ]);
  };

  const updateSecret = (
    index: number,
    field: "key" | "value",
    newValue: string
  ) => {
    const updated = [...editableSecrets];
    updated[index][field] = newValue;
    setEditableSecrets(updated);
  };

  const toggleDelete = (index: number) => {
    const updated = [...editableSecrets];
    updated[index].toDelete = !updated[index].toDelete;
    setEditableSecrets(updated);
  };

  const removeNewSecret = (index: number) => {
    const updated = editableSecrets.filter((_, i) => i !== index);
    setEditableSecrets(updated);
  };

  const saveChanges = async () => {
    try {
      setSaving(true);
      const updatedSecrets: Record<string, string> = {};

      editableSecrets.forEach((secret) => {
        if (!secret.toDelete && secret.key.trim() && secret.value.trim()) {
          updatedSecrets[secret.key.trim()] = secret.value.trim();
        }
      });
      console.log("Updated secrets:", updatedSecrets);
      const response = await client.queries.setSecrets({
        secrets: JSON.stringify(updatedSecrets),
      });
      console.log("Response:", response);
      if (response.data?.body) {
        const parsed: SecretsData = JSON.parse(response.data.body as string);
        setSecretsData(parsed);
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving secrets:", error);
      setError(
        error instanceof Error ? error.message : "Failed to save secrets"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (value: string) => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopyMessage("Secret copied to clipboard!");
        setTimeout(() => setCopyMessage(null), 3000);
      })
      .catch((err) => {
        console.error("Copy failed", err);
        setError("Failed to copy secret");
      });
  };

  if (loading) {
    return (
      <View padding="1rem">
        <Text>Loading secrets...</Text>
        <Button onClick={signOut} variation="link">
          Sign out
        </Button>
      </View>
    );
  }

  if (error) {
    return (
      <View padding="1rem">
        <Alert variation="error" hasIcon>
          <Heading level={4}>Error</Heading>
          {error}
        </Alert>
        <Button onClick={signOut} variation="link">
          Sign out
        </Button>
      </View>
    );
  }

  return (
    <>
      <Flex direction={"row"} height="100vh" alignItems="stretch" gap="1rem">
        <View width={"300px"} backgroundColor="neutral.10">
          <SideBar />
        </View>
        <View padding="1rem" width={"100%"}>
          <Flex direction="row" justifyContent="flex-end" alignItems="center">
            <Button onClick={signOut} variation="link">
              Sign out
            </Button>
          </Flex>

          {secretsData && !isEditing && (
            <View marginTop="1rem">
              <Flex
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="1rem"
              >
                <Heading level={2}>Secrets</Heading>
                <Button onClick={handleEdit} variation="primary">
                  Edit Secrets
                </Button>
              </Flex>
              {copyMessage && (
                <Alert variation="success" hasIcon marginBottom="1rem">
                  {copyMessage}
                </Alert>
              )}
              <Table variation="striped">
                <TableHead>
                  <TableRow>
                    <TableCell as="th">Secret Key</TableCell>
                    <TableCell as="th">Secret Value</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {Object.entries(secretsData.secrets).map(([key, value]) => (
                    <TableRow key={key}>
                      <TableCell>
                        <Text fontWeight="bold">{key}</Text>
                      </TableCell>
                      <TableCell>
                        <Flex direction="row" alignItems="center" gap="0.5rem">
                          <Text fontFamily="monospace">
                            {"*".repeat(Math.min(value.length, 12))}
                          </Text>
                          <Button
                            variation="link"
                            size="small"
                            ariaLabel="Copy secret to clipboard"
                            onClick={() => handleCopy(value)}
                          >
                            <MdContentCopy />
                          </Button>
                        </Flex>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <View marginTop="1rem">
                <Text fontSize="0.875rem" color="gray">
                  Version ID: {secretsData.versionId} • Created:{" "}
                  {new Date(secretsData.createdDate).toLocaleString()}
                </Text>
              </View>
            </View>
          )}

          {isEditing && (
            <Card marginTop="1rem">
              <View padding="1rem">
                <Flex
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  marginBottom="1rem"
                >
                  <Heading level={3}>Edit Secrets</Heading>
                  <Button onClick={cancelEdit} size="small" variation="link">
                    Cancel
                  </Button>
                </Flex>

                <Divider marginBottom="1rem" />
                <Alert variation="info" marginTop="1rem" marginBottom={"1rem"}>
                  <Text fontSize="0.875rem">
                    • Green background indicates new secrets to be added
                    <br />
                    • Red background indicates secrets marked for deletion
                    <br />• Empty keys or values will be ignored when saving
                  </Text>
                </Alert>
                <View maxHeight="400px" overflow="auto" marginBottom="1rem">
                  {editableSecrets.map((secret, index) => (
                    <Card
                      key={index}
                      marginBottom="0.75rem"
                      padding="0.75rem"
                      backgroundColor={
                        secret.toDelete
                          ? "red.10"
                          : secret.isNew
                          ? "green.10"
                          : "neutral.10"
                      }
                    >
                      <Flex direction="row" alignItems="end" gap="0.5rem">
                        <TextField
                          label="Secret Key"
                          placeholder="Enter secret key"
                          value={secret.key}
                          onChange={(e) =>
                            updateSecret(index, "key", e.target.value)
                          }
                          isDisabled={secret.toDelete}
                          size="small"
                          flex="1"
                        />
                        <TextField
                          label="Secret Value"
                          placeholder="Enter secret value"
                          value={secret.value}
                          onChange={(e) =>
                            updateSecret(index, "value", e.target.value)
                          }
                          isDisabled={secret.toDelete}
                          size="small"
                          flex="2"
                        />
                        <View>
                          {secret.isNew ? (
                            <Button
                              onClick={() => removeNewSecret(index)}
                              size="small"
                              variation="destructive"
                            >
                              Remove
                            </Button>
                          ) : (
                            <Button
                              onClick={() => toggleDelete(index)}
                              size="small"
                              variation={
                                secret.toDelete ? "primary" : "destructive"
                              }
                            >
                              {secret.toDelete ? "Restore" : "Delete"}
                            </Button>
                          )}
                        </View>
                      </Flex>
                    </Card>
                  ))}
                </View>

                <Divider marginBottom="1rem" />

                <Flex
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Button
                    onClick={addNewSecret}
                    variation="primary"
                    size="small"
                  >
                    Add New Secret
                  </Button>

                  <Flex gap="0.5rem">
                    <Button onClick={cancelEdit} variation="link">
                      Cancel
                    </Button>
                    <Button
                      onClick={saveChanges}
                      variation="primary"
                      isLoading={saving}
                      loadingText="Saving..."
                    >
                      Save Changes
                    </Button>
                  </Flex>
                </Flex>
              </View>
            </Card>
          )}
        </View>
      </Flex>
    </>
  );
}

export default SecretsPage;
