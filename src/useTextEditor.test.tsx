import { renderHook, act, RenderResult } from "@testing-library/react-hooks";
import { InputBlockInfoMap, LineKey, LineStyle, TextStyle } from "./types";
import { useTextEditor, TextEditorProps } from "./useTextEditor";

/*
default onChangeText is called before onSelectionChange

'|' => 'H|'
onChangeText('H')
onSelectionChange(1,1)

'|' => 'He|'
onChangeText('He')
onSelectionChange(2,2)


'|' => 'Hey|'
onChangeText('Hey')
onSelectionChange(3,3)

-- change selection

'|' => 'He|y'
onSelectionChange(2,2)

'|' => 'H|ey'
onSelectionChange(1,1)

'|' => '|Hey'
onSelectionChange(0,0)

*/

interface OnTypeInput {
  result: RenderResult<TextEditorProps>;
  text: string;
  cursor: number;
  inputBlockKey?: LineKey;
}
const onType = ({ result, text, cursor, inputBlockKey = "0" }: OnTypeInput) => {
  act(() => {
    result.current.onChangeText(inputBlockKey, text);
  });
  act(() => {
    result.current.onSelectionChange(inputBlockKey, {
      start: cursor,
      end: cursor,
    });
  });
};

const lineStyles: LineStyle[] = ["#", "##", "###"];

const textStyles: TextStyle[] = ["**", "__", "--", "~~"];

