import React from "react";
import { useSelector } from "react-redux";
import MembersPopover from "../Popovers/Members/MembersPopover";
import BasePopover from "../../../ReUsableComponents/BasePopover";
import { Title, RowContainer, AddAvatar } from "./styled";
import { Avatar } from "@mui/material";
import AvatarIcon from "../../../AvatarIcon";
const MembersFeature = (props) => {
  const card = useSelector((state) => state.card);
  const [memberPopover, setMemberPopover] = React.useState(null);
  return (
    <>
      <Title>Members</Title>
      <RowContainer>
        {card.members.map((member, index) => {
          return <AvatarIcon id={member.user} {...member} />;
        })}
        <AddAvatar onClick={(event) => setMemberPopover(event.currentTarget)}>
          +
        </AddAvatar>
      </RowContainer>
      {memberPopover && (
        <BasePopover
          anchorElement={memberPopover}
          closeCallback={() => {
            setMemberPopover(null);
          }}
          title="Members"
          contents={<MembersPopover />}
        />
      )}
    </>
  );
};

export default MembersFeature;
