export const boardLink = (boardId, boardTitle) => {
  return `/b/${boardId}-${boardTitle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/--/g, "-")
    .replace(/^-|-$/g, "")}`;
};

export const cardLink = (boardId, boardTitle, cardId, cardTitle) => {
  return `/b/${boardId}-${boardTitle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/--/g, "-")
    .replace(/^-|-$/g, "")}/${cardId}-${cardTitle
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/--/g, "-")
    .replace(/^-|-$/g, "")}`;
};
