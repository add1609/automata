import styles from "../styles/Footer.module.css";
import Link from "next/link";

const Footer = () => (
    <div className={styles.footer}>
            <span>&copy;{" "}
                <Link href="/"><a>Automata</a></Link>
            </span>
        {" "}
        <span>Powered by{" "}
            <Link href="/"><a>Vercel</a></Link>
            </span>
    </div>
);

export default Footer;
