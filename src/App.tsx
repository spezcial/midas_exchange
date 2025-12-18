import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppRoutes } from "@/routes";
import "./i18n/config";

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
