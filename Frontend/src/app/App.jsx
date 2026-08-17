import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { useAuthActions } from "../features/auth/hooks/useAuth";
import "./App.css";
import { routes } from "./app.route";

function App() {
  const { handleGetMe } = useAuthActions();

  useEffect(() => {
    handleGetMe().catch((err) => {
      console.log("Not authenticated or failed to retrieve session", err);
    });
  }, [handleGetMe]);

  return <RouterProvider router={routes} />;
}

export default App;
