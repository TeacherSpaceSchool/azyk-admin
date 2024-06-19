const regexpUA = /(Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|iOS|Mobile)/

export const checkMobile = (ua)=>{
    return regexpUA.exec(ua)!==null
}
export const getJWT = (cookie)=>{
    //console.time('perfomance')
    let name = 'jwt=';
    let decodedCookie = decodeURIComponent(cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            let jwt = c.substring(name.length, c.length)
            if(process.browser&&!/*sessionStorage*/localStorage.extended) {
                /*sessionStorage*/localStorage.extended = true
                document.cookie = `jwt=${jwt};expires=Sun, 31 May 2048 12:35:23 GMT;path=/;SameSite=Lax;secure=true`;
            }
            //console.timeEnd('perfomance')
            return jwt;
        }
    }
    //console.timeEnd('perfomance')
    return undefined;
}
export const getCityCookie = (cookie)=>{
    let name = 'city=';
    let decodedCookie = decodeURIComponent(cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return undefined;
}
export const isNotTestUser = (profile) => {
    return !profile||!profile.login||!profile.login.toLowerCase().includes('test')
}
export const setCityCookie = (city)=>{
    let date = new Date(Date.now() + 10000*24*60*60*1000);
    date = date.toUTCString();
    document.cookie = `city=${encodeURI(city)}; expires=` + date;
}
export const countdown = (date) => {
    date = new Date(date).getTime()
    let now = new Date().getTime();
    let distance = date - now;
    return {days: Math.floor(distance / (1000 * 60 * 60 * 24)), hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)), seconds: Math.floor((distance % (1000 * 60)) / 1000)}
}
export const checkInt = (int) => {
    if(int&&int.length>1&&int[0]==='0')
        int = int.substring(1)
    return isNaN(parseInt(int))?0:parseInt(int)
}
export const getGeoDistance = (lat1, lon1, lat2, lon2) => {
    lat1 = parseFloat(lat1)
    lon1 = parseFloat(lon1)
    lat2 = parseFloat(lat2)
    lon2 = parseFloat(lon2)
    let deg2rad = Math.PI / 180;
    lat1 *= deg2rad;
    lon1 *= deg2rad;
    lat2 *= deg2rad;
    lon2 *= deg2rad;
    let diam = 12742000; // Diameter of the earth in km (2 * 6371)
    let dLat = lat2 - lat1;
    let dLon = lon2 - lon1;
    let a = (
        (1 - Math.cos(dLat)) +
        (1 - Math.cos(dLon)) * Math.cos(lat1) * Math.cos(lat2)
    ) / 2;
    return parseInt(diam * Math.asin(Math.sqrt(a)))
}
export const weekDay = [
    'Bоскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
]

export const inputFloat = (str) => {
    if(!str.length)
        return ''
    let oldStr = str.substring(0, str.length-1)
    let newChr = str[str.length-1]
    if(!['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', ','].includes(newChr))
        return oldStr
    if(','===newChr) {
        str = oldStr+'.'
        newChr = '.'
    }
    if(newChr==='.'&&oldStr.includes('.'))
        return oldStr
    if(str.length===2&&str[0]==='0'&&newChr!=='.')
        return str[1]
    return str
}

export const inputInt = (str) => {
    if(!str.length)
        return ''
    let oldStr = str.substring(0, str.length-1)
    let newChr = str[str.length-1]
    if(!['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].includes(newChr))
        return oldStr
    if(str.length===2&&str[0]==='0')
        return str[1]
    return str
}
export const checkFloat = (float) => {
    float = parseFloat(float)
    return isNaN(float)?0:Math.round(float * 10)/10
}
export const pdDDMMYYYY = (date) =>
{
    date = new Date(date)
    date = `${date.getDate()<10?'0':''}${date.getDate()}.${date.getMonth()<9?'0':''}${date.getMonth()+1}.${date.getFullYear()}`
    return date
}
export const pdDDMMYY = (date) =>
{
    date = new Date(date)
    date = `${date.getDate()<10?'0':''}${date.getDate()}.${date.getMonth()<9?'0':''}${date.getMonth()+1}.${date.getYear()-100}`
    return date
}
export const pdDDMMYYYYWW = (date) =>
{
    date = new Date(date)
    date = `${date.getDate()<10?'0':''}${date.getDate()}.${date.getMonth()<9?'0':''}${date.getMonth()+1}.${date.getFullYear()}, ${weekDay[date.getDay()]}`
    return date
}
export const pdDatePicker = (date) =>
{
    date = new Date(date)
    date = `${date.getFullYear()}-${date.getMonth()<9?'0':''}${date.getMonth()+1}-${date.getDate()<10?'0':''}${date.getDate()}`
    return date
}
export const pdtDatePicker = (date) =>
{
    date = new Date(date)
    date = `${date.getFullYear()}-${date.getMonth()<9?'0':''}${date.getMonth()+1}-${date.getDate()<10?'0':''}${date.getDate()}T${date.getHours()<10?'0':''}${date.getHours()}:${date.getMinutes()<10?'0':''}${date.getMinutes()}`
    return date
}
export const pdDDMMYYHHMM = (date) =>
{
    date = new Date(date)
    date = `${date.getDate()<10?'0':''}${date.getDate()}.${date.getMonth()<9?'0':''}${date.getMonth()+1}.${date.getYear()-100} ${date.getHours()<10?'0':''}${date.getHours()}:${date.getMinutes()<10?'0':''}${date.getMinutes()}`
    return date
}
export const pdDDMMYYHHMMCancel = (date) =>
{
    date = new Date(date)
    date.setMinutes(date.getMinutes() + 10);
    date = `${date.getDate()<10?'0':''}${date.getDate()}.${date.getMonth()<9?'0':''}${date.getMonth()+1}.${date.getYear()-100} ${date.getHours()<10?'0':''}${date.getHours()}:${date.getMinutes()<10?'0':''}${date.getMinutes()}`
    return date
}
export const validMail = (mail) =>
{
    return /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()\.,;\s@\"]+\.{0,1})+([^<>()\.,;:\s@\"]{2,}|[\d\.]+))$/.test(mail);
}
export const validPhone = (phone) =>
{
    return /^[+]{1}996[0-9]{9}$/.test(phone);
}