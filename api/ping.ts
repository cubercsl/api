import { ServerRequest } from "../deps.ts";

export default (req: ServerRequest) => {
  req.respond({
    status: 200,
    body: JSON.stringify({
      code: 0,
      message: "pong"
    })
  });
};
