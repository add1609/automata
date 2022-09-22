import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

type LayoutProps = {
    children?: ReactNode
}

const Layout = ({children}: LayoutProps) => (
    <>
        <Header/>
        <main>{children}</main>
        <Footer/>
    </>
);

export default Layout;
