import { StCssRule, StCssRules } from "../st-css";

const sizeProps: Record<string, string> = {
    w: 'width',
    h: 'height',
    minw: 'minWidth',
    minh: 'minHeight',
    maxw: 'maxWidth',
    maxh: 'maxHeight'
}

export const sizeShorthandProps = Object.keys(sizeProps);

export const sizeShorthands = (rule: StCssRule): StCssRules | undefined => {
    const prop = sizeProps[rule[0]];
    if (prop){
       if (typeof rule[1] === 'number'){
           return [[prop, rule[1] <= 1 ? `${rule[1] * 100}%` : `${rule[1]}px`, rule[2]]];
       }
       return [[prop, rule[1], rule[2]]];
    }
}