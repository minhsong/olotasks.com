import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { login, requestResetPassword } from "../../Services/userService";
import Background from "../../Components/Background";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  BgContainer,
  Container,
  TrelloIconContainer,
  FormSection,
  FormCard,
  Form,
  Title,
  Input,
  Button,
  Icon,
  Hr,
  Link,
} from "./Styled";
import logo from "../../Images/trello-logo.svg";
import { openAlert } from "../../Redux/Slices/alertSlice";

const ForgotPassword = () => {
  let navigate = useNavigate();
  const dispatch = useDispatch();
  useEffect(() => {
    document.title = "Log in to Olo Tasks";
  }, []);

  const schema = yup.object().shape({
    email: yup.string().email().required("Email is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    requestResetPassword(data).then((res) => {
      if (res.data) {
        dispatch(
          openAlert({
            message: "Please check your email for password reset link",
            severity: "success",
            duration: 1500,
            nextRoute: "/login",
          })
        );
      } else {
        dispatch(
          openAlert({
            message: res.data.errMessage,
            severity: "error",
          })
        );
      }
    });
  };

  if (localStorage.getItem("token")) return <Navigate push to="/boards" />;
  return (
    <>
      <BgContainer>
        <Background />
      </BgContainer>
      <Container>
        <TrelloIconContainer onClick={() => navigate("/")}>
          <Icon src={logo} />
        </TrelloIconContainer>
        <FormSection>
          <FormCard>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Title>Forgot your password</Title>
              <Input
                type="email"
                placeholder="Enter email"
                required
                {...register("email")}
              />
              {errors.email && <span>{errors.email.message}</span>}
              <Button>Recovery password</Button>
              <Hr />
              <Link fontSize="0.85rem" onClick={() => navigate("/login")}>
                Login page
              </Link>
            </Form>
          </FormCard>
        </FormSection>
      </Container>
    </>
  );
};

export default ForgotPassword;
