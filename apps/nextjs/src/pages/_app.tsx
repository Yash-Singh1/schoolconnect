// Wrapper for the entire application

import { type AppType } from "next/app";

// Import Tailwind styling, utilities
import "../styles/globals.css";
// Import Kumiko styling, pre-built styles
import "kumiko/dist/kumiko.css";

const App: AppType = ({ Component }) => {
  return <Component />;
};

export default App;
