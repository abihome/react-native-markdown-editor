"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.textSampleMap = void 0;
exports.textSampleMap = {
    //title
    empty: {
        markdown: '',
        inputBlockInfoMap: {
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
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: '',
                        },
                    ],
                },
            },
        },
    },
    title: {
        markdown: '#Hey title',
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
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: '#',
                    styledTexts: [
                        {
                            text: 'Hey title',
                        },
                    ],
                },
            },
        },
    },
    titleWithImage: {
        markdown: '#Hey title\n<img>img_url</img>',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey title\n',
                lineStyleMap: {
                    '0': '#',
                    '1': 'body',
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
                text: '',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {},
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: '#',
                    styledTexts: [
                        {
                            text: 'Hey title',
                        },
                    ],
                },
                '1': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: '',
                        },
                    ],
                },
            },
        },
    },
    titleWithImageBody: {
        markdown: '#Hey title\n<img>img_url</img>Body',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey title\n',
                lineStyleMap: {
                    '0': '#',
                    '1': 'body',
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
                text: 'Body',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {},
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: '#',
                    styledTexts: [
                        {
                            text: 'Hey title',
                        },
                    ],
                },
                '1': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: '',
                        },
                    ],
                },
            },
        },
    },
    titleWithImageBody2: {
        markdown: 'Hey title<img>img_uri</img>\nHey body',
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
                imgUrl: 'img_uri',
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
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey title',
                        },
                    ],
                },
            },
        },
    },
    titleWithImageBody3: {
        markdown: '#Hey title\n<img>img_uri</img>\nHey **bold**',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey title\n',
                lineStyleMap: {
                    '0': '#',
                    '1': 'body',
                },
                textStyleMap: {},
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
            '1': {
                type: 'image',
                imgUrl: 'img_uri',
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
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: '#',
                    styledTexts: [
                        {
                            text: 'Hey title',
                        },
                    ],
                },
                '1': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: '',
                        },
                    ],
                },
            },
        },
    },
    //multiline
    multiline: {
        markdown: '#Hey title\n##Hey heading\nHey body',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey title\nHey heading\nHey body',
                lineStyleMap: {
                    '0': '#',
                    '1': '##',
                    '2': 'body',
                },
                textStyleMap: {},
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: '#',
                    styledTexts: [
                        {
                            text: 'Hey title',
                        },
                    ],
                },
                '1': {
                    lineStyle: '##',
                    styledTexts: [
                        {
                            text: 'Hey heading',
                        },
                    ],
                },
                '2': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey body',
                        },
                    ],
                },
            },
        },
    },
    multiline2: {
        markdown: '#Hey title\n##Hey heading\n###Hey subheading\nHey body',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey title\nHey heading\nHey subheading\nHey body',
                lineStyleMap: {
                    '0': '#',
                    '1': '##',
                    '2': '###',
                    '3': 'body',
                },
                textStyleMap: {},
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: '#',
                    styledTexts: [
                        {
                            text: 'Hey title',
                        },
                    ],
                },
                '1': {
                    lineStyle: '##',
                    styledTexts: [
                        {
                            text: 'Hey heading',
                        },
                    ],
                },
                '2': {
                    lineStyle: '###',
                    styledTexts: [
                        {
                            text: 'Hey subheading',
                        },
                    ],
                },
                '3': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey body',
                        },
                    ],
                },
            },
        },
    },
    multlineBoldyHey: {
        markdown: '**Hey you**\nFoo bar',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you\nFoo bar',
                lineStyleMap: {
                    '0': 'body',
                    '1': 'body',
                },
                textStyleMap: {
                    '0:7': ['**'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey you',
                            bold: true,
                        },
                    ],
                },
                '1': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Foo bar',
                        },
                    ],
                },
            },
        },
    },
    multlineBoldFoo: {
        markdown: 'Hey you\n**Foo** bar',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you\nFoo bar',
                lineStyleMap: {
                    '0': 'body',
                    '1': 'body',
                },
                textStyleMap: {
                    '8:11': ['**'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey you',
                        },
                    ],
                },
                '1': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Foo',
                            bold: true,
                        },
                        {
                            text: ' bar',
                        },
                    ],
                },
            },
        },
    },
    multlineBoldBar: {
        markdown: 'Hey you\nFoo **bar**',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you\nFoo bar',
                lineStyleMap: {
                    '0': 'body',
                    '1': 'body',
                },
                textStyleMap: {
                    '12:15': ['**'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey you',
                        },
                    ],
                },
                '1': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Foo ',
                        },
                        {
                            text: 'bar',
                            bold: true,
                        },
                    ],
                },
            },
        },
    },
    //no style
    heyYou: {
        markdown: 'Hey you',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {},
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey you',
                        },
                    ],
                },
            },
        },
    },
    //bold
    boldHey: {
        markdown: '**Hey** you',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '0:3': ['**'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey',
                            bold: true,
                        },
                        {
                            text: ' you',
                        },
                    ],
                },
            },
        },
    },
    boldYou: {
        markdown: 'Hey **you**',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '4:7': ['**'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey ',
                        },
                        {
                            text: 'you',
                            bold: true,
                        },
                    ],
                },
            },
        },
    },
    boldYouS: {
        markdown: 'Hey **you **',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you ',
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
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey ',
                        },
                        {
                            text: 'you ',
                            bold: true,
                        },
                    ],
                },
            },
        },
    },
    boldYouAndThere: {
        markdown: 'Hey **you**, out **there** in the cloud',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you, out there in the cloud',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '4:7': ['**'],
                    '13:18': ['**'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey ',
                        },
                        {
                            text: 'you',
                            bold: true,
                        },
                        {
                            text: ', out ',
                        },
                        {
                            text: 'there',
                            bold: true,
                        },
                        {
                            text: ' in the cloud',
                        },
                    ],
                },
            },
        },
    },
    boldYouAndThere2: {
        markdown: 'Hey **you**, out **there** in the cloud',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you, out there in the cloud',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '13:18': ['**'],
                    '4:7': ['**'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey ',
                        },
                        {
                            text: 'you',
                            bold: true,
                        },
                        {
                            text: ', out ',
                        },
                        {
                            text: 'there',
                            bold: true,
                        },
                        {
                            text: ' in the cloud',
                        },
                    ],
                },
            },
        },
    },
    boldYouToThere: {
        markdown: 'Hey **you, out there** in the cloud',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you, out there in the cloud',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '4:18': ['**'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey ',
                        },
                        {
                            text: 'you, out there',
                            bold: true,
                        },
                        {
                            text: ' in the cloud',
                        },
                    ],
                },
            },
        },
    },
    //italic
    italicHey: {
        markdown: '__Hey__ you',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '0:3': ['__'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey',
                            italic: true,
                        },
                        {
                            text: ' you',
                        },
                    ],
                },
            },
        },
    },
    italicYou: {
        markdown: 'Hey __you__',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '4:7': ['__'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey ',
                        },
                        {
                            text: 'you',
                            italic: true,
                        },
                    ],
                },
            },
        },
    },
    italicYouS: {
        markdown: 'Hey __you __',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you ',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '4:8': ['__'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey ',
                        },
                        {
                            text: 'you ',
                            italic: true,
                        },
                    ],
                },
            },
        },
    },
    italicYouAndThere: {
        markdown: 'Hey __you__, out __there__ in the cloud',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you, out there in the cloud',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '4:7': ['__'],
                    '13:18': ['__'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey ',
                        },
                        {
                            text: 'you',
                            italic: true,
                        },
                        {
                            text: ', out ',
                        },
                        {
                            text: 'there',
                            italic: true,
                        },
                        {
                            text: ' in the cloud',
                        },
                    ],
                },
            },
        },
    },
    italicYouToThere: {
        markdown: 'Hey __you, out there__ in the cloud',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you, out there in the cloud',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '4:18': ['__'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey ',
                        },
                        {
                            text: 'you, out there',
                            italic: true,
                        },
                        {
                            text: ' in the cloud',
                        },
                    ],
                },
            },
        },
    },
    boldYouAndItalicThere: {
        markdown: 'Hey **you**, out __there__ in the cloud',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you, out there in the cloud',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '4:7': ['**'],
                    '13:18': ['__'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey ',
                        },
                        {
                            text: 'you',
                            bold: true,
                        },
                        {
                            text: ', out ',
                        },
                        {
                            text: 'there',
                            italic: true,
                        },
                        {
                            text: ' in the cloud',
                        },
                    ],
                },
            },
        },
    },
    boldYouAndItalicThere2: {
        markdown: 'Hey **yoou**, out __there__ in the cloud',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey yoou, out there in the cloud',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '4:8': ['**'],
                    '14:19': ['__'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey ',
                        },
                        {
                            text: 'yoou',
                            bold: true,
                        },
                        {
                            text: ', out ',
                        },
                        {
                            text: 'there',
                            italic: true,
                        },
                        {
                            text: ' in the cloud',
                        },
                    ],
                },
            },
        },
    },
    //underline
    underlineHey: {
        markdown: '--Hey-- you',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '0:3': ['--'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey',
                            underline: true,
                        },
                        {
                            text: ' you',
                        },
                    ],
                },
            },
        },
    },
    //strikethrough
    strikethroughHey: {
        markdown: '~~Hey~~ you',
        inputBlockInfoMap: {
            '0': {
                type: 'text',
                text: 'Hey you',
                lineStyleMap: {
                    '0': 'body',
                },
                textStyleMap: {
                    '0:3': ['~~'],
                },
                currentSelectionKey: '0:0',
                lastSelectionKey: '0:0',
            },
        },
        inputInfoStyledLineMap: {
            '0': {
                '0': {
                    lineStyle: 'body',
                    styledTexts: [
                        {
                            text: 'Hey',
                            strikethrough: true,
                        },
                        {
                            text: ' you',
                        },
                    ],
                },
            },
        },
    },
};
