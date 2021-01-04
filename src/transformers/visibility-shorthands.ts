import { StCssRule, StCssRules } from "../st-css";

export const visibilityShorthandProps = ['show', 'hide', 'visible', 'invisible'];

export const visibilityShorthands = (rule: StCssRule): StCssRules | undefined => {
    if ((rule[0] === 'show' && !rule[1]) || (rule[0] === 'hide' && rule[1])){
       return [['display', 'none', rule[2]]];
    }
    else if ((rule[0] === 'visible' && !rule[1]) || (rule[0] === 'invisible' && rule[1])){
       return [['visibility', 'hidden', rule[2]]];
    }
}