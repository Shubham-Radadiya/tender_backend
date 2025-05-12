import { IUser } from "../modules/user";
import { UserRole } from "../modules/user/schema";
export const isUserProfileComplete = async (user: IUser) => {
  const commonFields = [
    user.firstName,
    user.lastName,
    user.dob,
    user.address,
    user.city,
    user.state,
    user.phoneNumber,
    user.profile
  ];

  if (commonFields.some(field => !field)) {
    return false;
  }

  if (user.role === UserRole.COMPANY_MANAGER) {
    const companyDetails = user.companyDetails;
    const companyFields = [
      companyDetails?.companyName,
      companyDetails?.businessEmail,
      companyDetails?.aadharNumber,
      companyDetails?.panNumber,
      companyDetails?.userName,
      companyDetails?.companyPhone,
      companyDetails?.gstUsername,
      companyDetails?.gstNumber,
      companyDetails?.ifscCode,
      companyDetails?.website,
      companyDetails?.annualTenderCap
    ];

    if (companyFields.some(field => !field)) {
      return false;
    }
  }

  return true;
}
