import { textSampleMap } from './mock';
import {
  LineStyle,
  LineStyleMap,
  SelectionKey,
  TextBlockInfo,
  TextStyleMap,
} from './types';
import {
  getSelectionText,
  getKeyFromSelection,
  getSelectionFromKey,
  stringReplaceAt,
  stringInsertAt,
  getLineStyle,
  getTextStyleSelectionsFromMarkdownText,
  mardownToInputBlockInfoMap,
  inputBlockInfoMapToMarkdown,
  clearText,
  getClosestSelectionKey,
  handleTextStyleShiftSelection,
  getCurrentLineIndex,
  getStyledLineMap,
  handleLineStyleShiftSelection,
  splitInputBlockInfoMap,
  splitLineStyleMap,
  mergeInputBlockInfoMap,
  splitTextStyleMap,
  mergeTextStyleMap,
  mergeLineStyleMap,
} from './utils';

test('getSelectionText', () => {
  expect(getSelectionText('Hey you', 4, 7)).toBe('you');
  expect(getSelectionText('Hey you, out there in the cloud', 4, 7)).toBe('you');
  expect(getSelectionText('Hey you, out there in the cloud', 13, 18)).toBe(
    'there',
  );
});

test('stringReplaceAt', () => {
  expect(stringReplaceAt('Hey you', 4, 7, '**you**')).toBe('Hey **you**');
  expect(stringReplaceAt('Hey you, foo bar', 4, 7, '**you**')).toBe(
    'Hey **you**, foo bar',
  );
  expect(
    stringReplaceAt(
      'Hey **you**, out there in the cloud',
      13,
      18,
      '**there**',
      4,
    ),
  ).toBe('Hey **you**, out **there** in the cloud');
  expect(
    stringReplaceAt('Hey you keep editing', 7, 20, '** keep editing**'),
  ).toBe('Hey you** keep editing**');
});

test('stringInsertAt', () => {
  expect(stringInsertAt('Hey title', 0, '#')).toBe('#Hey title');
  expect(stringInsertAt('Hey title\nHey heading', 0, '#')).toBe(
    '#Hey title\nHey heading',
  );
  expect(stringInsertAt('#Hey title\nHey heading', 11, '##')).toBe(
    '#Hey title\n##Hey heading',
  );
});

test('getLineStyle', () => {
  expect(getLineStyle('Hey you')).toBe<LineStyle>('body');
  expect(getLineStyle('#Hey you')).toBe<LineStyle>('#');
  expect(getLineStyle('# Hey you')).toBe<LineStyle>('#');
  expect(getLineStyle('##Hey you')).toBe<LineStyle>('##');
  expect(getLineStyle('## Hey you')).toBe<LineStyle>('##');
  expect(getLineStyle('###Hey you')).toBe<LineStyle>('###');
  expect(getLineStyle('### Hey you')).toBe<LineStyle>('###');
});

test('getKeyFromSelection', () => {
  expect(getKeyFromSelection(1, 2)).toBe('1:2');
  expect(getKeyFromSelection(4, 7)).toBe('4:7');
  expect(getKeyFromSelection(14, 17)).toBe('14:17');
  expect(getKeyFromSelection(141, 173)).toBe('141:173');
});

test('getSelectionFromKey', () => {
  expect(getSelectionFromKey('1:2')).toStrictEqual({ start: 1, end: 2 });
  expect(getSelectionFromKey('4:7')).toStrictEqual({ start: 4, end: 7 });
  expect(getSelectionFromKey('14:17')).toStrictEqual({ start: 14, end: 17 });
  expect(getSelectionFromKey('141:173')).toStrictEqual({
    start: 141,
    end: 173,
  });
});

