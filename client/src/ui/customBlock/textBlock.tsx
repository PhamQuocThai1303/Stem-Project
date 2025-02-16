
export const textToolboxConfig = {
    kind: "category",
    name: "Văn bản",
    colour: 160,
    contents: [
      {
        kind: "block",
        blockxml:
          '    <block type="text_charAt">\n' +
          '      <mutation at="true"></mutation>\n' +
          '      <field name="WHERE">FROM_START</field>\n' +
          '      <value name="VALUE">\n' +
          '        <block type="variables_get">\n' +
          '          <field name="VAR" id="q@$ZF(L?Zo/z`d{o.Bp!" variabletype="">text</field>\n' +
          "        </block>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="text">\n' +
          '      <field name="TEXT"></field>\n' +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="text_append">\n' +
          '      <field name="VAR" id=":};P,s[*|I8+L^-.EbRi" variabletype="">item</field>\n' +
          '      <value name="TEXT">\n' +
          '        <shadow type="text">\n' +
          '          <field name="TEXT"></field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="text_length">\n' +
          '      <value name="VALUE">\n' +
          '        <shadow type="text">\n' +
          '          <field name="TEXT">abc</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="text_isEmpty">\n' +
          '      <value name="VALUE">\n' +
          '        <shadow type="text">\n' +
          '          <field name="TEXT"></field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="text_indexOf">\n' +
          '      <field name="END">FIRST</field>\n' +
          '      <value name="VALUE">\n' +
          '        <block type="variables_get">\n' +
          '          <field name="VAR" id="q@$ZF(L?Zo/z`d{o.Bp!" variabletype="">text</field>\n' +
          "        </block>\n" +
          "      </value>\n" +
          '      <value name="FIND">\n' +
          '        <shadow type="text">\n' +
          '          <field name="TEXT">abc</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="text_join">\n' +
          '      <mutation items="2"></mutation>\n' +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="text_getSubstring">\n' +
          '      <mutation at1="true" at2="true"></mutation>\n' +
          '      <field name="WHERE1">FROM_START</field>\n' +
          '      <field name="WHERE2">FROM_START</field>\n' +
          '      <value name="STRING">\n' +
          '        <block type="variables_get">\n' +
          '          <field name="VAR" id="q@$ZF(L?Zo/z`d{o.Bp!" variabletype="">text</field>\n' +
          "        </block>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="text_changeCase">\n' +
          '      <field name="CASE">UPPERCASE</field>\n' +
          '      <value name="TEXT">\n' +
          '        <shadow type="text">\n' +
          '          <field name="TEXT">abc</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="text_trim">\n' +
          '      <field name="MODE">BOTH</field>\n' +
          '      <value name="TEXT">\n' +
          '        <shadow type="text">\n' +
          '          <field name="TEXT">abc</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="text_print">\n' +
          '      <value name="TEXT">\n' +
          '        <shadow type="text">\n' +
          '          <field name="TEXT">abc</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
      {
        kind: "block",
        blockxml:
          '    <block type="text_prompt_ext">\n' +
          '      <mutation type="TEXT"></mutation>\n' +
          '      <field name="TYPE">TEXT</field>\n' +
          '      <value name="TEXT">\n' +
          '        <shadow type="text">\n' +
          '          <field name="TEXT">abc</field>\n' +
          "        </shadow>\n" +
          "      </value>\n" +
          "    </block>\n",
      },
    ],
  }