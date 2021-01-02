import type { StCss } from "../st-css";

export const styleProps = (...styleProps: string[]) => (props: any, _: StCss): Styles => {
    return styleProps.reduce((acc, p) => ({ ...acc, [p]: props[p] }), {} as Styles);
}