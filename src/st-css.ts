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

    protected readonly cache: Map<string, string> = new Map();
    protected readonly sheet!: CSSStyleSheet;
    protected readonly rules: string[][];

    constructor(readonly config: StCssConfig) {
        this.rules = [0,...config.breakpoints].map(() => []);
        if (typeof document !== 'undefined') {
            this.sheet = document.head.appendChild(document.createElement('style')).sheet as CSSStyleSheet;
            this.config.breakpoints.forEach((_, i) => {
                this.sheet.insertRule(this.mqString(i), this.sheet.cssRules.length);
            });
        }
    }

    protected onNewRule(rule: StCssRule, className: string, bp: number) {
        const ruleString = `.${className}${rule[2]}{${rule[0].replace(/[A-Z]/g, '-$&').toLowerCase()}:${rule[1]}}`;
        this.rules[bp].push(ruleString);
        if (typeof document !== 'undefined') {
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
        const hash = rule.join() + bp;
        const cachedClassName = this.cache.get(hash);
        if (cachedClassName) return cachedClassName;
        const className = `st-${this.cache.size.toString(36)}`;
        this.onNewRule(rule, className, bp);
        this.cache.set(hash, className);
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
        let str = this.rules[0].sort().join('');
        this.config.breakpoints.forEach((_, i) => {
            str += this.mqString(i, this.rules[i+1].sort().join(''));
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
        return `${mq}{${content}}`;
    }
}