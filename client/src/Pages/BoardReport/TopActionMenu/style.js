import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  justify-content: space-between;
  height: 40px;
  padding: 0 15px;
  align-items: center;
  background-color: #ebecf0;
`;

export const TopLeftWrapper = styled.div`
  display: flex;
  gap: 10px;
`;

export const TopRightWrapper = styled.div`
  display: flex;
  gap: 10px;
  group: 1;
`;

export const Title = styled.div`
  color: #5e6c84;
  font-size: 0.85rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  align-items: center;
`;
