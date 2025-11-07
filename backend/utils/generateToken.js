import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  const token = jwt.sign(
    { id: userId }, // Payload: We sign the user's ID
    process.env.JWT_SECRET, // Secret from .env
    {
      expiresIn: "30d", // Token expires in 30 days
    }
  );

  return token;
};

export default generateToken;