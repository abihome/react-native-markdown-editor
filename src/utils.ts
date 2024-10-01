import {
  TextStyleMap,
  Selection,
  TextStyle,
  SelectionKey,
  LineStyleMap,
  StyledText,
  StyledLineMap,
  LineStyle,
  LineKey,
  InputBlockInfoMap,
  LINE_TAGS,
  TEXT_TAGS,
} from './types';

export const getKeyFromSelection = (
  start: number,
  end: number,
): SelectionKey => {
  return `${start}:${end}`;
};

export const getSelectionFromKey = (
  key: SelectionKey,
): { start: number; end: number } => {
  const [start, end] = key.split(':');
  return {
    start: parseInt(start) || 0,
    end: parseInt(end) || 0,
  };
};

export const getSelectionText = (
  text: string,
  start: number,
  end?: number,
): string => {
  return text.substr(start, end ? end - start : undefined);
};

export const stringReplaceAt = (
  string: string,
  start: number,
  end: number,
  replacement: string,
  replacementOffset = 0,
): string => {
  return (
    string.substr(0, start + replacementOffset) +
    replacement +
    string.substr(end + replacementOffset)
  );
};

export const stringInsertAt = (
  string: string,
  at: number,
  replacement: string,
): string => {
  return string.substr(0, at) + replacement + string.substr(at);
};

export const getLineStyle = (text: string): LineStyle => {
  let i, lineTag;
  for (i = 0; i < LINE_TAGS.length; i++) {
    lineTag = LINE_TAGS[i];
    if (text.substr(0, lineTag.length) === lineTag) {
      return lineTag;
    }
  }
  return 'body';
};

