import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const contactsPath = path.join(process.cwd(), "db/contacts.json");

export async function listContacts() {
  const contactList = await fs.readFile(contactsPath);
  return JSON.parse(contactList.toString());
}

export async function getContactById(contactId) {
  const contacts = await listContacts();
  const contact = contacts.find((item) => item.id === contactId);
  if (contact) {
    return contact;
  }
  return null;
}

export async function removeContact(contactId) {
  const contacts = await listContacts();
  const contact = contacts.find((item) => item.id === contactId);
  if (contact) {
    const filterContacts = contacts.filter((item) => item.id !== contactId);
    await fs.writeFile(contactsPath, JSON.stringify(filterContacts));
    return contact;
  }
  return null;
}

export async function addContact(name, email, phone) {
  const contacts = await listContacts();
  const contactObj = {
    id: crypto.randomUUID(),
    name,
    email,
    phone,
  };
  if (contacts.some((item) => item.name === contactObj.name)) {
    console.log("A contact with that name already exists");
    return;
  }
  const newContacts = [...contacts, contactObj];
  await fs.writeFile(contactsPath, JSON.stringify(newContacts));
  return contactObj;
}
export async function updateContactFunc(contactId, body) {
  const contacts = await listContacts();
  const contact = contacts.find((item) => item.id === contactId);
  const index = contacts.findIndex((item) => item.id === contactId);
  if (index < 0) {
    return null;
  }
  contacts[index] = { ...contact, ...body };
  await fs.writeFile(contactsPath, JSON.stringify(contacts));
  return { ...contact, ...body };
}
