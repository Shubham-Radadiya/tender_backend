import { TenderParty } from ".";
import { UserModel, UserRole } from "../user/schema";
import { TenderPartyModel } from "./schema";

export const getTenderParty = async () => {
  const [users, parties] = await Promise.all([
    UserModel.find(
      { role: UserRole.COMPANY_MANAGER },
      { firstName: 1, email: 1, address: 1 }
    ).lean(),
    TenderPartyModel.find(
      { type: "party" },
      { name: 1, email: 1, address: 1, type: 1 }
    ).lean(),
  ]);

  const userList = users.map((user) => ({
    _id: user._id.toString(),
    name: user.firstName,
    email: user.email,
    address: user.address,
    type: "user",
  }));

  const partyList = parties.map((party) => ({
    _id: party._id.toString(),
    name: party.name,
    email: party.email,
    address: party.address,
    type: party.type || "party",
  }));

  const combined = [...userList, ...partyList];

  return {
    total: combined.length,
    data: combined,
  };
};
