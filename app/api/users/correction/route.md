/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';



// Process a batch of users
export async function POST(request: NextRequest) {
  try{
    const requestData = await request.json();
    const isBatch = Array.isArray(requestData);
    const usersData = isBatch ? requestData : [requestData];
    return usersData

  } catch (error: any) {
    console.error('Error processing batch data:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Error processing batch data' 
    }, { status: 500 });
  }
}