test('getTextStyleSelectionsFromMarkdownText', () => {
  expect(
    getTextStyleSelectionsFromMarkdownText(textSampleMap.heyYou.markdown, '**'),
  ).toStrictEqual([]);
  expect(
    getTextStyleSelectionsFromMarkdownText(
      textSampleMap.boldHey.markdown,
      '**',
    ),
  ).toStrictEqual([
    {
      start: 0,
      end: 3,
    },
  ]);
  expect(
    getTextStyleSelectionsFromMarkdownText(
      textSampleMap.boldYou.markdown,
      '**',
    ),
  ).toStrictEqual([
    {
      start: 4,
      end: 7,
    },
  ]);
  expect(
    getTextStyleSelectionsFromMarkdownText(
      textSampleMap.boldYouS.markdown,
      '**',
    ),
  ).toStrictEqual([
    {
      start: 4,
      end: 8,
    },
  ]);
  expect(
    getTextStyleSelectionsFromMarkdownText(
      textSampleMap.boldYouAndThere.markdown,
      '**',
    ),
  ).toStrictEqual([
    {
      start: 4,
      end: 7,
    },
    {
      start: 13,
      end: 18,
    },
  ]);

  expect(
    getTextStyleSelectionsFromMarkdownText(
      textSampleMap.boldYouAndItalicThere.markdown,
      '**',
    ),
  ).toStrictEqual([
    {
      start: 4,
      end: 7,
    },
  ]);

  expect(
    getTextStyleSelectionsFromMarkdownText(
      textSampleMap.boldYouAndItalicThere.markdown,
      '__',
    ),
  ).toStrictEqual([
    {
      start: 13,
      end: 18,
    },
  ]);
});

test('markdown <=> inputBlockInfoMap', () => {
  Object.keys(textSampleMap).map((textSampleKey) => {
    const textSample = textSampleMap[textSampleKey];
    expect(mardownToInputBlockInfoMap(textSample.markdown)).toStrictEqual(
      textSample.inputBlockInfoMap,
    );
  });
  Object.keys(textSampleMap).map((textSampleKey) => {
    const textSample = textSampleMap[textSampleKey];
    expect(inputBlockInfoMapToMarkdown(textSample.inputBlockInfoMap)).toBe(
      textSample.markdown,
    );
  });
});

test('clearText', () => {
  expect(clearText('Hey you')).toBe('Hey you');
  expect(clearText('**Hey** you')).toBe('Hey you');
  expect(clearText('Hey **you**')).toBe('Hey you');
  expect(clearText('Hey **you**, out __there__ in the cloud')).toBe(
    'Hey you, out there in the cloud',
  );
  expect(clearText('Hey **you**, out __there__ in the cloud', ['**'])).toBe(
    'Hey **you**, out there in the cloud',
  );
  expect(clearText('Hey **you**, out __there__ in the cloud', ['__'])).toBe(
    'Hey you, out __there__ in the cloud',
  );
});

/*
[s,e] //selection
'|'   //text
[0,0] '|' => [1,1] '|' => [1,1] ' |'
'|' => ''| => ' |'
*/

test('getClosestSelectionKey', () => {
  //Hey| you
  expect(getClosestSelectionKey({}, '4:4')).toBe(undefined);

  //|Hey| you
  expect(getClosestSelectionKey({}, '0:4')).toBe(undefined);

  //**Hey|** you
  expect(getClosestSelectionKey({ '0:3': ['**'] }, '3:3')).toBe<SelectionKey>(
    '0:3',
  );

  //**Hey**| you
  expect(getClosestSelectionKey({ '0:3': ['**'] }, '3:3', false)).toBe(
    undefined,
  );

  //Hey **you|**
  expect(getClosestSelectionKey({ '4:7': ['**'] }, '7:7')).toBe<SelectionKey>(
    '4:7',
  );

  //Hey **you**|
  expect(getClosestSelectionKey({ '4:7': ['**'] }, '7:7', false)).toBe(
    undefined,
  );

  //**Hey **you|****
  expect(
    getClosestSelectionKey({ '0:7': ['**'], '4:7': ['**'] }, '7:7'),
  ).toBe<SelectionKey>('4:7');

  //**Hey **you****|
  expect(
    getClosestSelectionKey({ '0:7': ['**'], '4:7': ['**'] }, '7:7', false),
  ).toBe(undefined);

  //**Hey **you|****
  expect(
    getClosestSelectionKey({ '4:7': ['**'], '0:7': ['**'] }, '7:7'),
  ).toBe<SelectionKey>('4:7');

  //Hey you**|**
  expect(getClosestSelectionKey({ '7:7': ['**'] }, '7:7')).toBe<SelectionKey>(
    '7:7',
  );
});

