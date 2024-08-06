import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  height: fit-content;
  display: flex;
  padding-bottom: 0.5rem;
  flex-direction: column;
  gap: 0.2rem;
`;
export const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.3rem;
  width: 100%;
  height: fit-content;
`;
export const Colorbox = styled.div`
  box-sizing: border-box;
  cursor: pointer;
  flex: 5;
  height: 2rem;
  width: 100%;
  padding: 0rem 1rem 0rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  color: white;
  border-radius: 3px;
  background-color: ${(props) => props.bg};
  transition: 150ms ease-in;
  &:hover {
    box-shadow: -5px 0 ${(props) => props.hbg};
  }
`;
export const ColorText = styled.div`
  font-size: 0.875rem;
  color: white;
  font-weight: 800;
`;

export const SearchArea = styled.input`
  width: 100%;
  height: 2rem;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  padding-left: 0.5rem;
  outline: none;
  font-size: 0.875rem;
  background-color: rgba(0, 0, 0, 0.02);
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  &:focus {
    border: 2px solid #0079bf;
    background-color: #fff;
  }

  &[aria-invalid="false"] {
    border: 2px solid red;
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

export const SmallColorBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2rem;
  width: 23%;
  color: white;
  border-radius: 3px;
  background-color: ${(props) => props.bg};
  cursor: pointer;
  transition: 150ms ease-in;
  &:hover {
    background-color: ${(props) => props.hbg};
  }
`;
