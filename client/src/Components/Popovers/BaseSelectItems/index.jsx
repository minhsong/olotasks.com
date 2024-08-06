import React from "react";
import {
  Container,
  SearchArea,
  Title,
  MemberWrapper,
  MemberName,
  IconWrapper,
} from "./styled";
import DoneIcon from "@mui/icons-material/Done";

const ItemComponent = (props) => {
  const { selected, handleClick } = props;

  const handleItemClick = () => {
    handleClick && handleClick({ ...props });
  };
  return (
    <MemberWrapper onClick={handleItemClick}>
      <MemberName>{props.name}</MemberName>
      {selected && (
        <IconWrapper>
          <DoneIcon fontSize="1rem" />
        </IconWrapper>
      )}
    </MemberWrapper>
  );
};

export default ({
  title,
  items,
  selectedItems,
  handleItemClick,
  searchable,
}) => {
  const [search, setSearch] = React.useState("");
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };
  return (
    <Container>
      {searchable && (
        <SearchArea
          value={search}
          onChange={handleSearch}
          placeholder="Search ..."
        />
      )}
      {title && <Title>{title}</Title>}
      {items
        .filter((s) => ~s.name.toLowerCase().indexOf(search.toLowerCase()))
        .map((item) => {
          return (
            <ItemComponent
              key={item.id}
              {...item}
              selected={(selectedItems || []).includes(item.id)}
              handleClick={handleItemClick}
            />
          );
        })}
    </Container>
  );
};
