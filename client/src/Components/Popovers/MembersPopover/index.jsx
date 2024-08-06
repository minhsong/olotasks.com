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
import AvatarIcon from "../../AvatarIcon";

const MemberComponent = (props) => {
  const { isMember, handleClick } = props;

  const handleItemClick = () => {
    handleClick && handleClick({ ...props });
  };
  return (
    <MemberWrapper onClick={handleItemClick}>
      <AvatarIcon id={props.user} {...props} />
      <MemberName>{props.name}</MemberName>
      {isMember && (
        <IconWrapper>
          <DoneIcon fontSize="1rem" />
        </IconWrapper>
      )}
    </MemberWrapper>
  );
};

export default ({ members, selectedItems, handleItemClick }) => {
  const [search, setSearch] = React.useState("");
  const handleSearch = (e) => {
    setSearch(e.target.value);
  };
  return (
    <Container>
      <SearchArea
        value={search}
        onChange={handleSearch}
        placeholder="Search member..."
      />
      <Title>Board members</Title>
      {members
        .filter((s) => ~s.name.toLowerCase().indexOf(search.toLowerCase()))
        .map((member) => {
          return (
            <MemberComponent
              key={member.user}
              {...member}
              isMember={(selectedItems || []).includes(member.user)}
              handleClick={handleItemClick}
            />
          );
        })}
    </Container>
  );
};
