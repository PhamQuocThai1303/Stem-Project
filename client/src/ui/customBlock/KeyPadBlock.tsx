import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

// Mở rộng kiểu PythonGenerator để thêm ORDER_ATOMIC
declare module 'blockly/python' {
  interface PythonGenerator {
    ORDER_ATOMIC: number;
  }
}

export const defineKeyPadBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "KeyPad_setup",
      "message0": "Thiết lập thư viện Keypad",
      "nextStatement": null,
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Thiết lập thư viện Keypad",
    },
      {
        "type": "start_keypad",
        "message0": "Bắt đầu bàn phím",
        "message1": "kết thúc với %1",
        "args1": [
          {
            "type": "input_value",
            "name": "END"
          }
        ],
        "colour": 160,
        "tooltip": "Khối bắt đầu keypad",
        "previousStatement": null,
        "nextStatement": null,
        "helpUrl": ""
      },
      {
        "type": "end_keypad",
        "message0": "Kết thúc bàn phím",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Tắt bàn phím",
        "helpUrl": ""
      },
      {
        "type": "keypad_available",
        "message0": "Bàn phím có sẵn",
        "output": "Boolean",
        "colour": 60,
        "tooltip": "Kiểm tra xem bàn phím có sẵn hay không",
        "helpUrl": ""
      },
      {
        "type": "keypad_data",
        "message0": "Đọc dữ liệu bàn phím",
        "output": "Value",
        "colour": 60,
        "tooltip": "Đọc dữ liệu bàn phím",
        "helpUrl": ""
      },
  ]);

  pythonGenerator.forBlock['KeyPad_setup'] = function() {
    return "import KEYPAD\n"
};
  
  pythonGenerator.forBlock['start_keypad'] = function (block) {
    // Lấy nội dung try và finally
    const value = pythonGenerator.valueToCode(block, 'END', pythonGenerator.ORDER_ATOMIC) || "''";
  
    return `KEYPAD.start(${value})\n`;
  };

  pythonGenerator.forBlock['end_keypad'] = function() {
    return "KEYPAD.stop()\n"
};

  pythonGenerator.forBlock['keypad_available'] = function () {
    return [`KEYPAD.available()`,  pythonGenerator.ORDER_ATOMIC];
  };

   pythonGenerator.forBlock['keypad_data'] = function () {
    return [`KEYPAD.readBuffer()`,  pythonGenerator.ORDER_ATOMIC];
  };

};

export const KeyPadToolboxConfig = {
    kind: "category",
    name: "KeyPad",
    colour: "160",
    contents: [
      {
        kind: 'block',
        type: 'KeyPad_setup'
      },
      {
        kind: "block",
        type: "start_keypad"
      },
      {
        kind: "block",
        type: "end_keypad"
      },
      {
        kind: "block",
        type: "keypad_available"
      },
      {
        kind: "block",
        type: "keypad_data"
      }
    ]
  };