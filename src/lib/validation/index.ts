import * as z from "zod"


export const SignupValidation = z.object({
      name: z.string().min(3, {message:'Nome curto demais'}),
      username: z.string().min(2, {message:'Usuario curto demais'}),
      email: z.string().email(),
      password: z.string().min(8, {message:'Senha curta demais'})
})

export const SigninValidation = z.object({
      email: z.string().email(),
      password: z.string().min(8, {message:'Senha curta demais'})
})

export const PostValidation = z.object({
     caption: z.string().min(0).max(2200),
     file: z.custom<File[]>(),
     location: z.string().min(0).max(100,),
     tags: z.string(),
})