test('handleLineStyleShiftSelection', () => {
  //'|' => '\n|'
  expect(
    handleLineStyleShiftSelection({
      lineStyleMap: { '0': 'body' },
      currentLineIndex: 1,
      shift: 1,
      lineCount: 2,
    }),
  ).toStrictEqual<LineStyleMap>({
    '0': 'body',
    '1': 'body',
  });

  //'#|' => '#\n|'
  expect(
    handleLineStyleShiftSelection({
      lineStyleMap: { '0': '#' },
      currentLineIndex: 1,
      shift: 1,
      lineCount: 2,
    }),
  ).toStrictEqual<LineStyleMap>({
    '0': '#',
    '1': 'body',
  });

  //'#\n|##' => '#\n\n|##'
  expect(
    handleLineStyleShiftSelection({
      lineStyleMap: { '0': '#', '1': '##' },
      currentLineIndex: 1,
      shift: 1,
      lineCount: 3,
    }),
  ).toStrictEqual<LineStyleMap>({
    '0': '#',
    '1': 'body',
    '2': '##',
  });

  ///'\n|' => '\n\n|'
});

test('handleTextStyleShiftSelection', () => {
  //**Hey|** you => **Hey |** you
  expect(
    handleTextStyleShiftSelection({
      textStyleMap: { '0:3': ['**'] },
      currentSelectionKey: '3:3',
      shift: 1,
    }),
  ).toStrictEqual<TextStyleMap>({
    '0:4': ['**'],
  });

  //**Hey**| you => **Hey** | you
  expect(
    handleTextStyleShiftSelection({
      textStyleMap: { '0:3': ['**'] },
      currentSelectionKey: '3:3',
      shift: 1,
      includeSelectionEnd: false,
    }),
  ).toStrictEqual<TextStyleMap>({
    '0:3': ['**'],
  });

  //Hey| **you** => Hey | **you**
  expect(
    handleTextStyleShiftSelection({
      textStyleMap: { '4:7': ['**'] },
      currentSelectionKey: '3:3',
      shift: 1,
    }),
  ).toStrictEqual<TextStyleMap>({
    '5:8': ['**'],
  });

  //Hey| **you** => Hey foo| **you**
  expect(
    handleTextStyleShiftSelection({
      textStyleMap: { '4:7': ['**'] },
      currentSelectionKey: '3:3',
      shift: 3,
    }),
  ).toStrictEqual<TextStyleMap>({
    '7:10': ['**'],
  });

  //Hey **you|** and **you** => Hey **you |** and **you**
  expect(
    handleTextStyleShiftSelection({
      textStyleMap: { '4:7': ['**'], '13:15': ['**'] },
      currentSelectionKey: '7:7',
      shift: 1,
    }),
  ).toStrictEqual<TextStyleMap>({
    '4:8': ['**'],
    '14:16': ['**'],
  });

  //Hey| **you** and **you** => Hey | **you** and **you**
  expect(
    handleTextStyleShiftSelection({
      textStyleMap: { '4:7': ['**'], '13:15': ['**'] },
      currentSelectionKey: '3:3',
      shift: 1,
    }),
  ).toStrictEqual<TextStyleMap>({
    '5:8': ['**'],
    '14:16': ['**'],
  });

  //Hey **you** a|nd **you** => Hey **you** an|nd **you**
  expect(
    handleTextStyleShiftSelection({
      textStyleMap: { '4:7': ['**'], '13:15': ['**'] },
      currentSelectionKey: '9:9',
      shift: 1,
    }),
  ).toStrictEqual<TextStyleMap>({
    '4:7': ['**'],
    '14:16': ['**'],
  });

  //Hey **you** and **you|** => Hey **you** and **you |**
  expect(
    handleTextStyleShiftSelection({
      textStyleMap: { '4:7': ['**'], '13:15': ['**'] },
      currentSelectionKey: '15:15',
      shift: 1,
    }),
  ).toStrictEqual<TextStyleMap>({
    '4:7': ['**'],
    '13:16': ['**'],
  });

  //Hey **you|** and __you__ => Hey **you |** and __you__
  expect(
    handleTextStyleShiftSelection({
      textStyleMap: { '4:7': ['**'], '13:15': ['__'] },
      currentSelectionKey: '7:7',
      shift: 1,
    }),
  ).toStrictEqual<TextStyleMap>({
    '4:8': ['**'],
    '14:16': ['__'],
  });

  //Hey **|** => Hey|
  expect(
    handleTextStyleShiftSelection({
      textStyleMap: { '4:4': ['**'] },
      currentSelectionKey: '4:4',
      shift: -1,
    }),
  ).toStrictEqual<TextStyleMap>({});

  //TODO: handle replace
});

