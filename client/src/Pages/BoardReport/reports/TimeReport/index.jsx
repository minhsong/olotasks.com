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
import dayjs from "dayjs";
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
  const { allLists, loadingListService } = useSelector((state) => state.list);
  const report = useSelector((state) => state.report);
  const [boardId, boardTitle] = id.split("-");

  const [detailViews, setDetailViews] = useState([]);
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
  }, [report.filter, allLists]);

  const viewDetailClick = (user) => {
    if (detailViews.includes(user)) {
      setDetailViews(detailViews.filter((s) => s !== user));
    } else {
      setDetailViews([...detailViews, user]);
    }
  };

  const filterDatesList = () => {
    const { dateRange } = report.filter;
    const dateRangeList = [];
    const startDate = dayjs(dateRange.startDate);
    const endDate = dayjs(dateRange.endDate);
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dateRangeList.push(currentDate.toDate());
      currentDate = currentDate.add(1, "day");
    }
    return dateRangeList;
  };

  return (
    <>
      <Paper sx={{ width: "100%", overflow: "hidden", padding: "1rem" }}>
        <TableContainer>
          <Table stickyHeader size="small" aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Tasks</TableCell>
                {filterDatesList().map((date) => (
                  <TableCell key={date.getTime()}>
                    {dayjs(date).format("DD/MM")}
                  </TableCell>
                ))}
                <TableCell>Total</TableCell>
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
                    onClick={() => viewDetailClick(user.user)}
                  >
                    <TableCell>
                      <AvatarIcon {...user} /> {user.name} {user.surename}
                    </TableCell>
                    <TableCell>{user.tasks}</TableCell>
                    {filterDatesList().map((date) => {
                      const dateLogs = user.cards
                        .map((card) => {
                          return card.timeTracking.userTimeTracking.filter(
                            (log) => {
                              if (
                                log.user === user.user &&
                                new Date(log.date).toDateString() ===
                                  date.toDateString()
                              ) {
                                return true;
                              } else {
                                return false;
                              }
                            }
                          );
                        })
                        .flat();
                      const dateLoggedTime = dateLogs.reduce(
                        (a, b) => a + b.loggedTime,
                        0
                      );
                      return (
                        <TableCell key={date.toDateString()}>
                          {secondsToTimeString(dateLoggedTime, "h")}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      {secondsToTimeString(user.loggedTime, "h")}
                    </TableCell>
                  </TableRow>
                  {detailViews.includes(user.user) && user.cards.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <TableContainer>
                          <Table size="small" aria-label="sticky table">
                            <TableHead>
                              <TableRow style={{ background: "#ccc" }}>
                                <TableCell></TableCell>
                                <TableCell>Task</TableCell>
                                <TableCell>Column</TableCell>
                                <TableCell>Member time</TableCell>
                                <TableCell>Task time</TableCell>
                                <TableCell>Estimated</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {user.cards.map((card, i) => (
                                <TableRow key={card._id}>
                                  <TableCell>{i + 1}</TableCell>
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
                                        .reduce((a, b) => a + b.loggedTime, 0),
                                      "h"
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {card.timeTracking?.spentTime
                                      ? secondsToTimeString(
                                          card.timeTracking.spentTime,
                                          "h"
                                        )
                                      : "-"}
                                  </TableCell>
                                  <TableCell>
                                    {card.timeTracking?.estimateTime
                                      ? secondsToTimeString(
                                          card.timeTracking.estimateTime,
                                          "h"
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
              {/* summary */}
              <TableRow>
                <TableCell>Total</TableCell>
                <TableCell>{data.reduce((a, b) => a + b.tasks, 0)}</TableCell>
                {filterDatesList().map((date) => {
                  const dateLogs = data
                    .map((user) => {
                      return user.cards
                        .map((card) => {
                          return card.timeTracking.userTimeTracking.filter(
                            (log) => {
                              if (
                                new Date(log.date).toDateString() ===
                                date.toDateString()
                              ) {
                                return true;
                              } else {
                                return false;
                              }
                            }
                          );
                        })
                        .flat();
                    })
                    .flat();
                  const dateLoggedTime = dateLogs.reduce(
                    (a, b) => a + b.loggedTime,
                    0
                  );
                  return (
                    <TableCell key={date.toDateString()}>
                      {secondsToTimeString(dateLoggedTime, "h")}
                    </TableCell>
                  );
                })}
                <TableCell>
                  {secondsToTimeString(
                    data.reduce((a, b) => a + b.loggedTime, 0),
                    "h"
                  )}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}
