import { Avatar, Tooltip } from "@mui/material";
import { merge, upperFirst } from "lodash-es";
import { useSelector } from "react-redux";

export default function AvatarIcon({ id, name, surename, color, sx = {} }) {
  const boardMembers = useSelector((state) => state.board.members);

  const member = boardMembers?.find((m) => m.user === id);
  const fullName = `${upperFirst(member?.name || name)} ${upperFirst(
    member?.surename || surename
  )}`.trim();
  const shortName = fullName
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => !!s)
    .map((s) => s[0].toUpperCase())
    .splice(0, 2);

  return (
    <Tooltip title={fullName}>
      <Avatar
        sx={merge(
          {
            display: "inline-flex",
            width: "28px",
            height: "28px",
            bgcolor: member ? member.color : color,
            fontSize: "0.875rem",
            fontWeight: "700",
          },
          sx
        )}
      >
        {shortName}
      </Avatar>
    </Tooltip>
  );
}
