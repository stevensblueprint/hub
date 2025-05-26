import { BrowserRouter, Route, Routes } from "react-router-dom";
import SecretsPage from "./pages/SecretsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SecretsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
