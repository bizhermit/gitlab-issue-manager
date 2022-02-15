import { fetchData } from "@bizhermit/next-absorber/dist/fetch";
import { GitAccountProps } from "../contexts/git-account";

const fetchGit = <T = Struct>(gitCtx: GitAccountProps, url: string, options?: RequestInit) => {
    const opts = {...options, method: "GET", headers: {...options?.headers, "Private-Token": gitCtx.token }};
    return fetchData<T>(`${gitCtx.url}/${url}`, {}, opts);
};

export default fetchGit;