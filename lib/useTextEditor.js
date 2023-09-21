"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTextEditor = void 0;
const React = require("react");
const immutability_helper_1 = require("immutability-helper");
const utils_1 = require("./utils");
const DEFAULT_TEXT_INFO = {
    text: "",
    lineStyleMap: {},
    textStyleMap: {},
    currentSelectionKey: "0:0",
    lastSelectionKey: "0:0",
};
const useTextEditor = ({ platformMode, initialMarkdownText = "", }) => {
    const [inputBlockInfoMap, setInputBlockInfoMap] = React.useState(() => (0, utils_1.mardownToInputBlockInfoMap)(initialMarkdownText));
    //eslint-disable-next-line
    const [currentInputBlockKey, setCurrentInputBlockKey] = React.useState("0");
    const [includeSelectionEnd, setIncludeSelectionEnd] = React.useState(true);
    const markdown = (0, utils_1.inputBlockInfoMapToMarkdown)(inputBlockInfoMap);
    const currentInputBlockInfo = inputBlockInfoMap === null || inputBlockInfoMap === void 0 ? void 0 : inputBlockInfoMap[currentInputBlockKey];
    // const  = currentInputBlockInfo
    const textInfo = (currentInputBlockInfo === null || currentInputBlockInfo === void 0 ? void 0 : currentInputBlockInfo.type) === "text"
        ? currentInputBlockInfo
        : DEFAULT_TEXT_INFO;
    const { text, lineStyleMap, textStyleMap, currentSelectionKey, lastSelectionKey, } = textInfo;
    //line
    const currentLineIndex = (0, utils_1.getCurrentLineIndex)(currentSelectionKey, text);
    const currentLineStyle = lineStyleMap[`${currentLineIndex}`];
    //text
    const closestSelectionKey = (0, utils_1.getClosestSelectionKey)(textStyleMap, currentSelectionKey, includeSelectionEnd);
    const currentSelectionTextStyles = (0, utils_1.getTextStyles)(textStyleMap, currentSelectionKey);
    const closestSelectionTextStyles = (0, utils_1.getTextStyles)(textStyleMap, closestSelectionKey);
    let currentTextStyles = [];
    const { start: currentSelectionStart, end: currentSelectionEnd } = (0, utils_1.getSelectionFromKey)(currentSelectionKey);
    if (currentSelectionStart != currentSelectionEnd) {
        currentTextStyles = currentSelectionTextStyles;
    }
    else if (closestSelectionKey) {
        currentTextStyles = closestSelectionTextStyles;
    }
    const onSelectionChange = (inputBlockInfoKey, { start, end }) => {
        const inputBlockInfo = inputBlockInfoMap === null || inputBlockInfoMap === void 0 ? void 0 : inputBlockInfoMap[inputBlockInfoKey];
        if (inputBlockInfo.type === "text") {
            setCurrentInputBlockKey(inputBlockInfoKey);
            const inputBlockCurrentSelectionKey = inputBlockInfo.currentSelectionKey;
            setInputBlockInfoMap((currentInputBlockInfoMap) => (0, immutability_helper_1.default)(currentInputBlockInfoMap, {
                [inputBlockInfoKey]: {
                    currentSelectionKey: { $set: (0, utils_1.getKeyFromSelection)(start, end) },
                    lastSelectionKey: { $set: inputBlockCurrentSelectionKey },
                },
            }));
        }
    };
    const handleAffectedSelections = ({ inputBlockInfoKey, lineIndex, lineShift, lineCount, textShift, currentIncludeSelectionEnd, }) => {
        const platformLastSelectionKey = platformMode === "ios" ? lastSelectionKey : currentSelectionKey;
        if (platformLastSelectionKey) {
            //TODO: handle line shift selection
            setInputBlockInfoMap((currentInputBlockInfoMap) => (0, immutability_helper_1.default)(currentInputBlockInfoMap, {
                [inputBlockInfoKey]: {
                    lineStyleMap: {
                        $apply: function (lineStyleMap = {}) {
                            return lineShift != 0
                                ? (0, utils_1.handleLineStyleShiftSelection)({
                                    lineStyleMap,
                                    currentLineIndex: lineIndex,
                                    shift: lineShift,
                                    lineCount,
                                })
                                : lineStyleMap;
                        },
                    },
                    textStyleMap: {
                        $apply: function (textStyleMap = {}) {
                            return (0, utils_1.handleTextStyleShiftSelection)({
                                textStyleMap,
                                currentSelectionKey: platformLastSelectionKey,
                                shift: textShift,
                                includeSelectionEnd: currentIncludeSelectionEnd,
                            });
                        },
                    },
                },
            }));
        }
    };
    const onChangeText = (inputBlockInfoKey, newText) => {
        setCurrentInputBlockKey(inputBlockInfoKey);
        setInputBlockInfoMap((currentInputBlockInfoMap) => (0, immutability_helper_1.default)(currentInputBlockInfoMap, {
            [inputBlockInfoKey]: {
                text: { $set: newText },
            },
        }));
        if (newText.length === 0) {
            setInputBlockInfoMap((currentInputBlockInfoMap) => (0, immutability_helper_1.default)(currentInputBlockInfoMap, {
                [inputBlockInfoKey]: {
                    lineStyleMap: { $set: {} },
                    textStyleMap: { $set: {} },
                },
            }));
            return;
        }
        const currentText = text;
        const textDiff = newText.length - currentText.length;
        // const lineCount = newText.split('\n').length;
        const cursor = currentSelectionStart === currentSelectionEnd
            ? currentSelectionStart
            : null;
        const cursorDiff = platformMode === "ios" ? 1 : 0;
        const lastChar = cursor !== null && textDiff == 1
            ? newText[cursor - cursorDiff]
            : newText[newText.length - 1];
        const nextLine = lastChar === "\n";
        const previousLine = newText.length === 0 && textDiff < 0;
        const currentTextLines = currentText.split("\n");
        const newTextLines = newText.split("\n");
        const possibleNextSelectionKey = currentSelectionStart === currentSelectionEnd
            ? (0, utils_1.getKeyFromSelection)(currentSelectionStart + textDiff, currentSelectionEnd + textDiff)
            : "0:0";
        const platformCurrentSelectionKey = platformMode === "ios" ? currentSelectionKey : possibleNextSelectionKey;
        const newLineIndex = (0, utils_1.getCurrentLineIndex)(platformCurrentSelectionKey, newText);
        const lineDiff = newTextLines.length - currentTextLines.length;
        let currentIncludeSelectionEnd = includeSelectionEnd;
        if (nextLine && lastSelectionKey) {
            const closestLastSelectionKey = lastSelectionKey
                ? (0, utils_1.getClosestSelectionKey)(textStyleMap, lastSelectionKey, includeSelectionEnd)
                : undefined;
            const closestLastSelectionTextStyles = closestLastSelectionKey
                ? textStyleMap[closestLastSelectionKey]
                : [];
            if (closestLastSelectionTextStyles.length > 0) {
                currentIncludeSelectionEnd = false;
            }
        }
        if (previousLine) {
            // return; TODO
        }
        handleAffectedSelections({
            inputBlockInfoKey,
            lineIndex: newLineIndex,
            lineShift: lineDiff,
            lineCount: newTextLines.length,
            textShift: textDiff,
            currentIncludeSelectionEnd,
        });
        if (!closestSelectionKey && !includeSelectionEnd) {
            currentIncludeSelectionEnd = true;
        }
        if (currentIncludeSelectionEnd != includeSelectionEnd) {
            setIncludeSelectionEnd(currentIncludeSelectionEnd);
        }
    };
    const onLineStyle = (lineStyle) => {
        setInputBlockInfoMap((currentInputBlockInfoMap) => (0, immutability_helper_1.default)(currentInputBlockInfoMap, {
            [currentInputBlockKey]: {
                lineStyleMap: {
                    [currentLineIndex]: { $set: lineStyle },
                },
            },
        }));
    };
    const onTextStyle = (textStyle) => {
        const currentSelection = (0, utils_1.getSelectionFromKey)(currentSelectionKey);
        //sentence Hey you| <=> Hey you**|**
        if (currentSelection.start === currentSelection.end &&
            closestSelectionKey) {
            if (!(closestSelectionTextStyles === null || closestSelectionTextStyles === void 0 ? void 0 : closestSelectionTextStyles.includes(textStyle))) {
                setInputBlockInfoMap((currentInputBlockInfoMap) => (0, immutability_helper_1.default)(currentInputBlockInfoMap, {
                    [currentInputBlockKey]: {
                        textStyleMap: {
                            [closestSelectionKey]: {
                                $apply: function (textStyles = []) {
                                    return [...textStyles, textStyle];
                                },
                            },
                        },
                    },
                }));
                return;
            }
            const closestSelection = (0, utils_1.getSelectionFromKey)(closestSelectionKey);
            if (closestSelectionTextStyles === null || closestSelectionTextStyles === void 0 ? void 0 : closestSelectionTextStyles.includes(textStyle)) {
                if (closestSelection.start === closestSelection.end) {
                    setInputBlockInfoMap((currentInputBlockInfoMap) => (0, immutability_helper_1.default)(currentInputBlockInfoMap, {
                        [currentInputBlockKey]: {
                            textStyleMap: {
                                $apply: function (currentTextStyleMap = {}) {
                                    //remove textStyle: { '0:3': [ '**', '__']} => { '0:3': ['__'] }
                                    if (currentTextStyleMap[closestSelectionKey].length > 1) {
                                        return Object.assign(Object.assign({}, currentTextStyleMap), { [closestSelectionKey]: currentTextStyleMap[closestSelectionKey].filter((ts) => ts !== textStyle) });
                                    }
                                    //or remove entire key:  { '0:3': ['__'] } => {}
                                    const _a = currentTextStyleMap, _b = closestSelectionKey, _ = _a[_b], //eslint-disable-line
                                    filteredStyleMap = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                                    return filteredStyleMap;
                                },
                            },
                        },
                    }));
                }
                else {
                    setIncludeSelectionEnd(false);
                }
                return;
            }
        }
        //selection Hey you| <=> **Hey** you|
        if (!(currentSelectionTextStyles === null || currentSelectionTextStyles === void 0 ? void 0 : currentSelectionTextStyles.includes(textStyle))) {
            setInputBlockInfoMap((currentInputBlockInfoMap) => (0, immutability_helper_1.default)(currentInputBlockInfoMap, {
                [currentInputBlockKey]: {
                    textStyleMap: {
                        [currentSelectionKey]: {
                            $apply: function (textStyles = []) {
                                return [...textStyles, textStyle];
                            },
                        },
                    },
                },
            }));
            return;
        }
        //**Hey** you| => Hey you|
        if (currentSelectionTextStyles === null || currentSelectionTextStyles === void 0 ? void 0 : currentSelectionTextStyles.includes(textStyle)) {
            setInputBlockInfoMap((currentInputBlockInfoMap) => (0, immutability_helper_1.default)(currentInputBlockInfoMap, {
                [currentInputBlockKey]: {
                    textStyleMap: {
                        $apply: function (currentTextStyleMap = {}) {
                            //remove textStyle: { '0:3': [ '**', '__']} => { '0:3': ['__'] }
                            if (currentTextStyleMap[currentSelectionKey].length > 1) {
                                return Object.assign(Object.assign({}, currentTextStyleMap), { [currentSelectionKey]: currentTextStyleMap[currentSelectionKey].filter((ts) => ts !== textStyle) });
                            }
                            //or remove entire key:  { '0:3': ['__'] } => {}
                            const _a = currentTextStyleMap, _b = currentSelectionKey, _ = _a[_b], //eslint-disable-line
                            filteredStyleMap = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                            return filteredStyleMap;
                        },
                    },
                },
            }));
            return;
        }
    };
    const onAddPhoto = (imgUri) => {
        setInputBlockInfoMap((currentInputBlockInfoMap) => (0, immutability_helper_1.default)(currentInputBlockInfoMap, {
            $set: (0, utils_1.splitInputBlockInfoMap)({
                inputBlockInfoMap: currentInputBlockInfoMap,
                inputBlockInfoKey: currentInputBlockKey,
                imgUri,
            }),
        }));
    };
    const onRemovePhoto = (inputBlockInfoKey) => {
        setInputBlockInfoMap((currentInputBlockInfoMap) => (0, immutability_helper_1.default)(currentInputBlockInfoMap, {
            $set: (0, utils_1.mergeInputBlockInfoMap)({
                inputBlockInfoMap: currentInputBlockInfoMap,
                inputBlockInfoKey,
            }),
        }));
    };
    return {
        markdown,
        inputBlockInfoMap,
        currentLineStyle,
        currentTextStyles,
        onChangeText,
        onSelectionChange,
        onLineStyle,
        onTextStyle,
        onAddPhoto,
        onRemovePhoto,
    };
};
exports.useTextEditor = useTextEditor;
