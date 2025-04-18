import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const defineLEDBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "led_setup",
      "message0": "Thiết lập thư viện LED",
      "nextStatement": null,
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Thiết lập thư viện LED"
    },
      // 4. Khối tắt LED
    {
        "type": "led_turn_off",
        "message0": "Khối chờ %1 giây",
        "args0": [
          {
            "type": "field_number",
            "name": "PIN",
            "value": 0,
            "min": 0,
            "max": 100
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 15,
        // "tooltip": "Tắt LED"
      },
      // 5. Khối nhấp nháy LED đơn
      // 6. Khối nhấp nháy led
    {
        "type": "led_sequential_blink",
        "message0": "Bật LED trên chân %1 với trạng thái %2",
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
        "colour": 15,
        "tooltip": "Nhấp nháy LED theo thứ tự tuần tự"
      },
  ]);

  // Định nghĩa Python generators
  pythonGenerator.forBlock['led_setup'] = function() {
    return "import LEDs\n" +
           "import time\n\n" +
           "# Alias for time\n"
};

  pythonGenerator.forBlock['led_turn_off'] = function(block: Block) {
    const pin = block.getFieldValue('PIN');
    return `time.sleep(${pin})\n`;
  };


  pythonGenerator.forBlock['led_sequential_blink'] = function(block: Block) {
    const pins = block.getFieldValue('PINS');
    const STATUS = block.getFieldValue('STATUS');
    return `LEDs.update(${pins},${STATUS})\n`
  };

};

export const ledToolboxConfig = {
    kind: "category",
    name: "LED Control",
    colour: "160",
    contents: [
      {
        kind: "block",
        type: "led_setup"
      },
      {
        kind: "block",
        type: "led_turn_off"
      },
      {
        kind: "block",
        type: "led_sequential_blink"
      }
    ]
  };