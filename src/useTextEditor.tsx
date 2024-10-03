import * as React from 'react';
import update from 'immutability-helper';
import {
  LineStyle,
  LineStyleMap,
  Selection,
  TextStyle,
  TextStyleMap,
  TextInfo,
  LineKey,
  InputBlockInfoMap,
} from './types';
import {
  mardownToInputBlockInfoMap,
  getKeyFromSelection,
  getClosestSelectionKey,
  getSelectionFromKey,
  handleTextStyleShiftSelection,
  getCurrentLineIndex,
  handleLineStyleShiftSelection,
  getTextStyles,
  inputBlockInfoMapToMarkdown,
  splitInputBlockInfoMap,
  mergeInputBlockInfoMap,
} from './utils';

type TextEditorInitalProps = {
  initialMarkdownText?: string;
};

const DEFAULT_TEXT_INFO: TextInfo = {
  text: '',
  lineStyleMap: {},
  textStyleMap: {},
  currentSelectionKey: '0:0',
  lastSelectionKey: '0:0',
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

export const useTextEditor = ({
  initialMarkdownText = '',
}: TextEditorInitalProps): TextEditorProps => {
  const [inputBlockInfoMap, setInputBlockInfoMap] = React.useState(() =>
    mardownToInputBlockInfoMap(initialMarkdownText),
  );

  //eslint-disable-next-line
  const [currentInputBlockKey, setCurrentInputBlockKey] =
    React.useState<LineKey>('0');

  const [includeSelectionEnd, setIncludeSelectionEnd] = React.useState(true);

  const markdown = inputBlockInfoMapToMarkdown(inputBlockInfoMap);

  const currentInputBlockInfo = inputBlockInfoMap?.[currentInputBlockKey];

  // const  = currentInputBlockInfo
  const textInfo =
    currentInputBlockInfo?.type === 'text'
      ? currentInputBlockInfo
      : DEFAULT_TEXT_INFO;

  const {
    text,
    lineStyleMap,
    textStyleMap,
    currentSelectionKey,
    lastSelectionKey,
  } = textInfo;
  //line

  const currentLineIndex = getCurrentLineIndex(currentSelectionKey, text);

  const currentLineStyle = lineStyleMap[`${currentLineIndex}`];

  //text
  const closestSelectionKey = getClosestSelectionKey(
    textStyleMap,
    currentSelectionKey,
    includeSelectionEnd,
  );

  const currentSelectionTextStyles = getTextStyles(
    textStyleMap,
    currentSelectionKey,
  );

  const closestSelectionTextStyles = getTextStyles(
    textStyleMap,
    closestSelectionKey,
  );

  let currentTextStyles: TextStyle[] = [];

  const { start: currentSelectionStart, end: currentSelectionEnd } =
    getSelectionFromKey(currentSelectionKey);

  if (currentSelectionStart != currentSelectionEnd) {
    currentTextStyles = currentSelectionTextStyles;
  } else if (closestSelectionKey) {
    currentTextStyles = closestSelectionTextStyles;
  }

  const onSelectionChange = (
    inputBlockInfoKey: LineKey,
    { start, end }: Selection,
  ) => {
    const inputBlockInfo = inputBlockInfoMap?.[inputBlockInfoKey];
    if (inputBlockInfo.type === 'text') {
      setCurrentInputBlockKey(inputBlockInfoKey);
      const inputBlockCurrentSelectionKey = inputBlockInfo.currentSelectionKey;
      setInputBlockInfoMap((currentInputBlockInfoMap) =>
        update(currentInputBlockInfoMap, {
          [inputBlockInfoKey]: {
            currentSelectionKey: { $set: getKeyFromSelection(start, end) },
            lastSelectionKey: { $set: inputBlockCurrentSelectionKey },
          },
        }),
      );
    }
  };

  const handleAffectedSelections = ({
    inputBlockInfoKey,
    lineIndex,
    lineShift,
    lineCount,
    textShift,
    currentIncludeSelectionEnd,
  }: {
    inputBlockInfoKey: LineKey;
    lineIndex: number;
    lineShift: number;
    lineCount: number;
    textShift: number;
    currentIncludeSelectionEnd: boolean;
  }) => {
    const platformLastSelectionKey = currentSelectionKey;
    if (platformLastSelectionKey) {
      //TODO: handle line shift selection
      setInputBlockInfoMap((currentInputBlockInfoMap) =>
        update(currentInputBlockInfoMap, {
          [inputBlockInfoKey]: {
            lineStyleMap: {
              $apply: function (lineStyleMap: LineStyleMap = {}) {
                return lineShift != 0
                  ? handleLineStyleShiftSelection({
                      lineStyleMap,
                      currentLineIndex: lineIndex,
                      shift: lineShift,
                      lineCount,
                    })
                  : lineStyleMap;
              },
            },
            textStyleMap: {
              $apply: function (textStyleMap: TextStyleMap = {}) {
                return handleTextStyleShiftSelection({
                  textStyleMap,
                  currentSelectionKey: platformLastSelectionKey,
                  shift: textShift,
                  includeSelectionEnd: currentIncludeSelectionEnd,
                });
              },
            },
          },
        }),
      );
    }
  };

  const onChangeText = (inputBlockInfoKey: LineKey, newText: string) => {
    setCurrentInputBlockKey(inputBlockInfoKey);

    setInputBlockInfoMap((currentInputBlockInfoMap) =>
      update(currentInputBlockInfoMap, {
        [inputBlockInfoKey]: {
          text: { $set: newText },
        },
      }),
    );

    if (newText.length === 0) {
      setInputBlockInfoMap((currentInputBlockInfoMap) =>
        update(currentInputBlockInfoMap, {
          [inputBlockInfoKey]: {
            lineStyleMap: { $set: {} },
            textStyleMap: { $set: {} },
          },
        }),
      );
      return;
    }
    const currentText = text;
    const textDiff = newText.length - currentText.length;
    // const lineCount = newText.split('\n').length;
    const cursor =
      currentSelectionStart === currentSelectionEnd
        ? currentSelectionStart
        : null;

    const lastChar =
      cursor !== null && textDiff == 1
        ? newText[cursor]
        : newText[newText.length - 1];
    const nextLine = lastChar === '\n';
    const previousLine = newText.length === 0 && textDiff < 0;
    const currentTextLines = currentText.split('\n');
    const newTextLines = newText.split('\n');

    const possibleNextSelectionKey =
      currentSelectionStart === currentSelectionEnd
        ? getKeyFromSelection(
            currentSelectionStart + textDiff,
            currentSelectionEnd + textDiff,
          )
        : '0:0';

    const platformCurrentSelectionKey = possibleNextSelectionKey;
    const newLineIndex = getCurrentLineIndex(
      platformCurrentSelectionKey,
      newText,
    );

    const lineDiff = newTextLines.length - currentTextLines.length;
    let currentIncludeSelectionEnd = includeSelectionEnd;

    if (nextLine && lastSelectionKey) {
      const closestLastSelectionKey = lastSelectionKey
        ? getClosestSelectionKey(
            textStyleMap,
            lastSelectionKey,
            includeSelectionEnd,
          )
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

  const onLineStyle = (lineStyle: LineStyle) => {
    setInputBlockInfoMap((currentInputBlockInfoMap) =>
      update(currentInputBlockInfoMap, {
        [currentInputBlockKey]: {
          lineStyleMap: {
            [currentLineIndex]: { $set: lineStyle },
          },
        },
      }),
    );
  };

  const onTextStyle = (textStyle: TextStyle) => {
    const currentSelection = getSelectionFromKey(currentSelectionKey);
    //sentence Hey you| <=> Hey you**|**
    if (
      currentSelection.start === currentSelection.end &&
      closestSelectionKey
    ) {
      if (!closestSelectionTextStyles?.includes(textStyle)) {
        setInputBlockInfoMap((currentInputBlockInfoMap) =>
          update(currentInputBlockInfoMap, {
            [currentInputBlockKey]: {
              textStyleMap: {
                [closestSelectionKey]: {
                  $apply: function (textStyles: TextStyle[] = []) {
                    return [...textStyles, textStyle];
                  },
                },
              },
            },
          }),
        );
        return;
      }

      const closestSelection = getSelectionFromKey(closestSelectionKey);

      if (closestSelectionTextStyles?.includes(textStyle)) {
        if (closestSelection.start === closestSelection.end) {
          setInputBlockInfoMap((currentInputBlockInfoMap) =>
            update(currentInputBlockInfoMap, {
              [currentInputBlockKey]: {
                textStyleMap: {
                  $apply: function (currentTextStyleMap: TextStyleMap = {}) {
                    //remove textStyle: { '0:3': [ '**', '__']} => { '0:3': ['__'] }
                    if (currentTextStyleMap[closestSelectionKey].length > 1) {
                      return {
                        ...currentTextStyleMap,
                        [closestSelectionKey]: currentTextStyleMap[
                          closestSelectionKey
                        ].filter((ts) => ts !== textStyle),
                      };
                    }
                    //or remove entire key:  { '0:3': ['__'] } => {}
                    const {
                      [closestSelectionKey]: _, //eslint-disable-line
                      ...filteredStyleMap
                    } = currentTextStyleMap;
                    return filteredStyleMap;
                  },
                },
              },
            }),
          );
        } else {
          setIncludeSelectionEnd(false);
        }

        return;
      }
    }
    //selection Hey you| <=> **Hey** you|
    if (!currentSelectionTextStyles?.includes(textStyle)) {
      setInputBlockInfoMap((currentInputBlockInfoMap) =>
        update(currentInputBlockInfoMap, {
          [currentInputBlockKey]: {
            textStyleMap: {
              $apply: function (currentTextStyleMap: TextStyleMap = {}) {
                const textStyles =
                  currentTextStyleMap[currentSelectionKey] || [];

                //'|Hey|****' => '**Hey|**'
                const mergingSelectionKey = getClosestSelectionKey(
                  currentTextStyleMap,
                  currentSelectionKey,
                  includeSelectionEnd,
                );

                if (mergingSelectionKey) {
                  const {
                    [mergingSelectionKey]: _, //eslint-disable-line
                    ...filteredStyleMap
                  } = currentTextStyleMap;
                  return {
                    ...filteredStyleMap,
                    [currentSelectionKey]: [...textStyles, textStyle],
                  };
                }

                return {
                  ...currentTextStyleMap,
                  [currentSelectionKey]: [...textStyles, textStyle],
                };
              },
            },
          },
        }),
      );
      return;
    }
    //**Hey** you| => Hey you|
    if (currentSelectionTextStyles?.includes(textStyle)) {
      setInputBlockInfoMap((currentInputBlockInfoMap) =>
        update(currentInputBlockInfoMap, {
          [currentInputBlockKey]: {
            textStyleMap: {
              $apply: function (currentTextStyleMap: TextStyleMap = {}) {
                //remove textStyle: { '0:3': [ '**', '__']} => { '0:3': ['__'] }
                if (currentTextStyleMap[currentSelectionKey].length > 1) {
                  return {
                    ...currentTextStyleMap,
                    [currentSelectionKey]: currentTextStyleMap[
                      currentSelectionKey
                    ].filter((ts) => ts !== textStyle),
                  };
                }
                //or remove entire key:  { '0:3': ['__'] } => {}
                const {
                  [currentSelectionKey]: _, //eslint-disable-line
                  ...filteredStyleMap
                } = currentTextStyleMap;
                return filteredStyleMap;
              },
            },
          },
        }),
      );
      return;
    }
  };

  const onAddPhoto = (imgUri: string) => {
    setInputBlockInfoMap((currentInputBlockInfoMap) =>
      update(currentInputBlockInfoMap, {
        $set: splitInputBlockInfoMap({
          inputBlockInfoMap: currentInputBlockInfoMap,
          inputBlockInfoKey: currentInputBlockKey,
          imgUri,
        }),
      }),
    );
  };

  const onRemovePhoto = (inputBlockInfoKey: LineKey) => {
    setInputBlockInfoMap((currentInputBlockInfoMap) =>
      update(currentInputBlockInfoMap, {
        $set: mergeInputBlockInfoMap({
          inputBlockInfoMap: currentInputBlockInfoMap,
          inputBlockInfoKey,
        }),
      }),
    );
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
