import { LineKey, InputBlockInfoMap, StyledLineMap } from './types';
export type InputInfoStyledLineMap = {
    [key: LineKey]: StyledLineMap;
};
type TextSample = {
    markdown: string;
    inputBlockInfoMap: InputBlockInfoMap;
    inputInfoStyledLineMap: InputInfoStyledLineMap;
};
type TextSampleMap = {
    [key: string]: TextSample;
};
export declare const textSampleMap: TextSampleMap;
export {};
