import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 0.5rem;
  padding-bottom: 1rem;
`;

export const SearchArea = styled.input`
  width: 100%;
  height: 2rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  padding-left: 0.5rem;
  outline: none;
  background-color: rgba(0, 0, 0, 0.02);
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  &:focus {
    border: 2px solid #0079bf;
    background-color: #fff;
  }
`;

export const Title = styled.div`
  color: #5e6c84;
  margin-top: 0.3rem;
  font-size: 0.85rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const MemberWrapper = styled.div`
  width: 100%;
  background-color: transparent;
  border-radius: 3px;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  height: 2rem;
  align-items: center;
  padding: 0.5rem;
  position: relative;
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

export const IconWrapper = styled.div`
  width: fit-content;
  height: fit-content;
  position: absolute;
  right: 0.5rem;
  top: 0.5rem;
`;

export const MemberName = styled.div``;
