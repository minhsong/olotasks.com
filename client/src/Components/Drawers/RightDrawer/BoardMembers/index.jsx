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
import AvatarIcon from "../../../AvatarIcon";
import ChangeMemberRole from "../../../Modals/EditCardModal/Popovers/ChangeMemberRole/ChangeMemberRole";

const BoardMembers = () => {
  const [invitePopover, setInvitePopover] = useState(null);
  const [rolePopover, setRolePopover] = useState(null);
  const [roleMember, setRoleMember] = useState(null);
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

  const changeRoleClick = (member, e) => {
    setRolePopover(e.currentTarget);
    setRoleMember(member);
  };

  const loggedMember = board.members.find((m) => m.user == user._id);

  const activeMembers = board.members.filter((m) =>
    ["active"].includes(m.status)
  );
  const invitingMembers = board.members.filter((m) =>
    ["inviting"].includes(m.status)
  );

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
        {["owner", "admin"].includes(loggedMember.role) && (
          <SectionHeaderContainer>
            <InviteButton
              onClick={(event) => setInvitePopover(event.currentTarget)}
            >
              <PersonAddAltIcon />
              <TextSpan>Add Member</TextSpan>
            </InviteButton>
          </SectionHeaderContainer>
        )}
        {activeMembers.map((member) => {
          return (
            <MemberSectionContainer key={member.email}>
              <AvatarIcon id={member.user} {...member} />
              <MemberInfoContainer>
                <MemberName>{`${member.name.replace(
                  /^./,
                  member.name[0].toUpperCase()
                )} ${member.surename.toUpperCase()}`}</MemberName>
                <MemberEmail>{member.email}</MemberEmail>
                <MemberMenu>
                  <MemberMenuButton
                    clickable={
                      ["owner"].includes(loggedMember.role) &&
                      member.user != loggedMember.user
                    }
                    onClick={(event) => changeRoleClick(member, event)}
                  >
                    {member.role}
                  </MemberMenuButton>
                  {["owner", "admin"].includes(loggedMember.role) &&
                    member.user != loggedMember.user && (
                      <MemberMenuButton
                        clickable
                        className="remove"
                        onClick={() => setRemoveMember(member)}
                      >
                        Remove
                      </MemberMenuButton>
                    )}
                  {loggedMember.role != "owner" &&
                    member.user == loggedMember.user && (
                      <MemberMenuButton
                        clickable
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
        {invitingMembers.map((member) => {
          return (
            <MemberSectionContainer key={member.email}>
              <AvatarIcon id={member.user} {...member} />
              <MemberInfoContainer>
                <MemberName>{`${member.name.replace(
                  /^./,
                  member.name[0].toUpperCase()
                )} ${member.surename.toUpperCase()}`}</MemberName>
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
                      <MemberMenuButton onClick={() => setRemoveMember(member)}>
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
              setRolePopover(null);
            }}
            title="Invite Members"
            contents={
              <InviteMembers
                closeCallback={() => {
                  setRolePopover(null);
                }}
              />
            }
          />
        )}

        {rolePopover && (
          <BasePopover
            anchorElement={rolePopover}
            closeCallback={() => {
              setRolePopover(null);
              setRoleMember(null);
            }}
            title={`Change role of ${roleMember.name}`}
            contents={
              <ChangeMemberRole
                member={roleMember}
                closeCallback={() => {
                  setRolePopover(null);
                  setRoleMember(null);
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
