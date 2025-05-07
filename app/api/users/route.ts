/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper function to parse Excel date value
const parseExcelDate = (excelDate: number): Date | null => {
  if (!excelDate) return null;
  // Excel dates start from December 30, 1899
  const startDate = new Date(1899, 11, 30);
  const resultDate = new Date(startDate);
  resultDate.setDate(startDate.getDate() + excelDate);
  return resultDate;
};

// Process a batch of users
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    const isBatch = Array.isArray(requestData);
    const usersData = isBatch ? requestData : [requestData];

    // Create lookup maps for all reference data to avoid redundant upsert operations
    const uniqueModels = {
      statuses: new Set<string>(),
      entities: new Set<string>(),
      budgets: new Set<string>(),
      departments: new Map<string, string | null>(),
      divisions: new Set<string>(),
      units: new Set<string>(),
      positions: new Map<string, string | null>(),
      grades: new Map<number, string | null>(),
      locations: new Set<string>(),
      contractTypes: new Set<string>(),
      nationalities: new Map<string, string | null>(),
      genders: new Map<string, string | null>(),
      maritalStatuses: new Map<string, string | null>(),
    };

    // Extract unique values for each reference table
    for (const userData of usersData) {
      if (userData.status) uniqueModels.statuses.add(userData.status);
      if (userData.entity) uniqueModels.entities.add(userData.entity);
      if (userData.budget) uniqueModels.budgets.add(userData.budget);
      if (userData.department) uniqueModels.departments.set(userData.department, userData.departmentAr || null);
      if (userData.division) uniqueModels.divisions.add(userData.division);
      if (userData.unit) uniqueModels.units.add(userData.unit);
      if (userData.position) uniqueModels.positions.set(userData.position, userData.positionAr || null);
      if (userData.gradeOfficial) uniqueModels.grades.set(Number(userData.gradeOfficial), userData.gradeInternal || null);
      if (userData.location) uniqueModels.locations.add(userData.location);
      if (userData.contractType) uniqueModels.contractTypes.add(userData.contractType);
      if (userData.nationality) uniqueModels.nationalities.set(userData.nationality, userData.nationalityAr || null);
      if (userData.gender) uniqueModels.genders.set(userData.gender, userData.genderAr || null);
      if (userData.maritalStatus) uniqueModels.maritalStatuses.set(userData.maritalStatus, userData.maritalStatusAr || null);
    }

    // Batch upsert all reference data in parallel
    const [
      statusesMap,
      entitiesMap,
      budgetsMap,
      departmentsMap,
      divisionsMap,
      unitsMap,
      positionsMap,
      gradesMap,
      locationsMap,
      contractTypesMap,
      nationalitiesMap,
      gendersMap,
      maritalStatusesMap
    ] = await Promise.all([
      // Status
      Promise.all(
        Array.from(uniqueModels.statuses).map(async (statusName) => {
          const status = await prisma.status.upsert({
            where: { statusName },
            update: {},
            create: { statusName },
          });
          return [statusName, status] as [string, any];
        })
      ).then(entries => Object.fromEntries(entries)),

      // Entity
      Promise.all(
        Array.from(uniqueModels.entities).map(async (entityName) => {
          const entity = await prisma.entity.upsert({
            where: { entityName },
            update: {},
            create: { entityName },
          });
          return [entityName, entity] as [string, any];
        })
      ).then(entries => Object.fromEntries(entries)),

      // Budget
      Promise.all(
        Array.from(uniqueModels.budgets).map(async (budgetName) => {
          const budget = await prisma.budget.upsert({
            where: { budgetName },
            update: {},
            create: { budgetName },
          });
          return [budgetName, budget] as [string, any];
        })
      ).then(entries => Object.fromEntries(entries)),

      // Department
      Promise.all(
        Array.from(uniqueModels.departments.entries()).map(async ([departmentEn, departmentAr]) => {
          const department = await prisma.department.upsert({
            where: { departmentEn },
            update: { departmentAr },
            create: { departmentEn, departmentAr },
          });
          return [departmentEn, department] as [string, any];
        })
      ).then(entries => Object.fromEntries(entries)),

      // Division
      Promise.all(
        Array.from(uniqueModels.divisions).map(async (divisionName) => {
          const division = await prisma.division.upsert({
            where: { divisionName },
            update: {},
            create: { divisionName },
          });
          return [divisionName, division] as [string, any];
        })
      ).then(entries => Object.fromEntries(entries)),

      // Unit
      Promise.all(
        Array.from(uniqueModels.units).map(async (unitName) => {
          const unit = await prisma.unit.upsert({
            where: { unitName },
            update: {},
            create: { unitName },
          });
          return [unitName, unit] as [string, any];
        })
      ).then(entries => Object.fromEntries(entries)),

      // Position
      Promise.all(
        Array.from(uniqueModels.positions.entries()).map(async ([positionEn, positionAr]) => {
          const position = await prisma.position.upsert({
            where: { positionEn },
            update: { positionAr },
            create: { positionEn, positionAr },
          });
          return [positionEn, position] as [string, any];
        })
      ).then(entries => Object.fromEntries(entries)),

      // Grade
      Promise.all(
        Array.from(uniqueModels.grades.entries()).map(async ([gradeOfficial, gradeInternal]) => {
          const grade = await prisma.grade.upsert({
            where: { gradeOfficial },
            update: { gradeInternal },
            create: { gradeOfficial, gradeInternal },
          });
          return [gradeOfficial, grade] as [number, any];
        })
      ).then(entries => Object.fromEntries(entries)),

      // Location
      Promise.all(
        Array.from(uniqueModels.locations).map(async (locationName) => {
          const location = await prisma.location.upsert({
            where: { locationName },
            update: {},
            create: { locationName },
          });
          return [locationName, location] as [string, any];
        })
      ).then(entries => Object.fromEntries(entries)),

      // ContractType
      Promise.all(
        Array.from(uniqueModels.contractTypes).map(async (typeName) => {
          const contractType = await prisma.contractType.upsert({
            where: { typeName },
            update: {},
            create: { typeName },
          });
          return [typeName, contractType] as [string, any];
        })
      ).then(entries => Object.fromEntries(entries)),

      // Nationality
      Promise.all(
        Array.from(uniqueModels.nationalities.entries()).map(async ([nationalityEn, nationalityAr]) => {
          const nationality = await prisma.nationality.upsert({
            where: { nationalityEn },
            update: { nationalityAr },
            create: { nationalityEn, nationalityAr },
          });
          return [nationalityEn, nationality] as [string, any];
        })
      ).then(entries => Object.fromEntries(entries)),

      // Gender
      Promise.all(
        Array.from(uniqueModels.genders.entries()).map(async ([genderEn, genderAr]) => {
          const gender = await prisma.gender.upsert({
            where: { genderEn },
            update: { genderAr },
            create: { genderEn, genderAr },
          });
          return [genderEn, gender] as [string, any];
        })
      ).then(entries => Object.fromEntries(entries)),

      // MaritalStatus
      Promise.all(
        Array.from(uniqueModels.maritalStatuses.entries()).map(async ([statusEn, statusAr]) => {
          const maritalStatus = await prisma.maritalStatus.upsert({
            where: { statusEn },
            update: { statusAr },
            create: { statusEn, statusAr },
          });
          return [statusEn, maritalStatus] as [string, any];
        })
      ).then(entries => Object.fromEntries(entries)),
    ]);

    // Process each user with the pre-created reference data
    const results = await Promise.all(
      usersData.map(async (userData) => {
        try {
          // Process dates
          const expectedStartDate = userData.expectedStartDate ? parseExcelDate(Number(userData.expectedStartDate)) : null;
          const actualStartDate = userData.actualStartDate ? parseExcelDate(Number(userData.actualStartDate)) : null;
          const probationEndDate = userData.probationEndDate ? parseExcelDate(Number(userData.probationEndDate)) : null;
          const dateOfBirth = userData.dateOfBirth ? parseExcelDate(Number(userData.dateOfBirth)) : null;
          const terminationDate = userData["termination/ResignationDate"] ? 
            parseExcelDate(Number(userData["termination/ResignationDate"])) : null;
          const terminationReason = userData["termination/ResignationReason"] || null;

          // Get the IDs from our pre-created entities
          const statusId = userData.status ? statusesMap[userData.status]?.id : null;
          const entityId = userData.entity ? entitiesMap[userData.entity]?.id : null;
          const budgetId = userData.budget ? budgetsMap[userData.budget]?.id : null;
          const departmentId = userData.department ? departmentsMap[userData.department]?.id : null;
          const divisionId = userData.division ? divisionsMap[userData.division]?.id : null;
          const unitId = userData.unit ? unitsMap[userData.unit]?.id : null;
          const positionId = userData.position ? positionsMap[userData.position]?.id : null;
          const gradeId = userData.gradeOfficial ? gradesMap[Number(userData.gradeOfficial)]?.id : null;
          const locationId = userData.location ? locationsMap[userData.location]?.id : null;
          const contractTypeId = userData.contractType ? contractTypesMap[userData.contractType]?.id : null;
          const nationalityId = userData.nationality ? nationalitiesMap[userData.nationality]?.id : null;
          const genderId = userData.gender ? gendersMap[userData.gender]?.id : null;
          const maritalStatusId = userData.maritalStatus ? maritalStatusesMap[userData.maritalStatus]?.id : null;

          // Create or update the user
        await prisma.user.upsert({
            where: { 
              employeeCode: userData.employeeCode 
            },
            update: {
              employeeCategory: userData.employeeCategory || null,
              registerName: userData.registername || null,
              statusId,
              expectedStartDate,
              actualStartDate,
              probationEndDate,
              terminationDate,
              terminationReason,
              resignationType: userData.resignationType || null,
              dateOfBirth,
              idName: userData.idName || null,
              idNameAr: userData.idNameAr || null,
              firstName: userData.firstName || null,
              lastName: userData.lastName || null,
              firstNameAr: userData.firstNameAr || null,
              lastNameAr: userData.lastNameAr || null,
              entityId,
              budgetId,
              departmentId,
              divisionId,
              unitId,
              positionId,
              gradeId,
              locationId,
              directManagerCode: userData.directManagerCode || null,
              directManagerName: userData.directManagerName || null,
              contractTypeId,
              nationalityId,
              genderId,
              maritalStatusId,
              email: userData.email,
              personalPhoneNumber1: userData.personalPhoneNumber1 || null,
              corporatePhoneNumber: userData.corporatePhoneNumber || null,
              idNumber: userData.idNumber || null,
              idPlaceOfIssue: userData.idPlaceOfIssueEn || null,
              idAddress: null,
              idAddressAr: userData.idAddressAr || null,
              idZoneOfResidence: userData.idZoneOfResidence || null,
              placeOfBirth: userData.placeOfBirthEn || null,
              companyId: userData.companyId || null,
              cleared: userData.cleared || null,
              disabilityType: userData.disabilityType || null,
              sourceId: userData.sourceid ? Number(userData.sourceid) : null,
              updateDate: new Date(),
            },
            create: {
              employeeCode: userData.employeeCode,
              employeeCategory: userData.employeeCategory || null,
              registerName: userData.registername || null,
              statusId,
              expectedStartDate,
              actualStartDate,
              probationEndDate,
              terminationDate,
              terminationReason,
              resignationType: userData.resignationType || null,
              dateOfBirth,
              idName: userData.idName || null,
              idNameAr: userData.idNameAr || null,
              firstName: userData.firstName || null,
              lastName: userData.lastName || null,
              firstNameAr: userData.firstNameAr || null,
              lastNameAr: userData.lastNameAr || null,
              entityId,
              budgetId,
              departmentId,
              divisionId,
              unitId,
              positionId,
              gradeId,
              locationId,
              directManagerCode: userData.directManagerCode || null,
              directManagerName: userData.directManagerName || null,
              contractTypeId,
              nationalityId,
              genderId,
              maritalStatusId,
              email: userData.email,
              password: null, // Password will be set separately via another flow
              personalPhoneNumber1: userData.personalPhoneNumber1 || null,
              corporatePhoneNumber: userData.corporatePhoneNumber || null,
              idNumber: userData.idNumber || null,
              idPlaceOfIssue: userData.idPlaceOfIssueEn || null,
              idAddress: null,
              idAddressAr: userData.idAddressAr || null,
              idZoneOfResidence: userData.idZoneOfResidence || null,
              placeOfBirth: userData.placeOfBirthEn || null,
              companyId: userData.companyId || null,
              cleared: userData.cleared || null,
              disabilityType: userData.disabilityType || null,
              sourceId: userData.sourceid ? Number(userData.sourceid) : null,
              insertionDate: new Date(),
              updateDate: new Date(),
            }
          });

          return { success: true, userData: { employeeCode: userData.employeeCode } };
        } catch (error: any) {
          console.error(`Error processing user with code ${userData.employeeCode}:`, error);
          return { 
            success: false, 
            error: error.message || 'Error processing user data',
            userData: { employeeCode: userData.employeeCode }
          };
        }
      })
    );

    // If this was a single user request, return just that result
    if (!isBatch) {
      const result = results[0];
      return NextResponse.json(result, { status: result.success ? 200 : 500 });
    }

    // For batch requests, return all results
    return NextResponse.json({ 
      success: true, 
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      }
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error processing batch data:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error processing batch data' 
    }, { status: 500 });
  }
}