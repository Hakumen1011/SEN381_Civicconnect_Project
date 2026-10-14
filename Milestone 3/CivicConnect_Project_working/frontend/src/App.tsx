import ManagementPerformancePage from "./features/management/pages/ManagementPerformancePage";

export default function App() {
  return <ManagementPerformancePage />;

import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";

/**
 * Root application component.
 *
 * BrowserRouter handles the browser URL and history.
 * AppRoutes decides which CivicConnect page to display.
 */
export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

