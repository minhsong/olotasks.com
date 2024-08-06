import { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import AvatarIcon from "../../../../Components/AvatarIcon";
import { isEmpty, set } from "lodash-es";
import { secondsToTimeString } from "../../../../Utils/estimateTimeHelper";
import { CardTitleLink } from "./styled";
import { cardLink } from "../../../../Utils/linkHelper";

export default function TimeReport() {
  let { id, cardId } = useParams();
  const board = useSelector((state) => state.board);
  const user = useSelector((state) => state.user);
  const { allLists, loadingListService } = useSelector((state) => state.list);
  const report = useSelector((state) => state.report);
  const [boardId, boardTitle] = id.split("-");

  const [detailView, setDetailView] = useState(null);
  const [data, setData] = useState([]);

  const filterData = () => {
    const result = [];
    const { members, labels, columns, dateRange } = report.filter;
    const selectedMembers = isEmpty(members)
      ? board.members
      : board.members.filter((m) => members.includes(m.user));

    selectedMembers.map((member) => {
      const memberData = {
        ...member,
        tasks: 0,
        loggedTime: 0,
        estimatedTime: 0,
        remainingTime: 0,
        cards: [],
      };

      const cards = [];

      allLists
        .filter((list) => isEmpty(columns) || columns.includes(list._id))
        .map((list) => {
          const listCards = list.cards.filter((card) => {
            // validate labels
            if (!isEmpty(labels) && !labels.includes(card._id)) {
              return false;
            }
            // validate user has logged time
            const logs = card.timeTracking.userTimeTracking.filter((log) => {
              if (log.user === member.user) {
                // validate date range
                if (
                  new Date(log.date) >= new Date(dateRange.startDate) &&
                  new Date(log.date) <= new Date(dateRange.endDate)
                ) {
                  return true;
                } else {
                  return false;
                }
              } else {
                return false;
              }
            });
            if (logs.length === 0) {
              return false;
            } else {
              memberData.tasks++;
              memberData.loggedTime += logs.reduce(
                (a, b) => a + b.loggedTime,
                0
              );
              return true;
            }
          });
          console.log(listCards);
          cards.push(
            ...listCards.map((s) => ({ ...s, listTitle: list.title }))
          );
        });
      memberData.cards = cards;
      result.push(memberData);
    });

    setData(result);
  };

  useEffect(() => {
    filterData();
  }, [report.filter]);

  const viewDetailClick = (user) => {
    if (detailView === user) {
      setDetailView(null);
      return;
    }
    setDetailView(user);
  };

  return (
    <>
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
                    key={user.user}
                    onClick={() => viewDetailClick(user.user)}
                  >
                    <TableCell>
                      <AvatarIcon {...user} /> {user.name} {user.surename}
                    </TableCell>
                    <TableCell>{user.tasks}</TableCell>
                    <TableCell>
                      {secondsToTimeString(user.loggedTime)}
                    </TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>0</TableCell>
                  </TableRow>
                  {detailView === user.user && user.cards.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <TableContainer>
                          <Table size="small" aria-label="sticky table">
                            <TableHead>
                              <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Task</TableCell>
                                <TableCell>Column</TableCell>
                                <TableCell>member time</TableCell>
                                <TableCell>task time</TableCell>
                                <TableCell>Estimated</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {user.cards.map((card) => (
                                <TableRow key={card._id}>
                                  <TableCell></TableCell>
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
                                  <TableCell>{card.listTitle}</TableCell>
                                  <TableCell>
                                    {secondsToTimeString(
                                      card.timeTracking.userTimeTracking
                                        .filter((log) => log.user === user.user)
                                        .reduce((a, b) => a + b.loggedTime, 0)
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {card.timeTracking?.spentTime
                                      ? secondsToTimeString(
                                          card.timeTracking.spentTime
                                        )
                                      : "-"}
                                  </TableCell>
                                  <TableCell>
                                    {card.timeTracking?.estimateTime
                                      ? secondsToTimeString(
                                          card.timeTracking.estimateTime
                                        )
                                      : "-"}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
