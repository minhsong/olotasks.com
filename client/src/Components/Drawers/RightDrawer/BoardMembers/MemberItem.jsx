import { useState } from "react";
import AvatarIcon from "../../../AvatarIcon";
import ChangeMemberRole from "../../../Modals/EditCardModal/Popovers/ChangeMemberRole/ChangeMemberRole";
import {
  MemberEmail,
  MemberInfoContainer,
  MemberMenu,
  MemberMenuButton,
  MemberName,
  MemberSectionContainer,
} from "./styled";
import { useDispatch, useSelector } from "react-redux";
import {
  boardMemberDelete,
  boardMemberLeave,
} from "../../../../Services/boardService";
import { updateMembers } from "../../../../Redux/Slices/boardSlice";
import { openAlert } from "../../../../Redux/Slices/alertSlice";
import BasePopover from "../../../ReUsableComponents/BasePopover";
import ConfirmModal from "../../../ConfirmModal";
import { loadUser } from "../../../../Services/userService";

const MemberItem = ({ member }) => {
  const dispatch = useDispatch();
  const [rolePopover, setRolePopover] = useState(null);
  const [removeConfirm, setRemoveConfirm] = useState(false);
  const [leaveConfirm, setLeaveConfirm] = useState(false);
  const [board, user] = useSelector((state) => [
    state.board,
    state.user.userInfo,
  ]);
  const loggedMember = board.members.find((m) => m.user == user._id);

  const handleRemoveMember = () => {
    boardMemberDelete(board.shortId, member.user)
      .then((res) => {
        setRemoveConfirm(false);
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

  const handleLeaveBoard = () => {
    boardMemberLeave(board.shortId)
      .then((res) => {
        window.location.href = "/boards";
        dispatch(
          openAlert({
            message: "You left board successfully",
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

  const canRoleChange = (member) => {
    if (loggedMember.role == "member") {
      return false;
    }

    if (loggedMember.user == member.user) {
      return false;
    }

    if (loggedMember.role == "owner") {
      return true;
    }
  };

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
          {canRoleChange(member) ? (
            <MemberMenuButton
              clickable
              onClick={(event) => setRolePopover(event.currentTarget)}
            >
              {member.role}
            </MemberMenuButton>
          ) : (
            <MemberMenuButton>{member.role}</MemberMenuButton>
          )}
          {["owner", "admin"].includes(loggedMember.role) &&
            member.user != loggedMember.user && (
              <MemberMenuButton
                clickable
                className="remove"
                onClick={() => setRemoveConfirm(true)}
              >
                Remove
              </MemberMenuButton>
            )}
          {loggedMember.role != "owner" && member.user == loggedMember.user && (
            <MemberMenuButton
              clickable
              className="remove"
              onClick={() => setLeaveConfirm(true)}
            >
              Leave Board
            </MemberMenuButton>
          )}
        </MemberMenu>
      </MemberInfoContainer>
      {rolePopover && (
        <BasePopover
          anchorElement={rolePopover}
          closeCallback={() => {
            setRolePopover(null);
          }}
          title={`Change role of ${member.name}`}
          contents={
            <ChangeMemberRole
              member={member}
              closeCallback={() => {
                setRolePopover(null);
              }}
            />
          }
        />
      )}
      {removeConfirm && (
        <ConfirmModal
          open={true}
          closeHandle={() => setRemoveConfirm(false)}
          confirmHandle={handleRemoveMember}
          title={`Are you sure to remove ${member.name} from board?`}
        />
      )}
      {leaveConfirm && (
        <ConfirmModal
          open={true}
          closeHandle={() => setLeaveConfirm(false)}
          confirmHandle={handleLeaveBoard}
          title={`Are you sure to leave board?`}
        />
      )}
    </MemberSectionContainer>
  );
};

export default MemberItem;
