import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import prisma from "./prisma";

// Extend the Session type to include the 'id' property
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      provider?: string;
      organizationName?: string | null;
      positionEn?: string | null;
      positionAr?: string | null;
      departmentEn?: string | null;
      departmentAr?: string | null;
      divisionName?: string | null;
      unitName?: string | null;
      gradeInternal?: string | null;
      gradeOfficial?: number | null;
      locationName?: string | null;
      typeName?: string | null;
      nationalityEn?: string | null;
      nationalityAr?: string | null;
      genderEn?: string | null;
      genderAr?: string | null;
      statusEn?: string | null;
      statusAr?: string | null;
      entityName?: string | null;
      budgetName?: string | null;
      statusName?: string | null;
      employeeCategory?: string | null;



registerName?: string | null;
statusId?: string | null;
expectedStartDate?: Date | null;
actualStartDate?: Date | null;
probationEndDate?: Date | null;
terminationDate?: Date | null;
terminationReason?: string | null;
resignationType?: string | null;
dateOfBirth?: Date | null;
idName?: string | null;
idNameAr?: string | null;
firstName?: string | null;
lastName?: string | null;
firstNameAr?: string | null;
lastNameAr?: string | null;
organizationId?: string | null;
entityId?: string | null;
budgetId?: string | null;
departmentId?: string | null;
divisionId?: string | null;
unitId?: string | null;
positionId?: string | null;
gradeId?: string | null;
locationId?: string | null;
directManagerCode?: string | null;
directManagerName?: string | null;
managerId?: string | null;
contractTypeId?: string | null;
nationalityId?: string | null;
genderId?: string | null;
maritalStatusId?: string | null;
password?: string | null;
personalPhoneNumber1?: string | null;
corporatePhoneNumber?: string | null;
idNumber?: string | null;
idPlaceOfIssue?: string | null;
idAddress?: string | null;
idAddressAr?: string | null;
idZoneOfResidence?: string | null;
placeOfBirth?: string | null;
companyId?: string | null;
cleared?: string | null;
disabilityType?: string | null;
sourceId?: number | null;
insertionDate?: Date | null;
    };
  }
}

// Define the UserAuth type if it is not imported
// interface UserAuth {

//   token: string;

// }

