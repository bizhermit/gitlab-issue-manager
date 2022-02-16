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
import fetchGit from "../modules/fetch-git";
import StringUtils from "@bizhermit/basic-utils/dist/string-utils";
import { MessageProps } from "@bizhermit/next-absorber/dist/message-context";

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
    const [inputParams, setInputParams] = useState<GitAccountProps>({ url: "", username: "", token: "" });
    const msg = useMessage();
    const router = useRouter();
    const git = useGitAccount(true);

    const signin = async (unlock: VoidFunc) => {
        try {
            const messages: Array<MessageProps> = [];
            if (StringUtils.isEmpty(inputParams.url)) messages.push({ type: "err", title: "input GitLab access info", message: "Git API URL is empty"});
            if (StringUtils.isEmpty(inputParams.username)) messages.push({ type: "err", title: "input GitLab access info", message: "User is empty"});
            if (StringUtils.isEmpty(inputParams.token)) messages.push({ type: "err", title: "input GitLab access info", message: "Access Token is empty"});
            if (messages.length > 0) {
                msg.append(messages);
                unlock();
                return;
            }
            let gitRes = await fetchGit<Struct>(inputParams, `user`);
            if (gitRes?.username !== inputParams.username) {
                messages.push({ type: "err", title: "cannot signin" , message: "please confirm input parameters" });
                unlock();
                return messages;
            }
            const res = await fetchApi("signin", inputParams);
            msg.append(res.messages);
            if (res.hasError) {
                unlock();
                return;
            }
            console.log(gitRes);
            git.set({
                ...inputParams,
                name: gitRes.name,
                userId: gitRes.id,
                email: gitRes.email,
            });
            router.push("/dashboard");
        } catch(err) {
            msg.error(err);
        }
        unlock();
    };

    const deleteUserCache = async (unlock: VoidFunc) => {
        try {
            const res = await fetchApi("deleteCache", inputParams);
            msg.append(res.messages);
            setInputParams({ url: inputParams.url, username: "", token: "" });
        } catch(err) {
            msg.error(err);
        }
        unlock();
    };

    const load = async () => {
        try {
            const res = await fetchApi<GitAccountProps>("loadAccount");
            msg.append(res.messages);
            if (res.hasError) return;
            setInputParams(res.data ?? { url: "", username: "", token: "" });
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
                <Caption label="GitLab URL" labelWidth={120}>
                    <TextBox name="url" bind={inputParams} style={{ width: 500 }} resize={false} />
                </Caption>
                <Caption label="User" labelWidth={120}>
                    <TextBox name="username" bind={inputParams} style={{ width: 500 }} resize={false} />
                </Caption>
                <Caption label="Access Token" labelWidth={120}>
                    <TextBox type="password" name="token" bind={inputParams} style={{ width: 500 }} resize={false} />
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