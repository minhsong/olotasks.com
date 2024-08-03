import React, { useEffect } from "react";
import ActivityIcon from "@mui/icons-material/MessageOutlined";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "@mui/material/Avatar";
import {
  ActionContainer,
  ActionWrapper,
  CommentTitle,
  Text,
  Date,
  CommentArea,
  Container,
  HeadWrapper,
  LoadingBox,
  HeadTitle,
  Wrapper,
  CardTitle,
} from "./styled";
import moment from "moment";
import CardLoadingSvg from "../../../Images/cardLoading.svg";
import { useParams } from "react-router-dom";
import { markAllAsRead } from "../../../Services/notificationService";
import AvatarIcon from "../../AvatarIcon";

const ActivitySection = () => {
  const [notifications, isLoading] = useSelector((state) => [
    state.notification.notifications,
    state.notification.isLoading,
  ]);
  const dispatch = useDispatch();
  useEffect(() => {
    // mark all notifications as read
    markAllAsRead(dispatch);
  }, [dispatch]);

  const Comment = (props) => {
    return (
      <ActionContainer
        to={`/b/${props.board.id}-${props.board.name}/${props.card.id}-${props.card.name}`}
      >
        <AvatarIcon id={props.sender.user} {...props.sender} />
        <ActionWrapper>
          <Text>
            <b style={{ fontSize: "0.875rem" }}>{props.sender.name}</b>{" "}
            {props.text} on <CardTitle>{props.card.name}</CardTitle>
          </Text>
          <Date>
            {moment(props.createdAt).calendar().indexOf("Today") === -1
              ? moment(props.createdAt).calendar()
              : moment(props.createdAt).fromNow()}
          </Date>
        </ActionWrapper>
      </ActionContainer>
    );
  };

  const Action = (props) => {
    return (
      <ActionContainer
        to={`/b/${props.board.id}-${props.board.name}/${props.card.id}-${props.card.name}`}
      >
        <AvatarIcon id={props.sender.user} {...props.sender} />

        <ActionWrapper>
          <Text>
            <b style={{ fontSize: "0.875rem" }}>{props.sender.name}</b>{" "}
            {props.text} on <CardTitle>{props.card.name}</CardTitle>
          </Text>
          <Date>
            {moment(props.createdAt).calendar().indexOf("Today") === -1
              ? moment(props.createdAt).calendar()
              : moment(props.createdAt).fromNow()}
          </Date>
        </ActionWrapper>
      </ActionContainer>
    );
  };

  return (
    <Container>
      <Wrapper>
        {isLoading ? (
          <LoadingBox image={CardLoadingSvg} />
        ) : (
          notifications.map((act) => {
            switch (act.type) {
              case "card.comment.add":
              case "card.comment.update":
                return <Comment key={act._id} {...act} />;
              default:
                return <Action key={act._id} {...act} />;
            }
          })
        )}
      </Wrapper>
    </Container>
  );
};

export default ActivitySection;
