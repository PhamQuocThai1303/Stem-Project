
export const listToolboxConfig = {
    kind: "category",
    name: "Danh sách",
    colour: 259,
    contents: [
      {
        kind: "block",
        blockxml:
          '    <block type="lists_indexOf">\n' +
          '      <field name="END">FIRST</field>\n' +
          '      <value name="VALUE">\n' +
          '        <block type="variables_get">\n' +
          '          <field name="VAR" id="e`(L;x,.j[[XN`F33Q5." variabletype="">list</field>\n' +
          "        </block>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="lists_create_with">\n' +
          '      <mutation items="0"></mutation>\n' +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="lists_repeat">\n' +
          '      <value name="NUM">\n' +
          '        <shadow type="math_number">\n' +
          '          <field name="NUM">5</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        type: "lists_length",
      },
      {
        kind: "block",
        type: "lists_isEmpty",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="lists_create_with">\n' +
          '      <mutation items="3"></mutation>\n' +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="lists_getIndex">\n' +
          '      <mutation statement="false" at="true"></mutation>\n' +
          '      <field name="MODE">GET</field>\n' +
          '      <field name="WHERE">FROM_START</field>\n' +
          '      <value name="VALUE">\n' +
          '        <block type="variables_get">\n' +
          '          <field name="VAR" id="e`(L;x,.j[[XN`F33Q5." variabletype="">list</field>\n' +
          "        </block>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="lists_setIndex">\n' +
          '      <mutation at="true"></mutation>\n' +
          '      <field name="MODE">SET</field>\n' +
          '      <field name="WHERE">FROM_START</field>\n' +
          '      <value name="LIST">\n' +
          '        <block type="variables_get">\n' +
          '          <field name="VAR" id="e`(L;x,.j[[XN`F33Q5." variabletype="">list</field>\n' +
          "        </block>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="lists_getSublist">\n' +
          '      <mutation at1="true" at2="true"></mutation>\n' +
          '      <field name="WHERE1">FROM_START</field>\n' +
          '      <field name="WHERE2">FROM_START</field>\n' +
          '      <value name="LIST">\n' +
          '        <block type="variables_get">\n' +
          '          <field name="VAR" id="e`(L;x,.j[[XN`F33Q5." variabletype="">list</field>\n' +
          "        </block>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="lists_split">\n' +
          '      <mutation mode="SPLIT"></mutation>\n' +
          '      <field name="MODE">SPLIT</field>\n' +
          '      <value name="DELIM">\n' +
          '        <shadow type="text">\n' +
          '          <field name="TEXT">,</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="lists_sort">\n' +
          '      <field name="TYPE">NUMERIC</field>\n' +
          '      <field name="DIRECTION">1</field>\n' +
          "    </block>\n",
      },
    ],
  }