import type { StCss } from "../st-css";

export const variant = <V extends string>(vProp: string, vStyles: Record<V, Styles>, vDefault?: V) => (props: any, stCss: StCss) => {
    const vVal = props[vProp] || vDefault;
    return Array.isArray(vVal) ? vVal.map(v => stCss.extractRulesByBp(vStyles[v as V])[0]) : vStyles[vVal as V];
}