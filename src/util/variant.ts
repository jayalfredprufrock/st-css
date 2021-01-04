import type { StCss, Styles } from "../st-css";

export const variant = <V extends string>(vProp: string, vStyles: Record<V, Styles> | ((props: any) => Record<V, Styles>), vDefault?: V | V[]) => (props: any, stCss: StCss) => {
    const vVal: V | V[] = props[vProp] || vDefault;
    const styles = typeof vStyles === 'function' ? vStyles(props) : vStyles;

    if (!Array.isArray(vVal)){
        return styles[vVal];
    }

    let prevVariant: V;
    const r = stCss.config.breakpoints.map((_, i) =>{
        if (i < vVal.length){
            prevVariant = vVal[i];
        }
        if (styles[prevVariant]){
            const rules = stCss.extractRulesByBp(styles[prevVariant]);
            return stCss.mergeRules(rules[0], rules[i+1]);
        }
    });
    return [ undefined, ...r];
}
