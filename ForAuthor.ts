import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.ts';

export const getProjectsByAuthorId = async ({ params }: { params: { id: string } }) => {
    const { id } = params;
    try {
        // Get projects where the user is the author
        const authorProjects = await prisma.project.findMany({
            where: { authorId: id },
            include: {
                subtasks: true,
                author: true,
                members: {
                    include: {
                        user: true,
                    },
                },
                projectResources: true,
            },
        });

        if (!authorProjects || authorProjects.length === 0) {
            return NextResponse.json([], { status: 200 }); // Return empty array instead of error
        }

        return NextResponse.json(authorProjects);
    } catch (error) {
        console.error('Error in getProjectsByAuthorId:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
};