import Document, { Html, Head, Main, NextScript } from "next/document";

import Layout from "../../components/Layout/Layout";
import AlloyConfiguration from "../../components/Configuration/Config";

export default function AlloyConfig() {
  return (
    <Layout>
      <Head>
        <title>AEP Web SDK Configuration</title>
      </Head>
      <AlloyConfiguration />
    </Layout>
  );
}
