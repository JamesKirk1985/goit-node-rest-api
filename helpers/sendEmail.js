import "dotenv/config";
import nodemailer from "nodemailer";

const META_PASSWORD = process.env.META_PASSWORD;

const nodeMailerConfig = {
  host: "smtp.meta.ua",
  port: "465",
  secure: true,
  auth: {
    user: "VolodymyrShevch85@meta.ua",
    pass: META_PASSWORD,
  },
};

export const transport = nodemailer.createTransport(nodeMailerConfig);
