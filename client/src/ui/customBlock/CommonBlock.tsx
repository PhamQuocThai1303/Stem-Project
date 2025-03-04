import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const defineCommonBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
      {
        "type": "create_variable",
        "message0": "let %1 = %2",
        "args0": [
          {
            "type": "field_input",
            "name": "VAR_NAME",
            "text": "a"
          },
          {
            "type": "input_value",
            "name": "VALUE"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Tạo biến mới",
        "helpUrl": ""
      },
      {
        "type": "custom_function",
        "message0": "thực hiện %1",
        "args0": [
          {
            "type": "input_statement",
            "name": "STACK"
          }
        ],
        "message1": "kết thúc với %1",
        "args1": [
          {
            "type": "input_statement",
            "name": "FINALLY"
          }
        ],
        "colour": 160,
        "tooltip": "Khối try-finally có thể kéo thả nội dung",
        "previousStatement": null,
        "nextStatement": null,
        "helpUrl": ""
      }
  ]);


  pythonGenerator.forBlock['create_variable'] = function (block) {
    const varName = block.getFieldValue('VAR_NAME');
    const value = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_ATOMIC) || 'None';
    
    return `${varName} = ${value}\n`;
  };
  
  pythonGenerator.forBlock['custom_function'] = function (block) {
    // Lấy nội dung try và finally
    let tryStatements = pythonGenerator.statementToCode(block, 'STACK') || 'pass\n';
    let finallyStatements = pythonGenerator.statementToCode(block, 'FINALLY') || 'pass\n';
  
    // Thêm lề (indent) cho mỗi phần
    tryStatements = addIndent(tryStatements);
    finallyStatements = addIndent(finallyStatements);
  
    // Trả về mã Python
    return `try:\n${tryStatements}finally:\n${finallyStatements}`;
  };

};

const addIndent = (code: string, indent = '  ') => {
  return code
    .split('\n') // Tách chuỗi thành các dòng
    .map((line) => (line ? indent + line : line)) // Thêm indent vào mỗi dòng không rỗng
    .join('\n'); // Ghép lại thành chuỗi hoàn chỉnh
};

export const CommonToolboxConfig = {
    kind: "category",
    name: "Common",
    colour: "160",
    contents: [
      {
        kind: "block",
        type: "create_variable"
      },
      {
        kind: 'block',
        type: 'custom_function'
      }
      
    ]
  };