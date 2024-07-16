import React from "react";
import * as style from "./styled";
import Button from "../ReUsableComponents/Button";

const BottomButtonGroup = (props) => {
  const { clickCallback, closeCallback, title } = props;
  return (
    <style.Row>
      <style.AddListButton onClick={() => clickCallback()}>
        {title}
      </style.AddListButton>

      <Button
        style={{ fontSize: "1em" }}
        clickCallback={() => closeCallback()}
        title="Close"
      ></Button>
      {/* <CloseIcon fontSize='medium'/> */}
    </style.Row>
  );
};

export default BottomButtonGroup;
