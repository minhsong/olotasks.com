import { useDispatch, useSelector } from "react-redux";
import { memberAdd, memberDelete } from "../../../../../Services/cardService";
import MembersPopover from "../../../../Popovers/MembersPopover";

export default () => {
  const dispatch = useDispatch();
  const card = useSelector((state) => state.card);
  const board = useSelector((state) => state.board);

  const handleClick = async (item) => {
    if (item.isMember) {
      await memberDelete(
        card.cardId,
        card.listId,
        card.boardId,
        item.user,
        item.name,
        dispatch
      );
    } else {
      await memberAdd(
        card.cardId,
        card.listId,
        card.boardId,
        item.user,
        item.name,
        item.color,
        dispatch
      );
    }
  };

  return (
    <MembersPopover
      members={board.members}
      selectedItems={card.members.map((s) => s.user)}
      handleItemClick={handleClick}
    />
  );
};
