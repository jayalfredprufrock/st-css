import type { StCss } from "../st-css";

export const styleProps = (...styleProps: (string | string[])[]) => (props: any, _: StCss): Styles => {
    return ([] as string[]).concat(...styleProps).reduce((acc, p) => ({ ...acc, [p]: props[p] }), {} as Styles);
}