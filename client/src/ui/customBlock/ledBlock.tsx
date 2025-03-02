import * as Blockly from 'blockly';
import { Block } from 'blockly/core';
import { pythonGenerator } from 'blockly/python';

export const defineLEDBlocks  = () => {
  // Định nghĩa blocks
  Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "led_setup",
      "message0": "Thiết lập thư viện",
      "nextStatement": null,
      "colour": 230,
      "tooltip": "Thiết lập thư viện LED"
    },
    {
      "type": "led_blink",
      "message0": "Nhấp nháy LED %1 lần với độ trễ %2 giây",
      "args0": [
        {
          "type": "field_number",
          "name": "TIMES",
          "value": 5,
          "min": 1
        },
        {
          "type": "field_number",
          "name": "DELAY",
          "value": 1,
          "min": 0.1
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 160,
      "tooltip": "Nhấp nháy LED với số lần và độ trễ chỉ định"
    },
    // 1. Khối thiết lập LED đơn
    {
        "type": "led_setup_single",
        "message0": "Thiết lập LED ở chân GPIO %1",
        "args0": [
          {
            "type": "field_number",
            "name": "PIN",
            "value": 18,
            "min": 0,
            "max": 27
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Thiết lập một LED đơn trên chân GPIO"
      },
      // 2. Khối thiết lập nhiều LED
    {
        "type": "led_setup_multiple",
        "message0": "Thiết lập %1 LED trên các chân %2",
        "args0": [
          {
            "type": "field_number",
            "name": "COUNT",
            "value": 3,
            "min": 1
          },
          {
            "type": "field_input",
            "name": "PINS",
            "text": "18,23,24"
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 230,
        "tooltip": "Thiết lập nhiều LED (nhập các chân GPIO phân cách bằng dấu phẩy)"
      },
      // 3. Khối bật LED
    {
        "type": "led_turn_on",
        "message0": "Bật LED ở chân %1",
        "args0": [
          {
            "type": "field_number",
            "name": "PIN",
            "value": 18,
            "min": 0,
            "max": 27
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160,
        "tooltip": "Bật LED"
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
        "colour": 160,
        // "tooltip": "Tắt LED"
      },
      // 5. Khối nhấp nháy LED đơn
    {
        "type": "led_blink_single",
        "message0": "Nhấp nháy LED ở chân %1 %2 lần với độ trễ %3 giây",
        "args0": [
          {
            "type": "field_number",
            "name": "PIN",
            "value": 18,
            "min": 0,
            "max": 27
          },
          {
            "type": "field_number",
            "name": "TIMES",
            "value": 5,
            "min": 1
          },
          {
            "type": "field_number",
            "name": "DELAY",
            "value": 1,
            "min": 0.1
          }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160,
        "tooltip": "Nhấp nháy LED với số lần và độ trễ chỉ định"
      },
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
        "colour": 160,
        "tooltip": "Nhấp nháy LED theo thứ tự tuần tự"
      },
  ]);

  // Định nghĩa Python generators
  pythonGenerator.forBlock['led_setup'] = function() {
    return "import LEDs\n" +
           "import time\n\n" +
           "# Alias for time\n"
};

  pythonGenerator.forBlock['led_blink'] = function(block: Block) {
    const times = block.getFieldValue('TIMES');
    const delay = block.getFieldValue('DELAY');
    return `for _ in range(${times}):\n  GPIO.output(LED_PIN, GPIO.HIGH)\n  time.sleep(${delay})\n  GPIO.output(LED_PIN, GPIO.LOW)\n  time.sleep(${delay})\n`;
  };

  pythonGenerator.forBlock['led_setup_single'] = function(block: Block) {
    const pin = block.getFieldValue('PIN');
    return `LED_PIN = ${pin}\nGPIO.setup(LED_PIN, GPIO.OUT)\n`;
  };

  pythonGenerator.forBlock['led_setup_multiple'] = function(block: Block) {
    const pins = block.getFieldValue('PINS');
    return `import RPi.GPIO as GPIO\nimport time\nGPIO.setmode(GPIO.BCM)\nGPIO.setwarnings(False)\nLED_PINS = [${pins}]\nfor pin in LED_PINS:\n  GPIO.setup(pin, GPIO.OUT)\n`;
  };

  pythonGenerator.forBlock['led_turn_on'] = function(block: Block) {
    const pin = block.getFieldValue('PIN');
    return `GPIO.output(${pin}, GPIO.HIGH)\n`;
  };

  pythonGenerator.forBlock['led_turn_off'] = function(block: Block) {
    const pin = block.getFieldValue('PIN');
    return `time.sleep(${pin})\n`;
  };

  pythonGenerator.forBlock['led_blink_single'] = function(block: Block) {
    const pin = block.getFieldValue('PIN');
    const times = block.getFieldValue('TIMES');
    const delay = block.getFieldValue('DELAY');
    return `for _ in range(${times}):\n  GPIO.output(${pin}, GPIO.HIGH)\n  time.sleep(${delay})\n  GPIO.output(${pin}, GPIO.LOW)\n  time.sleep(${delay})\n`;
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
        type: "led_setup_single"
      },
      {
        kind: "block",
        type: "led_setup_multiple"
      },
      {
        kind: "block",
        type: "led_turn_on"
      },
      {
        kind: "block",
        type: "led_turn_off"
      },
      {
        kind: "block",
        type: "led_blink_single"
      },
      {
        kind: "block",
        type: "led_sequential_blink"
      }
    ]
  };