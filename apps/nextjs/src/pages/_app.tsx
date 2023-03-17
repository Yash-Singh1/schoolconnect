// Wrapper for the entire application

import { type AppType } from "next/app";

import "../styles/globals.css";
import "kumiko/dist/kumiko.css";

const App: AppType = ({ Component }) => {
  return <Component />;
};

export default App;
