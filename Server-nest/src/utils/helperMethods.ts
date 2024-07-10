export const validateCardOwners = async (
  card = null,
  list,
  board,
  user,
  isCreate = false,
) => {
  const validate = isCreate
    ? true
    : list.cards.filter((item) => item.toString() === card._id.toString());
  const validate2 = board.lists.filter(
    (item) => item.toString() === list._id.toString(),
  );
  const validate3 = user.boards.filter(
    (item) => item.toString() === board._id.toString(),
  );

  return validate && validate2 && validate3;
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
