import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;

  .ql-container {
    min-height: 100px;
    padding-bottom: 30px;
    background-color: white;
  }
  .ql-toolbar {
    background-color: white;
  }
  .ql-toolbar:nth-child(n + 2) {
    display: none !important;
  }
`;
