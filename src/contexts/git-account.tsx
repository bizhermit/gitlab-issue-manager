import { isEmpty } from "@bizhermit/basic-utils/dist/string-utils";
import { useRouter } from "next/router";
import { createContext, FC, useCallback, useContext, useEffect, useState } from "react";

export type GitAccountProps = {
    url: string;
    user: string;
    token: string;
};
export type GitAccount = GitAccountProps & {
    set: (account: GitAccountProps) => void;
    unset: () => void;
};

export const GitAccountContext = createContext<Partial<GitAccount>>({});

const useGitAccount = () => {
    return useContext(GitAccountContext);
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
            if (isEmpty(gitAccount?.url) || isEmpty(gitAccount?.user) || isEmpty(gitAccount?.token)) {
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