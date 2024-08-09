import React from "react";
import { Container } from "./styled";
import BaseSelectItems from "../../../../Popovers/BaseSelectItems";
import Button from "../../../../ReUsableComponents/Button";

export default ({ value, onChange, lists, onClose }) => {
  const [list, setList] = React.useState(value);
  const changeHandler = (data) => {
    setList(data.id);
  };

  const changeButtonHandler = () => {
    onChange({
      sourceId: value,
      destinationId: list,
    });
  };
  return (
    <Container>
      <BaseSelectItems
        selectedItems={[list]}
        items={lists}
        handleItemClick={changeHandler}
      />
      <Button
        color={value != list ? "info" : "default"}
        onClick={changeButtonHandler}
      >
        Change
      </Button>
      <Button onClick={onClose}>Cancel</Button>
    </Container>
  );
};
