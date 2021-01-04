import { StCssRule, StCssRules } from "../st-css";

const textProps: Record<string, string> = {
    size: 'fontSize',
    weight: 'fontWeight',
    align: 'textAlign',
    textTransform: 'textTransform',
    color: 'color'
}

export const textShorthandProps = Object.keys(textProps);

export const textShorthands = (rule: StCssRule): StCssRules | undefined => {
    const prop = textProps[rule[0]];
    if (prop){
       return [[prop, prop === 'fontSize' && typeof rule[1] === 'number' ? `${rule[1]}px` : rule[1], rule[2]]];
    }
}