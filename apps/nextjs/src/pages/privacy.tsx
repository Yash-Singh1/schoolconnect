// Privacy policy page, real content is in markdown file

import { type NextPage } from "next";
import Head from "next/head";

import Policy from "../content/privacy.md";

const PrivacyPolicy: NextPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy</title>
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
