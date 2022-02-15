import FlexBox from "@bizhermit/react-sdk/dist/containers/flexbox";
import { NextPage } from "next";
import Link from "next/link";
import { VFC } from "react";
import SignedinContainer from "../components/signedin-container";

const DashboardPage: NextPage = () => {
    return (
        <SignedinContainer title="Dashboard">
            <DashboardComponent />
        </SignedinContainer>
    );
};

export default DashboardPage;

const DashboardComponent: VFC = () => {
    return (
        <FlexBox>
            <Link href="/issues">Issues</Link>
        </FlexBox>
    );
};