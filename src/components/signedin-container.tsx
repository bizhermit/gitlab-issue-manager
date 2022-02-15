import MenuContainer from "@bizhermit/react-sdk/dist/containers/menu-container";
import Row from "@bizhermit/react-sdk/dist/containers/row";
import Button from "@bizhermit/react-sdk/dist/controls/button";
import Label from "@bizhermit/react-sdk/dist/texts/label";
import Head from "next/head";
import { FC, VFC } from "react";
import useGitAccount from "../contexts/git-account";

const SignedinContainer: FC<{ title?: string; }> = ({ title, children }) => {
    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <MenuContainer header={{ jsx: <HeaderComponent /> }}>
                {children}
            </MenuContainer>
        </>
    );
};

export default SignedinContainer;

const HeaderComponent: VFC = () => {
    const git = useGitAccount();
    return (
        <Row fill style={{ padding: "0px 0px 0px 10px" }}>
            <Label style={{ fontSize: "2.0rem" }}>IssueManager</Label>
            <Row fill right>
                <Label style={{ marginRight: 5 }}>{git.user}</Label>
                <Button image="signout" click={() => git.unset()}>Signout</Button>
            </Row>
        </Row>
    );
};