import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.PRODUCT_MEDIA_JWT_SECRET || "secret";

class DownloadAuthorizationService {
  validateToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET);
  }

  createToken(orderId: string, lineItemId: string, mediaId: string) {
    return jwt.sign(
      {
        orderId: orderId,
        lineItemId: lineItemId,
        mediaId: mediaId,
      },
      JWT_SECRET
    );
  }
}

export default DownloadAuthorizationService;
