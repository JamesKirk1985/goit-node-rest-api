import express from "express";
import { validateBody } from "../helpers/validateBody.js";
import { validateObjectId } from "../helpers/validateObjectId.js";
import {
  createContactSchema,
  updateContactSchema,
  updateStatusContactSchema,
} from "../schemas/contactsSchemas.js";
import {
  getAllContacts,
  getOneContact,
  deleteContact,
  createContact,
  updateContact,
  updateStatusContact,
} from "../controllers/contactsControllers.js";

const contactsRouter = express.Router();

contactsRouter.get("/", getAllContacts);

contactsRouter.get("/:id", validateObjectId, getOneContact);

contactsRouter.delete("/:id", validateObjectId, deleteContact);

contactsRouter.post("/", validateBody(createContactSchema), createContact);

contactsRouter.put(
  "/:id",
  validateBody(updateContactSchema),
  validateObjectId,
  updateContact
);

contactsRouter.patch(
  "/:id/favorite",
  validateBody(updateStatusContactSchema),
  validateObjectId,
  updateStatusContact
);

export default contactsRouter;
