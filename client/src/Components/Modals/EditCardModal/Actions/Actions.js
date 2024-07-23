import React from "react";
import { Container, Title } from "./styled";
import Button from "../../../ReUsableComponents/IconButton";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useDispatch, useSelector } from "react-redux";
import { cardDelete } from "../../../../Services/listService";
const Actions = (props) => {
  const card = useSelector((state) => state.card);
  const dispatch = useDispatch();
  const deleteCard = () => {
    cardDelete(card.cardId, card.boardId, dispatch).then(() => {
      props.closeModal();
    });
  };
  return (
    <Container>
      <Title>Actions</Title>
      {/* 	<Button title='Move' icon={<ArrowForwardIcon fontSize='1rem' />}></Button>
			<Button title='Copy' icon={<CopyIcon fontSize='small' />}></Button>
			<Button title='Watch' icon={<WatchIcon fontSize='small' />}></Button> */}
      <Button
        onClick={() => {
          cardDelete(card.listId, card.boardId, card.cardId, dispatch);
        }}
        title="Delete"
        icon={<DeleteIcon fontSize="small" />}
      ></Button>
    </Container>
  );
};

export default Actions;