export const getTextStyleSelectionsFromMarkdownText = (
  markdowText: string,
  textStyle: TextStyle,
): Selection[] => {
  const selections: Selection[] = [];
  const filteredText = clearText(markdowText, [textStyle]);
  const textBlocks = filteredText.split(textStyle);

  let charCount = textBlocks?.[0].length || 0;
  let currentStart: number = textBlocks?.[0].length || 0;
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

export const getLineStyleMap = (rawText: string): LineStyleMap => {
  const lineStyleMap: LineStyleMap = {};
  const lines = rawText.split('\n');

  lines.forEach((text, i) => {
    const lineStyle = getLineStyle(text);
    if (lineStyle) {
      lineStyleMap[`${i}`] = lineStyle;
    }
  });
  return lineStyleMap;
};

export const mardownToInputBlockInfoMap = (
  mardownText: string,
): InputBlockInfoMap => {
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

  const inputBlockInfoMap: InputBlockInfoMap = {};
  const rawTextBlocks = mardownText.split(/<img>|<\/img>/);
  rawTextBlocks.forEach((rawTextBlock, index) => {
    if (index % 2 == 1) {
      inputBlockInfoMap[`${index}`] = {
        type: 'image',
        imgUrl: rawTextBlock,
      };
      return;
    }

    const lineStyleMap = getLineStyleMap(rawTextBlock);

    let textStyleMap: TextStyleMap = {};
    TEXT_TAGS.forEach((TAG) => {
      const textStyleSelections = getTextStyleSelectionsFromMarkdownText(
        rawTextBlock,
        TAG,
      );
      textStyleSelections.forEach((textStyleSelection) => {
        const { start, end } = textStyleSelection;
        const selectionKey = getKeyFromSelection(start, end);
        const currentTextStyles = textStyleMap[selectionKey] || [];
        const textStyles = [...currentTextStyles, TAG];

        textStyleMap = {
          ...textStyleMap,
          [selectionKey]: textStyles,
        };
      });
    });

    inputBlockInfoMap[`${index}`] = {
      type: 'text',
      text: clearText(rawTextBlock),
      lineStyleMap,
      textStyleMap,
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    };
  });

  return inputBlockInfoMap;
};

export const inputBlockInfoMapToMarkdown = (
  inputBlockInfoMap: InputBlockInfoMap,
): string => {
  const markdownLines: string[] = [];
  const inputBlockKeys = Object.keys(inputBlockInfoMap) as LineKey[];

  inputBlockKeys.map((inputBlockKey) => {
    let markdown = '';
    const inputBlockInfo = inputBlockInfoMap[inputBlockKey];
    if (inputBlockInfo.type === 'text') {
      const { text, textStyleMap, lineStyleMap } = inputBlockInfo;
      markdown = `${markdown}${text}`;
      let replacementOffset = 0;

      const selectionKeys = Object.keys(textStyleMap) as SelectionKey[];
      const selections = selectionKeys.map((selectionKey) =>
        getSelectionFromKey(selectionKey),
      );

      const sortedSelections = selections.sort((sa, sb) => sa.start - sb.start);

      sortedSelections.map((selection) => {
        const { start, end } = selection;
        const textStyles = textStyleMap[getKeyFromSelection(start, end)];
        const tag = textStyles.join('');
        const subText = getSelectionText(text, start, end);
        const replacedText = `${tag}${subText}${tag}`;
        markdown = stringReplaceAt(
          markdown,
          start,
          end || markdown.length,
          replacedText,
          replacementOffset,
        );

        replacementOffset += tag.length * 2;
      });

      const lines = markdown.split('\n');

      let textCount = 0;
      lines.forEach((line, i) => {
        const start = textCount;
        const lineTag = lineStyleMap[`${i}`];
        let lineTagSize = 0;

        if (lineTag && lineTag != 'body') {
          markdown = stringInsertAt(markdown, start, lineTag);

          lineTagSize = lineTag.length;
        }

        textCount += line.length + lineTagSize + 1; //\n
      });
    } else {
      const { imgUrl } = inputBlockInfo;
      markdown = `${markdown}<img>${imgUrl}</img>`;
    }
    markdownLines.push(markdown);
  });

  return markdownLines.join('');
};

export const clearText = (
  markdown: string,
  keepTags: (LineStyle | TextStyle)[] = [],
): string => {
  // /\*\*|__/g
  const regexTagMap: { [key in LineStyle | TextStyle]: string } = {
    '**': '\\*\\*',
    __: '__',
    '~~': '~~',
    '--': '--',
    '#': '#',
    '##': '##',
    '###': '###',
    body: '',
  };
  const allTags = [...LINE_TAGS, ...TEXT_TAGS];
  const filteredTags = allTags.filter((tag) => !keepTags.includes(tag));
  const regexTags = filteredTags.map((tag) => regexTagMap[tag]);
  const regex = new RegExp(regexTags.join('|'), 'g');
  return markdown.replace(regex, '');
};

export const getClosestSelectionKey = (
  textStyleMap: TextStyleMap,
  currentSelectionKey: SelectionKey,
  includeSelectionEnd = true,
): SelectionKey | undefined => {
  // console.log('getClosestSelectionKey', {
  //   textStyleMap,
  //   currentSelectionKey,
  //   includeSelectionEnd,
  // });
  const { start, end } = getSelectionFromKey(currentSelectionKey);
  if (start !== end) {
    return undefined;
  }

  const cursorIndex = start;

  const selections = (Object.keys(textStyleMap) as SelectionKey[]).map(
    (selectionKey) => getSelectionFromKey(selectionKey),
  );

  let i,
    closestDiff: number | undefined = undefined,
    closestSelection: Selection | undefined = undefined;
  for (i = 0; i < selections.length; i++) {
    const selection = selections[i];
    const { start, end } = selection;
    if (
      cursorIndex >= start &&
      ((includeSelectionEnd && cursorIndex <= end) ||
        (!includeSelectionEnd && cursorIndex < end))
    ) {
      const diff = end - start;
      if (!closestDiff || (closestDiff && diff < closestDiff)) {
        closestDiff = diff;
        closestSelection = selection;
      }
    }
  }
  return closestSelection
    ? getKeyFromSelection(closestSelection.start, closestSelection.end)
    : undefined;
};

interface HandleLineStyleShiftSelectionInput {
  lineStyleMap: LineStyleMap;
  currentLineIndex: number;
  shift: number;
  lineCount: number;
}

export const handleLineStyleShiftSelection = ({
  lineStyleMap,
  currentLineIndex,
  shift,
  lineCount,
}: HandleLineStyleShiftSelectionInput): LineStyleMap => {
  const updatedLineStyleMap: LineStyleMap = {};

  //handle shift
  const lineKeys = Object.keys(lineStyleMap) as LineKey[];
  lineKeys.map((lineKey) => {
    const lineNum = parseInt(lineKey);
    if (lineNum >= currentLineIndex) {
      const newLineNum = lineNum + shift;
      if (newLineNum >= 0) {
        updatedLineStyleMap[`${newLineNum}`] = lineStyleMap[lineKey];
      }
    } else {
      updatedLineStyleMap[lineKey] = lineStyleMap[lineKey];
    }
  });

  //fill all lines
  Array.from(Array(lineCount).keys()).map((lineNum) => {
    const lineKey = lineNum.toString() as LineKey;
    if (!updatedLineStyleMap[lineKey]) {
      updatedLineStyleMap[lineKey] = 'body';
    }
  });

  return updatedLineStyleMap;
};

interface HandleTextStyleShiftSelectionInput {
  textStyleMap: TextStyleMap;
  currentSelectionKey: SelectionKey;
  shift: number;
  includeSelectionEnd?: boolean;
}

export const handleTextStyleShiftSelection = ({
  textStyleMap,
  currentSelectionKey,
  shift,
  includeSelectionEnd = true,
}: HandleTextStyleShiftSelectionInput): TextStyleMap => {
  const { end: cursorIndex } = getSelectionFromKey(currentSelectionKey);
  const selectionKeys = Object.keys(textStyleMap) as SelectionKey[];
  const updatedTextStyleMap: TextStyleMap = {};

  const closestSelectionKey = getClosestSelectionKey(
    textStyleMap,
    currentSelectionKey,
    includeSelectionEnd,
  );

  selectionKeys.map((selectionKey) => {
    //clean on backspace: Hey **|** => Hey|
    if (shift < 0 && currentSelectionKey === selectionKey) {
      return;
    }

    //closest selection: **Hey|** => **Hey |**
    if (selectionKey === closestSelectionKey) {
      const closestSelection = getSelectionFromKey(closestSelectionKey);

      const updatedSelectionKey = getKeyFromSelection(
        closestSelection.start,
        closestSelection.end + shift,
      );

      updatedTextStyleMap[updatedSelectionKey] =
        textStyleMap[closestSelectionKey];
      return;
    }

    //affected selections: Hey| **you** => Hey | **you**
    const currentSelection = getSelectionFromKey(selectionKey);

    if (
      currentSelection.start > cursorIndex &&
      currentSelection.end > cursorIndex
    ) {
      const shiftedSelectionKey = getKeyFromSelection(
        currentSelection.start + shift,
        currentSelection.end + shift,
      );

      updatedTextStyleMap[shiftedSelectionKey] = textStyleMap[selectionKey];
      return;
    }

    updatedTextStyleMap[selectionKey] = textStyleMap[selectionKey];
  });

  return updatedTextStyleMap;
};

export const getCurrentLineIndex = (
  currentSelectionKey: SelectionKey,
  text: string,
): number => {
  const currentSelection = getSelectionFromKey(currentSelectionKey);
  const lines = text.split('\n');

  let i,
    lineLength,
    textCount = 0;

  for (i = 0; i < lines.length; i++) {
    lineLength = lines[i].length;
    const lineStart = textCount;
    const lineEnd = textCount + lineLength;

    if (
      currentSelection.start >= lineStart &&
      currentSelection.end <= lineEnd
    ) {
      return i;
    }
    textCount += lineLength + 1; //\n
  }

  return 0;
};

const getStyledTexts = (
  text: string,
  textStyleMap: TextStyleMap,
  textStart = 0,
): StyledText[] => {
  const selectionKeys = Object.keys(textStyleMap) as SelectionKey[];
  const textEnd = textStart + text.length;

  const styledTexts: StyledText[] = [];

  const selections = selectionKeys.map((selectionKey) =>
    getSelectionFromKey(selectionKey),
  );

  const filteredSelections = selections.filter(
    (sel) => sel.start >= textStart && sel.end <= textEnd,
  );

  //'**Hey******' => ensure [[3,3], [0,3]] => [[0,3] ,[3,3]]
  const sortedSelections = filteredSelections.sort(
    (sa, sb) => sa.start - sb.start,
  );

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
    const textStyles = textStyleMap[getKeyFromSelection(start, end)];
    const nStart = start - textStart;
    const nEnd = end - textStart;

    //inicial
    if (i === 0 && nStart != 0) {
      styledTexts.push({
        text: text.substr(0, nStart),
      });
    }
    //default

    const styledText: StyledText = {
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
    if (
      i < sortedSelections.length - 1 &&
      nEnd != sortedSelections[i + 1].start - textStart
    ) {
      styledTexts.push({
        text: text.substr(
          nEnd,
          sortedSelections[i + 1].start - textStart - nEnd,
        ),
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

export const getStyledLineMap = (
  text: string,
  textStyleMap: TextStyleMap,
  lineStyleMap: LineStyleMap,
): StyledLineMap => {
  const styledLineMap: StyledLineMap = {};

  const lines = text.split('\n');
  let textCount = 0;
  lines.forEach((line, i) => {
    const lineKey = i.toString() as LineKey;
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

export const getTextStyles = (
  textStyleMap: TextStyleMap,
  selectionKey?: SelectionKey,
): TextStyle[] => {
  if (!selectionKey) {
    return [];
  }
  return textStyleMap[selectionKey] || [];
};

export const splitLineStyleMap = ({
  lineStyleMap,
  leftText,
  rightText,
  currentLineIndex,
}: {
  lineStyleMap: LineStyleMap;
  leftText: string;
  rightText: string;
  currentLineIndex: number;
}): { leftLineStyleMap: LineStyleMap; rightLineStyleMap: LineStyleMap } => {
  const leftLineStyleMap: LineStyleMap = {};
  const rightLineStyleMap: LineStyleMap = {};
  const lineStyleKeys = Object.keys(lineStyleMap) as LineKey[];
  let leftLineCount = 0;
  let rightLineCount = 0;

  const leftLineStyleKeys = lineStyleKeys.filter(
    (lineStyleKey) => parseInt(lineStyleKey) < currentLineIndex,
  );
  const rightLineStyleKeys = lineStyleKeys.filter(
    (lineStyleKey) => parseInt(lineStyleKey) >= currentLineIndex,
  );

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

export const mergeLineStyleMap = ({
  leftLineStyleMap,
  rightLineStyleMap,
  leftText,
  rightText,
}: {
  leftLineStyleMap: LineStyleMap;
  rightLineStyleMap: LineStyleMap;
  leftText: string;
  rightText: string;
}): LineStyleMap => {
  const lineStyleMap: LineStyleMap = {};
  let lineCount = 0;

  const leftLineStyleKeys: LineKey[] = Object.keys(
    leftLineStyleMap,
  ) as LineKey[];
  const rightLineStyleKeys: LineKey[] = Object.keys(
    rightLineStyleMap,
  ) as LineKey[];

  leftLineStyleKeys.forEach((leftLineStyleKey, index) => {
    if (
      index === leftLineStyleKeys.length - 1 &&
      leftText[leftText.length - 1] === '\n'
    ) {
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

export const splitTextStyleMap = ({
  textStyleMap,
  leftTextLength,
}: {
  textStyleMap: TextStyleMap;
  leftTextLength: number;
}): { leftTextStyleMap: TextStyleMap; rightTextStyleMap: TextStyleMap } => {
  const leftTextStyleMap: TextStyleMap = {};
  const rightTextStyleMap: TextStyleMap = {};

  const textSelectionKeys = Object.keys(textStyleMap) as SelectionKey[];
  textSelectionKeys.forEach((textSelectionKey) => {
    const { start, end } = getSelectionFromKey(textSelectionKey);
    if (end <= leftTextLength) {
      leftTextStyleMap[textSelectionKey] = textStyleMap[textSelectionKey];
    } else {
      rightTextStyleMap[`${start - leftTextLength}:${end - leftTextLength}`] =
        textStyleMap[textSelectionKey];
    }
  });

  return {
    leftTextStyleMap,
    rightTextStyleMap,
  };
};

export const mergeTextStyleMap = ({
  leftTextStyleMap,
  rightTextStyleMap,
  leftTextLength,
}: {
  leftTextStyleMap: TextStyleMap;
  rightTextStyleMap: TextStyleMap;
  leftTextLength: number;
}): TextStyleMap => {
  const textStyleMap: TextStyleMap = {};

  const leftTextStyleKeys = Object.keys(leftTextStyleMap) as SelectionKey[];
  const rightTextStyleKeys = Object.keys(rightTextStyleMap) as SelectionKey[];

  leftTextStyleKeys.map((leftTextStyleKey) => {
    textStyleMap[leftTextStyleKey] = leftTextStyleMap[leftTextStyleKey];
  });

  rightTextStyleKeys.map((rightTextStyleKey) => {
    const { start, end } = getSelectionFromKey(rightTextStyleKey);

    textStyleMap[`${start + leftTextLength}:${end + leftTextLength}`] =
      rightTextStyleMap[rightTextStyleKey];
  });

  return textStyleMap;
};

export const splitInputBlockInfoMap = ({
  inputBlockInfoMap,
  inputBlockInfoKey,
  imgUri,
}: {
  inputBlockInfoMap: InputBlockInfoMap;
  inputBlockInfoKey: LineKey;
  imgUri: string;
}): InputBlockInfoMap => {
  const splitedInputBlockInfoMap: InputBlockInfoMap = {};
  let splitedInputBlockIndex = 0;
  const inputKeys = Object.keys(inputBlockInfoMap) as LineKey[];
  inputKeys.forEach((inputKey) => {
    const inputBlockInfo = inputBlockInfoMap[inputKey];
    if (inputKey === inputBlockInfoKey && inputBlockInfo.type === 'text') {
      const { text, currentSelectionKey } = inputBlockInfo;
      const { end: cursor } = getSelectionFromKey(currentSelectionKey);

      const leftText = text.substring(0, cursor);
      const rightText = text.substring(cursor, text.length);

      const lineShift = rightText[0] === '\n' ? 1 : 0;

      const currentLineIndex =
        getCurrentLineIndex(`${cursor}:${cursor}`, text) + lineShift;

      const { leftLineStyleMap, rightLineStyleMap } = splitLineStyleMap({
        lineStyleMap: inputBlockInfo.lineStyleMap,
        leftText,
        rightText,
        currentLineIndex,
      });

      const { leftTextStyleMap, rightTextStyleMap } = splitTextStyleMap({
        textStyleMap: inputBlockInfo.textStyleMap,
        leftTextLength: leftText.length,
      });

      //left
      splitedInputBlockInfoMap[`${splitedInputBlockIndex}`] = {
        ...inputBlockInfo,
        text: leftText,
        lineStyleMap: leftLineStyleMap,
        textStyleMap: leftTextStyleMap,
        currentSelectionKey: '0:0',
        lastSelectionKey: '0:0',
      };
      splitedInputBlockIndex += 1;

      //image
      splitedInputBlockInfoMap[`${splitedInputBlockIndex}`] = {
        type: 'image',
        imgUrl: imgUri,
      };
      splitedInputBlockIndex += 1;

      //right
      splitedInputBlockInfoMap[`${splitedInputBlockIndex}`] = {
        ...inputBlockInfo,
        text: rightText,
        lineStyleMap: rightLineStyleMap,
        textStyleMap: rightTextStyleMap,
        currentSelectionKey: '0:0',
        lastSelectionKey: '0:0',
      };
      splitedInputBlockIndex += 1;
      return;
    }
    splitedInputBlockInfoMap[`${splitedInputBlockIndex}`] = inputBlockInfo;
    splitedInputBlockIndex += 1;
  });

  return splitedInputBlockInfoMap;
};

export const mergeInputBlockInfoMap = ({
  inputBlockInfoMap,
  inputBlockInfoKey,
}: {
  inputBlockInfoMap: InputBlockInfoMap;
  inputBlockInfoKey: LineKey;
}): InputBlockInfoMap => {
  const mergedInputBlockInfoMap: InputBlockInfoMap = {};
  const inputBlockInfoIndex = parseInt(inputBlockInfoKey);
  const leftInputBlockInfoKey: LineKey = `${inputBlockInfoIndex - 1}`;
  const rightInputBlockInfoKey: LineKey = `${inputBlockInfoIndex + 1}`;

  let mergeInputBlockIndex = 0;
  const inputKeys = Object.keys(inputBlockInfoMap) as LineKey[];

  inputKeys.forEach((inputKey) => {
    const inputBlockInfo = inputBlockInfoMap[inputKey];

    if (inputKey == leftInputBlockInfoKey && inputBlockInfo.type === 'text') {
      const leftInputBlockInfo = inputBlockInfoMap[leftInputBlockInfoKey];
      const rightInputBlockInfo = inputBlockInfoMap[rightInputBlockInfoKey];

      if (
        leftInputBlockInfo.type === 'text' &&
        rightInputBlockInfo.type === 'text'
      ) {
        const lineStyleMap = mergeLineStyleMap({
          leftLineStyleMap: leftInputBlockInfo.lineStyleMap,
          rightLineStyleMap: rightInputBlockInfo.lineStyleMap,
          leftText: leftInputBlockInfo.text,
          rightText: rightInputBlockInfo.text,
        });

        const textStyleMap = mergeTextStyleMap({
          leftTextStyleMap: leftInputBlockInfo.textStyleMap,
          rightTextStyleMap: rightInputBlockInfo.textStyleMap,
          leftTextLength: leftInputBlockInfo.text.length,
        });

        const leftText = leftInputBlockInfo.text;
        const rightText = rightInputBlockInfo.text;
        const lineSeparator =
          leftText[leftText.length - 1] === '\n' || rightText[0] === '\n'
            ? ''
            : '\n';
        const text = `${leftText}${lineSeparator}${rightText}`;

        mergedInputBlockInfoMap[leftInputBlockInfoKey] = {
          ...inputBlockInfo,
          text,
          lineStyleMap,
          textStyleMap,
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        };
        mergeInputBlockIndex += 1;
      }

      return;
    } else if (
      inputKey == inputBlockInfoKey ||
      inputKey == rightInputBlockInfoKey
    ) {
      return;
    }
    mergedInputBlockInfoMap[`${mergeInputBlockIndex}`] = inputBlockInfo;
    mergeInputBlockIndex += 1;
  });

  return mergedInputBlockInfoMap;
};
