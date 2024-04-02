export interface Selection {
    start: number;
    end: number;
}
export type LineStyle = "#" | "##" | "###" | "body";
export type TextStyle = "**" | "__" | "--" | "~~";
export type SelectionKey = `${number}:${number}`;
export type LineKey = `${number}`;
export type TextStyleMap = {
    [key: SelectionKey]: TextStyle[];
};
export type LineStyleMap = {
    [key: LineKey]: LineStyle;
};
export type TextInfo = {
    text: string;
    lineStyleMap: LineStyleMap;
    textStyleMap: TextStyleMap;
    currentSelectionKey: SelectionKey;
    lastSelectionKey?: SelectionKey;
};
export type TextBlockInfo = {
    type: "text";
} & TextInfo;
export type ImageBlockInfo = {
    type: "image";
    imgUrl: string;
};
export type InputBlockInfo = TextBlockInfo | ImageBlockInfo;
export type InputBlockInfoMap = {
    [key: LineKey]: InputBlockInfo;
};
export interface StyledText {
    text: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
}
export interface StyledLine {
    lineStyle: LineStyle;
    styledTexts: StyledText[];
}
export interface StyledLineMap {
    [key: LineKey]: StyledLine;
}
export declare const LINE_TAGS: LineStyle[];
export declare const TEXT_TAGS: TextStyle[];
