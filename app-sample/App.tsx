import {
  Platform,
  StyleSheet,
  TextInput,
  Text,
  NativeSyntheticEvent,
  TextInputSelectionChangeEventData,
  Image,
  SafeAreaView,
  View,
  TouchableOpacity,
  ScrollView,
  InputAccessoryView,
} from "react-native";
import {
  LineKey,
  LineStyle,
  LineStyleMap,
  TextStyle,
  TextStyleMap,
  getStyledLineMap,
  useTextEditor,
} from "react-markdown-editor";

type MarkdownTextProps = {
  children: string;
  textStyleMap?: TextStyleMap;
  lineStyleMap?: LineStyleMap;
};

const lineFontSizeMap: { [key in LineStyle]: number } = {
  "#": 18,
  "##": 16,
  "###": 14,
  body: 14,
};

function MarkdownText({
  children,
  textStyleMap = {},
  lineStyleMap = {},
}: MarkdownTextProps): JSX.Element {
  const styleLineMap = getStyledLineMap(children, textStyleMap, lineStyleMap);

  const lineKeys = Object.keys(styleLineMap) as LineKey[];

  return (
    <>
      {lineKeys.map((lineKey, lineIndex) => {
        const { lineStyle, styledTexts } = styleLineMap[lineKey];
        const lineFontWeight = lineStyle === "body" ? "400" : "600";
        return (
          <Text
            key={lineKey}
            style={{
              fontSize: lineFontSizeMap[lineStyle],
              fontWeight: lineFontWeight,
            }}
          >
            {styledTexts.map(
              ({ text, bold, italic, underline, strikethrough }, textIndex) => (
                <Text
                  key={`t${textIndex}`}
                  style={{
                    fontWeight: bold ? "600" : lineFontWeight,
                    fontStyle: italic ? "italic" : "normal",
                    textDecorationLine: underline
                      ? "underline"
                      : strikethrough
                      ? "line-through"
                      : "none",
                  }}
                >
                  {text}
                </Text>
              )
            )}
            {lineIndex < lineKeys.length - 1 ? "\n" : ""}
          </Text>
        );
      })}
    </>
  );
}

const LINE_TEXT_STYLES: LineStyle[] = ["#", "##", "###", "body"];

const LINE_TEXT_NAME_MAP: { [key in LineStyle]: string } = {
  "#": "Title",
  "##": "Heading",
  "###": "Subheading",
  body: "Body",
};

const TEXT_STYLES: TextStyle[] = ["**", "__", "--", "~~"];

const TEXT_STYLE_NAME_MAP: { [key in TextStyle]: string } = {
  "**": "b",
  __: "i",
  "--": "u",
  "~~": "s",
};

type StyleBarProps = {
  currentLineStyle?: LineStyle;
  currentTextStyles?: TextStyle[];
  onLineStyle: (lineStyle: LineStyle) => void;
  onTextStyle: (textStyle: TextStyle) => void;
};

function StyleBar({
  currentLineStyle = "body",
  currentTextStyles = [],
  onLineStyle,
  onTextStyle,
}: StyleBarProps): JSX.Element {
  return (
    <View>
      <View style={{ flexDirection: "row" }}>
        {LINE_TEXT_STYLES.map((lineStyle) => {
          const selected = lineStyle === currentLineStyle;
          return (
            <TouchableOpacity
              key={lineStyle}
              style={{
                flex: 1,
                alignItems: "center",
                backgroundColor: selected ? "#CCC" : "#FFF",
              }}
              onPress={() => onLineStyle(lineStyle)}
            >
              <Text
                style={{
                  fontSize: lineFontSizeMap[lineStyle],
                  fontWeight: lineStyle === "body" ? "400" : "600",
                }}
              >
                {LINE_TEXT_NAME_MAP[lineStyle]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={{ flexDirection: "row" }}>
        {TEXT_STYLES.map((textStyle, i) => {
          const selected = currentTextStyles.includes(textStyle);
          return (
            <TouchableOpacity
              key={textStyle}
              style={{
                flex: 1,
                alignItems: "center",
                backgroundColor: selected ? "#CCC" : "#FFF",
              }}
              onPress={() => onTextStyle(textStyle)}
            >
              <Text
                style={{
                  fontWeight: textStyle === "**" ? "600" : "400",
                  fontStyle: textStyle === "__" ? "italic" : "normal",
                  textDecorationLine:
                    textStyle === "--"
                      ? "underline"
                      : textStyle === "~~"
                      ? "line-through"
                      : "none",
                }}
              >
                {TEXT_STYLE_NAME_MAP[textStyle]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  const initialMarkdownText = "Hey";
  const {
    inputBlockInfoMap,
    markdown,
    currentLineStyle,
    currentTextStyles,
    onChangeText,
    onSelectionChange,
    onTextStyle,
    onLineStyle,
    onAddPhoto,
    onRemovePhoto,
  } = useTextEditor({
    initialMarkdownText,
    platformMode: "android",
  });

  const inputBlockKeys = Object.keys(inputBlockInfoMap) as LineKey[];
  const inputAccessoryViewID = "toolbarAcessoryView";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView keyboardShouldPersistTaps="handled">
        {inputBlockKeys.map((inputBlockKey, i) => {
          const inputBlockInfo = inputBlockInfoMap[inputBlockKey];
          if (inputBlockInfo.type === "text") {
            const { text, textStyleMap, lineStyleMap } = inputBlockInfo;
            return (
              <TextInput
                style={{ minHeight: 400 }}
                multiline
                inputAccessoryViewID={inputAccessoryViewID}
                key={inputBlockKey}
                onChangeText={(newText: string) => {
                  // console.log("onChangeText", inputBlockKey, newText);
                  onChangeText(inputBlockKey, newText);
                }}
                onEndEditing={() => {
                  if (markdown != initialMarkdownText) {
                    console.log("onSave", markdown);
                  }
                }}
                onSelectionChange={({
                  nativeEvent: { selection },
                }: NativeSyntheticEvent<TextInputSelectionChangeEventData>) =>
                  onSelectionChange(inputBlockKey, selection)
                }
              >
                <MarkdownText
                  lineStyleMap={lineStyleMap}
                  textStyleMap={textStyleMap}
                >
                  {text}
                </MarkdownText>
              </TextInput>
            );
          } else {
            const { imgUrl } = inputBlockInfo;
            return (
              <Image
                source={{ uri: `data:image/png;base64,${imgUrl}` }}
                resizeMode={"cover"}
                style={{ width: 200, height: 100 }}
              />
            );
          }
        })}
      </ScrollView>
      <InputAccessoryView nativeID={inputAccessoryViewID}>
        <StyleBar
          currentLineStyle={currentLineStyle}
          currentTextStyles={currentTextStyles}
          onLineStyle={onLineStyle}
          onTextStyle={onTextStyle}
        />
      </InputAccessoryView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderColor: "red",
    borderWidth: 1,
  },
});
