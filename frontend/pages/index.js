import { useState } from "react";
import DropPage from "../components/drop";
import MenuPage from "../components/menu";

export default function IndexPage({logged_in}) {

    const [loggedIn, setLoggedIn] = useState(logged_in);

    function logIn() {
        setLoggedIn(true);
    }

    if(loggedIn) return <MenuPage />
    else return <DropPage logIn={logIn} />
}

export async function getServerSideProps() {
    return { props: { logged_in: false } }
}