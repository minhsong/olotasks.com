import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  SectionContainer,
  MemberSectionContainer,
  MemberInfoContainer,
  SectionHeaderContainer,
  DescriptionSectionContainer,
  MemberEmail,
  IconWrapper,
  SectionTitle,
  MemberName,
  DescriptionInput,
  HiddenText,
} from "./styled";
import MemberIcon from "@mui/icons-material/PersonOutlineOutlined";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import { boardDescriptionUpdate } from "../../../../Services/boardService";
import { Avatar } from "@mui/material";
import BottomButtonGroup from "../../../BottomButtonGroup/BottomButtonGroup";
import { InviteButton, TextSpan } from "../../../TopBar/styled";
import BasePopover from "../../../ReUsableComponents/BasePopover";
import InviteMembers from "../../../Modals/EditCardModal/Popovers/InviteMembers/InviteMembers";
const BoardMembers = () => {
  const [invitePopover, setInvitePopover] = React.useState(null);
  const dispatch = useDispatch();

  const board = useSelector((state) => state.board);

  return (
    <Container>
      <SectionContainer>
        <SectionHeaderContainer>
          <InviteButton
            onClick={(event) => setInvitePopover(event.currentTarget)}
          >
            <PersonAddAltIcon />
            <TextSpan>Add Member</TextSpan>
          </InviteButton>
        </SectionHeaderContainer>
        {board.members
          .filter((s) => s.status == "active")
          .map((member) => {
            return (
              <MemberSectionContainer key={member.email}>
                <Avatar
                  sx={{
                    width: "30px",
                    height: "30px",
                    bgcolor: member.color,
                    fontWeight: "800",
                  }}
                >
                  {member.name[0].toUpperCase()}
                </Avatar>
                <MemberInfoContainer>
                  <MemberName>{`${member.name.replace(
                    /^./,
                    member.name[0].toUpperCase()
                  )} ${member.surname.toUpperCase()}`}</MemberName>
                  <MemberEmail>{member.email}</MemberEmail>
                </MemberInfoContainer>
              </MemberSectionContainer>
            );
          })}
      </SectionContainer>
      <SectionContainer>
        <SectionHeaderContainer>
          <IconWrapper>
            <EmailOutlined fontSize="inherit" />
          </IconWrapper>
          <SectionTitle>Invited Members</SectionTitle>
        </SectionHeaderContainer>

        {invitePopover && (
          <BasePopover
            anchorElement={invitePopover}
            closeCallback={() => {
              setInvitePopover(null);
            }}
            title="Invite Members"
            contents={
              <InviteMembers
                closeCallback={() => {
                  setInvitePopover(null);
                }}
              />
            }
          />
        )}
      </SectionContainer>
    </Container>
  );
};

export default BoardMembers;
