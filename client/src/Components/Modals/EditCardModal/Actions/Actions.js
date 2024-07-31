import React, { useState } from "react";
import { Container, Title } from "./styled";
import Button from "../../../ReUsableComponents/IconButton";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useDispatch, useSelector } from "react-redux";
import { cardDelete } from "../../../../Services/listService";
import BasePopover from "../../../ReUsableComponents/BasePopover";
import { PopoverContainer } from "../TimeTracking/Styled";
import {
  BlueButton,
  ButtonContainer,
  RedButton,
} from "../Popovers/Labels/styled";
import ConfirmModal from "../../../ConfirmModal";

const Actions = (props) => {
  const card = useSelector((state) => state.card);
  const [deletePopover, setDeletePopover] = useState(false);
  const dispatch = useDispatch();
  const deleteCard = () => {
    cardDelete(card.listId, card.boardId, card.cardId, dispatch).then(() => {
      props.closeModal();
    });
  };
  return (
    <Container>
      <Title>Actions</Title>
      <Button
        onClick={() => {
          setDeletePopover(true);
        }}
        title="Delete"
        icon={<DeleteIcon fontSize="small" />}
      ></Button>
      {deletePopover && (
        <ConfirmModal
          open={true}
          closeHandle={() => setDeletePopover(false)}
          confirmHandle={deleteCard}
          title="Are you sure to delete card?"
        />
      )}
    </Container>
  );
};

export default Actions;
