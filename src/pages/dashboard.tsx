import { useNextron } from "@bizhermit/nextron/dist/accessor";
import Caption from "@bizhermit/react-sdk/dist/containers/caption";
import FlexBox from "@bizhermit/react-sdk/dist/containers/flexbox";
import Row from "@bizhermit/react-sdk/dist/containers/row";
import FileBox from "@bizhermit/react-sdk/dist/controls/filebox";
import RadioButton from "@bizhermit/react-sdk/dist/controls/radiobutton";
import { useLayout } from "@bizhermit/react-sdk/dist/layouts/style";
import { NextPage } from "next";
import Link from "next/link";
import { useMemo, VFC } from "react";
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
    const layout = useLayout();
    const nextron = useNextron();
    const colorSource = useMemo(() => {
        return [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }];
    }, [])
    const designSource = useMemo(() => {
        return [{ label: "Material", value: "material" }, { label: "Neumorphism", value: "neumorphism" }];
    }, []);

    return (
        <FlexBox fitToOuter="fill">
            <FlexBox fitToOuter="ffy" style={{ padding: 5 }}>
                <Link href="/issues">Issues</Link>
            </FlexBox>
            <Row fill right>
                <Caption label="配色" style={{ marginRight: 5 }}>
                    <RadioButton defaultValue={layout.color} source={colorSource} changed={v => {
                        layout.setColor(v.value);
                        nextron.setLayoutColor(v.value);
                    }} direction={layout.screenSize === "s" ? "vertical" : "horizontal"} />
                </Caption>
                <Caption label="デザイン">
                    <RadioButton defaultValue={layout.design} source={designSource} changed={v => {
                        layout.setDesign(v.value);
                        nextron.setLayoutDesign(v.value);
                    }} direction={layout.screenSize === "s" ? "vertical" : "horizontal"} />
                </Caption>
            </Row>
        </FlexBox>
    );
};