import axios from "axios";
import { openAlert } from "../Redux/Slices/alertSlice";
import {
  setPending,
  setCard,
  updateTitle,
  updateDescription,
  addComment,
  updateComment,
  deleteComment,
  addMember,
  deleteMember,
  createLabel,
  updateLabel,
  deleteLabel,
  updateLabelSelection,
  updateCreatedLabelId,
  createChecklist,
  updateCreatedChecklist,
  deleteChecklist,
  addChecklistItem,
  updateAddedChecklistItemId,
  setChecklistItemCompleted,
  deleteChecklistItem,
  setChecklistItemText,
  updateStartDueDates,
  updateDateCompleted,
  addAttachment,
  updateAddedAttachmentId,
  deleteAttachment,
  updateAttachment,
  updateCover,
  updateEstimateTime,
  updateTimeTracking,
  updateAllAttachments,
  setCardActivities,
} from "../Redux/Slices/cardSlice";
import {
  addAttachmentForCard,
  addChecklistItemForCard,
  createChecklistForCard,
  createLabelForCard,
  deleteAttachmentOfCard,
  deleteChecklistItemOfCard,
  deleteChecklistOfCard,
  deleteLabelOfCard,
  deleteMemberOfCard,
  setCardTitle,
  setChecklistItemCompletedOfCard,
  setChecklistItemTextOfCard,
  updateAllAttachmentsOfCard,
  updateCoverOfCard,
  updateDateCompletedOfCard,
  updateDescriptionOfCard,
  updateLabelOfCard,
  updateLabelSelectionOfCard,
  updateMemberOfCard,
  updateStartDueDatesOfCard,
  updateTimeTrackingOfCard,
} from "../Redux/Slices/listSlice";
import { updateBoardLabels } from "../Redux/Slices/boardSlice";

const baseUrl = process.env.REACT_APP_API_URL + "/card";

