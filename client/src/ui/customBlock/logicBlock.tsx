
export const logicToolboxConfig = {
    kind: "category",
      name: "Logic",
      colour: 210,
      contents: [
        {
          kind: "block",
          type: "controls_if",
        },
        {
          kind: "block",
          blockxml:
            '<block type="logic_compare"><field name="OP">EQ</field></block>',
        },
        {
          kind: "block",
          blockxml:
            '<block type="logic_operation"><field name="OP">AND</field></block>',
        },
        {
          kind: "block",
          type: "logic_negate",
        },
        {
          kind: "block",
          "type": "logic_boolean"
        },
        {
          kind: "block",
          type: "logic_null",
        },
        {
          kind: "block",
          type: "logic_ternary",
        },
      ],
  };