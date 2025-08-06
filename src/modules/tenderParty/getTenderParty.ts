import { TenderParty } from ".";
import { UserModel } from "../user/schema";
import { TenderPartyModel } from "./schema";

export const getTenderParty = async () => {
  const [users, parties] = await Promise.all([
    UserModel.find({}, { firstName: 1, email: 1, address: 1 }).lean(),
    TenderPartyModel.find({}, { name: 1, email: 1, address: 1 }).lean(),
  ]);

  const userList = users.map((user) => ({
    name: user.firstName,
    email: user.email,
    address: user.address,
    type: "user",
  }));

  const partyList = parties.map((party) => ({
    name: party.name,
    email: party.email,
    address: party.address,
    type: "party",
  }));

  const combined = [...userList, ...partyList];

  return {
    total: combined.length,
    data: combined,
  };
};
