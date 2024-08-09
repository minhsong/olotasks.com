import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { secondsToTimeString } from "../../../../Utils/estimateTimeHelper";
import AvatarIcon from "../../../../Components/AvatarIcon";
import { isEmpty } from "lodash-es";
import dayjs from "dayjs";
import { cardLink } from "../../../../Utils/linkHelper";
import { CardTitleLink } from "../TimeReport/styled";

export default function Deadline() {
  let { id, cardId } = useParams();
  const board = useSelector((state) => state.board);
  const { allLists, loadingListService } = useSelector((state) => state.list);
  const report = useSelector((state) => state.report);
  const [boardId, boardTitle] = id.split("-");
  const [data, setData] = useState([]);
  const listMapping = {};
  allLists.forEach((l) => {
    listMapping[l._id] = l.title;
  });
  const filterData = () => {
    const { members, labels, columns, dateRange } = report.filter;

    const allCards = allLists.map((l) => l.cards).flat();
    const result = allCards
      .filter((c) => {
        if (isEmpty(c.date.dueDate)) return false;

        if (labels.length > 0 && !labels.includes(c.label)) return false;

        if (columns.length > 0 && !columns.includes(c.owner)) return false;

        if (
          members.length > 0 &&
          !c.members.map((s) => s.user).some((s) => members.includes(s))
        )
          return false;

        return true;
      })
      .sort((a, b) => {
        return dayjs(a.date.dueDate).diff(dayjs(b.date.dueDate));
      });
    setData(result);
  };

  useEffect(() => {
    if (loadingListService) return;
    filterData();
  }, [loadingListService, report.filter]);

  return (
    <Paper sx={{ width: "100%", overflow: "hidden", padding: "1rem" }}>
      <TableContainer>
        <Table stickyHeader size="small" aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>List</TableCell>
              <TableCell>Members</TableCell>
              <TableCell>Estimated</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Over Due</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((card) => (
              <>
                <TableRow key={card._id}>
                  <TableCell>
                    <CardTitleLink
                      target="_blank"
                      href={cardLink(
                        board.shortId,
                        board.title,
                        card._id,
                        card.title
                      )}
                    >
                      {card.title}
                    </CardTitleLink>
                  </TableCell>
                  <TableCell>{listMapping[card.owner]}</TableCell>
                  <TableCell>
                    {card.members.map((u) => (
                      <AvatarIcon {...u} />
                    ))}
                  </TableCell>
                  <TableCell>
                    {secondsToTimeString(card.timeTracking.estimateTime)}
                  </TableCell>
                  <TableCell>
                    {dayjs(card.date.dueDate).format("DD/MM HH:mm")}
                  </TableCell>
                  <TableCell>
                    {dayjs(card.date.dueDate).diff(new Date(), "day")}
                  </TableCell>
                </TableRow>
              </>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
