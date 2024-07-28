import { Avatar } from "@mui/material";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Container,
  LeftContainer,
  RightContainer,
  LogWrapper,
  Title,
  Date,
} from "./styled";
import { loadCardActivities } from "../../../../Services/cardService";
import CardLoadingSvg from "../../../../Images/cardLoading.svg";
import { LoadingScreen } from "../styled";

const ActivityLog = () => {
  const card = useSelector((state) => state.card);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (card.activities == undefined && !loading) {
      setLoading(true);
      loadCardActivities(card.boardId, card.cardId, dispatch).then((data) => {
        setLoading(false);
      });
    }
  }, [card.activities]);

  if (loading) {
    return (
      <Container>
        <LoadingScreen image={CardLoadingSvg} />
      </Container>
    );
  }
  return (
    <>
      {card.activities?.map((activity, index) => {
        if (!activity.isComment)
          return (
            <Container key={index}>
              <LeftContainer>
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: activity.color,
                    fontSize: "0.875rem",
                    fontWeight: "800",
                  }}
                >
                  {activity.userName[0].toUpperCase()}
                </Avatar>
              </LeftContainer>
              <RightContainer>
                <LogWrapper>
                  <Title>{activity.userName}</Title>{" "}
                  <span
                    dangerouslySetInnerHTML={{ __html: activity.text }}
                  ></span>
                </LogWrapper>
                <Date>
                  {moment(activity.date).format("MMMM Do YYYY, h:mm:ss a")}
                </Date>
              </RightContainer>
            </Container>
          );
        return undefined;
      })}
    </>
  );
};

export default ActivityLog;
