import React, { useState } from "react";
import { Container, SearchContainer, SearchBar, ChipContainer } from "./styled";
import Button from "../../../../ReUsableComponents/Button";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { makeStyles } from "@mui/styles";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import { useDispatch, useSelector } from "react-redux";
import { getUserFromEmail } from "../../../../../Services/userService";
import { openAlert } from "../../../../../Redux/Slices/alertSlice";
import {
  boardAddMemberByEmails,
  boardMemberAdd,
} from "../../../../../Services/boardService";
import { ReactMultiEmail, isEmail } from "react-multi-email";
import "react-multi-email/dist/style.css";

const useStyles = makeStyles({
  root: {
    maxWidth: "8rem",
    opacity: "70%",
  },
});

const ChipComponent = (props) => {
  const { name, surename, email, callback } = props;
  const classes = useStyles();
  return (
    <Tooltip
      TransitionComponent={Zoom}
      title={`${name} ${surename}`}
      size="small"
      placement="top"
      arrow
    >
      <Chip
        className={classes.root}
        onDelete={() => callback(email)}
        avatar={<Avatar>{name.toString()[0]}</Avatar>}
        label={name}
        size="small"
        color="secondary"
      />
    </Tooltip>
  );
};

const InviteMembers = () => {
  const [emails, setEmails] = useState([]);
  const [focused, setFocused] = useState(false);
  const dispatch = useDispatch();
  const boardMembers = useSelector((state) => state.board.members);
  const boardId = useSelector((state) => state.board.shortId);
  const handleAddClick = async (memberMail) => {
    const checkMember = boardMembers.filter((m) => m.email === memberMail)[0];
    if (checkMember) {
      // dispatch(
      //   openAlert({
      //     message: `${checkMember.name} is already member of this board!`,
      //     severity: "error",
      //   })
      // );
      return false;
    }
    return true;
  };

  const handleEmailsChange = (values) => {
    const lastEmail = values[values.length - 1];
    const valid = handleAddClick(lastEmail);
    setEmails(values);
  };

  const handleInviteClick = async () => {
    // remove empty emails
    let inviteEmails = emails.filter((email) => isEmail(email));
    // remove already board members
    inviteEmails = inviteEmails.filter(
      (email) => !boardMembers.map((m) => m.email).includes(email)
    );

    await boardAddMemberByEmails(boardId, inviteEmails, dispatch);
  };

  return (
    <Container>
      <SearchContainer>
        <ReactMultiEmail
          style={{ fontSize: "0.85em" }}
          placeholder="Input emails to invite"
          emails={emails}
          onChange={handleEmailsChange}
          autoFocus={true}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          getLabel={(email, index, removeEmail) => {
            return (
              <div data-tag key={index}>
                <div data-tag-item>{email}</div>
                <span data-tag-handle onClick={() => removeEmail(index)}>
                  ×
                </span>
              </div>
            );
          }}
        />
        {/* <SearchBar
          type="email"
          placeholder="Member's Email"
          value={memberMail}
          onChange={(e) => {
            setMemberMail(e.target.value);
          }}
        /> */}
      </SearchContainer>
      <Button
        title="Invite"
        style={{ flex: "1" }}
        onClick={handleInviteClick}
      />
    </Container>
  );
};

export default InviteMembers;
