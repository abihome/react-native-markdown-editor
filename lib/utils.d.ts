import { TextStyleMap, Selection, TextStyle, SelectionKey, LineStyleMap, StyledLineMap, LineStyle, LineKey, InputBlockInfoMap } from "./types";
export declare const getKeyFromSelection: (start: number, end: number) => SelectionKey;
export declare const getSelectionFromKey: (key: SelectionKey) => {
    start: number;
    end: number;
};
export declare const getSelectionText: (text: string, start: number, end?: number) => string;
export declare const stringReplaceAt: (string: string, start: number, end: number, replacement: string, replacementOffset?: number) => string;
export declare const stringInsertAt: (string: string, at: number, replacement: string) => string;
export declare const getLineStyle: (text: string) => LineStyle;
export declare const getTextStyleSelectionsFromMarkdownText: (markdowText: string, textStyle: TextStyle) => Selection[];
export declare const getLineStyleMap: (rawText: string) => LineStyleMap;
export declare const mardownToInputBlockInfoMap: (mardownText: string) => InputBlockInfoMap;
export declare const inputBlockInfoMapToMarkdown: (inputBlockInfoMap: InputBlockInfoMap) => string;
export declare const clearText: (markdown: string, keepTags?: (LineStyle | TextStyle)[]) => string;
export declare const getClosestSelectionKey: (textStyleMap: TextStyleMap, currentSelectionKey: SelectionKey, includeSelectionEnd?: boolean) => SelectionKey | undefined;
interface HandleLineStyleShiftSelectionInput {
    lineStyleMap: LineStyleMap;
    currentLineIndex: number;
    shift: number;
    lineCount: number;
}
export declare const handleLineStyleShiftSelection: ({ lineStyleMap, currentLineIndex, shift, lineCount, }: HandleLineStyleShiftSelectionInput) => LineStyleMap;
interface HandleTextStyleShiftSelectionInput {
    textStyleMap: TextStyleMap;
    currentSelectionKey: SelectionKey;
    shift: number;
    includeSelectionEnd?: boolean;
}
export declare const handleTextStyleShiftSelection: ({ textStyleMap, currentSelectionKey, shift, includeSelectionEnd, }: HandleTextStyleShiftSelectionInput) => TextStyleMap;
export declare const getCurrentLineIndex: (currentSelectionKey: SelectionKey, text: string) => number;
export declare const getStyledLineMap: (text: string, textStyleMap: TextStyleMap, lineStyleMap: LineStyleMap) => StyledLineMap;
export declare const getTextStyles: (textStyleMap: TextStyleMap, selectionKey?: SelectionKey) => TextStyle[];
export declare const splitLineStyleMap: ({ lineStyleMap, leftText, rightText, currentLineIndex, }: {
    lineStyleMap: LineStyleMap;
    leftText: string;
    rightText: string;
    currentLineIndex: number;
}) => {
    leftLineStyleMap: LineStyleMap;
    rightLineStyleMap: LineStyleMap;
};
export declare const mergeLineStyleMap: ({ leftLineStyleMap, rightLineStyleMap, leftText, rightText, }: {
    leftLineStyleMap: LineStyleMap;
    rightLineStyleMap: LineStyleMap;
    leftText: string;
    rightText: string;
}) => LineStyleMap;
export declare const splitTextStyleMap: ({ textStyleMap, leftTextLength, }: {
    textStyleMap: TextStyleMap;
    leftTextLength: number;
}) => {
    leftTextStyleMap: TextStyleMap;
    rightTextStyleMap: TextStyleMap;
};
export declare const mergeTextStyleMap: ({ leftTextStyleMap, rightTextStyleMap, leftTextLength, }: {
    leftTextStyleMap: TextStyleMap;
    rightTextStyleMap: TextStyleMap;
    leftTextLength: number;
}) => TextStyleMap;
export declare const splitInputBlockInfoMap: ({ inputBlockInfoMap, inputBlockInfoKey, imgUri, }: {
    inputBlockInfoMap: InputBlockInfoMap;
    inputBlockInfoKey: LineKey;
    imgUri: string;
}) => InputBlockInfoMap;
export declare const mergeInputBlockInfoMap: ({ inputBlockInfoMap, inputBlockInfoKey, }: {
    inputBlockInfoMap: InputBlockInfoMap;
    inputBlockInfoKey: LineKey;
}) => InputBlockInfoMap;
export {};
