import Head from "next/head";

import Layout from "../../components/Layout/Layout";
import AlloyConfiguration from "../../components/Configuration/Config";

export default function Main() {
  return (
    <Layout>
      <Head>
        <title>AEP Web SDK Configuration</title>
      </Head>
      <AlloyConfiguration />
    </Layout>
  );
}
