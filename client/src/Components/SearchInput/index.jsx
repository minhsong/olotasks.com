import React, { useEffect, useState } from "react";
import defaultStyle from "./defaultStyle";
import { MentionsInput, Mention } from "react-mentions";

export default ({ onChange, value, data }) => {
  return (
    <MentionsInput
      singleLine
      value={value}
      onChange={onChange}
      style={defaultStyle}
      placeholder={"Mention people using '@'"}
      a11ySuggestionsListLabel={"Suggested mentions"}
    >
      <Mention data={data} style={{}} />
    </MentionsInput>
  );
};
