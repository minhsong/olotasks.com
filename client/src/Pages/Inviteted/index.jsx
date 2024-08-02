import React, { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import Background from "../../Components/Background";
import { completeInvite, loadUser, register } from "../../Services/userService";
import { useDispatch, useSelector } from "react-redux";
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
  Text,
  Icon,
  Hr,
  Link,
} from "./Styled";
import { useEffect } from "react";
import logo from "../../Images/trello-logo.svg";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { openAlert } from "../../Redux/Slices/alertSlice";
import { loginSuccess } from "../../Redux/Slices/userSlice";
import setBearer from "../../Utils/setBearer";
import { Error } from "../ResetPassword/Styled";

const schema = yup.object().shape({
  name: yup.string().required("Name is required"),
  surname: yup.string().required("Surname is required"),
  email: yup.string().email().required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  repassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match"),
});

const Invitied = () => {
  let nvaigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParames] = useSearchParams();
  const [pending, setPending] = useState(false);
  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: searchParames.get("email"),
      token: searchParames.get("token"),
    },
  });

  useEffect(() => {
    document.title = "Create a Olo Tasks Account";
  }, []);

  const onSubmit = async (data) => {
    completeInvite(data)
      .then((res) => {
        const { token, message } = res.data;
        localStorage.setItem("token", token);
        loadUser(dispatch);
        dispatch(
          openAlert({
            message,
            severity: "success",
            duration: 1500,
            nextRoute: "/boards",
          })
        );
      })
      .catch((error) => {
        dispatch(
          openAlert({
            message: error?.response?.data?.errMessage
              ? error.response.data.errMessage
              : error.message,
            severity: "error",
          })
        );
      });
  };

  if (localStorage.getItem("token")) return <Navigate push to="/boards" />;

  return (
    <>
      <BgContainer>
        <Background />
      </BgContainer>
      <Container>
        <TrelloIconContainer onClick={() => nvaigate("/")}>
          <Icon src={logo} />
        </TrelloIconContainer>
        <FormSection>
          <FormCard>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Title>Sign up for your account</Title>
              <Input
                type="text"
                placeholder="Enter name"
                required
                {...register("name")}
              />
              {errors.name && <Error>{errors.name.message}</Error>}
              <Input
                type="text"
                placeholder="Enter surname"
                required
                {...register("surname")}
              />
              {errors.surname && <Error>{errors.surname.message}</Error>}
              <Input
                type="email"
                placeholder="Enter email"
                required
                disabled
                readOnly
                value={searchParames.get("email")}
              />
              {errors.email && <Error>{errors.email.message}</Error>}
              <Input
                type="password"
                placeholder="Enter password"
                required
                {...register("password")}
              />
              {errors.password && <Error>{errors.password.message}</Error>}
              <Input
                type="password"
                placeholder="Confirm password"
                required
                {...register("repassword")}
              />
              {errors.repassword && <Error>{errors.repassword.message}</Error>}
              <Text>
                By signing up, you confirm that you've read and accepted our{" "}
                <Link fontSize="0.75rem">Terms of Service</Link> and{" "}
                <Link fontSize="0.75rem">Privacy Policy</Link>.
              </Text>
              <Button type="submit" disabled={pending}>
                Complete
              </Button>
              <Hr />
              <Link fontSize="0.85rem" onClick={() => nvaigate("/login")}>
                Already have an account? Log In
              </Link>
            </Form>
          </FormCard>
        </FormSection>
      </Container>
    </>
  );
};

export default Invitied;