test('getCurrentLineIndex', () => {
  //sentence |
  expect(getCurrentLineIndex('0:0', '')).toBe(0); //'|'
  expect(getCurrentLineIndex('0:0', 'Hey you')).toBe(0); //'|Hey you'
  expect(getCurrentLineIndex('7:7', 'Hey you')).toBe(0); //'Hey you|'
  expect(getCurrentLineIndex('7:7', 'Hey you\n')).toBe(0); //'Hey you|\n'
  expect(getCurrentLineIndex('8:8', 'Hey you\n')).toBe(1); //'Hey you\n|'
  expect(getCurrentLineIndex('7:7', 'Hey you\nAnd you')).toBe(0); //'Hey you|\nAnd you'
  expect(getCurrentLineIndex('8:8', 'Hey you\nAnd you')).toBe(1); //'Hey you\n|And you'
  expect(getCurrentLineIndex('15:15', 'Hey you\nAnd you')).toBe(1); //'Hey you\nAnd you|'
  expect(getCurrentLineIndex('0:0', 'Hey you\nAnd you\nFoo')).toBe(0); //'|Hey you\nAnd you\nFoo'
  expect(getCurrentLineIndex('8:8', 'Hey you\nAnd you\nFoo')).toBe(1); //'Hey you\n|And you\nFoo'
  expect(getCurrentLineIndex('15:15', 'Hey you\nAnd you\nFoo')).toBe(1); //'Hey you\nAnd you|\nFoo'
  expect(getCurrentLineIndex('16:16', 'Hey you\nAnd you\nFoo')).toBe(2); //'Hey you\nAnd you\n|Foo'
  expect(getCurrentLineIndex('19:19', 'Hey you\nAnd you\nFoo')).toBe(2); //'Hey you\nAnd you\nFoo|'
  //selection |Foo|
  expect(getCurrentLineIndex('0:3', 'Hey you')).toBe(0); //'|Hey| you'
  expect(getCurrentLineIndex('4:7', 'Hey you')).toBe(0); //'Hey |you|'
  expect(getCurrentLineIndex('4:7', 'Hey you\n')).toBe(0); //'Hey  |you|\n'
  expect(getCurrentLineIndex('4:7', 'Hey you\nAnd you')).toBe(0); //'Hey |you|\nAnd you'
  expect(getCurrentLineIndex('8:11', 'Hey you\nAnd you')).toBe(1); //'Hey you\n|And| you'
  expect(getCurrentLineIndex('12:15', 'Hey you\nAnd you')).toBe(1); //'Hey you\nAnd |you|'
  expect(getCurrentLineIndex('0:3', 'Hey you\nAnd you\nFoo')).toBe(0); //'|Hey| you\nAnd you\nFoo'
  expect(getCurrentLineIndex('8:11', 'Hey you\nAnd you\nFoo')).toBe(1); //'Hey you\n|And| you\nFoo'
  expect(getCurrentLineIndex('12:15', 'Hey you\nAnd you\nFoo')).toBe(1); //'Hey you\nAnd |you|\nFoo'
  expect(getCurrentLineIndex('16:18', 'Hey you\nAnd you\nFoo')).toBe(2); //'Hey you\nAnd you\n|Foo|'
});

