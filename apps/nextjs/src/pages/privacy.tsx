// Privacy policy page, real content is in markdown file

import { type NextPage } from "next";
import Head from "next/head";

import Policy from "../content/privacy.md";

const PrivacyPolicy: NextPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy</title>
        <link
          rel="stylesheet"
          href="https://unpkg.com/kumiko@0.0.1/dist/kumiko.css"
        />
      </Head>
      <div className="flex justify-center items-center">
        <div className="p-4 w-3/4">
          <Policy />
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
