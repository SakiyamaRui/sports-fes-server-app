import { customAlphabet } from 'nanoid/async';

const  generateNumberId = async (length) =>  {
    const nanoid = customAlphabet('1234567890', length);
    return await nanoid();
}

export {
    generateNumberId
}