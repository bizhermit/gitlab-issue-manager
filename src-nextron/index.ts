import execute from "@bizhermit/nextron";

execute({
    defaultConfig: {
        gitApiUrl: "https://[your_gitlab_url]/api/v4",
    },
    openDevTools: true
});