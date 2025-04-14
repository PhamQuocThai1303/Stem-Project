import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const defineSonarBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "Sonar_setup",
      "message0": "Thiết lập thư viện Sonar",
      "nextStatement": null,
      "previousStatement": null,
      "colour": 230,
      "tooltip": "Thiết lập thư viện Sonar"
    },
    {
        "type": "Sonar_distance",
        "message0": "Khối khoảng cách",
        "output": "Number",
        "colour": 210,
        "tooltip": "Trả về khoảng cách của vật thể",
        "helpUrl": ""
      },
  ]);

  // Định nghĩa Python generators
  pythonGenerator.forBlock['Sonar_setup'] = function() {
    return "import SONAR\n"
};

pythonGenerator.forBlock['Sonar_distance'] = function () {
    return ['SONAR.distance()', pythonGenerator.ORDER_ATOMIC];
  };
 

};

export const SonarToolboxConfig = {
    kind: "category",
    name: "Sonar Control",
    colour: "160",
    contents: [
      {
        kind: "block",
        type: "Sonar_setup"
      },
      { kind: "block", type: "Sonar_distance" },
    ]
  };