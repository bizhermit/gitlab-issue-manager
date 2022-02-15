import { LayoutProvider } from "@bizhermit/react-sdk/dist/layouts/style";
import type { AppProps } from "next/app";
import { GitAccountProvidor } from "../contexts/git-account";
import "../styles/base.css";

const App = ({ Component, pageProps }: AppProps) => {
  return <GitAccountProvidor><LayoutProvider design="neumorphism"><Component {...pageProps} /></LayoutProvider></GitAccountProvidor>;
};
export default App;