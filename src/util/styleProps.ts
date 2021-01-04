import type { StCss, Styles } from "../st-css";

export const styleProps = (...styleProps: (string | string[])[]) => (props: any, _: StCss): Styles => {
    const styles: Styles = {};
    ([] as string[]).concat(...styleProps).forEach(p => {
        if (props[p] !== undefined) {
            styles[p] = props[p];
        }
    })
    return styles;
}