describe(`useTextEditor`, () => {
  /*         //*/
  //init
  test("init", () => {
    const { result } = renderHook(() => useTextEditor({}));

    expect(result.current.markdown).toBe("");
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
    });
  });

  lineStyles.map((lineStyle) => {
    describe(`lineStyle: ${lineStyle}`, () => {
      //multiline
      //'|' => 'Hey title|' => '#Hey title|' => '#Hey title\n|' => '#Hey title\n##|'  => '#Hey title\n##Hey heading|'
      test(`should add title ${lineStyle}:\n 'Hey title|' => '${lineStyle}Hey title|' => '${lineStyle}Hey title\\n|' => '${lineStyle}Hey title\\n|##'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => 'Hey title|'
        const text1 = "Hey title";
        onType({
          result,
          text: text1,
          cursor: 9,
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "9:9",
            lastSelectionKey: "0:0",
          },
        });

        //'Hey title|' => '#Hey title|'
        act(() => {
          result.current.onLineStyle(lineStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": lineStyle,
            },
            textStyleMap: {},
            currentSelectionKey: "9:9",
            lastSelectionKey: "0:0",
          },
        });
        expect(result.current.currentLineStyle).toStrictEqual<LineStyle>(
          lineStyle
        );

        //'#Hey title|' => '#Hey title\n|'
        const text2 = text1 + "\n";
        onType({
          result,
          text: text2,
          cursor: 10,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": lineStyle,
              "1": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "10:10",
            lastSelectionKey: "9:9",
          },
        });

        //'#Hey title\n|' => '#Hey title\n##|'
        act(() => {
          result.current.onLineStyle("##");
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": lineStyle,
              "1": "##",
            },
            textStyleMap: {},
            currentSelectionKey: "10:10",
            lastSelectionKey: "9:9",
          },
        });
        expect(result.current.currentLineStyle).toStrictEqual<LineStyle>("##");

        //'#Hey title\n##|' => '#Hey title\n##Hey heading|'
        const text3 = text2 + "Hey heading";
        onType({
          result,
          text: text3,
          cursor: 21,
        });
        // TODO handle selection / change text blink
        // expect(result.current.currentLineStyle).toStrictEqual<LineStyle>('##');

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text3,
            lineStyleMap: {
              "0": lineStyle,
              "1": "##",
            },
            textStyleMap: {},
            currentSelectionKey: "21:21",
            lastSelectionKey: "10:10",
          },
        });
      });

      //'|' => 'Hey title|' => '#Hey title|' => '#Hey title\n|' => '#Hey title\n|##'  => '#Hey title\n|' => '|Hey title\n'
      test(`should remove title ${lineStyle}:\n '${lineStyle}Hey title\\n|##'  => '${lineStyle}Hey title\\n|' => '|Hey title\\n'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        const text1 = "Hey title";
        //'|' => 'Hey title|'
        onType({
          result,
          text: text1,
          cursor: 9,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",

            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "9:9",
            lastSelectionKey: "0:0",
          },
        });

        //'Hey title|' => '#Hey title|'
        act(() => {
          result.current.onLineStyle(lineStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": lineStyle,
            },
            textStyleMap: {},
            currentSelectionKey: "9:9",
            lastSelectionKey: "0:0",
          },
        });
        expect(result.current.currentLineStyle).toStrictEqual<LineStyle>(
          lineStyle
        );

        const text2 = text1 + "\n";
        //'#Hey title|' => '#Hey title\n|'
        onType({
          result,
          text: text2,
          cursor: 10,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": lineStyle,
              "1": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "10:10",
            lastSelectionKey: "9:9",
          },
        });

        //'#Hey title\n|' => '#Hey title\n|##'
        act(() => {
          result.current.onLineStyle("##");
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": lineStyle,
              "1": "##",
            },
            textStyleMap: {},
            currentSelectionKey: "10:10",
            lastSelectionKey: "9:9",
          },
        });
        expect(result.current.currentLineStyle).toStrictEqual<LineStyle>("##");

        //'#Hey title\n|##' => '#Hey title\n|'
        act(() => {
          result.current.onLineStyle("body");
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": lineStyle,
              "1": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "10:10",
            lastSelectionKey: "9:9",
          },
        });
        expect(result.current.currentLineStyle).toStrictEqual<LineStyle>(
          "body"
        );

        //'#Hey title\n|' => '#|Hey title\n'
        act(() => {
          result.current.onSelectionChange("0", {
            start: 0,
            end: 0,
          });
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": lineStyle,
              "1": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "0:0",
            lastSelectionKey: "10:10",
          },
        });
        expect(result.current.currentLineStyle).toStrictEqual<LineStyle>(
          lineStyle
        );

        //'#|Hey title\n' => '|Hey title\n'
        act(() => {
          result.current.onLineStyle("body");
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": "body",
              "1": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "0:0",
            lastSelectionKey: "10:10",
          },
        });
        expect(result.current.currentLineStyle).toStrictEqual<LineStyle>(
          "body"
        );
      });

      //'|' => 'Hey title|' => '#Hey title|' => '#Hey title\n|' => '#Hey title\n|##' => '#Hey title|\n##' => '#Hey title\n|\n##' => '#Hey title\nHey body|\n##'
      test(`should add title ${lineStyle} and handle shift selection:\n '${lineStyle}Hey title\\n|##' => '${lineStyle}Hey title|\\n##' => '${lineStyle}Hey title\\n|\\n##' => '${lineStyle}Hey title\\nHey body|\\n##'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => 'Hey title|'
        const text1 = "Hey title";
        onType({
          result,
          text: text1,
          cursor: 9,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "9:9",
            lastSelectionKey: "0:0",
          },
        });

        //'Hey title|' => '#Hey title|'
        act(() => {
          result.current.onLineStyle(lineStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": lineStyle,
            },
            textStyleMap: {},
            currentSelectionKey: "9:9",
            lastSelectionKey: "0:0",
          },
        });
        expect(result.current.currentLineStyle).toStrictEqual<LineStyle>(
          lineStyle
        );

        //'#Hey title|' => '#Hey title\n|'
        const text2 = text1 + "\n";
        onType({
          result,
          text: text2,
          cursor: 10,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": lineStyle,
              "1": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "10:10",
            lastSelectionKey: "9:9",
          },
        });

        //'#Hey title\n|' => '#Hey title\n|##'
        act(() => {
          result.current.onLineStyle("##");
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": lineStyle,
              "1": "##",
            },
            textStyleMap: {},
            currentSelectionKey: "10:10",
            lastSelectionKey: "9:9",
          },
        });
        expect(result.current.currentLineStyle).toStrictEqual<LineStyle>("##");

        //'#Hey title\n|##' => '#Hey title|\n##'
        act(() => {
          result.current.onSelectionChange("0", {
            start: 9,
            end: 9,
          });
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": lineStyle,
              "1": "##",
            },
            textStyleMap: {},
            currentSelectionKey: "9:9",
            lastSelectionKey: "10:10",
          },
        });
        expect(result.current.currentLineStyle).toStrictEqual<LineStyle>(
          lineStyle
        );

        //'#Hey title|\n##' =>  '#Hey title\n|\n##'
        const text3 = "Hey title\n\n";
        onType({
          result,
          text: text3,
          cursor: 10,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text3,
            lineStyleMap: {
              "0": lineStyle,
              "1": "body",
              "2": "##",
            },
            textStyleMap: {},
            currentSelectionKey: "10:10",
            lastSelectionKey: "9:9",
          },
        });
      });
    });
  });

  textStyles.map((textStyle) => {
    describe(`textStyle: ${textStyle}`, () => {
      // **Hey** you
      //'|' => 'Hey you|' => '|Hey| you' => '**|Hey|** you' => '**Hey|** you' => '**Hey |** you'
      test(`should add ${textStyle} tag to selected word and keep style of closest selection:\n [0,3] '|Hey| you' => '${textStyle}Hey|${textStyle} you' => '${textStyle}Hey |${textStyle} you'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => 'Hey you|'
        const text1 = "Hey you";
        onType({
          result,
          text: text1,
          cursor: 7,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "7:7",
            lastSelectionKey: "0:0",
          },
        });

        //'Hey you|' => '|Hey| you'
        act(() => {
          result.current.onSelectionChange("0", {
            start: 0,
            end: 3,
          });
        });

        // '|Hey| you' => '**|Hey|** you'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "0:3": [textStyle],
            },
            currentSelectionKey: "0:3",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'**|Hey|** you' => '**Hey|** you'
        act(() => {
          result.current.onSelectionChange("0", {
            start: 3,
            end: 3,
          });
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "0:3": [textStyle],
            },
            currentSelectionKey: "3:3",
            lastSelectionKey: "0:3",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'**Hey|** you' => '**Hey |** you'
        const text2 = "Hey  you";
        onType({
          result,
          text: text2,
          cursor: 4,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "0:4": [textStyle],
            },
            currentSelectionKey: "4:4",
            lastSelectionKey: "3:3",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);
      });

      //'|' => 'Hey you|' => '|Hey| you' => '**|Hey|** you' => '|Hey| you'
      test(`should remove ${textStyle} tag from selected word:\n [0,3] ${textStyle}|Hey|${textStyle} you| => |Hey| you`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => 'Hey you|'
        const text1 = "Hey you";
        onType({
          result,
          text: text1,
          cursor: 7,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "7:7",
            lastSelectionKey: "0:0",
          },
        });

        //'Hey you|' => '|Hey| you'
        act(() => {
          result.current.onSelectionChange("0", {
            start: 0,
            end: 3,
          });
        });

        // '|Hey| you' => '**|Hey|** you'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "0:3": [textStyle],
            },
            currentSelectionKey: "0:3",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'**|Hey|** you' => '|Hey| you'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "0:3",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([]);
      });

      // Hey **you**
      //'|' => 'Hey you|' => 'Hey |you|' => 'Hey **|you|**' => 'Hey **you|**' =>  'Hey **you keep editing|**'
      test(`should add ${textStyle} tag to selected last word and keep style of closest selection:\n [4,7] 'Hey |you|' => 'Hey ${textStyle}you|${textStyle}' =>  'Hey ${textStyle}you keep editing|${textStyle}'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => 'Hey you|'
        const text1 = "Hey you";
        onType({
          result,
          text: text1,
          cursor: 7,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "7:7",
            lastSelectionKey: "0:0",
          },
        });

        //'Hey you|' =>  'Hey |you|'
        act(() => {
          result.current.onSelectionChange("0", {
            start: 4,
            end: 7,
          });
        });

        //'Hey |you|' =>  'Hey **|you|**'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "4:7": [textStyle],
            },
            currentSelectionKey: "4:7",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'Hey **|you|**' => 'Hey **you|**'
        act(() => {
          result.current.onSelectionChange("0", {
            start: 7,
            end: 7,
          });
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "4:7": [textStyle],
            },
            currentSelectionKey: "7:7",
            lastSelectionKey: "4:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'Hey **you|**' =>  'Hey **you keep editing|**'
        const text2 = text1 + " keep editing";
        onType({
          result,
          text: text2,
          cursor: 20,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "4:20": [textStyle],
            },
            currentSelectionKey: "20:20",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);
      });

      //'|' => 'Hey you|' => 'Hey |you|' => 'Hey **|you|**' => 'Hey |you|'
      test(`should remove ${textStyle} tag from selected last word:\n [4,7] 'Hey |you|' => 'Hey ${textStyle}|you|${textStyle}' =>  'Hey |you|'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => 'Hey you|'
        const text1 = "Hey you";
        onType({
          result,
          text: text1,
          cursor: 7,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "7:7",
            lastSelectionKey: "0:0",
          },
        });

        //'Hey you|' =>  'Hey |you|'
        act(() => {
          result.current.onSelectionChange("0", {
            start: 4,
            end: 7,
          });
        });

        //'Hey |you|' =>  'Hey **|you|**'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "4:7": [textStyle],
            },
            currentSelectionKey: "4:7",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        // 'Hey **|you|**' => 'Hey |you|'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "4:7",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([]);
      });

      // **|**
      //'|' => '**|**' => '**Hey you|**' => '**Hey you keep editing|**'
      test(`should add ${textStyle} tag on start new sentence and keep style of closest selection:\n [0,0] '|' => '${textStyle}|${textStyle}' => '${textStyle}Hey you|${textStyle}'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => '**|**'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: "",
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "0:0": [textStyle],
            },
            currentSelectionKey: "0:0",
            lastSelectionKey: "0:0",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'**|**' => '**Hey you|**'
        const text1 = "Hey you";
        onType({
          result,
          text: text1,
          cursor: 7,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "0:7": [textStyle],
            },
            currentSelectionKey: "7:7",
            lastSelectionKey: "0:0",
          },
        });

        //'**Hey you|**' => '**Hey you keep editing|** '
        const text2 = text1 + " keep editing";
        onType({
          result,
          text: text2,
          cursor: 20,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "0:20": [textStyle],
            },
            currentSelectionKey: "20:20",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);
        //assert blink
        /// closestSelectionKey: undefined
      });

      // **|**
      //'|' => '**|**' => '|'
      test(`should toggle ${textStyle} tag:\n [0,0] '|' => '${textStyle}|${textStyle}' => '|'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => '**|**'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: "",
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "0:0": [textStyle],
            },
            currentSelectionKey: "0:0",
            lastSelectionKey: "0:0",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'**|**' => '|'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: "",
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "0:0",
            lastSelectionKey: "0:0",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([]);

        //'|' => '**|**'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: "",
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "0:0": [textStyle],
            },
            currentSelectionKey: "0:0",
            lastSelectionKey: "0:0",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);
      });

      //'|' => 'Hey you|' => 'Hey you**|**' => 'Hey you** keep editing|**'
      test(`should add ${textStyle} tag to current sentence and keep style of closest selection:\n [7,7] '|' => 'Hey you${textStyle}|${textStyle}' => 'Hey you${textStyle} keep editing|${textStyle}'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => 'Hey you|'
        const text1 = "Hey you";
        onType({
          result,
          text: text1,
          cursor: 7,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "7:7",
            lastSelectionKey: "0:0",
          },
        });

        //'Hey you|' => 'Hey you**|**'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "7:7": [textStyle],
            },
            currentSelectionKey: "7:7",
            lastSelectionKey: "0:0",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'Hey you**|**' => 'Hey you** keep editing|**'
        const text2 = text1 + " keep editing";
        onType({
          result,
          text: text2,
          cursor: 20,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "7:20": [textStyle],
            },
            currentSelectionKey: "20:20",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);
      });

      //'|' => 'Hey you|' => 'Hey you**|**' => 'Hey you** keep editing|**' => 'Hey you** keep editing** and more|'
      test(`should remove ${textStyle} tag from current sentence and keep style of closest selection:\n [7,7] 'Hey you${textStyle}|${textStyle}' => 'Hey you${textStyle} keep editing|${textStyle}' => 'Hey you${textStyle} keep editing${textStyle} and more|'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => 'Hey you|'
        const text1 = "Hey you";
        onType({
          result,
          text: text1,
          cursor: 7,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "7:7",
            lastSelectionKey: "0:0",
          },
        });

        //'Hey you|' => 'Hey you**|**'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "7:7": [textStyle],
            },
            currentSelectionKey: "7:7",
            lastSelectionKey: "0:0",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'Hey you**|**' => 'Hey you** keep editing|**'
        const text2 = text1 + " keep editing";
        onType({
          result,
          text: text2,
          cursor: 20,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "7:20": [textStyle],
            },
            currentSelectionKey: "20:20",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'Hey you** keep editing|**' => 'Hey you** keep editing**|'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "7:20": [textStyle],
            },
            currentSelectionKey: "20:20",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([]);

        //'Hey you** keep editing|**' => 'Hey you** keep editing** and more|'
        const text3 = text2 + " and more";
        onType({
          result,
          text: text3,
          cursor: 29,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text3,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "7:20": [textStyle],
            },
            currentSelectionKey: "29:29",
            lastSelectionKey: "20:20",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([]);
      });

      //'|' => '**|**' => '**Hey you|**' => '**Hey you**\n|'
      test(`should disable text style on new line:\n [7,7] '${textStyle}Hey you|${textStyle}' => '${textStyle}Hey you${textStyle}\n|'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => '**|**'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: "",
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "0:0": [textStyle],
            },
            currentSelectionKey: "0:0",
            lastSelectionKey: "0:0",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'**|**' => '**Hey you|**'
        const text1 = "Hey you";
        onType({
          result,
          text: text1,
          cursor: 7,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "0:7": [textStyle],
            },
            currentSelectionKey: "7:7",
            lastSelectionKey: "0:0",
          },
        });

        //'**Hey you|**' => '**Hey you**\n'
        const text2 = text1 + "\n";
        onType({
          result,
          text: text2,
          cursor: 8,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": "body",
              "1": "body",
            },
            textStyleMap: {
              "0:7": [textStyle],
            },
            currentSelectionKey: "8:8",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([]);
      });

      //Backspace
      //'|' => 'Hey you|' => 'Hey |you|' => 'Hey **|you|**' => 'Hey **you|**' => 'Hey **|**' => 'Hey|'
      test(`should clear styling on backspace:\n [4,4] 'Hey ${textStyle}|${textStyle}' => 'Hey|'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => 'Hey you|'
        const text1 = "Hey you";
        onType({
          result,
          text: text1,
          cursor: 7,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "7:7",
            lastSelectionKey: "0:0",
          },
        });

        //'Hey you|' =>  'Hey |you|'
        act(() => {
          result.current.onSelectionChange("0", {
            start: 4,
            end: 7,
          });
        });

        //'Hey |you|' =>  'Hey **|you|**'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "4:7": [textStyle],
            },
            currentSelectionKey: "4:7",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'Hey **|you|**' => 'Hey **you|**'
        act(() => {
          result.current.onSelectionChange("0", {
            start: 7,
            end: 7,
          });
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "4:7": [textStyle],
            },
            currentSelectionKey: "7:7",
            lastSelectionKey: "4:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'Hey **you|**' =>  'Hey **|**'
        const text2 = "Hey ";
        onType({
          result,
          text: text2,
          cursor: 4,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {
              "4:4": [textStyle],
            },
            currentSelectionKey: "4:4",
            lastSelectionKey: "7:7",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'Hey **|**' =>  'Hey|'
        const text3 = "Hey";
        onType({
          result,
          text: text3,
          cursor: 3,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text3,
            lineStyleMap: {
              "0": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "3:3",
            lastSelectionKey: "4:4",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([]);
      });

      //multiline
      // **|**
      //'|' => '\n|' => '\n**|**' => '\n**Hey you|**' =>
      test(`should add ${textStyle} tag on start new sentence and keep style of closest selection:\n [0,0] '\n|' => '${textStyle}|${textStyle}' => '${textStyle}Hey you|${textStyle}'`, () => {
        const { result } = renderHook(() => useTextEditor({}));

        //'|' => '\n|'
        const text1 = "\n";
        onType({
          result,
          text: text1,
          cursor: 1,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
              "1": "body",
            },
            textStyleMap: {},
            currentSelectionKey: "1:1",
            lastSelectionKey: "0:0",
          },
        });

        //'\n|' => '\n**|**'
        act(() => {
          result.current.onTextStyle(textStyle);
        });
        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text1,
            lineStyleMap: {
              "0": "body",
              "1": "body",
            },
            textStyleMap: {
              "1:1": [textStyle],
            },
            currentSelectionKey: "1:1",
            lastSelectionKey: "0:0",
          },
        });
        expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>([
          textStyle,
        ]);

        //'\n**|**' => '**Hey you|**'
        const text2 = "\nHey you";
        onType({
          result,
          text: text2,
          cursor: 8,
        });

        expect(
          result.current.inputBlockInfoMap
        ).toStrictEqual<InputBlockInfoMap>({
          "0": {
            type: "text",
            text: text2,
            lineStyleMap: {
              "0": "body",
              "1": "body",
            },
            textStyleMap: {
              "1:8": [textStyle],
            },
            currentSelectionKey: "8:8",
            lastSelectionKey: "1:1",
          },
        });
      });
    });
  });

  //muilt text style
  //'|' =>
  //'Hey bold and italic|' =>
  //'Hey |bold| and italic' =>
  //'Hey **|bold|** and italic' =>
  //'Hey **bold** and |italic|' =>
  //'Hey **bold** and __|italic|__' =>
  //'Hey **b|old** and __italic__' =>
  //'Hey **bb|old** and __italic__'
  test("should shift selection index of all content after current cursor on add text:\n [4,4] 'Hey **b|old** and __italic__' => 'Hey **bb|old** and __italic__'", () => {
    const { result } = renderHook(() => useTextEditor({}));

    //'|' => 'Hey bold and italic|'
    const text1 = "Hey bold and italic";
    onType({
      result,
      text: text1,
      cursor: 19,
    });

    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "19:19",
        lastSelectionKey: "0:0",
      },
    });

    //'Hey bold and italic|' => 'Hey |bold| and italic'
    act(() => {
      result.current.onSelectionChange("0", {
        start: 4,
        end: 8,
      });
    });

    //'Hey |bold| and italic' => 'Hey **|bold|** and italic'
    act(() => {
      result.current.onTextStyle("**");
    });
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {
          "4:8": ["**"],
        },
        currentSelectionKey: "4:8",
        lastSelectionKey: "19:19",
      },
    });
    expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>(["**"]);

    //'Hey **|bold|** and italic' => 'Hey **bold** and |italic|'
    act(() => {
      result.current.onSelectionChange("0", {
        start: 13,
        end: 19,
      });
    });

    //'Hey **bold** and |italic|' => 'Hey **bold** and __|italic|__'
    act(() => {
      result.current.onTextStyle("__");
    });
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {
          "4:8": ["**"],
          "13:19": ["__"],
        },
        currentSelectionKey: "13:19",
        lastSelectionKey: "4:8",
      },
    });
    expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>(["__"]);

    //'Hey **bold** and __|italic|__' => 'Hey **b|old** and __italic__'
    act(() => {
      result.current.onSelectionChange("0", {
        start: 5,
        end: 5,
      });
    });
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {
          "4:8": ["**"],
          "13:19": ["__"],
        },
        currentSelectionKey: "5:5",
        lastSelectionKey: "13:19",
      },
    });
    expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>(["**"]);

    //'Hey **b|old** and __italic__' => 'Hey **bb|old** and __italic__'
    const text2 = "Hey bbold and italic";
    onType({
      result,
      text: text2,
      cursor: 6,
    });

    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text2,
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {
          "4:9": ["**"],
          "14:20": ["__"],
        },
        currentSelectionKey: "6:6",
        lastSelectionKey: "5:5",
      },
    });
    expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>(["**"]);
  });

  //'|' =>
  //'Hey bold and italic|' =>
  //'Hey |bold| and italic' =>
  //'Hey **|bold|** and italic' =>
  //'Hey **bold** and |italic|' =>
  //'Hey **bold** and __|italic|__' =>
  //'Hey **b|old** and __italic__' =>
  //'Hey **|old** and __italic__'
  test("should shift selection index of all content after current cursor on remove text:\n [4,4] 'Hey **b|old** and __italic__' => 'Hey **|old** and __italic__'", () => {
    const { result } = renderHook(() => useTextEditor({}));

    //'|' => 'Hey bold and italic|'
    const text1 = "Hey bold and italic";
    onType({
      result,
      text: text1,
      cursor: 19,
    });

    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "19:19",
        lastSelectionKey: "0:0",
      },
    });

    //'Hey bold and italic|' => 'Hey |bold| and italic'
    act(() => {
      result.current.onSelectionChange("0", {
        start: 4,
        end: 8,
      });
    });

    //'Hey |bold| and italic' => 'Hey **|bold|** and italic'
    act(() => {
      result.current.onTextStyle("**");
    });
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {
          "4:8": ["**"],
        },
        currentSelectionKey: "4:8",
        lastSelectionKey: "19:19",
      },
    });
    expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>(["**"]);

    //'Hey **|bold|** and italic' => 'Hey **bold** and |italic|'
    act(() => {
      result.current.onSelectionChange("0", {
        start: 13,
        end: 19,
      });
    });

    //'Hey **bold** and |italic|' => 'Hey **bold** and __|italic|__'
    act(() => {
      result.current.onTextStyle("__");
    });
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {
          "4:8": ["**"],
          "13:19": ["__"],
        },
        currentSelectionKey: "13:19",
        lastSelectionKey: "4:8",
      },
    });
    expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>(["__"]);

    //'Hey **bold** and __|italic|__' => 'Hey **b|old** and __italic__'
    act(() => {
      result.current.onSelectionChange("0", {
        start: 5,
        end: 5,
      });
    });
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {
          "4:8": ["**"],
          "13:19": ["__"],
        },
        currentSelectionKey: "5:5",
        lastSelectionKey: "13:19",
      },
    });
    expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>(["**"]);

    //'Hey **b|old** and __italic__' => 'Hey **|old** and __italic__'
    const text2 = "Hey old and italic";
    onType({
      result,
      text: text2,
      cursor: 4,
    });

    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text2,
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {
          "4:7": ["**"],
          "12:18": ["__"],
        },
        currentSelectionKey: "4:4",
        lastSelectionKey: "5:5",
      },
    });
    expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>(["**"]);
  });

  //muilt line text style
  //'|' =>
  //'Line 1\nHey bold and italic|' =>
  //'Line 1\nHey |bold| and italic' =>
  //'Line 1\nHey **|bold|** and italic' =>
  //'Line 1\nHey **bold** and |italic|' =>
  //'Line 1\nHey **bold** and __|italic|__' =>
  //'Line 1|\nHey **bold** and __italic__' =>
  //'Line 1\n\nHey **bold** and __italic__'
  test("should shift selection index of all content after current cursor on new line:\n [6,6] 'Line 1|\nHey **bold** and __italic__' => 'Line 1\n\nHey **bold** and __italic__'", () => {
    const { result } = renderHook(() => useTextEditor({}));

    //'|' => 'Line 1\nHey bold and italic|'
    const text1 = "Line 1\nHey bold and italic";
    onType({
      result,
      text: text1,
      cursor: 26,
    });

    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "26:26",
        lastSelectionKey: "0:0",
      },
    });

    //'Line 1\nHey bold and italic|' => 'Line 1\nHey |bold| and italic'
    act(() => {
      result.current.onSelectionChange("0", {
        start: 11,
        end: 15,
      });
    });

    //'Line 1\nHey |bold| and italic' => 'Line 1\nHey **|bold|** and italic'
    act(() => {
      result.current.onTextStyle("**");
    });
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {
          "11:15": ["**"],
        },
        currentSelectionKey: "11:15",
        lastSelectionKey: "26:26",
      },
    });
    expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>(["**"]);

    //'Line 1\nHey **|bold|** and italic' => 'Line 1\nHey **bold** and |italic|'
    act(() => {
      result.current.onSelectionChange("0", {
        start: 20,
        end: 26,
      });
    });

    //'Line 1\nHey **bold** and |italic|' => 'Line 1\nHey **bold** and __|italic|__'
    act(() => {
      result.current.onTextStyle("__");
    });
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {
          "11:15": ["**"],
          "20:26": ["__"],
        },
        currentSelectionKey: "20:26",
        lastSelectionKey: "11:15",
      },
    });
    expect(result.current.currentTextStyles).toStrictEqual<TextStyle[]>(["__"]);

    //'Line 1\nHey **bold** and __|italic|__' => 'Line 1|\nHey **bold** and __italic__'
    act(() => {
      result.current.onSelectionChange("0", {
        start: 6,
        end: 6,
      });
    });
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {
          "11:15": ["**"],
          "20:26": ["__"],
        },
        currentSelectionKey: "6:6",
        lastSelectionKey: "20:26",
      },
    });

    //'Line 1|\nHey **bold** and __italic__' => 'Line 1\n|\nHey **bold** and __italic__'
    const text2 = "Line 1\n\nHey bold and italic";
    onType({
      result,
      text: text2,
      cursor: 7,
    });

    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text2,
        lineStyleMap: {
          "0": "body",
          "1": "body",
          "2": "body",
        },
        textStyleMap: {
          "12:16": ["**"],
          "21:27": ["__"],
        },
        currentSelectionKey: "7:7",
        lastSelectionKey: "6:6",
      },
    });

    //'Line 1\n|\nHey **bold** and __italic__' => 'Line 1|\nHey **bold** and __italic__'
    onType({
      result,

      text: text1,
      cursor: 6,
    });

    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: text1,
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {
          "11:15": ["**"],
          "20:26": ["__"],
        },
        currentSelectionKey: "6:6",
        lastSelectionKey: "7:7",
      },
    });
  });

  test("should split inputBlockInfo on add photo", () => {
    const { result } = renderHook(() =>
      useTextEditor({
        initialMarkdownText: "Hey title\nHey body",
      })
    );

    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title\nHey body",
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
    });

    //'Hey title\nHey body|' => 'Hey title|\nHey body'
    act(() => {
      result.current.onSelectionChange("0", {
        start: 9,
        end: 9,
      });
    });
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title\nHey body",
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "9:9",
        lastSelectionKey: "0:0",
      },
    });

    //onAddPhoto
    const imgUri = "img_uri";
    act(() => {
      result.current.onAddPhoto(imgUri);
    });
    expect(result.current.markdown).toBe(
      "Hey title<img>img_uri</img>\nHey body"
    );
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
      "1": {
        type: "image",
        imgUrl: imgUri,
      },
      "2": {
        type: "text",
        text: "\nHey body",
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
    });
  });

  test("should split with multiple inputBlockInfo on add photo", () => {
    const { result } = renderHook(() =>
      useTextEditor({
        initialMarkdownText: "Hey title<img>img_uri</img>\nHey body",
      })
    );
    const imgUri = "img_uri";
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
      "1": {
        type: "image",
        imgUrl: imgUri,
      },
      "2": {
        type: "text",
        text: "\nHey body",
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
    });

    //'Hey title\nHey body|' => 'Hey title|\nHey body'
    act(() => {
      result.current.onSelectionChange("0", {
        start: 9,
        end: 9,
      });
    });
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "9:9",
        lastSelectionKey: "0:0",
      },
      "1": {
        type: "image",
        imgUrl: imgUri,
      },
      "2": {
        type: "text",
        text: "\nHey body",
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
    });

    act(() => {
      result.current.onSelectionChange("2", {
        start: 1,
        end: 1,
      });
    });
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "9:9",
        lastSelectionKey: "0:0",
      },
      "1": {
        type: "image",
        imgUrl: imgUri,
      },
      "2": {
        type: "text",
        text: "\nHey body",
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "1:1",
        lastSelectionKey: "0:0",
      },
    });

    //onAddPhoto
    const imgUri2 = "img_uri_2";
    act(() => {
      result.current.onAddPhoto(imgUri2);
    });
    expect(result.current.markdown).toBe(
      "Hey title<img>img_uri</img>\n<img>img_uri_2</img>Hey body"
    );
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "9:9",
        lastSelectionKey: "0:0",
      },
      "1": {
        type: "image",
        imgUrl: imgUri,
      },
      "2": {
        type: "text",
        text: "\n",
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
      "3": {
        type: "image",
        imgUrl: imgUri2,
      },
      "4": {
        type: "text",
        text: "Hey body",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
    });
  });

  test("should merge inputBlockInfo on remove photo", () => {
    const { result } = renderHook(() =>
      useTextEditor({
        initialMarkdownText: "Hey title<img>img_uri</img>\nHey body",
      })
    );

    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
      "1": {
        type: "image",
        imgUrl: "img_uri",
      },
      "2": {
        type: "text",
        text: "\nHey body",
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
    });

    //onRemovePhoto
    act(() => {
      result.current.onRemovePhoto("1");
    });
    expect(result.current.markdown).toBe("Hey title\nHey body");
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title\nHey body",
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
    });
  });

  test("should merge inputBlockInfo on remove photo and handle lines", () => {
    const { result } = renderHook(() =>
      useTextEditor({
        initialMarkdownText: "Hey title<img>img_uri</img>Hey body",
      })
    );

    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
      "1": {
        type: "image",
        imgUrl: "img_uri",
      },
      "2": {
        type: "text",
        text: "Hey body",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
    });

    //onRemovePhoto
    act(() => {
      result.current.onRemovePhoto("1");
    });
    expect(result.current.markdown).toBe("Hey title\nHey body");
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title\nHey body",
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
    });
  });

  test("should merge with multiple inputBlockInfo on remove photo", () => {
    const { result } = renderHook(() =>
      useTextEditor({
        initialMarkdownText:
          "Hey title<img>img_uri</img>\n<img>img_uri_2</img>Hey body",
      })
    );
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
      "1": {
        type: "image",
        imgUrl: "img_uri",
      },
      "2": {
        type: "text",
        text: "\n",
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
      "3": {
        type: "image",
        imgUrl: "img_uri_2",
      },
      "4": {
        type: "text",
        text: "Hey body",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
    });

    //onRemovePhoto
    act(() => {
      result.current.onRemovePhoto("3");
    });
    expect(result.current.markdown).toBe(
      "Hey title<img>img_uri</img>\nHey body"
    );
    expect(result.current.inputBlockInfoMap).toStrictEqual<InputBlockInfoMap>({
      "0": {
        type: "text",
        text: "Hey title",
        lineStyleMap: {
          "0": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
      "1": {
        type: "image",
        imgUrl: "img_uri",
      },
      "2": {
        type: "text",
        text: "\nHey body",
        lineStyleMap: {
          "0": "body",
          "1": "body",
        },
        textStyleMap: {},
        currentSelectionKey: "0:0",
        lastSelectionKey: "0:0",
      },
    });
  });
});
