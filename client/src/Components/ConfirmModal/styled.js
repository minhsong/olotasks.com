import styled from "styled-components";

export const Container = styled.div`
  outline: none;
  box-sizing: border-box;
  background-color: #f4f5f7;
  border-radius: 3px;
  width: 768px;
  min-height: 97vh;
  height: fit-content;
  margin: 3rem auto 5rem auto;
  padding: 0.5rem 0rem 1rem 0.25rem;
  position: relative;
  * {
    font-size: 14px;
  }
`;

export const Content = styled.div`
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Title = styled.h2`
  color: #5e6c84;
  font-size: 1.5rem;
  padding: 1rem;
`;
