import fs from 'fs';
import jwt from 'jsonwebtoken';

const privKey = fs.readFileSync(
  process.env.PRIVATE_PEM_FILE || './private.pem',
  'utf8'
);
const pubKey = fs.readFileSync(
  process.env.PUBLIC_PEM_FILE || './public.pem',
  'utf8'
);

export async function createJwt(username: String): Promise<string> {
  return jwt.sign({ username }, privKey, {
    algorithm: 'RS256',
  });
}

export async function verifyJwt(token: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    jwt.verify(
      token,
      pubKey,
      {
        algorithms: ['RS256'],
      },
      (err, decoded) => {
        if (err) {
          reject(err);
        } else {
          resolve(decoded.username);
        }
      }
    );
  });
}
