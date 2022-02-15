import MenuContainer from "@bizhermit/react-sdk/dist/containers/menu-container";
import Row from "@bizhermit/react-sdk/dist/containers/row";
import Button from "@bizhermit/react-sdk/dist/controls/button";
import Label from "@bizhermit/react-sdk/dist/texts/label";
import Head from "next/head";
import { useRouter } from "next/router";
import { FC, VFC } from "react";
import useGitAccount from "../contexts/git-account";

const SignedinContainer: FC<{ title?: string; }> = ({ title, children }) => {
    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <MenuContainer header={{ jsx: <HeaderComponent title={title} /> }}>
                {children}
            </MenuContainer>
        </>
    );
};

export default SignedinContainer;

const HeaderComponent: VFC<{ title: string; }> = ({ title }) => {
    const git = useGitAccount();
    const router = useRouter();
    return (
        <Row fill style={{ padding: "0px 0px 0px 10px" }}>
            <div onClick={() => router.push("/dashboard")} style={{ cursor: "pointer" }}>
                <Label style={{ fontSize: "2.0rem", marginRight: 20 }}>IssueManager</Label>
            </div>
            <Label style={{ fontSize: "1.8rem", paddingTop: 5 }}>{title}</Label>
            <Row fill right>
                <Label style={{ marginRight: 5 }}>{git.user}</Label>
                <Button image="signout" click={() => git.unset()}>Signout</Button>
            </Row>
        </Row>
    );
};