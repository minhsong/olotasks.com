import React, { useState } from "react";
import FollowIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import DescriptiondIcon from "@mui/icons-material/DescriptionOutlined";
import CommentIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import CheckIcon from "@mui/icons-material/LibraryAddCheckOutlined";
import AttachmentIcon from "@mui/icons-material/InsertLinkRounded";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import {
  AttachmentContainer,
  CardTitle,
  CommentContainer,
  Container,
  Cover,
  DateContainer,
  FooterContainer,
  IconGroupContainer,
  IconGroupWrapper,
  IconWrapper,
  Label,
  LabelContainer,
  Span,
  CheckContainer,
  MembersContainer,
  MembersWrapper,
} from "./styled";
import { Draggable } from "react-beautiful-dnd";
import moment from "moment";
import { Avatar } from "@mui/material";
import { secondsToTimeString } from "../../Utils/estimateTimeHelper";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Card = (props) => {
  const [openModal, setOpenModal] = useState(false);
  const board = useSelector((state) => state.board);
  const navigate = useNavigate();
  const card = props.info;
  let checks = { c: 0, n: 0 };
  card.checklists?.map((checklist) => {
    return checklist.items.map((item) => {
      if (item.completed) checks.c += 1;
      else checks.n += 1;
      return item;
    });
  });

  const handleOpenClose = () => {
    navigate(
      `/b/${props.boardId}-${board.title}/${props.info._id}-${card.title}`
    );
    // setOpenModal((current) => !current);
  };

  const formatDate = (date) => {
    if (moment(date).toDate().getFullYear() < new Date().getFullYear())
      return moment(date).format("MMM DD, yyyy");
    else return moment(date).format("MMM DD");
  };

  function getStyle(style, snapshot) {
    if (!snapshot.isDropAnimating) {
      return style;
    }
    return {
      ...style,
      transitionDuration: `80ms`,
    };
  }

  return (
    <>
      <Draggable draggableId={props.info._id} index={props.index}>
        {(provided, snapshot) => {
          return (
            <Container
              onClick={handleOpenClose}
              {...provided.dragHandleProps}
              {...provided.draggableProps}
              style={getStyle(provided.draggableProps.style, snapshot)}
              ref={provided.innerRef}
              isDragging={snapshot.isDragging}
              color={!card.cover?.isSizeOne ? card.cover?.color : "#fff"}
              // padding={card.cover?.color && card.cover?.isSizeOne}
            >
              {card.cover?.isSizeOne && (
                <Cover
                  color={card.cover?.color}
                  thumbnail={card.cover?.thumbnail}
                ></Cover>
              )}
              {card.labels && (
                <LabelContainer>
                  {card.labels.map((label) => {
                    return <Label key={label._id} color={label.color} />;
                  })}
                </LabelContainer>
              )}

              <CardTitle>{card.title}</CardTitle>
              <FooterContainer>
                <IconGroupContainer>
                  <IconGroupWrapper>
                    {card.watchers.length > 0 && (
                      <IconWrapper>
                        <FollowIcon fontSize="0.5rem" />
                      </IconWrapper>
                    )}
                    {card.attachments?.length > 0 && (
                      <AttachmentContainer>
                        <AttachmentIcon fontSize="small" />
                        <Span>{card.attachments?.length}</Span>
                      </AttachmentContainer>
                    )}

                    {(card.date?.dueDate || card.date?.startDate) && ( //#ec9488, #eb5a46 #61bd4f
                      <DateContainer
                        backColor={
                          card.date?.completed
                            ? "#61bd4f"
                            : moment(card.date?.dueDate).toDate().getTime() <
                              new Date().getTime()
                            ? "#ec9488"
                            : "transparent"
                        }
                        hoverBg={
                          card.date?.completed
                            ? "#81dd6f"
                            : moment(card.date?.dueDate).toDate().getTime() <
                              new Date().getTime()
                            ? "#eb5a46"
                            : "lightgray"
                        }
                        color={
                          card.date?.completed ||
                          moment(card.date?.dueDate).toDate().getTime() <
                            new Date().getTime()
                            ? "white"
                            : "darkgray"
                        }
                      >
                        <Span
                          color={
                            card.date?.completed ||
                            moment(card.date?.dueDate).toDate().getTime() <
                              new Date().getTime()
                              ? "white"
                              : "darkgray"
                          }
                        >{`${
                          card.date?.dueDate
                            ? formatDate(card.date?.dueDate)
                            : ""
                        }`}</Span>
                      </DateContainer>
                    )}
                    {card.description && <DescriptiondIcon fontSize="0.5rem" />}
                    {card.comments?.length > 0 && (
                      <CommentContainer>
                        <CommentIcon fontSize="0.5rem" />
                        <Span>{card.comments.length}</Span>
                      </CommentContainer>
                    )}
                    {card.checklists?.length > 0 && (
                      <CheckContainer>
                        <CheckIcon fontSize="0.5rem" />
                        <Span>
                          {checks.c}/{checks.c + checks.n}
                        </Span>
                      </CheckContainer>
                    )}
                    {card.timeTracking.estimateTime && (
                      <DateContainer
                        backColor={
                          card.timeTracking.spentTime <
                          card.timeTracking.estimateTime
                            ? "transparent"
                            : "#ec9488"
                        }
                        hoverBg={
                          card.timeTracking.spentTime <
                          card.timeTracking.estimateTime
                            ? "#81dd6f"
                            : "lightgray"
                        }
                        color={
                          card.timeTracking.spentTime <
                          card.timeTracking.estimateTime
                            ? "darkgray"
                            : "white"
                        }
                      >
                        <HourglassBottomIcon fontSize="0.5rem" />
                        <Span
                          color={
                            card.timeTracking.spentTime <
                            card.timeTracking.estimateTime
                              ? "darkgray"
                              : "white"
                          }
                        >
                          {secondsToTimeString(card.timeTracking.estimateTime)}
                        </Span>
                      </DateContainer>
                    )}
                  </IconGroupWrapper>
                </IconGroupContainer>
                {card.members && (
                  <MembersContainer>
                    <MembersWrapper>
                      {card.members &&
                        card.members.map((member, i) => {
                          return (
                            <Avatar
                              key={i}
                              sx={{
                                width: 20,
                                height: 20,
                                bgcolor: member.color,
                                fontSize: "0.6rem",
                                fontWeight: "600",
                              }}
                            >
                              {member.name
                                .split(/\s+/)
                                .map((s) => s.trim())
                                .filter((s) => !!s)
                                .map((s) => s[0].toUpperCase().toUpperCase())
                                .splice(0, 2)}
                            </Avatar>
                          );
                        })}
                    </MembersWrapper>
                  </MembersContainer>
                )}
              </FooterContainer>
            </Container>
          );
        }}
      </Draggable>
    </>
  );
};

export default Card;