// Auth options configuration that can be imported elsewhere in the application
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID || "",
      clientSecret: process.env.APPLE_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // First find the user by email
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: credentials.email },
                { corporatePhoneNumber: `2${credentials.email}` },
                { corporatePhoneNumber: `20${credentials.email}` },

                { employeeCode: credentials.email },
              ],
            },
            include: { auth: true },
          });

          if (!user || !user.auth || user.auth.length === 0) {
            console.log("User not found or no auth record");
            return null;
          }

          // Check if password matches - in a production app, you'd compare hashed passwords
          // const auth = user.auth.filter((auth) => auth.token && auth.token === credentials.password);
          const auth = await prisma.auth.findFirst({
            where: {
              employeeCode: user.employeeCode,
              token: credentials.password,
            },
          });
          if (auth) {
            return {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              email: user.email,
              provider: "credentials",
            };
          }

          console.log("Password did not match");
          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google accounts, check if user exists in the database
      if (account?.provider === "google") {
        const u = await prisma.user.findUnique({
          where: { email: user.email || "" },
        });
        if (u) {
          return true;
        }
        return false;
      }

      // For credentials, we've already checked in the authorize function
      if (account?.provider === "credentials") {
        return true;
      }

      return false;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }

        // Add the provider to the session
        if (token.provider) {
          const user = await prisma.user.findUnique({
            where: { email: session.user.email || "" },
            // include: { auth: true }
            select: {
              id: true,
              employeeCode: true,
              employeeCategory: true,
              registerName: true,
              statusId: true,
              expectedStartDate: true,
              actualStartDate: true,
              probationEndDate: true,
              terminationDate: true,
              terminationReason: true,
              resignationType: true,
              dateOfBirth: true,
              idName: true,
              idNameAr: true,
              firstName: true,
              lastName: true,
              firstNameAr: true,
              lastNameAr: true,
              organizationId: true,
              entityId: true,
              budgetId: true,
              departmentId: true,
              divisionId: true,
              unitId: true,
              positionId: true,
              gradeId: true,
              locationId: true,
              directManagerCode: true,
              directManagerName: true,
              managerId: true,
              contractTypeId: true,
              nationalityId: true,
              genderId: true,
              maritalStatusId: true,
              password: true,
              personalPhoneNumber1: true,
              corporatePhoneNumber: true,
              idNumber: true,
              idPlaceOfIssue: true,
              idAddress: true,
              idAddressAr: true,
              idZoneOfResidence: true,
              placeOfBirth: true,
              companyId: true,
              cleared: true,
              disabilityType: true,
              sourceId: true,
              insertionDate: true,
              organization: { select: { name: true } },
              position: { select: { positionEn: true, positionAr: true } },
              department: {
                select: { departmentEn: true, departmentAr: true },
              },
              division: { select: { divisionName: true } },
              unit: { select: { unitName: true } },
              grade: { select: { gradeInternal: true, gradeOfficial: true } },
              location: { select: { locationName: true } },
              contractType: { select: { typeName: true } },
              nationality: {
                select: { nationalityEn: true, nationalityAr: true },
              },
              gender: { select: { genderEn: true, genderAr: true } },
              maritalStatus: { select: { statusEn: true, statusAr: true } },
              entity: { select: { entityName: true } },
              budget: { select: { budgetName: true } },
              status: { select: { statusName: true } },
            },
          });

          session.user = {
            ...session.user,
      

            organizationName: user?.organization?.name || "",
            positionEn: user?.position?.positionEn || "",
            positionAr: user?.position?.positionAr || "",
            departmentEn: user?.department?.departmentEn || "",
            departmentAr: user?.department?.departmentAr || "",
            divisionName: user?.division?.divisionName || "",
            unitName: user?.unit?.unitName || "",
            gradeInternal: user?.grade?.gradeInternal || "",
            gradeOfficial: user?.grade?.gradeOfficial || 0,
            locationName: user?.location?.locationName || "",
            typeName: user?.contractType?.typeName || "",
            nationalityEn: user?.nationality?.nationalityEn || "",
            nationalityAr: user?.nationality?.nationalityAr || "",
            genderEn: user?.gender?.genderEn || "",
            genderAr: user?.gender?.genderAr || "",
            statusEn: user?.maritalStatus?.statusEn || "",
            statusAr: user?.maritalStatus?.statusAr || "",
            entityName: user?.entity?.entityName || "",
            budgetName: user?.budget?.budgetName || "",
            statusName: user?.status?.statusName || "",

            employeeCategory: user?.employeeCategory,
              registerName: user?.registerName,
              statusId: user?.statusId,
              expectedStartDate: user?.expectedStartDate,
              actualStartDate: user?.actualStartDate,
              probationEndDate: user?.probationEndDate,
              terminationDate: user?.terminationDate,
              terminationReason: user?.terminationReason,
              resignationType: user?.resignationType,
              dateOfBirth: user?.dateOfBirth,
              idName: user?.idName,
              idNameAr: user?.idNameAr,
              firstName: user?.firstName,
              lastName: user?.lastName,
              firstNameAr: user?.firstNameAr,
              lastNameAr: user?.lastNameAr,
              organizationId: user?.organizationId,
              entityId: user?.entityId,
              budgetId: user?.budgetId,
              departmentId: user?.departmentId,
              divisionId: user?.divisionId,
              unitId: user?.unitId,
              positionId: user?.positionId,
              gradeId: user?.gradeId,
              locationId: user?.locationId,
              directManagerCode: user?.directManagerCode,
              directManagerName: user?.directManagerName,
              managerId: user?.managerId,
              contractTypeId: user?.contractTypeId,
              nationalityId: user?.nationalityId,
              genderId: user?.genderId,
              maritalStatusId: user?.maritalStatusId,
              password: user?.password,
              personalPhoneNumber1: user?.personalPhoneNumber1,
              corporatePhoneNumber: user?.corporatePhoneNumber,
              idNumber: user?.idNumber,
              idPlaceOfIssue: user?.idPlaceOfIssue,
              idAddress: user?.idAddress,
              idAddressAr: user?.idAddressAr,
              idZoneOfResidence: user?.idZoneOfResidence,
              placeOfBirth: user?.placeOfBirth,
              companyId: user?.companyId,
              cleared: user?.cleared,
              disabilityType: user?.disabilityType,
              sourceId: user?.sourceId,
              insertionDate: user?.insertionDate,

            
          };

          // session.user.name = user?.idName || `${user?.firstName} ${user?.lastName}` || null;
          // session.user.position = user?.positionId || null;
          session.user.provider = token.provider as string;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }

      // Store the provider in the token
      if (account) {
        token.provider = account.provider;
      }

      return token;
    },
  },
  session: {
    strategy: "jwt", // Use JWT tokens
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login/error",
  },
};
