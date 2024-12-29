
export const loopToolboxConfig = {
    kind: "category",
    name: "Vòng lặp",
    colour: 120,
    contents: [
      {
        kind: "block",
        blockxml:
          '<block type="controls_repeat_ext">\n' +
          '      <value name="TIMES">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">10</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="controls_whileUntil">\n' +
          '      <field name="MODE">WHILE</field>\n' +
          "    </block>",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="controls_for">\n' +
          '      <field name="VAR" id="C(8;cYCF}~vSgkxzJ+{O" variabletype="">i</field>\n' +
          '      <value name="FROM">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">1</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          '      <value name="TO">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">10</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          '      <value name="BY">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">1</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="controls_forEach">\n' +
          '      <field name="VAR" id="Cg!CSk/ZJo2XQN3=VVrz" variabletype="">j</field>\n' +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="controls_flow_statements">\n' +
          '      <field name="FLOW">BREAK</field>\n' +
          "    </block>\n",
      },
    ],
  }