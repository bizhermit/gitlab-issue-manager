import StringUtils, { isEmpty } from "@bizhermit/basic-utils/dist/string-utils";
import { useRouter } from "next/router";
import { createContext, FC, useCallback, useContext, useEffect, useState } from "react";

export type GitAccountProps = {
    url: string;
    token: string;
    username: string;
    name?: string;
    userId?: number;
    email?: string;
};
export type GitAccount = GitAccountProps & {
    set: (account: GitAccountProps) => void;
    unset: () => void;
};

export const GitAccountContext = createContext<GitAccount>({
    url: undefined,
    username: undefined,
    token: undefined,
    set: undefined,
    unset: undefined,
});

const useGitAccount = (ignoreCheck?: boolean) => {
    const git = useContext(GitAccountContext);
    const router = useRouter();
    useEffect(() => {
        if (router.pathname !== "/" || !ignoreCheck) {
            if (StringUtils.isEmpty(git.url) || StringUtils.isEmpty(git.username) || StringUtils.isEmpty(git.token)) router.push("/");
        }
    }, []);
    return git;
};

export default useGitAccount;

export const GitAccountProvidor: FC<{}> = ({ children }) => {
    const router = useRouter();
    const [gitAccount, setGitAccount] = useState<GitAccountProps>();
    const set = useCallback((account: GitAccountProps) => {
        setGitAccount(account);
    }, []);
    const unset = useCallback(() => {
        setGitAccount(null);
        router.push("/");
    }, []);
    const [signedinChecked, setSignedinChecked] = useState(false);
    useEffect(() => {
        if (router.pathname === "/") {
            setSignedinChecked(true);
        } else {
            if (isEmpty(gitAccount?.url) || isEmpty(gitAccount?.username) || isEmpty(gitAccount?.token)) {
                router.push("/");
            } else {
                setSignedinChecked(true);
            }
        }
    }, [children]);
    return (
        <GitAccountContext.Provider value={{ ...gitAccount, set, unset }}>
            {signedinChecked ? children : ""}
        </GitAccountContext.Provider>
    );
};