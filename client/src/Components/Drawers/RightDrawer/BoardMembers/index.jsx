import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  SectionContainer,
  MemberSectionContainer,
  MemberInfoContainer,
  SectionHeaderContainer,
  MemberEmail,
  IconWrapper,
  SectionTitle,
  MemberName,
  MemberMenu,
  MemberMenuButton,
} from "./styled";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import { Avatar } from "@mui/material";
import { InviteButton, TextSpan } from "../../../TopBar/styled";
import BasePopover from "../../../ReUsableComponents/BasePopover";
import InviteMembers from "../../../Modals/EditCardModal/Popovers/InviteMembers/InviteMembers";
import ConfirmModal from "../../../ConfirmModal";
import {
  boardMemberDelete,
  boardMemberResendInvite,
} from "../../../../Services/boardService";
import { openAlert } from "../../../../Redux/Slices/alertSlice";
import { updateMembers } from "../../../../Redux/Slices/boardSlice";

const BoardMembers = () => {
  const [invitePopover, setInvitePopover] = useState(null);
  const [removeMember, setRemoveMember] = useState(null);
  const [board, user] = useSelector((state) => [
    state.board,
    state.user.userInfo,
  ]);

  const dispatch = useDispatch();

  const handleRemoveMember = () => {
    boardMemberDelete(board.shortId, removeMember.user)
      .then((res) => {
        setRemoveMember(null);
        dispatch(updateMembers(res.data));
        dispatch(
          openAlert({
            message: "Member removed successfully",
            severity: "success",
          })
        );
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

  const resentInviteClick = (email) => {
    boardMemberResendInvite(board.shortId, email).then((res) => {
      dispatch(
        openAlert({
          message: "Invite resent successfully",
          severity: "success",
        })
      );
    });
  };

  const loggedMember = board.members.find((m) => m.user == user._id);

  return (
    <Container>
      {removeMember && (
        <ConfirmModal
          open={true}
          closeHandle={() => setRemoveMember(null)}
          confirmHandle={handleRemoveMember}
          title="Are you sure to remove member?"
        />
      )}
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
                  <MemberMenu>
                    <MemberMenuButton>{member.role}</MemberMenuButton>
                    {loggedMember.role == "owner" &&
                      member.user != loggedMember.user && (
                        <MemberMenuButton
                          className="remove"
                          onClick={() => setRemoveMember(member)}
                        >
                          Remove
                        </MemberMenuButton>
                      )}
                    {loggedMember.role != "owner" &&
                      member.user == loggedMember.user && (
                        <MemberMenuButton
                          className="remove"
                          onClick={() => setRemoveMember(member)}
                        >
                          Leave Board
                        </MemberMenuButton>
                      )}
                  </MemberMenu>
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
        {board.members
          .filter((s) => s.status == "inviting")
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
                  <MemberMenu>
                    <MemberMenuButton>{member.role}</MemberMenuButton>
                    {loggedMember.role == "owner" && (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexDirection: "row",
                        }}
                        className="remove"
                      >
                        <MemberMenuButton
                          onClick={() => resentInviteClick(member.email)}
                        >
                          Resent
                        </MemberMenuButton>
                        <MemberMenuButton
                          onClick={() => setRemoveMember(member)}
                        >
                          Cancel
                        </MemberMenuButton>
                      </div>
                    )}
                  </MemberMenu>
                </MemberInfoContainer>
              </MemberSectionContainer>
            );
          })}
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
