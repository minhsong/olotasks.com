export const validateCardOwners = async (
  card = null,
  board = null,
  user,
  isCreate = false,
) => {
  // check if user is member of the board

  if (
    board &&
    !board.members.map((s) => s.user.toString()).includes(user._id.toString())
  ) {
    return false;
  }

  // check if the card is in the board for editing

  if (card && card.board.toString() !== board._id.toString()) {
    return false;
  }

  return true;
};

export const createRandomHexColor = () => {
  const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F'];
  let hex = '#';

  for (let i = 0; i < 6; i++) {
    const index = Math.floor(Math.random() * values.length);
    hex += values[index];
  }
  return hex.toString();
};

export const userPrivate = (user) => {
  return {
    ...user,
    password: undefined,
    __v: undefined,
  };
};

export const userpublic = (user) => {
  return {
    ...user,
    password: undefined,
    __v: undefined,
    email: undefined,
    createdAt: undefined,
    updatedAt: undefined,
  };
};
