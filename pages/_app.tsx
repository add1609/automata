import type { AppProps } from "next/app";
import "../styles/globals.css";
import Layout from "../components/Layout";
import Head from "next/head";

function MyApp({Component, pageProps}: AppProps) {
    return (
        <>
            <Head>
                <title>Automata</title>
                <meta name="description" content="Generated by create next app"/>
                <meta name="author" content="Ahmed Sami"/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <Layout>
                <Component {...pageProps} />
            </Layout>
        </>
    );
}

export default MyApp;
