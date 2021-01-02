const sizeProps: Record<string, string> = {
    w: 'width',
    h: 'height',
    mw: 'minWidth',
    mh: 'minHeight'
}

export const sizeShorthands = (rule: StCssRule, _: number): StCssRules | undefined => {
    const prop = sizeProps[rule[0]];
    if (prop){
       if (typeof rule[1] === 'number'){
           return [[prop, rule[1] <= 1 ? `${rule[1] * 100}%` : `${rule[1]}px`, rule[2]]];
       }
       return [[prop, rule[1], rule[2]]];
    }
}