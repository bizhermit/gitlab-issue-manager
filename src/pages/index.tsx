import { NextPage } from "next";
import { useEffect, useState, VFC } from "react";
import FlexBox from "@bizhermit/react-sdk/dist/containers/flexbox";
import TextBox from "@bizhermit/react-sdk/dist/controls/textbox";
import Caption from "@bizhermit/react-sdk/dist/containers/caption";
import Button from "@bizhermit/react-sdk/dist/controls/button";
import { fetchApi } from "@bizhermit/next-absorber/dist/fetch";
import useMessage from "@bizhermit/react-sdk/dist/hooks/message";
import { useRouter } from "next/router";
import Head from "next/head";
import useGitAccount, { GitAccountProps } from "../contexts/git-account";
import Row from "@bizhermit/react-sdk/dist/containers/row";

const IndexPage: NextPage = () => {
    return (
        <>
            <Head>
                <title>Issues Manager</title>
            </Head>
            <IndexComponent />
        </>
    );
};

export default IndexPage;

const IndexComponent: VFC = () => {
    const [params, setParams] = useState<Partial<GitAccountProps>>({});
    const msg = useMessage();
    const router = useRouter();
    const gitAccCtx = useGitAccount();

    const signin = async (unlock: VoidFunc) => {
        try {
            const res = await fetchApi("signin", params);
            msg.append(res.messages);
            if (res.hasError) {
                unlock();
                return;
            }
            if (res.data.result) {
                gitAccCtx.set(res.data.git);
                router.push("/dashboard");
            }
        } catch(err) {
            msg.error(err);
        }
        unlock();
    };

    const deleteUserCache = async (unlock: VoidFunc) => {
        try {
            const res = await fetchApi("deleteCache", params);
            msg.append(res.messages);
            setParams({});
        } catch(err) {
            msg.error(err);
        }
        unlock();
    };

    const load = async () => {
        try {
            const res = await fetchApi("loadAccount");
            msg.append(res.messages);
            if (res.hasError) return;
            setParams(res.data ?? {});
        } catch(err) {
            msg.error(err);
        }
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <FlexBox fitToOuter="fill" center middle>
            <FlexBox center middle design className="cvx" style={{ padding: 10 }}>
                <Caption label="Git API URL" labelWidth={120}>
                    <TextBox name="url" bind={params} style={{ width: 500 }} resize={false} />
                </Caption>
                <Caption label="User" labelWidth={120}>
                    <TextBox name="user" bind={params} style={{ width: 500 }} resize={false} />
                </Caption>
                <Caption label="Access Token" labelWidth={120}>
                    <TextBox type="password" name="token" bind={params} style={{ width: 500 }} resize={false} />
                </Caption>
                <Row fill>
                    <Row center>
                        <Button image="signin" click={signin} style={{ marginLeft: 40 }}>Singin</Button>
                    </Row>
                    <Row right style={{ flex: "none" }}>
                        <Button image="delete" click={deleteUserCache} title="delete user cache" />
                    </Row>
                </Row>
            </FlexBox>
        </FlexBox>
    );
};
