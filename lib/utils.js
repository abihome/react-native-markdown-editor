"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeInputBlockInfoMap = exports.splitInputBlockInfoMap = exports.mergeTextStyleMap = exports.splitTextStyleMap = exports.mergeLineStyleMap = exports.splitLineStyleMap = exports.getTextStyles = exports.getStyledLineMap = exports.getCurrentLineIndex = exports.handleTextStyleShiftSelection = exports.handleLineStyleShiftSelection = exports.getClosestSelectionKey = exports.clearText = exports.inputBlockInfoMapToMarkdown = exports.mardownToInputBlockInfoMap = exports.getLineStyleMap = exports.getTextStyleSelectionsFromMarkdownText = exports.getLineStyle = exports.stringInsertAt = exports.stringReplaceAt = exports.getSelectionText = exports.getSelectionFromKey = exports.getKeyFromSelection = void 0;
const types_1 = require("./types");
const getKeyFromSelection = (start, end) => {
    return `${start}:${end}`;
};
exports.getKeyFromSelection = getKeyFromSelection;
const getSelectionFromKey = (key) => {
    const [start, end] = key.split(':');
    return {
        start: parseInt(start) || 0,
        end: parseInt(end) || 0,
    };
};
exports.getSelectionFromKey = getSelectionFromKey;
const getSelectionText = (text, start, end) => {
    return text.substr(start, end ? end - start : undefined);
};
exports.getSelectionText = getSelectionText;
const stringReplaceAt = (string, start, end, replacement, replacementOffset = 0) => {
    return (string.substr(0, start + replacementOffset) +
        replacement +
        string.substr(end + replacementOffset));
};
exports.stringReplaceAt = stringReplaceAt;
const stringInsertAt = (string, at, replacement) => {
    return string.substr(0, at) + replacement + string.substr(at);
};
exports.stringInsertAt = stringInsertAt;
const getLineStyle = (text) => {
    let i, lineTag;
    for (i = 0; i < types_1.LINE_TAGS.length; i++) {
        lineTag = types_1.LINE_TAGS[i];
        if (text.substr(0, lineTag.length) === lineTag) {
            return lineTag;
        }
    }
    return 'body';
};
exports.getLineStyle = getLineStyle;
const getTextStyleSelectionsFromMarkdownText = (markdowText, textStyle) => {
    const selections = [];
    const filteredText = (0, exports.clearText)(markdowText, [textStyle]);
    const textBlocks = filteredText.split(textStyle);
    let charCount = (textBlocks === null || textBlocks === void 0 ? void 0 : textBlocks[0].length) || 0;
    let currentStart = (textBlocks === null || textBlocks === void 0 ? void 0 : textBlocks[0].length) || 0;
    let i;
    for (i = 1; i < textBlocks.length; i++) {
        const textBlock = textBlocks[i];
        if (i % 2 == 0) {
            const start = currentStart;
            const end = charCount;
            selections.push({
                start,
                end,
            });
            currentStart = charCount + textBlock.length;
        }
        charCount += textBlock.length;
    }
    return selections;
};
exports.getTextStyleSelectionsFromMarkdownText = getTextStyleSelectionsFromMarkdownText;
const getLineStyleMap = (rawText) => {
    const lineStyleMap = {};
    const lines = rawText.split('\n');
    lines.forEach((text, i) => {
        const lineStyle = (0, exports.getLineStyle)(text);
        if (lineStyle) {
            lineStyleMap[`${i}`] = lineStyle;
        }
    });
    return lineStyleMap;
};
exports.getLineStyleMap = getLineStyleMap;
const mardownToInputBlockInfoMap = (mardownText) => {
    if (mardownText === '') {
        return {
            '0': {
                type: 'text',
                text: '',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {},
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        };
    }
    const inputBlockInfoMap = {};
    const rawTextBlocks = mardownText.split(/<img>|<\/img>/);
    rawTextBlocks.forEach((rawTextBlock, index) => {
        if (index % 2 == 1) {
            inputBlockInfoMap[`${index}`] = {
                type: 'image',
                imgUrl: rawTextBlock,
            };
            return;
        }
        const lineStyleMap = (0, exports.getLineStyleMap)(rawTextBlock);
        let textStyleMap = {};
        types_1.TEXT_TAGS.forEach((TAG) => {
            const textStyleSelections = (0, exports.getTextStyleSelectionsFromMarkdownText)(rawTextBlock, TAG);
            textStyleSelections.forEach((textStyleSelection) => {
                const { start, end } = textStyleSelection;
                const selectionKey = (0, exports.getKeyFromSelection)(start, end);
                const currentTextStyles = textStyleMap[selectionKey] || [];
                const textStyles = [...currentTextStyles, TAG];
                textStyleMap = Object.assign(Object.assign({}, textStyleMap), { [selectionKey]: textStyles });
            });
        });
        inputBlockInfoMap[`${index}`] = {
            type: 'text',
            text: (0, exports.clearText)(rawTextBlock),
            lineStyleMap,
            textStyleMap,
            currentSelectionKey: '0:0',
            lastSelectionKey: '0:0',
        };
    });
    return inputBlockInfoMap;
};
exports.mardownToInputBlockInfoMap = mardownToInputBlockInfoMap;
const inputBlockInfoMapToMarkdown = (inputBlockInfoMap) => {
    const markdownLines = [];
    const inputBlockKeys = Object.keys(inputBlockInfoMap);
    inputBlockKeys.map((inputBlockKey) => {
        let markdown = '';
        const inputBlockInfo = inputBlockInfoMap[inputBlockKey];
        if (inputBlockInfo.type === 'text') {
            const { text, textStyleMap, lineStyleMap } = inputBlockInfo;
            markdown = `${markdown}${text}`;
            let replacementOffset = 0;
            const selectionKeys = Object.keys(textStyleMap);
            const selections = selectionKeys.map((selectionKey) => (0, exports.getSelectionFromKey)(selectionKey));
            const sortedSelections = selections.sort((sa, sb) => sa.start - sb.start);
            sortedSelections.map((selection) => {
                const { start, end } = selection;
                const textStyles = textStyleMap[(0, exports.getKeyFromSelection)(start, end)];
                const tag = textStyles.join('');
                const subText = (0, exports.getSelectionText)(text, start, end);
                const replacedText = `${tag}${subText}${tag}`;
                markdown = (0, exports.stringReplaceAt)(markdown, start, end || markdown.length, replacedText, replacementOffset);
                replacementOffset += tag.length * 2;
            });
            const lines = markdown.split('\n');
            let textCount = 0;
            lines.forEach((line, i) => {
                const start = textCount;
                const lineTag = lineStyleMap[`${i}`];
                let lineTagSize = 0;
                if (lineTag && lineTag != 'body') {
                    markdown = (0, exports.stringInsertAt)(markdown, start, lineTag);
                    lineTagSize = lineTag.length;
                }
                textCount += line.length + lineTagSize + 1; //\n
            });
        }
        else {
            const { imgUrl } = inputBlockInfo;
            markdown = `${markdown}<img>${imgUrl}</img>`;
        }
        markdownLines.push(markdown);
    });
    return markdownLines.join('');
};
exports.inputBlockInfoMapToMarkdown = inputBlockInfoMapToMarkdown;
const clearText = (markdown, keepTags = []) => {
    // /\*\*|__/g
    const regexTagMap = {
        '**': '\\*\\*',
        __: '__',
        '~~': '~~',
        '--': '--',
        '#': '#',
        '##': '##',
        '###': '###',
        body: '',
    };
    const allTags = [...types_1.LINE_TAGS, ...types_1.TEXT_TAGS];
    const filteredTags = allTags.filter((tag) => !keepTags.includes(tag));
    const regexTags = filteredTags.map((tag) => regexTagMap[tag]);
    const regex = new RegExp(regexTags.join('|'), 'g');
    return markdown.replace(regex, '');
};
exports.clearText = clearText;
const getClosestSelectionKey = (textStyleMap, currentSelectionKey, includeSelectionEnd = true) => {
    // console.log('getClosestSelectionKey', {
    //   textStyleMap,
    //   currentSelectionKey,
    //   includeSelectionEnd,
    // });
    const { start, end } = (0, exports.getSelectionFromKey)(currentSelectionKey);
    if (start !== end) {
        return undefined;
    }
    const cursorIndex = start;
    const selections = Object.keys(textStyleMap).map((selectionKey) => (0, exports.getSelectionFromKey)(selectionKey));
    let i, closestDiff = undefined, closestSelection = undefined;
    for (i = 0; i < selections.length; i++) {
        const selection = selections[i];
        const { start, end } = selection;
        if (cursorIndex >= start &&
            ((includeSelectionEnd && cursorIndex <= end) ||
                (!includeSelectionEnd && cursorIndex < end))) {
            const diff = end - start;
            if (!closestDiff || (closestDiff && diff < closestDiff)) {
                closestDiff = diff;
                closestSelection = selection;
            }
        }
    }
    return closestSelection
        ? (0, exports.getKeyFromSelection)(closestSelection.start, closestSelection.end)
        : undefined;
};
exports.getClosestSelectionKey = getClosestSelectionKey;
const handleLineStyleShiftSelection = ({ lineStyleMap, currentLineIndex, shift, lineCount, }) => {
    const updatedLineStyleMap = {};
    //handle shift
    const lineKeys = Object.keys(lineStyleMap);
    lineKeys.map((lineKey) => {
        const lineNum = parseInt(lineKey);
        if (lineNum >= currentLineIndex) {
            const newLineNum = lineNum + shift;
            if (newLineNum >= 0) {
                updatedLineStyleMap[`${newLineNum}`] = lineStyleMap[lineKey];
            }
        }
        else {
            updatedLineStyleMap[lineKey] = lineStyleMap[lineKey];
        }
    });
    //fill all lines
    Array.from(Array(lineCount).keys()).map((lineNum) => {
        const lineKey = lineNum.toString();
        if (!updatedLineStyleMap[lineKey]) {
            updatedLineStyleMap[lineKey] = 'body';
        }
    });
    return updatedLineStyleMap;
};
exports.handleLineStyleShiftSelection = handleLineStyleShiftSelection;
const handleTextStyleShiftSelection = ({ textStyleMap, currentSelectionKey, shift, includeSelectionEnd = true, }) => {
    const { end: cursorIndex } = (0, exports.getSelectionFromKey)(currentSelectionKey);
    const selectionKeys = Object.keys(textStyleMap);
    const updatedTextStyleMap = {};
    const closestSelectionKey = (0, exports.getClosestSelectionKey)(textStyleMap, currentSelectionKey, includeSelectionEnd);
    selectionKeys.map((selectionKey) => {
        //clean on backspace: Hey **|** => Hey|
        if (shift < 0 && currentSelectionKey === selectionKey) {
            return;
        }
        //closest selection: **Hey|** => **Hey |**
        if (selectionKey === closestSelectionKey) {
            const closestSelection = (0, exports.getSelectionFromKey)(closestSelectionKey);
            const updatedSelectionKey = (0, exports.getKeyFromSelection)(closestSelection.start, closestSelection.end + shift);
            updatedTextStyleMap[updatedSelectionKey] =
                textStyleMap[closestSelectionKey];
            return;
        }
        //affected selections: Hey| **you** => Hey | **you**
        const currentSelection = (0, exports.getSelectionFromKey)(selectionKey);
        if (currentSelection.start > cursorIndex &&
            currentSelection.end > cursorIndex) {
            const shiftedSelectionKey = (0, exports.getKeyFromSelection)(currentSelection.start + shift, currentSelection.end + shift);
            updatedTextStyleMap[shiftedSelectionKey] = textStyleMap[selectionKey];
            return;
        }
        updatedTextStyleMap[selectionKey] = textStyleMap[selectionKey];
    });
    return updatedTextStyleMap;
};
exports.handleTextStyleShiftSelection = handleTextStyleShiftSelection;
const getCurrentLineIndex = (currentSelectionKey, text) => {
    const currentSelection = (0, exports.getSelectionFromKey)(currentSelectionKey);
    const lines = text.split('\n');
    let i, lineLength, textCount = 0;
    for (i = 0; i < lines.length; i++) {
        lineLength = lines[i].length;
        const lineStart = textCount;
        const lineEnd = textCount + lineLength;
        if (currentSelection.start >= lineStart &&
            currentSelection.end <= lineEnd) {
            return i;
        }
        textCount += lineLength + 1; //\n
    }
    return 0;
};
exports.getCurrentLineIndex = getCurrentLineIndex;
const getStyledTexts = (text, textStyleMap, textStart = 0) => {
    const selectionKeys = Object.keys(textStyleMap);
    const textEnd = textStart + text.length;
    const styledTexts = [];
    const selections = selectionKeys.map((selectionKey) => (0, exports.getSelectionFromKey)(selectionKey));
    const filteredSelections = selections.filter((sel) => sel.start >= textStart && sel.end <= textEnd);
    //'**Hey******' => ensure [[3,3], [0,3]] => [[0,3] ,[3,3]]
    const sortedSelections = filteredSelections.sort((sa, sb) => sa.start - sb.start);
    if (sortedSelections.length == 0) {
        return [
            {
                text,
            },
        ];
    }
    let i;
    for (i = 0; i < sortedSelections.length; i++) {
        const { start, end } = sortedSelections[i];
        const textStyles = textStyleMap[(0, exports.getKeyFromSelection)(start, end)];
        const nStart = start - textStart;
        const nEnd = end - textStart;
        //inicial
        if (i === 0 && nStart != 0) {
            styledTexts.push({
                text: text.substr(0, nStart),
            });
        }
        //default
        const styledText = {
            text: text.substr(nStart, nEnd - nStart),
        };
        if (textStyles.includes('**')) {
            styledText.bold = true;
        }
        if (textStyles.includes('__')) {
            styledText.italic = true;
        }
        if (textStyles.includes('--')) {
            styledText.underline = true;
        }
        if (textStyles.includes('~~')) {
            styledText.strikethrough = true;
        }
        styledTexts.push(styledText);
        //inner
        if (i < sortedSelections.length - 1 &&
            nEnd != sortedSelections[i + 1].start - textStart) {
            styledTexts.push({
                text: text.substr(nEnd, sortedSelections[i + 1].start - textStart - nEnd),
            });
        }
        //last
        if (i === sortedSelections.length - 1 && nEnd != text.length) {
            styledTexts.push({
                text: text.substr(nEnd, textEnd - nEnd),
            });
        }
    }
    return styledTexts;
};
const getStyledLineMap = (text, textStyleMap, lineStyleMap) => {
    const styledLineMap = {};
    const lines = text.split('\n');
    let textCount = 0;
    lines.forEach((line, i) => {
        const lineKey = i.toString();
        const styledTexts = getStyledTexts(line, textStyleMap, textCount);
        styledLineMap[lineKey] = {
            lineStyle: 'body',
            styledTexts,
        };
        const lineStyle = lineStyleMap[lineKey];
        if (lineStyle) {
            styledLineMap[lineKey].lineStyle = lineStyle;
        }
        textCount += line.length + 1; //\n
    });
    return styledLineMap;
};
exports.getStyledLineMap = getStyledLineMap;
const getTextStyles = (textStyleMap, selectionKey) => {
    if (!selectionKey) {
        return [];
    }
    return textStyleMap[selectionKey] || [];
};
exports.getTextStyles = getTextStyles;
const splitLineStyleMap = ({ lineStyleMap, leftText, rightText, currentLineIndex, }) => {
    const leftLineStyleMap = {};
    const rightLineStyleMap = {};
    const lineStyleKeys = Object.keys(lineStyleMap);
    let leftLineCount = 0;
    let rightLineCount = 0;
    const leftLineStyleKeys = lineStyleKeys.filter((lineStyleKey) => parseInt(lineStyleKey) < currentLineIndex);
    const rightLineStyleKeys = lineStyleKeys.filter((lineStyleKey) => parseInt(lineStyleKey) >= currentLineIndex);
    leftLineStyleKeys.forEach((leftLineStyleKey) => {
        leftLineStyleMap[`${leftLineCount}`] = lineStyleMap[leftLineStyleKey];
        leftLineCount += 1;
    });
    if (leftText[leftText.length - 1] === '\n') {
        leftLineStyleMap[`${leftLineCount}`] = 'body';
        leftLineCount += 1;
    }
    if (rightText[0] === '\n') {
        rightLineStyleMap[`${rightLineCount}`] = 'body';
        rightLineCount += 1;
    }
    rightLineStyleKeys.forEach((rightLineStyleKey) => {
        rightLineStyleMap[`${rightLineCount}`] = lineStyleMap[rightLineStyleKey];
        rightLineCount += 1;
    });
    return {
        leftLineStyleMap,
        rightLineStyleMap,
    };
};
exports.splitLineStyleMap = splitLineStyleMap;
const mergeLineStyleMap = ({ leftLineStyleMap, rightLineStyleMap, leftText, rightText, }) => {
    const lineStyleMap = {};
    let lineCount = 0;
    const leftLineStyleKeys = Object.keys(leftLineStyleMap);
    const rightLineStyleKeys = Object.keys(rightLineStyleMap);
    leftLineStyleKeys.forEach((leftLineStyleKey, index) => {
        if (index === leftLineStyleKeys.length - 1 &&
            leftText[leftText.length - 1] === '\n') {
            return;
        }
        lineStyleMap[`${lineCount}`] = leftLineStyleMap[leftLineStyleKey];
        lineCount += 1;
    });
    rightLineStyleKeys.forEach((rightLineStyleKey, index) => {
        if (index === 0 && rightText[0] === '\n') {
            return;
        }
        lineStyleMap[`${lineCount}`] = rightLineStyleMap[rightLineStyleKey];
        lineCount += 1;
    });
    return lineStyleMap;
};
exports.mergeLineStyleMap = mergeLineStyleMap;
const splitTextStyleMap = ({ textStyleMap, leftTextLength, }) => {
    const leftTextStyleMap = {};
    const rightTextStyleMap = {};
    const textSelectionKeys = Object.keys(textStyleMap);
    textSelectionKeys.forEach((textSelectionKey) => {
        const { start, end } = (0, exports.getSelectionFromKey)(textSelectionKey);
        if (end <= leftTextLength) {
            leftTextStyleMap[textSelectionKey] = textStyleMap[textSelectionKey];
        }
        else {
            rightTextStyleMap[`${start - leftTextLength}:${end - leftTextLength}`] =
                textStyleMap[textSelectionKey];
        }
    });
    return {
        leftTextStyleMap,
        rightTextStyleMap,
    };
};
exports.splitTextStyleMap = splitTextStyleMap;
const mergeTextStyleMap = ({ leftTextStyleMap, rightTextStyleMap, leftTextLength, }) => {
    const textStyleMap = {};
    const leftTextStyleKeys = Object.keys(leftTextStyleMap);
    const rightTextStyleKeys = Object.keys(rightTextStyleMap);
    leftTextStyleKeys.map((leftTextStyleKey) => {
        textStyleMap[leftTextStyleKey] = leftTextStyleMap[leftTextStyleKey];
    });
    rightTextStyleKeys.map((rightTextStyleKey) => {
        const { start, end } = (0, exports.getSelectionFromKey)(rightTextStyleKey);
        textStyleMap[`${start + leftTextLength}:${end + leftTextLength}`] =
            rightTextStyleMap[rightTextStyleKey];
    });
    return textStyleMap;
};
exports.mergeTextStyleMap = mergeTextStyleMap;
const splitInputBlockInfoMap = ({ inputBlockInfoMap, inputBlockInfoKey, imgUri, }) => {
    const splitedInputBlockInfoMap = {};
    let splitedInputBlockIndex = 0;
    const inputKeys = Object.keys(inputBlockInfoMap);
    inputKeys.forEach((inputKey) => {
        const inputBlockInfo = inputBlockInfoMap[inputKey];
        if (inputKey === inputBlockInfoKey && inputBlockInfo.type === 'text') {
            const { text, currentSelectionKey } = inputBlockInfo;
            const { end: cursor } = (0, exports.getSelectionFromKey)(currentSelectionKey);
            const leftText = text.substring(0, cursor);
            const rightText = text.substring(cursor, text.length);
            const lineShift = rightText[0] === '\n' ? 1 : 0;
            const currentLineIndex = (0, exports.getCurrentLineIndex)(`${cursor}:${cursor}`, text) + lineShift;
            const { leftLineStyleMap, rightLineStyleMap } = (0, exports.splitLineStyleMap)({
                lineStyleMap: inputBlockInfo.lineStyleMap,
                leftText,
                rightText,
                currentLineIndex,
            });
            const { leftTextStyleMap, rightTextStyleMap } = (0, exports.splitTextStyleMap)({
                textStyleMap: inputBlockInfo.textStyleMap,
                leftTextLength: leftText.length,
            });
            //left
            splitedInputBlockInfoMap[`${splitedInputBlockIndex}`] = Object.assign(Object.assign({}, inputBlockInfo), { text: leftText, lineStyleMap: leftLineStyleMap, textStyleMap: leftTextStyleMap, currentSelectionKey: '0:0', lastSelectionKey: '0:0' });
            splitedInputBlockIndex += 1;
            //image
            splitedInputBlockInfoMap[`${splitedInputBlockIndex}`] = {
                type: 'image',
                imgUrl: imgUri,
            };
            splitedInputBlockIndex += 1;
            //right
            splitedInputBlockInfoMap[`${splitedInputBlockIndex}`] = Object.assign(Object.assign({}, inputBlockInfo), { text: rightText, lineStyleMap: rightLineStyleMap, textStyleMap: rightTextStyleMap, currentSelectionKey: '0:0', lastSelectionKey: '0:0' });
            splitedInputBlockIndex += 1;
            return;
        }
        splitedInputBlockInfoMap[`${splitedInputBlockIndex}`] = inputBlockInfo;
        splitedInputBlockIndex += 1;
    });
    return splitedInputBlockInfoMap;
};
exports.splitInputBlockInfoMap = splitInputBlockInfoMap;
const mergeInputBlockInfoMap = ({ inputBlockInfoMap, inputBlockInfoKey, }) => {
    const mergedInputBlockInfoMap = {};
    const inputBlockInfoIndex = parseInt(inputBlockInfoKey);
    const leftInputBlockInfoKey = `${inputBlockInfoIndex - 1}`;
    const rightInputBlockInfoKey = `${inputBlockInfoIndex + 1}`;
    let mergeInputBlockIndex = 0;
    const inputKeys = Object.keys(inputBlockInfoMap);
    inputKeys.forEach((inputKey) => {
        const inputBlockInfo = inputBlockInfoMap[inputKey];
        if (inputKey == leftInputBlockInfoKey && inputBlockInfo.type === 'text') {
            const leftInputBlockInfo = inputBlockInfoMap[leftInputBlockInfoKey];
            const rightInputBlockInfo = inputBlockInfoMap[rightInputBlockInfoKey];
            if (leftInputBlockInfo.type === 'text' &&
                rightInputBlockInfo.type === 'text') {
                const lineStyleMap = (0, exports.mergeLineStyleMap)({
                    leftLineStyleMap: leftInputBlockInfo.lineStyleMap,
                    rightLineStyleMap: rightInputBlockInfo.lineStyleMap,
                    leftText: leftInputBlockInfo.text,
                    rightText: rightInputBlockInfo.text,
                });
                const textStyleMap = (0, exports.mergeTextStyleMap)({
                    leftTextStyleMap: leftInputBlockInfo.textStyleMap,
                    rightTextStyleMap: rightInputBlockInfo.textStyleMap,
                    leftTextLength: leftInputBlockInfo.text.length,
                });
                const leftText = leftInputBlockInfo.text;
                const rightText = rightInputBlockInfo.text;
                const lineSeparator = leftText[leftText.length - 1] === '\n' || rightText[0] === '\n'
                    ? ''
                    : '\n';
                const text = `${leftText}${lineSeparator}${rightText}`;
                mergedInputBlockInfoMap[leftInputBlockInfoKey] = Object.assign(Object.assign({}, inputBlockInfo), { text,
                    lineStyleMap,
                    textStyleMap, currentSelectionKey: '0:0', lastSelectionKey: '0:0' });
                mergeInputBlockIndex += 1;
            }
            return;
        }
        else if (inputKey == inputBlockInfoKey ||
            inputKey == rightInputBlockInfoKey) {
            return;
        }
        mergedInputBlockInfoMap[`${mergeInputBlockIndex}`] = inputBlockInfo;
        mergeInputBlockIndex += 1;
    });
    return mergedInputBlockInfoMap;
};
exports.mergeInputBlockInfoMap = mergeInputBlockInfoMap;
