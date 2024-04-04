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
  Pressable,
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
} from "react-native-markdown-editor";
import * as ImagePicker from "expo-image-picker";

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
  onGetImage: () => void;
};

function StyleBar({
  currentLineStyle = "body",
  currentTextStyles = [],
  onLineStyle,
  onTextStyle,
  onGetImage,
}: StyleBarProps): JSX.Element {
  return (
    <View style={{ backgroundColor: "#FFF" }}>
      <View style={{ flexDirection: "row" }}>
        {LINE_TEXT_STYLES.map((lineStyle) => {
          const selected = lineStyle === currentLineStyle;
          return (
            <Pressable
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
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: "row" }}>
        {TEXT_STYLES.map((textStyle, i) => {
          const selected = currentTextStyles.includes(textStyle);
          return (
            <Pressable
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
            </Pressable>
          );
        })}
      </View>
      <Pressable
        style={{
          flex: 1,
          alignItems: "center",
        }}
        onPress={() => onGetImage()}
      >
        <Text>{"Add Photo"}</Text>
      </Pressable>
    </View>
  );
}

export default function App() {
  const initialMarkdownText =
    "#Title example\n\n##Heading example\n\n###Subheading example\n\nContent example, testing **bold**, __italic__ --underline-- and ~~strikethrough~~\n";
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
  });

  const inputBlockKeys = Object.keys(inputBlockInfoMap) as LineKey[];
  const inputAccessoryViewID = "toolbarAcessoryView";

  const rawTextBlocks = markdown.split(/<img>|<\/img>/);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        style={{ paddingHorizontal: 16, paddingTop: 32 }}
      >
        <View style={{ minHeight: 200 }}>
          {inputBlockKeys.map((inputBlockKey, i) => {
            const inputBlockInfo = inputBlockInfoMap[inputBlockKey];
            if (inputBlockInfo.type === "text") {
              const { text, textStyleMap, lineStyleMap } = inputBlockInfo;
              return (
                <TextInput
                  multiline
                  style={{ height: 200 }}
                  inputAccessoryViewID={inputAccessoryViewID}
                  key={inputBlockKey}
                  onChangeText={(newText: string) =>
                    onChangeText(inputBlockKey, newText)
                  }
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
                <View>
                  <Image
                    source={{ uri: `data:image/png;base64,${imgUrl}` }}
                    resizeMode={"cover"}
                    style={{ width: "100%", height: 200 }}
                  />
                  <Pressable
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      backgroundColor: "#FFF",
                    }}
                    onPress={() => onRemovePhoto(inputBlockKey)}
                  >
                    <Text>{"Remove Photo"}</Text>
                  </Pressable>
                </View>
              );
            }
          })}
        </View>
        {rawTextBlocks.map((rawTextBlock, i) => {
          if (i % 2 == 1) {
            return (
              <Text style={{ borderColor: "#999", borderWidth: 1 }}>
                {`data:image/png;base64,${rawTextBlock.substring(0, 40)}...`}
              </Text>
            );
          }
          return (
            <Text style={{ borderColor: "#999", borderWidth: 1 }}>
              {rawTextBlock}
            </Text>
          );
        })}
      </ScrollView>
      <InputAccessoryView nativeID={inputAccessoryViewID}>
        <StyleBar
          currentLineStyle={currentLineStyle}
          currentTextStyles={currentTextStyles}
          onLineStyle={onLineStyle}
          onTextStyle={onTextStyle}
          onGetImage={() => {
            ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.All,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 0.3,
              base64: true,
            })
              .then((result) => {
                const base64 = result.assets?.[0].base64;
                onAddPhoto(base64);
              })
              .catch((e) => console.log(e));
          }}
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
  },
});
