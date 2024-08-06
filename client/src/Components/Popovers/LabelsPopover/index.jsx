import React from "react";
import {
  Container,
  SearchArea,
  Title,
  Row,
  Colorbox,
  ColorText,
} from "./styled";
import DoneIcon from "@mui/icons-material/Done";

const LabelComponent = (props) => {
  const { handleItemClick, ...data } = props;
  const handleColorBoxClick = () => {
    handleItemClick && handleItemClick(data);
  };
  return (
    <Row>
      <Colorbox
        bg={data.color}
        hbg={data.backColor}
        onClick={handleColorBoxClick}
      >
        <ColorText>{data.text}</ColorText>
        {data.selected && <DoneIcon fontSize="1rem" />}
      </Colorbox>
    </Row>
  );
};

export default ({ labels, selectedItems, handleItemClick }) => {
  return (
    <Container>
      <SearchArea placeholder="Search labels..." />
      <Title>Labels</Title>
      {labels.map((label) => {
        return (
          <LabelComponent
            key={label._id}
            {...label}
            selected={(selectedItems || []).includes(label._id)}
            handleItemClick={handleItemClick}
          />
        );
      })}
    </Container>
  );
};
