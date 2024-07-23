import * as React from "react";
import Modal from "@mui/material/Modal";
import Actions from "./Actions/Actions";
import Activity from "./Activity/Activity";
import AddToCard from "./AddToCard/AddToCard";
import Checklist from "./Checklist/Checklist";
import Description from "./Description/Description";
import Attachments from "./Attachments/Attachments";
import Features from "./Features/Features";
import Title from "./Title/Title";
import CardLoadingSvg from "../../../Images/cardLoading.svg";
import { getCard, uploadAttachment } from "../../../Services/cardService";
import { useSelector, useDispatch } from "react-redux";
import IconButton from "../../ReUsableComponents/IconButton";
import CoverIcon from "@mui/icons-material/TableChartOutlined";
import CloseIcon from "@mui/icons-material/Close";
import {
  Container,
  Wrapper,
  CoverContainer,
  MainContainer,
  TitleContainer,
  FeaturesContainer,
  DescriptionContainer,
  ChecklistContainer,
  ActivityContainer,
  RightContainer,
  AddToCardContainer,
  ActionsContainer,
  LoadingScreen,
  AttachmentContainer,
  CoverButtonWrapper,
  CloseIconWrapper,
  TimeTrackingContainer,
} from "./styled";
import TimeTracking from "./TimeTracking/TimeTracking";
import { isEmpty } from "lodash-es";

export default function EditCard(props) {
  const { cardId, boardId } = props.ids;
  const dispatch = useDispatch();
  const thisCard = useSelector((state) => state.card);
  const [isDragging, setIsDragging] = React.useState(false);
  const [bId, btitle] = boardId.split("-");
  const [cId, ctitle] = cardId.split("-");

  React.useEffect(() => {
    if (props.open) {
      getCard(cId, bId, dispatch);
    }
  }, [bId, cId, dispatch, props.open]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await uploadAttachment(cId, thisCard.owner, bId, files, dispatch);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <Modal
        open={props.open}
        onClose={props.callback}
        style={{ overflow: "auto" }}
      >
        <Container>
          <CoverContainer
            color={!thisCard.pending ? thisCard.cover?.color : null}
            thumbnail={!thisCard.pending ? thisCard.cover?.thumbnail : null}
          >
            <CoverButtonWrapper>
              <IconButton title="Cover" icon={<CoverIcon fontSize="small" />} />
            </CoverButtonWrapper>
          </CoverContainer>
          <TitleContainer>{!thisCard.pending && <Title />}</TitleContainer>
          <Wrapper
            isDragging={isDragging}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <MainContainer>
              {!thisCard.pending ? (
                <>
                  {(thisCard.members.length > 0 ||
                    thisCard.labels.length > 0 ||
                    thisCard.date?.startDate ||
                    thisCard.date?.dueDate) && (
                    <FeaturesContainer>
                      <Features />
                    </FeaturesContainer>
                  )}
                  <DescriptionContainer>
                    <Description />
                  </DescriptionContainer>
                  {thisCard.attachments.length > 0 && (
                    <AttachmentContainer>
                      <Attachments />
                    </AttachmentContainer>
                  )}
                  {thisCard.checklists?.length > 0 && (
                    <ChecklistContainer>
                      {thisCard.checklists?.map((list) => {
                        return <Checklist key={list._id} {...list} />;
                      })}
                    </ChecklistContainer>
                  )}

                  <TimeTrackingContainer>
                    <TimeTracking />
                  </TimeTrackingContainer>
                  <ActivityContainer>
                    <Activity />
                  </ActivityContainer>
                </>
              ) : (
                <LoadingScreen image={CardLoadingSvg} />
              )}
            </MainContainer>
            <RightContainer>
              <AddToCardContainer>
                <AddToCard />
              </AddToCardContainer>
              <ActionsContainer>
                <Actions closeModal={props.callback} />
              </ActionsContainer>
            </RightContainer>
          </Wrapper>
          <CloseIconWrapper onClick={props.callback}>
            <CloseIcon fontSize="small" color="black" />
          </CloseIconWrapper>
        </Container>
      </Modal>
    </div>
  );
}
