import { LineStyle, PlatformMode, Selection, TextStyle, LineKey, InputBlockInfoMap } from "./types";
type TextEditorInitalProps = {
    platformMode: PlatformMode;
    initialMarkdownText?: string;
};
export type TextEditorProps = {
    markdown: string;
    inputBlockInfoMap: InputBlockInfoMap;
    currentLineStyle: LineStyle;
    currentTextStyles?: TextStyle[];
    onChangeText: (inputBlockInfoKey: LineKey, text: string) => void;
    onSelectionChange: (inputBlockInfoKey: LineKey, selection: Selection) => void;
    onLineStyle: (lineStyle: LineStyle) => void;
    onTextStyle: (textStyle: TextStyle) => void;
    onAddPhoto: (base64: string) => void;
    onRemovePhoto: (inputBlockInfoKey: LineKey) => void;
};
declare const useTextEditor: ({ platformMode, initialMarkdownText, }: TextEditorInitalProps) => TextEditorProps;
export default useTextEditor;
