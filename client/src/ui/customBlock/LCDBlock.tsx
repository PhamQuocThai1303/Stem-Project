import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const defineLCDBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "LCD_setup",
        "message0": "Thiết lập thư viện LCD",
        "nextStatement": null,
        "previousStatement": null,
        "colour": 230,
        "tooltip": "Thiết lập thư viện LCD"
      },
      {
        "type": "LCD_begin",
        "message0": "Khởi tạo LCD",
        "nextStatement": null,
        "previousStatement": null,
        "colour": 180,
        "tooltip": "Khởi tạo LCD"
      },
      {
        "type": "LCD_clear",
        "message0": "Xóa màn hình LCD",
        "nextStatement": null,
        "previousStatement": null,
        "colour": 180,
        "tooltip": "Xóa màn hình LCD"
      },
      {
        "type": "LCD_backlight",
        "message0": "Bật đèn nền",
        "nextStatement": null,
        "previousStatement": null,
        "colour": 180,
        "tooltip": "Bật đèn nền"
      },
      {
        "type": "LCD_nobacklight",
        "message0": "Tắt đèn nền",
        "nextStatement": null,
        "previousStatement": null,
        "colour": 180,
        "tooltip": "Tắt đèn nền"
      },
      {
        "type": "LCD_print",
        "message0": "Hiển thị chuỗi %1",
        "args0": [
          {
            "type": "input_value",
            "name": "TEXT",
            "text": "Hello World" // Giá trị mặc định
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 180,
        "tooltip": "Hiển thị chuỗi lên LCD"
      },
      {
        "type": "LCD_cursor",
        "message0": "Đặt vị trí con trỏ ở hàng %1 và cột %2",
        "args0": [
          {
            "type": "input_value",
            "name": "PINS",
            "value": 0,
            "min": 0,
            "max": 1
          },
          {
            "type": "input_value",
            "name": "PINS2",
            "value": 0,
            "min": 0,
            "max": 15
          },
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 180,
        "inputsInline": true,
        "tooltip": "Đặt vị trí con trỏ trên màn hình"
      },
  ]);

  pythonGenerator.forBlock['LCD_setup'] = function() {
    return "import LCD\n"
};

pythonGenerator.forBlock['LCD_begin'] = function() {
    return "LCD.begin()\n"
};

pythonGenerator.forBlock['LCD_clear'] = function() {
    return "LCD.clear()\n"
};
  
pythonGenerator.forBlock['LCD_backlight'] = function() {
    return "LCD.backlight()\n"
};

pythonGenerator.forBlock['LCD_nobacklight'] = function() {
    return "LCD.noBacklight()\n"
};

pythonGenerator.forBlock['LCD_print'] = function (block) {
  const text = pythonGenerator.valueToCode(block, 'TEXT', pythonGenerator.ORDER_ATOMIC) || '0';
    // const text = block.getFieldValue('TEXT');
    // return `LCD.print(${JSON.stringify(text)})\n`;
    return `LCD.print(${text})\n`;
  };

  pythonGenerator.forBlock['LCD_cursor'] = function(block: Block) {
    const pins = pythonGenerator.valueToCode(block, 'PINS', pythonGenerator.ORDER_ATOMIC) || '0';
    const pins2 = pythonGenerator.valueToCode(block, 'PINS2', pythonGenerator.ORDER_ATOMIC) || '0';
    // const pins = block.getFieldValue('PINS');
    // const pins2 = block.getFieldValue('PINS2');
    return `LCD.setCursor(${pins2},${pins})\n`
  };
};


export const LCDToolboxConfig = {
    kind: "category",
    name: "LCD Control",
    colour: "160",
    contents: [
        {
            kind: "block",
            type: "LCD_setup"
          },
      {
        kind: "block",
        type: "LCD_begin"
      },
      {
        kind: "block",
        type: "LCD_clear"
      },
      {
        kind: "block",
        type: "LCD_backlight"
      },
      {
        kind: "block",
        type: "LCD_nobacklight"
      },
      {
        kind: "block",
        type: "LCD_print"
      },
      {
        kind: "block",
        type: "LCD_cursor"
      },
    ]
  };