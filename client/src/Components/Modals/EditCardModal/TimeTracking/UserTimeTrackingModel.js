import Modal from "@mui/material/Modal";
import { ButtonContainer, ModelContainer, PopoverContainer } from "./Styled";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { secondsToTimeString } from "../../../../Utils/estimateTimeHelper";
import Button from "../../../ReUsableComponents/Button";
import { Delete } from "@mui/icons-material";
import { useState } from "react";
import BasePopover from "../../../ReUsableComponents/BasePopover";
import EstimateTimePopover from "../Popovers/EstimateTime/EstimateTimePopover";
import { BlueButton, RedButton } from "../Popovers/Labels/styled";
import { useDispatch, useSelector } from "react-redux";
import {
  comment,
  deleteWorkingTime,
  updateWorkingTime,
} from "../../../../Services/cardService";
import Close from "@mui/icons-material/Close";
import TaskComment from "./TaskCommen";

const UserTimeTrackingModel = (props) => {
  const { open, callback } = props;
  const dispatch = useDispatch();
  const [deletePopover, setDeletePopover] = useState(null);
  const timeTracking = useSelector((state) => state.card.timeTracking);
  const thisCard = useSelector((state) => state.card);
  const handleDeleteTimeTracking = async (time) => {
    await deleteWorkingTime(
      thisCard.cardId,
      thisCard.listId,
      thisCard.boardId,
      time._id,
      dispatch
    );
    setDeletePopover(null);
  };

  const onTimeCommentChanged = (data) => {
    updateWorkingTime(
      thisCard.cardId,
      thisCard.listId,
      thisCard.boardId,
      data._id,
      data.loggedTime,
      data.comment,
      null,
      dispatch
    );
  };
  return (
    <Modal open={open} onClose={callback} style={{ overflow: "auto" }}>
      <ModelContainer>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <h3>Time Tracking</h3>
          <Close onClick={callback} style={{ cursor: "pointer" }} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "stretch",
          }}
        >
          <span style={{ marginRight: "0.5em" }}>
            Logged Time: {secondsToTimeString(timeTracking.spentTime)}
          </span>
          <span style={{ marginRight: "0.5em" }}>
            Estimated Time: {secondsToTimeString(timeTracking.estimateTime)}
          </span>
        </div>
        <TableContainer component={Paper}>
          <Table
            sx={{ minWidth: "auto", padding: "0.5em" }}
            aria-label="simple table"
          >
            <TableBody>
              {timeTracking.userTimeTracking.map((row) => (
                <TableRow
                  key={row.userName}
                  sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                    td: { padding: "5px" },
                  }}
                >
                  <TableCell align="left" size="small" sx={{ with: 100 }}>
                    {new Date(row.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell scope="row">{row.userName}</TableCell>

                  <TableCell align="left">
                    <TaskComment
                      text={row.comment}
                      onChanged={(text) =>
                        onTimeCommentChanged({ ...row, comment: text })
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    {secondsToTimeString(row.loggedTime)}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      onClick={(event) => setDeletePopover(event.currentTarget)}
                    >
                      <Delete fontSize="small" />
                    </Button>
                    {deletePopover && (
                      <BasePopover
                        anchorElement={deletePopover}
                        closeCallback={() => {
                          setDeletePopover(null);
                        }}
                        title="Are you sure?"
                        contents={
                          <PopoverContainer>
                            <ButtonContainer>
                              <RedButton
                                style={{ width: "4rem" }}
                                onClick={() => handleDeleteTimeTracking(row)}
                              >
                                Yes
                              </RedButton>
                              <BlueButton
                                style={{ width: "4rem" }}
                                onClick={() => setDeletePopover(null)}
                              >
                                Cancel
                              </BlueButton>
                            </ButtonContainer>
                          </PopoverContainer>
                        }
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </ModelContainer>
    </Modal>
  );
};

export default UserTimeTrackingModel;
