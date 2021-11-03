import Head from "next/head";

import Layout from "../components/Layout/Layout";
import Home from "../components/Home/Home";

export default function Main() {
  return (
    <Layout>
      <Head>
        <title>Alloy Web SDK</title>
      </Head>

      <Home />
    </Layout>
  );
}
