import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContactFunc,
} from "../services/contactsServices.js";

export const getAllContacts = async (req, res) => {
  try {
    const contactList = await listContacts();
    res.status(200).json({
      data: { contactList },
    });
  } catch (e) {
    console.log(e.message);
  }
};

export const getOneContact = async (req, res) => {
  try {
    const contactId = req.params.id;
    const contact = await getContactById(contactId);
    if (contact) {
      res.status(200).json({
        data: contact,
      });
      return;
    }
    res.status(404).json({
      message: "Not found",
    });
  } catch (e) {
    console.log(e.message);
  }
};

export const deleteContact = async (req, res) => {
  try {
    const contactId = req.params.id;
    const deleteContact = await removeContact(contactId);
    if (deleteContact) {
      res.status(200).json({
        data: deleteContact,
      });
      return;
    }
    res.status(404).json({
      message: "Not found",
    });
  } catch (e) {
    console.log(e.message);
  }
};

export const createContact = async (req, res) => {
  const { name, email, phone } = req.body;
  const newContact = await addContact(name, email, phone);
  res.status(201).json({
    data: newContact,
  });
};

export const updateContact = async (req, res) => {
  const contactId = req.params.id;
  const body = req.body;
  if (Object.keys(body).length === 0) {
    res.status(400).json({ message: "Body must have at least one field" });
  }
  try {
    const updateContact = await updateContactFunc(contactId, body);
    if (!updateContact) {
      res.status(404).json({ message: "Not found" });
      return;
    }
    return res.status(200).json({ data: updateContact });
  } catch (e) {
    console.log(e.message);
  }
};
