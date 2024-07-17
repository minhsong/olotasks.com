import React from "react";
import * as style from "./styled";
import Button from "../ReUsableComponents/Button";

const BottomButtonGroup = (props) => {
  const { clickCallback, closeCallback, title } = props;
  return (
    <style.Row>
      <Button color={"info"} onClick={() => clickCallback()}>
        {title}
      </Button>

      <Button
        style={{ fontSize: "1em" }}
        onClick={() => closeCallback()}
        title="Close"
      ></Button>
      {/* <CloseIcon fontSize='medium'/> */}
    </style.Row>
  );
};

export default BottomButtonGroup;
