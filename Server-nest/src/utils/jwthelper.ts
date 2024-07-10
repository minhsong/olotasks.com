import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UserTokenPayload } from 'src/app/models/dto/user/user.tokenPayload';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

export const extractTokenFromHeader = (
  request: Request,
): string | undefined => {
  const [type, token] = request.headers.authorization?.split(' ') ?? [];
  return type === 'Bearer' ? token : undefined;
};

export const jwtDecode = async (token: string): Promise<UserTokenPayload> => {
  return await jwt.verify(token, process.env.JWT_SECRET);
};

export const jwtSign = async (
  payload: UserTokenPayload,
  options = {},
): Promise<string> => {
  const token = jwt
    .sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.TOKEN_EXPIRE_TIME,
      ...options,
    })
    .toString();

  return token;
};

export const generateToken = (id, email) => {
  const token = jwt.sign({ id, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRE_TIME,
  });
  return token.toString();
};

export const comparePasswords = async (
  enteredPassword: string,
  storedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compareSync(enteredPassword, storedPassword);
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);
  return hashedPassword;
};

// export const verifyToken = async (req, res, next) => {
//   try {
//     if (!req.headers['authorization'])
//       return res
//         .status(401)
//         .send({ errMessage: 'Authorization token not found!' });

//     const header = req.headers['authorization'];
//     const token = header.split(' ')[1];

//     await jwt.verify(
//       token,
//       process.env.JWT_SECRET,
//       async (err, verifiedToken) => {
//         if (err)
//           return res
//             .status(401)
//             .send({ errMessage: 'Authorization token invalid', details: err });
//         const user = await userModel.findById(verifiedToken.id);
//         req.user = user;
//         next();
//       },
//     );
//   } catch (error) {
//     return res.status(500).send({
//       errMesage: 'Internal server error occured!',
//       details: error.message,
//     });
//   }
// };