export const getCard = async (cardId, boardId, dispatch) => {
  dispatch(setPending(true));
  try {
    let response = "";

    await axios.get(baseUrl + "/" + boardId + "/" + cardId).then((res) => {
      response = res;
    });

    const card = await JSON.parse(JSON.stringify(response.data));
    dispatch(setCard(card));
    dispatch(setPending(false));
  } catch (error) {
    dispatch(setPending(false));
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const titleUpdate = async (cardId, listId, boardId, title, dispatch) => {
  try {
    dispatch(setCardTitle({ listId, cardId, title }));
    dispatch(updateTitle(title));

    await axios.put(baseUrl + "/" + boardId + "/" + cardId, {
      title: title,
    });
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const descriptionUpdate = async (
  cardId,
  listId,
  boardId,
  { description, mentions },
  dispatch
) => {
  try {
    dispatch(updateDescription(description));
    dispatch(updateDescriptionOfCard({ listId, cardId, description }));

    await axios.put(baseUrl + "/" + boardId + "/" + cardId, {
      description: description,
      mentions: mentions,
    });
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const comment = async (
  cardId,
  boardId,
  { content, mentions },
  dispatch
) => {
  try {
    let response = "";
    await axios
      .post(baseUrl + "/" + boardId + "/" + cardId + "/add-comment", {
        text: content,
        mentions: mentions,
      })
      .then((res) => {
        response = res;
      });

    dispatch(addComment(response.data));
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const commentUpdate = async (
  cardId,
  boardId,
  { content, mentions },
  commentId,
  dispatch
) => {
  try {
    dispatch(updateComment(commentId, content));

    await axios.put(baseUrl + "/" + boardId + "/" + cardId + "/" + commentId, {
      text: content,
      mentions: mentions,
    });
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const commentDelete = async (cardId, boardId, commentId, dispatch) => {
  try {
    dispatch(deleteComment(commentId));

    await axios.delete(
      baseUrl + "/" + boardId + "/" + cardId + "/" + commentId
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const memberAdd = async (
  cardId,
  listId,
  boardId,
  memberId,
  memberName,
  memberColor,
  dispatch
) => {
  try {
    dispatch(addMember({ memberId, memberName, memberColor }));
    dispatch(
      updateMemberOfCard({ listId, cardId, memberId, memberName, memberColor })
    );

    await axios.post(baseUrl + "/" + boardId + "/" + cardId + "/add-member", {
      memberId: memberId,
    });
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const memberDelete = async (
  cardId,
  listId,
  boardId,
  memberId,
  memberName,
  dispatch
) => {
  try {
    dispatch(deleteMember({ memberId }));
    dispatch(deleteMemberOfCard({ listId, cardId, memberId }));

    await axios.delete(
      baseUrl + "/" + boardId + "/" + cardId + "/" + memberId + "/delete-member"
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const labelCreate = async (
  cardId,
  listId,
  boardId,
  text,
  color,
  backColor,
  dispatch
) => {
  try {
    dispatch(
      createLabel({ _id: "notUpdated", text, color, backColor, selected: true })
    );

    let response = "";
    await axios
      .post(baseUrl + "/" + boardId + "/" + cardId + "/create-label", {
        text,
        color,
        backColor,
      })
      .then((res) => {
        response = res;
      });

    dispatch(updateCreatedLabelId(response.data.labelId));
    dispatch(
      createLabelForCard({
        listId,
        cardId,
        _id: response.data.labelId,
        text,
        color,
        backColor,
        selected: true,
      })
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const labelUpdate = async (
  cardId,
  listId,
  boardId,
  labelId,
  label,
  dispatch
) => {
  try {
    dispatch(
      updateLabel({
        labelId: labelId,
        text: label.text,
        color: label.color,
        backColor: label.backColor,
      })
    );
    dispatch(
      updateLabelOfCard({
        listId,
        cardId,
        labelId: labelId,
        text: label.text,
        color: label.color,
        backColor: label.backColor,
      })
    );

    dispatch(
      updateBoardLabels({
        listId,
        cardId,
        labelId: labelId,
        text: label.text,
        color: label.color,
        backColor: label.backColor,
      })
    );

    await axios.put(
      baseUrl + "/" + boardId + "/" + cardId + "/" + labelId + "/update-label",
      label
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const labelDelete = async (
  cardId,
  listId,
  boardId,
  labelId,
  dispatch
) => {
  try {
    dispatch(deleteLabel(labelId));
    dispatch(deleteLabelOfCard({ listId, cardId, labelId }));

    await axios.delete(
      baseUrl + "/" + boardId + "/" + cardId + "/" + labelId + "/delete-label"
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const labelUpdateSelection = async (
  cardId,
  listId,
  boardId,
  labelId,
  selected,
  label,
  dispatch
) => {
  try {
    dispatch(
      updateLabelSelection({ labelId: labelId, selected: selected, label })
    );
    dispatch(
      updateLabelSelectionOfCard({ listId, cardId, labelId, selected, label })
    );

    await axios.put(
      baseUrl +
        "/" +
        boardId +
        "/" +
        cardId +
        "/" +
        labelId +
        "/update-label-selection",
      { selected: selected }
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const checklistCreate = async (
  cardId,
  listId,
  boardId,
  title,
  dispatch
) => {
  try {
    dispatch(createChecklist({ _id: "notUpdated", title }));

    let response = "";
    await axios
      .post(baseUrl + "/" + boardId + "/" + cardId + "/create-checklist", {
        title,
      })
      .then((res) => {
        response = res;
      });

    dispatch(updateCreatedChecklist(response.data.checklistId));
    dispatch(
      createChecklistForCard({
        listId,
        cardId,
        _id: response.data.checklistId,
        title,
      })
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const checklistDelete = async (
  cardId,
  listId,
  boardId,
  checklistId,
  dispatch
) => {
  try {
    dispatch(deleteChecklist(checklistId));
    dispatch(deleteChecklistOfCard({ listId, cardId, checklistId }));
    await axios.delete(
      baseUrl +
        "/" +
        boardId +
        "/" +
        cardId +
        "/" +
        checklistId +
        "/delete-checklist"
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const checklistItemAdd = async (
  cardId,
  listId,
  boardId,
  checklistId,
  text,
  dispatch
) => {
  try {
    dispatch(
      addChecklistItem({
        checklistId: checklistId,
        _id: "notUpdated",
        text: text,
      })
    );

    let response = "";
    await axios
      .post(
        baseUrl +
          "/" +
          boardId +
          "/" +
          cardId +
          "/" +
          checklistId +
          "/add-checklist-item",
        {
          text,
        }
      )
      .then((res) => {
        response = res;
      });

    dispatch(
      updateAddedChecklistItemId({
        checklistId: checklistId,
        checklistItemId: response.data.checklistItemId,
      })
    );
    dispatch(
      addChecklistItemForCard({
        listId,
        cardId,
        checklistId: checklistId,
        _id: response.data.checklistItemId,
        text: text,
      })
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const checklistItemCompletedSet = async (
  cardId,
  listId,
  boardId,
  checklistId,
  checklistItemId,
  completed,
  dispatch
) => {
  try {
    dispatch(
      setChecklistItemCompleted({
        checklistId: checklistId,
        checklistItemId: checklistItemId,
        completed: completed,
      })
    );
    dispatch(
      setChecklistItemCompletedOfCard({
        listId,
        cardId,
        checklistId: checklistId,
        checklistItemId: checklistItemId,
        completed: completed,
      })
    );

    await axios.put(
      baseUrl +
        "/" +
        boardId +
        "/" +
        cardId +
        "/" +
        checklistId +
        "/" +
        checklistItemId +
        "/set-checklist-item-completed",
      {
        completed,
      }
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const checklistItemTextSet = async (
  cardId,
  listId,
  boardId,
  checklistId,
  checklistItemId,
  text,
  dispatch
) => {
  try {
    dispatch(
      setChecklistItemText({
        checklistId: checklistId,
        checklistItemId: checklistItemId,
        text: text,
      })
    );
    dispatch(
      setChecklistItemTextOfCard({
        listId,
        cardId,
        checklistId: checklistId,
        checklistItemId: checklistItemId,
        text: text,
      })
    );

    await axios.put(
      baseUrl +
        "/" +
        boardId +
        "/" +
        cardId +
        "/" +
        checklistId +
        "/" +
        checklistItemId +
        "/set-checklist-item-text",
      {
        text,
      }
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const checklistItemDelete = async (
  cardId,
  listId,
  boardId,
  checklistId,
  checklistItemId,
  dispatch
) => {
  try {
    dispatch(
      deleteChecklistItem({
        checklistId: checklistId,
        checklistItemId: checklistItemId,
      })
    );
    dispatch(
      deleteChecklistItemOfCard({
        listId,
        cardId,
        checklistId: checklistId,
        checklistItemId: checklistItemId,
      })
    );

    await axios.delete(
      baseUrl +
        "/" +
        boardId +
        "/" +
        cardId +
        "/" +
        checklistId +
        "/" +
        checklistItemId +
        "/delete-checklist-item"
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const startDueDatesUpdate = async (
  cardId,
  listId,
  boardId,
  startDate,
  dueDate,
  dueTime,
  dispatch
) => {
  try {
    dispatch(updateStartDueDates({ startDate, dueDate, dueTime }));
    dispatch(
      updateStartDueDatesOfCard({ listId, cardId, startDate, dueDate, dueTime })
    );

    await axios.put(baseUrl + "/" + boardId + "/" + cardId + "/update-dates", {
      startDate,
      dueDate,
      dueTime,
    });
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const dateCompletedUpdate = async (
  cardId,
  listId,
  boardId,
  completed,
  dispatch
) => {
  try {
    dispatch(updateDateCompleted(completed));
    dispatch(updateDateCompletedOfCard({ listId, cardId, completed }));

    await axios.put(
      baseUrl + "/" + boardId + "/" + cardId + "/update-date-completed",
      {
        completed,
      }
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const attachmentAdd = async (
  cardId,
  listId,
  boardId,
  link,
  name,
  dispatch
) => {
  try {
    let response = "";
    await axios
      .post(baseUrl + "/" + boardId + "/" + cardId + "/add-attachment", {
        link: link,
        name: name,
      })
      .then((res) => {
        response = res;
      });
    dispatch(updateAllAttachments(response.data.attachments));
    dispatch(
      updateAllAttachmentsOfCard({
        listId,
        cardId,
        attachments: response.data.attachments,
      })
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const attachmentDelete = async (
  cardId,
  listId,
  boardId,
  attachmentId,
  dispatch
) => {
  try {
    dispatch(deleteAttachment(attachmentId));
    dispatch(deleteAttachmentOfCard({ listId, cardId, attachmentId }));

    await axios.delete(
      baseUrl +
        "/" +
        boardId +
        "/" +
        cardId +
        "/" +
        attachmentId +
        "/delete-attachment"
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const attachmentUpdate = async (
  cardId,
  listId,
  boardId,
  attachmentId,
  link,
  name,
  dispatch
) => {
  try {
    dispatch(
      updateAttachment({ attachmentId: attachmentId, link: link, name: name })
    );

    await axios.put(
      baseUrl +
        "/" +
        boardId +
        "/" +
        cardId +
        "/" +
        attachmentId +
        "/update-attachment",
      { link: link, name: name }
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const coverUpdate = async (
  cardId,
  listId,
  boardId,
  color,
  isSizeOne,
  dispatch
) => {
  try {
    dispatch(updateCover({ color: color, isSizeOne: isSizeOne }));
    dispatch(updateCoverOfCard({ listId, cardId, color, isSizeOne }));

    await axios.put(baseUrl + "/" + boardId + "/" + cardId + "/update-cover", {
      color: color,
      isSizeOne: isSizeOne,
    });
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const estimateTimeUpdate = async (
  cardId,
  listId,
  boardId,
  time,
  dispatch
) => {
  try {
    dispatch(updateEstimateTime(time));
    let response = "";
    await axios
      .post(baseUrl + "/" + boardId + "/" + cardId + "/estimate-time", {
        time,
      })
      .then((res) => {
        response = res;
      });

    dispatch(
      updateTimeTrackingOfCard({
        listId,
        cardId,
        data: response.data,
      })
    );
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const addWorkingTime = async (
  cardId,
  listId,
  boardId,
  time,
  comment,
  date,
  dispatch
) => {
  try {
    let response = "";
    await axios
      .post(baseUrl + "/" + boardId + "/" + cardId + "/add-time", {
        time,
        comment,
        date,
      })
      .then((res) => {
        response = res;
      });

    dispatch(updateTimeTracking(response.data));

    dispatch(
      updateTimeTrackingOfCard({
        listId,
        cardId,
        data: response.data,
      })
    );
    return response.data;
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const updateWorkingTime = async (
  cardId,
  listId,
  boardId,
  timeId,
  time,
  comment,
  date,
  dispatch
) => {
  try {
    let response = "";
    await axios
      .put(
        baseUrl + "/" + boardId + "/" + cardId + "/" + timeId + "/update-time",
        {
          time,
          comment,
          date,
        }
      )
      .then((res) => {
        response = res;
      });

    dispatch(updateTimeTracking(response.data));

    dispatch(
      updateTimeTrackingOfCard({
        listId,
        cardId,
        data: response.data,
      })
    );
    return response.data;
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const deleteWorkingTime = async (
  cardId,
  listId,
  boardId,
  timeId,
  dispatch
) => {
  try {
    let response = "";
    await axios
      .delete(
        baseUrl + "/" + boardId + "/" + cardId + "/" + timeId + "/delete-time"
      )
      .then((res) => {
        response = res;
      });

    dispatch(updateTimeTracking(response.data));

    dispatch(
      updateTimeTrackingOfCard({
        listId,
        cardId,
        data: response.data,
      })
    );
    return response.data;
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const uploadAttachment = async (
  cardId,
  listId,
  boardId,
  files,
  dispatch
) => {
  try {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append(`file`, file);
      await axios
        .post(
          baseUrl + "/" + boardId + "/" + cardId + "/upload-files",
          formData
        )
        .then((res) => {
          dispatch(updateAllAttachments(res.data.data.attachments));
          if (res.data.data.cover) {
            dispatch(updateCover(res.data.data.cover));
            dispatch(
              updateCoverOfCard({
                listId,
                cardId,
                color: res.data.data.cover.color,
                isSizeOne: res.data.data.cover.isSizeOne,
                thumbnail: res.data.data.cover.thumbnail,
              })
            );
          }
          dispatch(
            updateAllAttachmentsOfCard({
              listId,
              cardId,
              attachments: res.data.data,
            })
          );
        });
    }

    return true;
  } catch (error) {
    dispatch(
      openAlert({
        message: error?.response?.data?.errMessage
          ? error.response.data.errMessage
          : error.message,
        severity: "error",
      })
    );
  }
};

export const loadCardActivities = async (boardId, cardId, dispatch) => {
  try {
    let response = "";
    await axios
      .get(baseUrl + "/" + boardId + "/" + cardId + "/card-activities")
      .then((res) => {
        response = res;
      });

    dispatch(setCardActivities(response.data));
    return response;
  } catch (err) {}
};
