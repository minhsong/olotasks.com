import React, { useState } from "react";
import { Container, SearchContainer } from "./styled";
import Button from "../../../../ReUsableComponents/Button";
import { useDispatch, useSelector } from "react-redux";
import { boardMemberChangeRole } from "../../../../../Services/boardService";
import "react-multi-email/dist/style.css";
import { FormControl, MenuItem, Select } from "@mui/material";
import { openAlert } from "../../../../../Redux/Slices/alertSlice";
import { updateMembers } from "../../../../../Redux/Slices/boardSlice";

const ChangeMemberRole = ({ member, closeCallback }) => {
  const [role, setRole] = useState(member.role);
  const dispatch = useDispatch();
  const boardMembers = useSelector((state) => state.board.members);
  const boardId = useSelector((state) => state.board.shortId);

  const handleChangeClick = async () => {
    boardMemberChangeRole(boardId, member.user, role)
      .then((res) => {
        dispatch(updateMembers(res.data));
        dispatch(
          openAlert({
            message: "Member role changed successfully",
            severity: "success",
          })
        );
        closeCallback();
      })
      .catch((error) => {
        dispatch(
          openAlert({
            message: error?.response?.data?.errMessage
              ? error.response.data.errMessage
              : error.message,
            severity: "error",
          })
        );
      });
  };

  const handleChange = (event) => {
    setRole(event.target.value);
  };

  return (
    <Container>
      <SearchContainer>
        <FormControl sx={{ minWidth: "100%" }} size="small">
          <Select value={role} onChange={handleChange}>
            <MenuItem value={"member"}>Member</MenuItem>
            <MenuItem value={"admin"}>Admin</MenuItem>
          </Select>
        </FormControl>
      </SearchContainer>
      <Button
        title="Change"
        style={{ flex: "1" }}
        onClick={handleChangeClick}
      />
    </Container>
  );
};

export default ChangeMemberRole;
