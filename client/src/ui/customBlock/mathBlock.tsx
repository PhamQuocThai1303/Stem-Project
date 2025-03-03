
export const mathToolboxConfig = {
    kind: "category",
    name: "Toán học",
    colour: 230,
    contents: [
      {
        kind: "block",
        blockxml:
          '    <block type="math_round">\n' +
          '      <field name="OP">ROUND</field>\n' +
          '      <value name="NUM">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">3.1</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="math_number">\n' +
          '      <field name="NUM">0</field>\n' +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="math_single">\n' +
          '      <field name="OP">ROOT</field>\n' +
          '      <value name="NUM">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">9</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="math_trig">\n' +
          '      <field name="OP">SIN</field>\n' +
          '      <value name="NUM">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">45</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="math_constant">\n' +
          '      <field name="CONSTANT">PI</field>\n' +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="math_number_property">\n' +
          '      <mutation divisor_input="false"></mutation>\n' +
          '      <field name="PROPERTY">EVEN</field>\n' +
          '      <value name="NUMBER_TO_CHECK">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">0</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="math_arithmetic">\n' +
          '      <field name="OP">ADD</field>\n' +
          '      <value name="A">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">1</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          '      <value name="B">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">1</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="math_on_list">\n' +
          '      <mutation op="SUM"></mutation>\n' +
          '      <field name="OP">SUM</field>\n' +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="math_modulo">\n' +
          '      <value name="DIVIDEND">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">64</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          '      <value name="DIVISOR">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">10</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="math_constrain">\n' +
          '      <value name="VALUE">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">50</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          '      <value name="LOW">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">1</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          '      <value name="HIGH">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">100</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="math_random_int">\n' +
          '      <value name="FROM">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">1</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          '      <value name="TO">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">100</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        type: "math_random_float",
      },
      // {
      //   kind: "block",
      //   blockxml:
      //     '    <block type="text_print">\n' +
      //     '      <value name="NUMBER">\n' +
      //     "      </value>\n" +
      //     "    </block>\n",
      // },
    ],
  }