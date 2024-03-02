import db from '../../models';
import bcryptjs from 'bcryptjs'
import { USER_ROLE, USER_STATUS } from '../config/constants/enum/auth';
import { Op } from 'sequelize';

export const run = ()=>{
    (async()=>{
        await createDefaultAdmin()
        await createDefaultStaff()
    })()
}

const createDefaultAdmin = async()=>{

    // check if any admin exist

    const admin = await db.users.findOne({
        where: {
            [Op.or]: [
                { role: USER_ROLE.ADMIN },
            ]
        }
    });

    if(admin){
        return null;
    }

    const hashPassword = bcryptjs.hashSync('8Weeksdev$', 8)

    await db.users.create({
        email: 'ovijoyapp@gmail.com',
        password: hashPassword,
        first_name: 'ovijoyapp',
        username: 'ovijoyapp',
        phone: '2348171498476',
        dob: '2022-09-27 18:00:00.000',
        gender: 'male',
        country: 'Nigeria',
        role: USER_ROLE.ADMIN,
        staffroleId: 1,
        status: USER_STATUS.ACTIVE
    })
}

const createDefaultStaff = async()=>{

    // check if any admin exist

    const staff = await db.users.findOne({
        where: {
            [Op.or]: [
                { role: USER_ROLE.STAFF },
            ]
        }
    });

    if(staff){
        return null;
    }

    const hashPassword = bcryptjs.hashSync('8Weeksdev$', 8)

    await db.users.create({
        email: 'ovijoyappstaff@gmail.com',
        password: hashPassword,
        first_name: 'ovijoyappstaff',
        username: 'ovijoyappstaff',
        phone: '2348171498476',
        dob: '2022-09-27 18:00:00.000',
        gender: 'female',
        country: 'Nigeria',
        role: USER_ROLE.STAFF,
        staffroleId: 2,
        status: USER_STATUS.ACTIVE
    })
}
