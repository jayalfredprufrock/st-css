import type { StCss } from "../st-css";

export const variant = <V extends string>(vProp: string, vStyles: Record<V, Styles> | ((props: any) => Record<V, Styles>), vDefault?: V) => (props: any, stCss: StCss) => {
    const vVal: V | V[] = props[vProp] || vDefault;
    const styles = typeof vStyles === 'function' ? vStyles(props) : vStyles;
    return Array.isArray(vVal) ? vVal.map(v => stCss.extractRulesByBp(styles[v])) : styles[vVal];
}