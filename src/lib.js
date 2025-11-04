import {viewModes} from './enum';

const regexpUA = /(Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|iOS|Mobile)/

export const dayStartDefault = 3

export const checkMobile = (ua) => {
    return regexpUA.exec(ua)!==null
}
export const getJWT = (cookie) => {
    if (!cookie) return null;
    // достаём jwt напрямую
    const jwt = cookie.split('; ')
        .find(c => c.startsWith('jwt='))?.split('=')[1];
    if (!jwt) return null;
    if (typeof window !== 'undefined') { // вместо process.browser
        const now = new Date();
        let needExtended = true;
        if (localStorage.extendedJWT) {
            const extendedJWT = new Date(localStorage.extendedJWT);
            if (!isNaN(extendedJWT.getTime())) {
                needExtended = ((now - extendedJWT) / 1000 / 60 / 60 / 24) > 30;
            }
        }
        if (needExtended) {
            localStorage.extendedJWT = now;
            document.cookie = `jwt=${jwt};expires=Sun, 31 May 2048 12:35:23 GMT;path=/;SameSite=Lax;secure=true`;
        }
    }
    return decodeURIComponent(jwt);
}
export const getCityCookie = (cookie) => {
    if (!cookie) return null;
    return decodeURIComponent(
        cookie.split('; ')
            .find(c => c.startsWith('city='))?.split('=')[1] || ''
    ) || null;
}
export const setCityCookie = (city) => {
    const days = 10000; // срок жизни в днях
    const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `city=${encodeURIComponent(city)}; expires=${date}; path=/;`;
}
export const getViewModeCookie = (cookie) => {
    if (!cookie) return null;
    return decodeURIComponent(
        cookie.split('; ')
            .find(c => c.startsWith('viewMode='))?.split('=')[1] || ''
    ) || viewModes.card;
}
export const setViewModeCookie = (viewMode) => {
    const days = 10000; // срок жизни в днях
    const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `viewMode=${encodeURIComponent(viewMode)}; expires=${date}; path=/;`;
};
export const isNotTestUser = (profile) => {
    return !profile||!profile.login||!profile.login.toLowerCase().includes('test')
}
export const isTestUser = (profile) => {
    return profile&&profile.login&&profile.login.toLowerCase().includes('test')
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
export const pdDDMMHHMM = (date) =>
{
    date = new Date(date)
    date = `${date.getDate()<10?'0':''}${date.getDate()}.${date.getMonth()<9?'0':''}${date.getMonth()+1} ${date.getHours()<10?'0':''}${date.getHours()}:${date.getMinutes()<10?'0':''}${date.getMinutes()}`
    return date
}
export const pdHHMM = (date) =>
{
    date = new Date(date)
    date = `${date.getHours()<10?'0':''}${date.getHours()}:${date.getMinutes()<10?'0':''}${date.getMinutes()}`
    return date
}
export const pdDDMM = (date) =>
{
    date = new Date(date)
    date = `${date.getDate()<10?'0':''}${date.getDate()}.${date.getMonth()<9?'0':''}${date.getMonth()+1}`
    return date
}
export const pdDDMMMM = (date) =>
{
    date = new Date(date)
    date = `${date.getDate()<10?'0':''}${date.getDate()} ${months[date.getMonth()]}`
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
export const isPWA = () => {
    if(process.browser) {
        const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
        return isInStandaloneMode;
    }
}

export const isNotEmpty = (value) => {
    return value !== undefined && value !== null;
}

export const isEmpty = (value) => {
    return value === undefined || value === null;
}

export const maxImageSize = 25
export const maxFileSize = 50

export const unawaited = (func) => setTimeout(async () => await func())

export const getQueryParam = (url, param) => new URLSearchParams(url.split('?')[1] || '').get(param);

export const cities = ['Бишкек', 'Баткен', 'Балыкчы', 'Боконбаева', 'Жалал-Абад', 'Кара-Балта', 'Каракол', 'Казарман', 'Кочкор', 'Кызыл-Кия', 'Нарын', 'Ош', 'Раззаков', 'Талас', 'Токмок', 'Чолпон-Ата', 'Москва'];

export const checkDate = (date) => {
    const parsed = new Date(date);
    return Number.isNaN(parsed)||parsed=='Invalid Date' ? new Date() : parsed;
};

export const getClientTitle = client => client&&client.address&&client.address[0]?`${client.address[0][2]}${client.address[0][0]&&client.address[0][2]?', ':''}${client.address[0][0]}`:'';

export const formatAmount = amount => amount&&amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');

export const handleDateRange = ({type, value, setDateRange,  maxMonthPeriod = 12}) => {
    setDateRange(dateRange => {
        let start = dateRange.start;
        let end = dateRange.end;
        if(type === 'start') {
            start = value || pdDatePicker(new Date());
            end = null
        } else {
            end = value;
            if(end) {
                let startDate = new Date(start);
                let endDate = new Date(end);
                if(endDate < startDate)
                    end = null;
                else {
                    const maxEnd = new Date(startDate);
                    maxEnd.setMonth(maxEnd.getMonth() + maxMonthPeriod);
                    if(endDate > maxEnd)
                        end = pdDatePicker(maxEnd);
                }
            }
        }


        return { start, end };
    });


};

// Функция для извлечения базового пути без id
function getBasePath(path) {
    const slashCount = (path.match(/\//g) || []).length;
    let basePath = path;

    // Если слешей больше одного, убираем последний сегмент (id)
    if (slashCount > 1) {
        const lastSlashIndex = path.lastIndexOf('/');
        basePath = path.slice(0, lastSlashIndex);
    }

    // Убираем конечную 's' у последнего сегмента
    const segments = basePath.split('/');
    const lastSegmentIndex = segments.length - 1;
    segments[lastSegmentIndex] = segments[lastSegmentIndex].endsWith('s')
        ? segments[lastSegmentIndex].slice(0, -1)
        : segments[lastSegmentIndex];

    return segments.join('/');
}

// Функция сравнения объектов
export const isSameUrl = (obj1, obj2) => {
    return getBasePath(obj1) === getBasePath(obj2)||obj1.includes('/logistic/')&&obj2.includes('/logistic/');
}

export const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);

export const months = [
    'январь',
    'февраль',
    'март',
    'апрель',
    'май',
    'июнь',
    'июль',
    'август',
    'сентябрь',
    'октябрь',
    'ноябрь',
    'декабрь'
]