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
        "message0": "Khối bật buzzer",
        "colour": 160,
        "tooltip": "Bật buzzer",
        "nextStatement": null,
        "previousStatement": null,
        "helpUrl": ""
      },
      {
        "type": "Servo_stop",
        "message0": "Khối tắt buzzer",
        "colour": 160,
        "tooltip": "Tắt buzzer",
        "helpUrl": "",
        "nextStatement": null,
        "previousStatement": null,
      },
      {
        "type": "Servo_angle",
        "message0": "Chỉnh Servo sang góc %1 độ",
        "args0": [
          {
            "type": "field_number",
            "name": "ANGLE",
            "value": 0,
            "min": -360,
            "max": 360
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160,
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
    const pin = block.getFieldValue('ANGLE');
    return `SERVO.angle(${pin})\n`;
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