test('getStyledLineMap', () => {
  Object.keys(textSampleMap).map((textSampleKey) => {
    const textSample = textSampleMap[textSampleKey];
    const textBlockInfo = textSample.inputBlockInfoMap['0'] as TextBlockInfo;
    expect(
      getStyledLineMap(
        textBlockInfo.text,
        textBlockInfo.textStyleMap,
        textBlockInfo.lineStyleMap,
      ),
    ).toStrictEqual(textSample.inputInfoStyledLineMap['0']);
  });
});

test('splitTextStyleMap', () => {
  //'Hey bold|\nHey body',
  expect(
    splitTextStyleMap({
      textStyleMap: {
        '4:8': ['**'],
      },
      leftTextLength: 8,
    }),
  ).toStrictEqual({
    leftTextStyleMap: {
      '4:8': ['**'],
    },
    rightTextStyleMap: {},
  });

  //'Hey title|\nHey bold',
  expect(
    splitTextStyleMap({
      textStyleMap: {
        '14:18': ['**'],
      },
      leftTextLength: 9,
    }),
  ).toStrictEqual({
    leftTextStyleMap: {},
    rightTextStyleMap: {
      '5:9': ['**'],
    },
  });

  //'Hey title\n|Hey bold',
  expect(
    splitTextStyleMap({
      textStyleMap: {
        '14:18': ['**'],
      },
      leftTextLength: 10,
    }),
  ).toStrictEqual({
    leftTextStyleMap: {},
    rightTextStyleMap: {
      '4:8': ['**'],
    },
  });
});

test('mergeTextStyleMap', () => {
  //'Hey bold|\nHey body',
  expect(
    mergeTextStyleMap({
      leftTextStyleMap: {
        '4:8': ['**'],
      },
      rightTextStyleMap: {},
      leftTextLength: 8,
    }),
  ).toStrictEqual({
    '4:8': ['**'],
  });

  //'Hey title|\nHey bold',
  expect(
    mergeTextStyleMap({
      leftTextStyleMap: {},
      rightTextStyleMap: {
        '5:9': ['**'],
      },
      leftTextLength: 9,
    }),
  ).toStrictEqual({
    '14:18': ['**'],
  });

  //'Hey title\n|Hey bold',
  expect(
    mergeTextStyleMap({
      leftTextStyleMap: {},
      rightTextStyleMap: {
        '4:8': ['**'],
      },
      leftTextLength: 10,
    }),
  ).toStrictEqual({
    '14:18': ['**'],
  });
});

test('splitLineStyleMap', () => {
  //'Hey title\n|Hey body
  expect(
    splitLineStyleMap({
      lineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      leftText: 'Hey title\n',
      rightText: 'Hey body',
      currentLineIndex: 1,
    }),
  ).toStrictEqual({
    leftLineStyleMap: {
      '0': 'body',
      '1': 'body',
    },
    rightLineStyleMap: {
      '0': 'body',
    },
  });

  //'Hey title\n|Hey body
  expect(
    splitLineStyleMap({
      lineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      leftText: 'Hey title',
      rightText: '\nHey body',
      currentLineIndex: 1,
    }),
  ).toStrictEqual({
    leftLineStyleMap: {
      '0': 'body',
    },
    rightLineStyleMap: {
      '0': 'body',
      '1': 'body',
    },
  });

  //'#Hey title\n|Hey body
  expect(
    splitLineStyleMap({
      lineStyleMap: {
        '0': '#',
        '1': 'body',
      },
      leftText: 'Hey title\n',
      rightText: 'Hey body',
      currentLineIndex: 1,
    }),
  ).toStrictEqual({
    leftLineStyleMap: {
      '0': '#',
      '1': 'body',
    },
    rightLineStyleMap: {
      '0': 'body',
    },
  });

  //'Hey body\n|#Hey title
  expect(
    splitLineStyleMap({
      lineStyleMap: {
        '0': 'body',
        '1': '#',
      },
      leftText: 'Hey body\n',
      rightText: 'Hey title',
      currentLineIndex: 1,
    }),
  ).toStrictEqual({
    leftLineStyleMap: {
      '0': 'body',
      '1': 'body',
    },
    rightLineStyleMap: {
      '0': '#',
    },
  });

  //'\n|Hey bold
  expect(
    splitLineStyleMap({
      lineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      leftText: '\n',
      rightText: 'Hey bold',
      currentLineIndex: 1,
    }),
  ).toStrictEqual({
    leftLineStyleMap: {
      '0': 'body',
      '1': 'body',
    },
    rightLineStyleMap: {
      '0': 'body',
    },
  });
});

