import FlexBox from "@bizhermit/react-sdk/dist/containers/flexbox";
import Row from "@bizhermit/react-sdk/dist/containers/row";
import { NextPage } from "next";
import Link from "next/link";
import { VFC } from "react";
import SignedinContainer from "../components/signedin-container";
import SwitchThemeComponent from "../components/switch-theme";

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
        <FlexBox fitToOuter="fill">
            <FlexBox fitToOuter="ffy" style={{ padding: 5 }}>
                <Link href="/issues">Issues</Link>
            </FlexBox>
            <Row fill right>
                <SwitchThemeComponent />
            </Row>
        </FlexBox>
    );
};