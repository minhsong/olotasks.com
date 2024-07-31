import * as React from "react";
import Modal from "@mui/material/Modal";
import * as style from "./Styled";

import PhotoCardComponent from "./PhotoCardComponent";
import TitleCardComponent from "./TitleCardComponent";
import { useDispatch, useSelector } from "react-redux";
import { createBoard } from "../../../Services/boardsService";
import LoadingScreen from "../../LoadingScreen";
import { successCreatingBoard } from "../../../Redux/Slices/boardsSlice";
import { openAlert } from "../../../Redux/Slices/alertSlice";
import { addNewBoard } from "../../../Redux/Slices/userSlice";

const backgroundImages = [
  "https://images.unsplash.com/photo-1636471815144-616b00e21f24",
  "https://images.unsplash.com/photo-1636467455675-46b5552af493",
  "https://images.unsplash.com/photo-1636412911203-4065623b94fc",
  "https://images.unsplash.com/photo-1636408807362-a6195d3dd4de",
  "https://images.unsplash.com/photo-1603932743786-9a069a74e632",
  "https://images.unsplash.com/photo-1636207608470-dfedb46c2380",
  "https://images.unsplash.com/photo-1603932978744-e09fcf98ac00",
  "https://images.unsplash.com/photo-1636207543865-acf3ad382295",
  "https://images.unsplash.com/photo-1597244211919-8a52ab2e40ea",
];
const smallPostfix =
  "?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=Mnw3MDY2fDB8MXxjb2xsZWN0aW9ufDJ8MzE3MDk5fHx8fHwyfHwxNjM2NjUzNDgz&ixlib=rb-1.2.1&q=80&w=400";

export default function CreateBoard(props) {
  const dispatch = useDispatch();
  const [creating, setCreating] = React.useState(false);

  const [open, setOpen] = React.useState(true);

  const [background, setBackground] = React.useState(
    backgroundImages[0] + smallPostfix
  );

  let newBoard = {};

  const handleClick = async () => {
    if (!(newBoard.title && newBoard.backgroundImageLink)) {
      dispatch(
        openAlert({
          message: "Please enter a title for board!",
          severity: "warning",
        })
      );

      return;
    }
    createBoard(newBoard)
      .then((res) => {
        if (res.data) {
          dispatch(addNewBoard(res.data));
          props.callback();
          setBackground(backgroundImages[0] + smallPostfix);
          dispatch(
            openAlert({
              message: `${res.data.title} board has been successfully created`,
              severity: "success",
            })
          );
        }
      })
      .catch((err) => {
        dispatch(
          openAlert({
            message: "Please enter a title for board!",
            severity: "warning",
          })
        );
      });
  };

  const handleSelect = (link) => {
    setBackground(link);
  };

  const handleClose = () => {
    setOpen(false);
    props.callback();
  };

  const handleUpdate = (updatedBoard) => {
    newBoard = { ...updatedBoard };
  };

  return (
    <div style={{ position: "relative" }}>
      {creating && <LoadingScreen />}
      <Modal open={open} onClose={handleClose} disableEnforceFocus>
        <style.Container>
          <style.Wrapper>
            <TitleCardComponent
              link={background}
              updateback={handleUpdate}
              callback={handleClose}
            />
            <style.PhotosCard>
              {backgroundImages.map((item, index) => {
                return (
                  <PhotoCardComponent
                    key={index}
                    selectedLink={background}
                    link={item + smallPostfix}
                    callback={handleSelect}
                  />
                );
              })}
            </style.PhotosCard>
          </style.Wrapper>
          <style.CreateButton onClick={() => handleClick()}>
            Create Board
          </style.CreateButton>
        </style.Container>
      </Modal>
    </div>
  );
}
