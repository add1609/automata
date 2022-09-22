import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import Grid from "../components/Grid";

const Home: NextPage = () => {
    return (
        <main className={styles.main}>
            <Grid/>
        </main>
    );
};

export default Home;
