import { mimeTypes } from 'src/constants/variables';

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

export const getThumbnailFromMeta = (metadata) => {
  if (metadata) {
    if (metadata.image) return metadata.image;
    if (metadata['og:image']) return metadata['og:image'];
    if (metadata['twitter:image']) return metadata['twitter:image'];
    if (metadata.favicons && metadata.favicons.length > 0) {
      const favs = metadata.favicons
        .map((fav) => {
          return {
            ...fav,
            size: fav.sizes
              .split('x')
              .reduce((a, b) => parseInt(a) * parseInt(b)),
          };
        })
        .sort((a, b) => b.size - a.size);

      return favs[-1].href;
    }
  }
  return null;
};

export function getFileCategory(mimeType: string): string {
  return mimeTypes[mimeType] || 'other';
}
