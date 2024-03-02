import db from "../../models";

export const generateOtp = async (length: number)=>{
    var n = length;
    var add = 1, max = 12 - add;   // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   
        
        if ( n > max ) {
                return generateOtp(max) + generateOtp(n - max);
        }
        
        max        = Math.pow(10, n+add);
        var min    = max/10; // Math.pow(10, n) basically
        var number = Math.floor( Math.random() * (max - min + 1) ) + min;
        
    return ("" + number).substring(add); 
}

export const upgradeUserToAccessGiveaway = async (user: any)=>{
    if(user.can_access_giveaway != null){
        return null;
    }
    
    const __referred_user = await db.users.findAll({
        where: {
            refer_by_username: user.username
        }
    })

    if((__referred_user || []).length > 4 ){
        // upgrade user 
        await db.users.update({
            can_access_giveaway: true
        }, {
            where: {
                id: user.id
            }
        })
    }

    return null;
}

export const generateDummyEmail = async ()=>{
    let number = await generateOtp(12);
    return `${number}@deleted.com`
}