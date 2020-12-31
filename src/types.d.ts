type StyleValue = number | string;

interface Styles {
    [prop: string]: Styles | StyleValue | StyleValue[];
}

interface StCssConfig {
    //TODO: type this
    pragma: Function;
    breakpoints: (string|number)[];
    transformers?: StTransformer[];
}

interface StFuncComp { 
    (props: any): any;
    st_classes?: string
}

type StTransformer = (rule: StCssRule, bp: number) => StCssRules | StCssRule | undefined;

type StCssRule = [string, StyleValue, string?];
type StCssRules = StCssRule[];