test('mergeLineStyleMap', () => {
  //'Hey title|Hey body
  expect(
    mergeLineStyleMap({
      leftLineStyleMap: {
        '0': 'body',
      },
      rightLineStyleMap: {
        '0': 'body',
      },
      leftText: 'Hey title',
      rightText: 'Hey body',
    }),
  ).toStrictEqual({
    '0': 'body',
    '1': 'body',
  });

  //'Hey title\n|Hey body
  expect(
    mergeLineStyleMap({
      leftLineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      rightLineStyleMap: {
        '0': 'body',
      },
      leftText: 'Hey title\n',
      rightText: 'Hey body',
    }),
  ).toStrictEqual({
    '0': 'body',
    '1': 'body',
  });

  //'Hey title\n|Hey body
  expect(
    mergeLineStyleMap({
      leftLineStyleMap: {
        '0': 'body',
      },
      rightLineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      leftText: 'Hey title',
      rightText: '\nHey body',
    }),
  ).toStrictEqual({
    '0': 'body',
    '1': 'body',
  });

  //'#Hey title\n|Hey body
  expect(
    mergeLineStyleMap({
      leftLineStyleMap: {
        '0': '#',
        '1': 'body',
      },
      rightLineStyleMap: {
        '0': 'body',
      },
      leftText: 'Hey title\n',
      rightText: 'Hey body',
    }),
  ).toStrictEqual({
    '0': '#',
    '1': 'body',
  });

  //'Hey body\n|#Hey title
  expect(
    mergeLineStyleMap({
      leftLineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      rightLineStyleMap: {
        '0': '#',
      },
      leftText: 'Hey body\n',
      rightText: 'Hey title',
    }),
  ).toStrictEqual({
    '0': 'body',
    '1': '#',
  });

  //'\n|Hey bold
  expect(
    mergeLineStyleMap({
      leftLineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      rightLineStyleMap: {
        '0': 'body',
      },
      leftText: '\n',
      rightText: 'Hey bold',
    }),
  ).toStrictEqual({
    '0': 'body',
    '1': 'body',
  });
});

