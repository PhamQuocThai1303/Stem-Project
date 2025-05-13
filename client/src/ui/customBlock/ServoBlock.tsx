import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const defineServoBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "Servo_setup",
      "message0": "Thiết lập thư viện Servo",
      "nextStatement": null,
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Thiết lập thư viện Servo"
    },
      {
        "type": "Servo_start",
        "message0": "Khối bật servo",
        "colour": 255,
        "tooltip": "Bật servo",
        "nextStatement": null,
        "previousStatement": null,
        "helpUrl": ""
      },
      {
        "type": "Servo_stop",
        "message0": "Khối tắt servo",
        "colour": 255,
        "tooltip": "Tắt servo",
        "helpUrl": "",
        "nextStatement": null,
        "previousStatement": null,
      },
      {
        "type": "Servo_angle",
        "message0": "Chỉnh Servo sang góc %1 độ",
        "args0": [
          {
            "type": "input_value",
            "name": "ANGLE",
            "value": 0,
            "min": -360,
            "max": 360
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 255,
        // "tooltip": "Tắt LED"
      },
  ]);

  // Định nghĩa Python generators
  pythonGenerator.forBlock['Servo_setup'] = function() {
    return "import SERVO\n"
};

pythonGenerator.forBlock['Servo_start'] = function () {
    return "SERVO.start()\n"
  };
 
  pythonGenerator.forBlock['Servo_stop'] = function () {
    return "SERVO.stop()\n"
  };

  pythonGenerator.forBlock['Servo_angle'] = function(block: Block) {
    const angle = pythonGenerator.valueToCode(block, 'ANGLE', pythonGenerator.ORDER_ATOMIC) || '0';
    // const pin = block.getFieldValue('ANGLE');
    return `SERVO.angle(${angle})\n`;
  };

};

export const ServoToolboxConfig = {
    kind: "category",
    name: "Servo Control",
    colour: "160",
    contents: [
      {
        kind: "block",
        type: "Servo_setup"
      },
      { kind: "block", type: "Servo_start" },
      { kind: "block", type: "Servo_stop" },
      { kind: "block", type: "Servo_angle" },
    ]
  };