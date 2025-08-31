import {Response , Request } from "express";
import {JwtService} from "../services/jwt"
import jwt from "jsonwebtoken";
export class JwtController{
    private JwtService = new JwtService();
   
    async register (req : Request , res : Response ){
      try{
        const user = await this.JwtService.register(req.body);
       return  res.status(200).json({
            status : true,
            message :"User registered successfully",
            user: user
        });
    } catch(err:any){
      res.status(400).json({error : err.message});
    }
}

  async login(req: Request, res: Response) {
    try {
      const token = await this.JwtService.login(req.body.email, req.body.password);
       return  res.status(200).json({
            status : true,
            message :"User login  successfully",
            token : token 
        });
    } catch (err: any) {
      res.status(401).json({ error: err.message });
    }
  }

//   async profile(req: Request, res: Response) {
//     try {
//       const user = await this.JwtService.getProfile(req.id!); // added by middleware
//      return  res.status(201).json({
//             status : true,
//             message :"User login  successfully",
//             user : user 
//         });
//     } catch (err: any) {
//       res.status(401).json({ error: err.message });
//     }
//   }

async profile(req: Request, res: Response) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };

    const user = await this.JwtService.getProfile(decoded.id);

    return res.status(200).json({
      status: true,
      message: "User profile fetched successfully",
      user: user
    });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}
}