test('splitInputBlockInfoMap', () => {
  //'Hey title|\nHey body'
  expect(
    splitInputBlockInfoMap({
      inputBlockInfoMap: {
        '0': {
          type: 'text',
          text: 'Hey title\nHey body',
          lineStyleMap: {
            '0': 'body',
            '1': 'body',
          },
          textStyleMap: {},
          currentSelectionKey: '9:9',
          lastSelectionKey: '0:0',
        },
      },
      inputBlockInfoKey: '0',
      imgUri: 'img_url',
    }),
  ).toStrictEqual({
    '0': {
      type: 'text',
      text: 'Hey title',
      lineStyleMap: {
        '0': 'body',
      },
      textStyleMap: {},
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
    '1': {
      type: 'image',
      imgUrl: 'img_url',
    },
    '2': {
      type: 'text',
      text: '\nHey body',
      lineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      textStyleMap: {},
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
  });

  //'Hey **bold**|\n#Hey title'
  expect(
    splitInputBlockInfoMap({
      inputBlockInfoMap: {
        '0': {
          type: 'text',
          text: 'Hey bold\nHey title',
          lineStyleMap: {
            '0': 'body',
            '1': '#',
          },
          textStyleMap: {
            '4:8': ['**'],
          },
          currentSelectionKey: '8:8',
          lastSelectionKey: '0:0',
        },
      },
      inputBlockInfoKey: '0',
      imgUri: 'img_url',
    }),
  ).toStrictEqual({
    '0': {
      type: 'text',
      text: 'Hey bold',
      lineStyleMap: {
        '0': 'body',
      },
      textStyleMap: {
        '4:8': ['**'],
      },
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
    '1': {
      type: 'image',
      imgUrl: 'img_url',
    },
    '2': {
      type: 'text',
      text: '\nHey title',
      lineStyleMap: {
        '0': 'body',
        '1': '#',
      },
      textStyleMap: {},
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
  });

  //'#Hey title|\nHey **bold**'
  expect(
    splitInputBlockInfoMap({
      inputBlockInfoMap: {
        '0': {
          type: 'text',
          text: 'Hey title\nHey bold',
          lineStyleMap: {
            '0': '#',
            '1': 'body',
          },
          textStyleMap: {
            '14:18': ['**'],
          },
          currentSelectionKey: '9:9',
          lastSelectionKey: '0:0',
        },
      },
      inputBlockInfoKey: '0',
      imgUri: 'img_url',
    }),
  ).toStrictEqual({
    '0': {
      type: 'text',
      text: 'Hey title',
      lineStyleMap: {
        '0': '#',
      },
      textStyleMap: {},
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
    '1': {
      type: 'image',
      imgUrl: 'img_url',
    },
    '2': {
      type: 'text',
      text: '\nHey bold',
      lineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      textStyleMap: {
        '5:9': ['**'],
      },
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
  });

  //'\n|Hey **bold**'
  expect(
    splitInputBlockInfoMap({
      inputBlockInfoMap: {
        '0': {
          type: 'text',
          text: 'Hey title',
          lineStyleMap: {
            '0': '#',
          },
          textStyleMap: {},
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        },
        '1': {
          type: 'image',
          imgUrl: 'img_url',
        },
        '2': {
          type: 'text',
          text: '\nHey bold',
          lineStyleMap: {
            '0': 'body',
            '1': 'body',
          },
          textStyleMap: {
            '5:9': ['**'],
          },
          currentSelectionKey: '1:1',
          lastSelectionKey: '0:0',
        },
      },
      inputBlockInfoKey: '2',
      imgUri: 'img_url2',
    }),
  ).toStrictEqual({
    '0': {
      type: 'text',
      text: 'Hey title',
      lineStyleMap: {
        '0': '#',
      },
      textStyleMap: {},
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
    '1': {
      type: 'image',
      imgUrl: 'img_url',
    },
    '2': {
      type: 'text',
      text: '\n',
      lineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      textStyleMap: {},
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
    '3': {
      type: 'image',
      imgUrl: 'img_url2',
    },
    '4': {
      type: 'text',
      text: 'Hey bold',
      lineStyleMap: {
        '0': 'body',
      },
      textStyleMap: {
        '4:8': ['**'],
      },
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
  });
});

test('mergeInputBlockInfoMap', () => {
  //'Hey title|Hey body'
  expect(
    mergeInputBlockInfoMap({
      inputBlockInfoMap: {
        '0': {
          type: 'text',
          text: 'Hey title',
          lineStyleMap: {
            '0': 'body',
          },
          textStyleMap: {},
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        },
        '1': {
          type: 'image',
          imgUrl: 'img_url',
        },
        '2': {
          type: 'text',
          text: 'Hey body',
          lineStyleMap: {
            '0': 'body',
          },
          textStyleMap: {},
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        },
      },
      inputBlockInfoKey: '1',
    }),
  ).toStrictEqual({
    '0': {
      type: 'text',
      text: 'Hey title\nHey body',
      lineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      textStyleMap: {},
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
  });

  //'Hey title|\nHey body'
  expect(
    mergeInputBlockInfoMap({
      inputBlockInfoMap: {
        '0': {
          type: 'text',
          text: 'Hey title',
          lineStyleMap: {
            '0': 'body',
          },
          textStyleMap: {},
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        },
        '1': {
          type: 'image',
          imgUrl: 'img_url',
        },
        '2': {
          type: 'text',
          text: '\nHey body',
          lineStyleMap: {
            '0': 'body',
            '1': 'body',
          },
          textStyleMap: {},
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        },
      },
      inputBlockInfoKey: '1',
    }),
  ).toStrictEqual({
    '0': {
      type: 'text',
      text: 'Hey title\nHey body',
      lineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      textStyleMap: {},
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
  });

  //'Hey **bold**|\n#Hey title'
  expect(
    mergeInputBlockInfoMap({
      inputBlockInfoMap: {
        '0': {
          type: 'text',
          text: 'Hey bold',
          lineStyleMap: {
            '0': 'body',
          },
          textStyleMap: {
            '4:8': ['**'],
          },
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        },
        '1': {
          type: 'image',
          imgUrl: 'img_url',
        },
        '2': {
          type: 'text',
          text: '\nHey title',
          lineStyleMap: {
            '0': 'body',
            '1': '#',
          },
          textStyleMap: {},
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        },
      },
      inputBlockInfoKey: '1',
    }),
  ).toStrictEqual({
    '0': {
      type: 'text',
      text: 'Hey bold\nHey title',
      lineStyleMap: {
        '0': 'body',
        '1': '#',
      },
      textStyleMap: {
        '4:8': ['**'],
      },
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
  });

  //'#Hey title|\nHey **bold**'
  expect(
    mergeInputBlockInfoMap({
      inputBlockInfoMap: {
        '0': {
          type: 'text',
          text: 'Hey title',
          lineStyleMap: {
            '0': '#',
          },
          textStyleMap: {},
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        },
        '1': {
          type: 'image',
          imgUrl: 'img_url',
        },
        '2': {
          type: 'text',
          text: '\nHey bold',
          lineStyleMap: {
            '0': 'body',
            '1': 'body',
          },
          textStyleMap: {
            '5:9': ['**'],
          },
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        },
      },
      inputBlockInfoKey: '1',
    }),
  ).toStrictEqual({
    '0': {
      type: 'text',
      text: 'Hey title\nHey bold',
      lineStyleMap: {
        '0': '#',
        '1': 'body',
      },
      textStyleMap: {
        '14:18': ['**'],
      },
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
  });

  //'\n|Hey **bold**'
  expect(
    mergeInputBlockInfoMap({
      inputBlockInfoMap: {
        '0': {
          type: 'text',
          text: 'Hey title',
          lineStyleMap: {
            '0': '#',
          },
          textStyleMap: {},
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        },
        '1': {
          type: 'image',
          imgUrl: 'img_url',
        },
        '2': {
          type: 'text',
          text: '\n',
          lineStyleMap: {
            '0': 'body',
            '1': 'body',
          },
          textStyleMap: {},
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        },
        '3': {
          type: 'image',
          imgUrl: 'img_url2',
        },
        '4': {
          type: 'text',
          text: 'Hey bold',
          lineStyleMap: {
            '0': 'body',
          },
          textStyleMap: {
            '4:8': ['**'],
          },
          currentSelectionKey: '0:0',
          lastSelectionKey: '0:0',
        },
      },
      inputBlockInfoKey: '3',
    }),
  ).toStrictEqual({
    '0': {
      type: 'text',
      text: 'Hey title',
      lineStyleMap: {
        '0': '#',
      },
      textStyleMap: {},
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
    '1': {
      type: 'image',
      imgUrl: 'img_url',
    },
    '2': {
      type: 'text',
      text: '\nHey bold',
      lineStyleMap: {
        '0': 'body',
        '1': 'body',
      },
      textStyleMap: {
        '5:9': ['**'],
      },
      currentSelectionKey: '0:0',
      lastSelectionKey: '0:0',
    },
  });
});
