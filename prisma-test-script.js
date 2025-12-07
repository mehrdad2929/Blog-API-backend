const prisma = require('./db/prisma');
//TODO: lets test some here before going to controller
async function main() {
    const user = await prisma.user.create({
        data: {
            username: 'naghi69',
            password: 'naghis_hashed_password',
            email: 'naghi@mamoli.com',
            name: 'naghi mamoli'
        }
    })
    console.log('created user:', user)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
