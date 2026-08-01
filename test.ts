import { Solar } from 'lunar-javascript';
const d = new Date();
const lunar = Solar.fromDate(d).getLunar();
console.log(lunar.getDayYi());
