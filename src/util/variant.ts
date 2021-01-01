import type { StCss } from "../st-css";

export const variant = <V extends string>(vProp: string, vStyles: Record<V, Styles> | ((props: any) => Record<V, Styles>), vDefault?: V) => (props: any, stCss: StCss) => {
    const vVal: V | V[] = props[vProp] || vDefault;
    const styles = typeof vStyles === 'function' ? vStyles(props) : vStyles;
    let v: V;
    return Array.isArray(vVal) ? [0,...stCss.config.breakpoints].map((_, i) => {
        // carry over variant to subsequent undefined breakpoints
        if (vVal[i]){
            v = vVal[i];
        }
        return stCss.mergeRules(...stCss.extractRulesByBp(styles[v] || {}).slice(0, i+1));
    }) : styles[vVal];
}