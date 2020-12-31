export const spacingShorthands = (rule: StCssRule, _: number): StCssRules | undefined => {
    const match = /^(p|m)(x|y|l|r|t|b)?$/.exec(rule[0]);
    if (match){
        const prefix = match[1] === 'p' ? 'padding' : 'margin';
        const suffixes: Record<string, string[]> = {
            'Left': ['x','l'],
            'Right': ['x','r'],
            'Top': ['y','t'],
            'Bottom': ['y','b']
        };
        const rules: StCssRules = [];
        Object.keys(suffixes).forEach(s => (suffixes[s].includes(match[2]) || !match[2]) && rules.push([prefix+s, rule[1], rule[2]]));
        return rules;
    }
}