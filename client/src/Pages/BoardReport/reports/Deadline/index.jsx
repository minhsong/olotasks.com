import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { secondsToTimeString } from "../../../../Utils/estimateTimeHelper";
import AvatarIcon from "../../../../Components/AvatarIcon";

export default function Deadline() {
  let { id, cardId } = useParams();
  const board = useSelector((state) => state.board);
  const { allLists, loadingListService } = useSelector((state) => state.list);
  const report = useSelector((state) => state.report);
  const [boardId, boardTitle] = id.split("-");
  const [data, setData] = useState([]);
  return (
    <Paper sx={{ width: "100%", overflow: "hidden", padding: "1rem" }}>
      <TableContainer>
        <Table stickyHeader size="small" aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Number of Task</TableCell>
              <TableCell>Logged Time</TableCell>
              <TableCell>Estimated Time</TableCell>
              <TableCell>Time Remaining</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((user) => (
              <>
                <TableRow
                  hover={user.cards.length > 0}
                  key={user.user}
                  sx={{
                    cursor: user.cards.length > 0 ? "pointer" : "default",
                  }}
                >
                  <TableCell>
                    <AvatarIcon {...user} /> {user.name} {user.surename}
                  </TableCell>
                  <TableCell>{user.tasks}</TableCell>
                  <TableCell>{secondsToTimeString(user.loggedTime)}</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>0</TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
