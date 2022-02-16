import { useNextron } from "@bizhermit/nextron/dist/accessor";
import Caption from "@bizhermit/react-sdk/dist/containers/caption";
import RadioButton from "@bizhermit/react-sdk/dist/controls/radiobutton";
import { useLayout } from "@bizhermit/react-sdk/dist/layouts/style";
import { useMemo, VFC } from "react";

const SwitchThemeComponent: VFC = () => {
    const layout = useLayout();
    const nextron = useNextron();
    const colorSource = useMemo(() => {
        return [{ label: "Light", value: "light" }, { label: "Dark", value: "dark" }];
    }, [])
    const designSource = useMemo(() => {
        return [{ label: "Material", value: "material" }, { label: "Neumorphism", value: "neumorphism" }];
    }, []);

    return (
        <>
            <Caption label="Color" style={{ marginRight: 5 }}>
                <RadioButton defaultValue={layout.color} source={colorSource} changed={v => {
                    layout.setColor(v.value);
                    nextron?.setLayoutColor(v.value);
                }} direction={layout.screenSize === "s" ? "vertical" : "horizontal"} />
            </Caption>
            <Caption label="Design">
                <RadioButton defaultValue={layout.design} source={designSource} changed={v => {
                    layout.setDesign(v.value);
                    nextron?.setLayoutDesign(v.value);
                }} direction={layout.screenSize === "s" ? "vertical" : "horizontal"} />
            </Caption>
        </>
    );
};

export default SwitchThemeComponent;