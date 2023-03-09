import { type NextPage } from "next";
import Head from "next/head";
import TOS from '../content/tos.md';

const PrivacyPolicy: NextPage = () => {
  return (
    <>
      <Head>
        <title>Terms & Conditions</title>
        <link rel="stylesheet" href="https://unpkg.com/kumiko@0.0.1/dist/kumiko.css" />
      </Head>
      <div className="flex justify-center items-center">  
        <div className="p-4 w-3/4">
          <TOS />
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;
