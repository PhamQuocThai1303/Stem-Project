
export const colorToolboxConfig = {
    kind: "category",
    name: "Màu",
    colour: 19,
    contents: [
      {
        kind: "block",
        blockxml:
          '    <block type="colour_picker">\n' +
          '      <field name="COLOUR">#ff0000</field>\n' +
          "    </block>\n",
      },
      {
        kind: "block",
        type: "colour_random",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="colour_rgb">\n' +
          '      <value name="RED">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">100</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          '      <value name="GREEN">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">50</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          '      <value name="BLUE">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">0</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="colour_blend">\n' +
          '      <value name="COLOUR1">\n' +
          '        <shadow type="colour_picker">\n' +
          '          <field name="COLOUR">#ff0000</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          '      <value name="COLOUR2">\n' +
          '        <shadow type="colour_picker">\n' +
          '          <field name="COLOUR">#3333ff</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          '      <value name="RATIO">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">0.5</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
    ],
  }