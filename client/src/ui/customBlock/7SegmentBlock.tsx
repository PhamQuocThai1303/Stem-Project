import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const define7SegmentBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "led_7_setup",
      "message0": "Thiết lập thư viện LED 7 đoạn",
      "nextStatement": null,
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Thiết lập thư viện LED 7 đoạn"
    },
    {
      "type": "dot_7_turn_on",
      "message0": "Bật chấm trên LED %1 với trạng thái %2",
      "args0": [
        {
          "type": "field_number",
          "name": "PINS",
          "value": 1
        },
        {
          "type": "field_dropdown",
          "name": "STATUS",
          "options": [
      ["Tắt", "0"],
      ["Bật", "1"]
    ]
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 120,
      "tooltip": "Bật chấm"
    },
      {
        "type": "led_7_start",
        "message0": "Khởi động LED 7 đoạn",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        // "tooltip": "Tắt LED"
      },
      {
        "type": "led_7_stop",
        "message0": "Tắt LED 7 đoạn",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        // "tooltip": "Tắt LED"
      },
      {
        "type": "led_7_turn_on",
        "message0": "Bật LED trên chân %1 với số %2",
        "args0": [
          {
            "type": "field_number",
            "name": "PINS",
            "value": 1
          },
          {
            "type": "field_number",
            "name": "PINS2",
            "value": 1
          },
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 120,
        "tooltip": "Nhấp nháy LED theo thứ tự tuần tự"
      },

  ]);

  // Định nghĩa Python generators
  pythonGenerator.forBlock['led_7_setup'] = function() {
    return "import SEG7\n"
};

pythonGenerator.forBlock['dot_7_turn_on'] = function(block: Block) {
  const pins = block.getFieldValue('PINS');
  const STATUS = block.getFieldValue('STATUS');
  return `SEG7.dot_update(${pins},${STATUS})\n`
  };

  pythonGenerator.forBlock['led_7_start'] = function() {
    return "SEG7.start()\n"
};

pythonGenerator.forBlock['led_7_stop'] = function() {
    return "SEG7.stop()\n"
};

pythonGenerator.forBlock['led_7_turn_on'] = function(block: Block) {
    const pins = block.getFieldValue('PINS');
    const pins2 = block.getFieldValue('PINS2');
    return `SEG7.update(${pins2},${pins})\n`
  };

};

export const sevenSegmentToolboxConfig = {
    kind: "category",
    name: "7 Segment LED",
    colour: "160",
    contents: [
      {
        kind: "block",
        type: "led_7_setup"
      },
      {
        kind: "block",
        type: "dot_7_turn_on"
      },
      {
        kind: "block",
        type: "led_7_start"
      },
      {
        kind: "block",
        type: "led_7_stop"
      },
      {
        kind: "block",
        type: "led_7_turn_on"
      }
    ]
  };