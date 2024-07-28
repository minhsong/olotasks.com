import React from "react";
import defaultStyle from "./defaultStyle";
import { MentionsInput, Mention } from "react-mentions";

export default ({ onChange, value, data, placeholder }) => {
  return (
    <MentionsInput
      singleLine
      value={value}
      onChange={onChange}
      style={defaultStyle}
      placeholder={placeholder}
      a11ySuggestionsListLabel={"Suggested mentions"}
    >
      <Mention data={data} style={{}} />
    </MentionsInput>
  );
};
