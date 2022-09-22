import styles from "../styles/Header.module.css";

const handleAddState = () => {
    console.log("handleAddState called");
};

const handleAddTransition = () => {
    console.log("handleAddTransition called");
};

const handleClear = () => {
    console.log("handleClear called");
};

const Header = () => (
    <header className={styles.header}>
        <nav className={styles.nav}>
            <button onClick={handleAddState} className={styles.formButton}>add state</button>
            <button onClick={handleAddTransition} className={styles.formButton}>add transition</button>
            <button onClick={handleClear} className={styles.formButton}>clear</button>
        </nav>
    </header>
);

export default Header;
