import React from "react";
import styled from "styled-components";
import { sm, xs } from "../BreakPoints";
import SearchIcon from "../Images/search-icon.svg";
import SearchInput from "./SearchInput";
import { useDispatch, useSelector } from "react-redux";
import { updateSearch } from "../Redux/Slices/boardSlice";
import { uniqBy } from "lodash-es";
const Container = styled.div`
  width: 25rem;
  min-width: 6rem;
  display: flex;
  flex-direction: row;
  gap: 0.3rem;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.3);
  height: 2rem;
  box-sizing: border-box;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 0.1rem 0.5rem;
  color: white;
  &:hover {
    background-color: rgba(255, 255, 255, 0.4);
  }
  ${sm({
    width: "10rem",
  })}
  ${xs({
    width: "26.8vw",
  })}
`;
const Input = styled.input`
  box-sizing: content-box;
  font-size: 0.85rem;
  border: none;
  color: white;
  background-color: transparent;
  outline: none;
  height: 1rem;
  overflow: hidden;
  &::placeholder {
    color: white;
  }
  &:focus {
    font-weight: 600;
    &::placeholder {
      color: transparent;
    }
  }
`;

const Icon = styled.img`
  width: 24px;
  height: 24px;
  ${xs({
    width: "20px",
    height: "20px",
  })}
`;

const SearchBar = (props) => {
  const dispatch = useDispatch();
  const board = useSelector((state) => state.board);
  const [searchString, setSearchString] = React.useState("");

  const extractMentions = (str) => {
    const regex = /@\[([^\]]+)\]\(([^)]+)\)|([^@]+)/g;

    let matches;
    const results = {
      mentions: [],
      text: "",
    };

    while ((matches = regex.exec(str)) !== null) {
      if (matches[1] && matches[2]) {
        // It's a mention
        results.mentions.push(matches[2]);
      } else if (matches[3]) {
        // It's text
        results.text += matches[3].trim(); // Add text, trimming whitespace
      }
    }
    return results;
  };

  const handleSearch = (e) => {
    setSearchString(e.target.value);

    dispatch(updateSearch(extractMentions(e.target.value)));
  };
  return (
    <Container>
      <Icon src={SearchIcon} />
      <SearchInput
        value={searchString}
        onChange={handleSearch}
        placeholder="@ to member search.."
        data={uniqBy(board?.members, "user").map((member) => ({
          ...member,
          id: member.user,
          display: `${member.name} ${member.surename}`,
        }))}
      />
    </Container>
  );
};

export default SearchBar;
