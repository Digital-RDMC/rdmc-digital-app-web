/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from "./emailService"
import { sendSms } from "./smsService"
import prisma from '@/lib/prisma';



// Process a batch of users
export async function POST(request: NextRequest) {
    const body = await request.json();
    const { email } = body;
    // console.log("body", body);
    // console.log("email", email);
    
    try {
        const user = await prisma.user.findFirst({
        where: {
            OR: [
            { email: email },
            { corporatePhoneNumber: `2${email}` },
            { corporatePhoneNumber: `20${email}` },
    
            
            { employeeCode: email }
            ]
        },
        });
        if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Generate a random 6-digit token
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const updateAuth = await prisma.auth.upsert({
            where: {  employeeCode: user.employeeCode },
            update: { token: token },
            create: { userId: user.id, token: token, employeeCode: user.employeeCode },
        })

        if (!updateAuth) {
            console.error('Failed to update token for user:', user.id);
            return NextResponse.json({ error: 'Failed to update token' }, { status: 500 });
        }

        await sendEmail(user.email, token);
        if(user.corporatePhoneNumber ) {
            await sendSms(user.corporatePhoneNumber, `${token} is your RDMC Portal verification code.`)
        }
      
        return NextResponse.json({ message: 'User found' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}