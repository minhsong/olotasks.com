import React, { useState } from "react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  login,
  RequestResetPassword,
  resetPassword,
} from "../../Services/userService";
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
  FormGroup,
  Error,
} from "./Styled";
import logo from "../../Images/trello-logo.svg";
import { openAlert } from "../../Redux/Slices/alertSlice";

const ResetPassword = () => {
  const params = useParams();
  let navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = params;
  useEffect(() => {
    document.title = "Log in to Olo Tasks";
  }, []);

  const schema = yup.object().shape({
    email: yup.string().email().required("Email is required"),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    resetPassword({ ...data, token }).then((res) => {
      if (res.data) {
        dispatch(
          openAlert({
            message: res.data.message,
            severity: "Password reset successfully",
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
              <FormGroup>
                <Input
                  type="email"
                  placeholder="Enter email"
                  required
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && <Error>{errors.email.message}</Error>}
              </FormGroup>
              <FormGroup>
                <Input
                  type="password"
                  placeholder="New Password"
                  required
                  {...register("password")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.password && <Error>{errors.password.message}</Error>}
              </FormGroup>
              <FormGroup>
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  required
                  {...register("confirmPassword")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.confirmPassword && (
                  <Error>{errors.confirmPassword.message}</Error>
                )}
              </FormGroup>
              <Button>Reset Password</Button>
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

export default ResetPassword;
