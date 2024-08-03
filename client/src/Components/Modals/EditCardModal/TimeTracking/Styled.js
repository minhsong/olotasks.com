import styled from "styled-components";

export const Container = styled.div`
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
`;

export const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
`;

export const Title = styled.div`
  margin: 0;
  padding: 0.2rem 0rem 0rem 0rem;
  display: inline;
  color: black;
  font-size: 1rem;
  font-weight: 800;
`;

export const TimeTable = styled.div`
  border-top: 1px solid rgba(9, 30, 66, 0.13);
  display: gird;
  grid-template-columns: 1fr 1fr;
  margin-top: 0.5rem;
`;

export const TimeRow = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  border-bottom: 1px solid rgba(9, 30, 66, 0.13);
  padding: 0.5rem 0;
`;

export const TimeSum = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  padding: 0.5rem 0;
`;

export const TimeSumContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(9, 30, 66, 0.13);
  > div:nth-child(n + 2) {
    border-left: 1px solid rgba(9, 30, 66, 0.13);
    padding-left: 1rem;
  }
`;

export const ModelContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: white;
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 0 1px 0 rgba(9, 30, 66, 0.25);
  width: 680px;
  margin: 2rem auto;
`;

export const PopoverContainer = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  padding-bottom: 0.5rem;
  flex-direction: column;
  gap: 0.2rem;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const EditInput = styled.input`
  width: 100%;
  height: 2rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  padding-left: 0.5rem;
  outline: none;
  font-size: 0.875rem;
  background-color: #fff;
`;

export const CommentContent = styled.div`
  padding: 0.5rem;
  margin-bottom: 0.5em;
  text-align: right;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  svg {
    cursor: pointer;
    &:hover: {
      color: #0079bf;
    }
  }
`;
