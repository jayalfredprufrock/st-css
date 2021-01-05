export type StyleValue = number | string;

export interface Styles {
    [prop: string]: Styles | StyleValue | StyleValue[];
}

export interface StCssConfig {
    //TODO: type this
    pragma: Function;
    breakpoints: ([string, string] | [number | 'none', number | 'none'])[];
    transformers?: StTransformer[];
}

export interface StFuncComp { 
    (props: any): any;
    st_classes?: string
}

export type StTransformer = (rule: StCssRule, bp: number, stCss: StCss) => StCssRules | undefined;

export type StCssRule = [string, StyleValue, string?];
export type StCssRules = StCssRule[];

export class StCss {

    protected readonly cache: Map<string, string>[];
    protected sheet: CSSStyleSheet | undefined;
    readonly rules: string[][];

    constructor(readonly config: StCssConfig) {
        this.rules = [0,...config.breakpoints].map(() => []);
        this.cache = this.rules.map(() => new Map());
        if (typeof document !== 'undefined') {
            //this.hydrate();
        }
    }

    clear() {
        [0,...this.config.breakpoints].forEach((_, i) => {
            this.rules[i] = [];
            this.cache[i].clear();
        });
    }

    hydrate() {
        this.clear();
        const existingStyleTag = document.getElementById('st-css-styles');
        existingStyleTag?.innerText.split('@media').map((ruleSets, bp) => {
            ruleSets.split('\n').forEach((rule, i) => {
                if (!bp || i){
                    const ruleMatch = /^\.(st[a-z0-9]+)(.*{.*?})}?$/.exec(rule);
                    if (ruleMatch){
                        this.rules[bp].push(`.${ruleMatch[1]}${ruleMatch[2]}`);
                        this.cache[bp].set(ruleMatch[1], ruleMatch[2]);
                    }
                    else {
                        console.log('no match!!', rule);
                    }
                }
            })
        });
        this.sheet = (existingStyleTag as HTMLStyleElement).sheet as CSSStyleSheet;
        console.log(this.sheet);
    }

    protected onNewRule(ruleString: string, bp: number) {
        this.rules[bp].push(ruleString);
        if (this.sheet) {
            if (bp > 0){
                const sheet = this.sheet.cssRules[this.sheet.cssRules.length - this.config.breakpoints.length - 1 + bp] as CSSMediaRule; 
                sheet.insertRule(ruleString, sheet.cssRules.length);
            }
            else {
                this.sheet.insertRule(ruleString, this.sheet.cssRules.length - this.config.breakpoints.length);
            }
        }
    }

    protected className(rule: StCssRule, bp = 0): string {
        const ruleString = `${rule[2]}{${rule[0].replace(/[A-Z]/g, '-$&').toLowerCase()}:${rule[1]}}`;
        const cachedClassName = this.cache[bp].get(ruleString);
        if (cachedClassName) return cachedClassName;
        const className = `st${bp}${this.cache[bp].size.toString(36)}`;
        this.onNewRule(`.${className}${ruleString}`, bp);
        this.cache[bp].set(ruleString, className);
        return className;
    }

    mergeRules = (...ruleSets: StCssRules[]): StCssRules => {
        const map = new Map<string, StCssRule>();
        ruleSets.filter(r => r).forEach(rules => rules.forEach((r => map.set(`${r[2]} ${r[0]}`, r))));
        return Array.from(map.values());
    }

    processTransformers = (rule: StCssRule, bp = 0): StCssRules => {
        const rules: StCssRules = [];
        for (const t of this.config.transformers || []){
            const r = t(rule, bp, this);
            if (r){
                rules.push(...r);
            }
        }
        return rules.length ? rules : [rule];
    }

    extractRulesByBp = (styleObj: Styles, prefix = '', result?: StCssRules[]): StCssRules[] => {
        return Object.keys(styleObj || {}).reduce((acc, k) => {
          if (typeof styleObj[k] === 'object') {
            if (Array.isArray(styleObj[k])){
                let prevVal: StyleValue;
                this.config.breakpoints.forEach((_, i) =>{
                    const vals = styleObj[k] as StyleValue[];
                    if (i < vals.length){
                        prevVal = vals[i];
                    }
                    if ((prevVal !== undefined && prevVal !== null)){
                        acc[i+1].push(...this.processTransformers([k, prevVal, prefix], i+1));
                    }
                });
            }
            else {
                this.extractRulesByBp(styleObj[k] as Styles, prefix + k, acc);
            }
          } else {
            acc[0].push(...this.processTransformers([k, styleObj[k] as StyleValue, prefix]));
          }
          return acc;
        }, result || [0, ...this.config.breakpoints].map(_ =>[]) as StCssRules[]);
    }
    
    st = (...styles: (Styles | StCssRules[])[]): string => {
        const ruleSets = styles.map(s => Array.isArray(s) ? s : this.extractRulesByBp(s));
        return [0, ...this.config.breakpoints].map((_, i) => {
            return this.mergeRules(...ruleSets.map(rs => rs[i])).map(rule => this.className(rule, i)).join(' ');
        }).join(' ')
    }

    canonize = (C: any) => (...styles: (Styles | StCssRules[] | ((props: any, stcss: StCss) => Styles | StCssRules[]))[]) => {
        const Component: StFuncComp = (props) => {
            const { className = '', css = {}, as, ...newProps } = props;
            Component.st_classes = this.st(...styles.map(s => typeof s === 'function' ? s(props, this) : s), css) + ' ' + (C.st_classes || '');
            newProps.className = `${className} ${Component.st_classes}`.trim();
            return this.config.pragma(as || C, newProps);
        }
        return Component;
    }

    toString = (): string => {
        let str = this.rules[0].join('\n');
        this.config.breakpoints.forEach((_, i) => {
            str += this.mqString(i, this.rules[i+1].join('\n'));
        });
        return str;
    }

    mqString = (bpIndex: number, content = ''): string => {
        const bp = this.config.breakpoints[bpIndex];
        let mq = '@media screen and ';
        if (bp[0] == 'none'){
            mq += `(max-width: ${bp[1]})`;
        }
        else if (bp[1] == 'none'){
            mq += `(min-width: ${bp[0]})`;
        }
        else {
            mq += `(min-width: ${bp[0]}) and (max-width: ${bp[1]})`;
        }
        return `${mq}{\n${content}}`;
    }
}