import 'dotenv/config'
import { PrismaClient } from '../generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'

const adapter = new PrismaNeon({
    connectionString: process.env.DIRECT_URL!,
})
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🌱 Seeding database...')

    await prisma.user.createMany({
        data: [
            { id: 'EMP001', name: 'Anurag Thakur', email: 'anurag@empowertech.in', password: 'emp123', role: 'employee', dept: 'Engineering' },
            { id: 'EMP002', name: 'Priya Sharma', email: 'priya@empowertech.in', password: 'emp123', role: 'employee', dept: 'Finance' },
            { id: 'EMP003', name: 'Rahul Verma', email: 'rahul@empowertech.in', password: 'emp123', role: 'employee', dept: 'Operations' },
            { id: 'ADM001', name: 'Admin Kumar', email: 'admin@empowertech.in', password: 'admin123', role: 'admin', dept: 'IT Department' },
        ],
        skipDuplicates: true,
    })

    await prisma.ticket.createMany({
        data: [
            {
                id: 'TKT-1001', empId: 'EMP001', empName: 'Anurag Thakur', dept: 'Engineering',
                category: 'Password Reset', priority: 'High', status: 'Resolved',
                desc: 'Unable to login to VPN after password expiry.',
                resolution: 'Password reset via AD console.',
                createdAt: new Date('2026-04-18T09:12:00Z'),
                updatedAt: new Date('2026-04-18T09:45:00Z'),
            },
            {
                id: 'TKT-1002', empId: 'EMP002', empName: 'Priya Sharma', dept: 'Finance',
                category: 'Software Help', priority: 'Medium', status: 'In Progress',
                desc: 'Need MS Office 365 installed on new laptop.', resolution: '',
                createdAt: new Date('2026-04-19T11:30:00Z'),
                updatedAt: new Date('2026-04-20T10:00:00Z'),
            },
            {
                id: 'TKT-1003', empId: 'EMP003', empName: 'Rahul Verma', dept: 'Operations',
                category: 'Network Issue', priority: 'High', status: 'Open',
                desc: 'WiFi dropping every 30 minutes on floor 3.', resolution: '',
                createdAt: new Date('2026-04-20T08:55:00Z'),
                updatedAt: new Date('2026-04-20T08:55:00Z'),
            },
            {
                id: 'TKT-1004', empId: 'EMP001', empName: 'Anurag Thakur', dept: 'Engineering',
                category: 'Hardware Issue', priority: 'Low', status: 'Open',
                desc: 'Requesting a second monitor for workstation.', resolution: '',
                createdAt: new Date('2026-04-21T14:00:00Z'),
                updatedAt: new Date('2026-04-21T14:00:00Z'),
            },
            {
                id: 'TKT-1005', empId: 'EMP002', empName: 'Priya Sharma', dept: 'Finance',
                category: 'Access Permission', priority: 'Medium', status: 'Resolved',
                desc: 'Need access to shared Finance drive on server.',
                resolution: 'Permission granted by IT admin.',
                createdAt: new Date('2026-04-17T10:00:00Z'),
                updatedAt: new Date('2026-04-17T16:00:00Z'),
            },
            {
                id: 'TKT-1006', empId: 'EMP003', empName: 'Rahul Verma', dept: 'Operations',
                category: 'Email Issue', priority: 'High', status: 'In Progress',
                desc: 'Outlook not syncing emails since Monday morning.', resolution: '',
                createdAt: new Date('2026-04-21T09:30:00Z'),
                updatedAt: new Date('2026-04-22T08:00:00Z'),
            },
            {
                id: 'TKT-1007', empId: 'EMP001', empName: 'Anurag Thakur', dept: 'Engineering',
                category: 'Software Help', priority: 'High', status: 'Open',
                desc: 'VS Code crashes on startup after Windows update.', resolution: '',
                createdAt: new Date('2026-04-22T07:45:00Z'),
                updatedAt: new Date('2026-04-22T07:45:00Z'),
            },
        ],
        skipDuplicates: true,
    })

    console.log('✅ Seeding complete!')
}

main()
    .catch((e) => { console.error(e); process.exit(1) })
    .finally(async () => await prisma.$disconnect())