const numbers = {
    '*': {
        '1': 'один ',
        '2': 'два ',
        '3': 'три ',
        '4': 'четыре ',
        '5': 'пять ',
        '6': 'шесть ',
        '7': 'семь ',
        '8': 'восемь ',
        '9': 'девять ',
        '0': ''
    },
    '1*': {
        '10': 'десять ',
        '11': 'одиннадцать ',
        '12': 'двенадцать ',
        '13': 'тринадцать ',
        '14': 'четырнадцать ',
        '15': 'пятнадцать ',
        '16': 'шестнадцать ',
        '17': 'семнадцать ',
        '18': 'восемнадцать ',
        '19': 'девятнадцать ',
        '0': ''
    },
    '**': {
        '2': 'двадцать ',
        '3': 'тридцать ',
        '4': 'сорок ',
        '5': 'пятьдесят ',
        '6': 'шестьдесят ',
        '7': 'семьдесят ',
        '8': 'восемьдесят ',
        '9': 'девяносто ',
        '0': ''
    },
    '***': {
        '1': 'сто ',
        '2': 'двести ',
        '3': 'триста ',
        '4': 'четыреста ',
        '5': 'пятьсот ',
        '6': 'шестьсот ',
        '7': 'семьсот ',
        '8': 'восемьсот ',
        '9': 'девятьсот ',
        '0': ''
    },
};

const orders = [
    { singular: '', few: '', many: '' }, // единицы
    { singular: 'тысяча ', few: 'тысячи ', many: 'тысяч ' },
    { singular: 'миллион ', few: 'миллиона ', many: 'миллионов ' },
    { singular: 'миллиард ', few: 'миллиарда ', many: 'миллиардов ' },
];

function getOrderWord(ones, tens, orderIndex) {
    if (orderIndex === 0) return '';
    if (tens === '1') return orders[orderIndex].many; // 11-19 всегда "many"
    if (ones === '1') return orders[orderIndex].singular;
    if (['2', '3', '4'].includes(ones)) return orders[orderIndex].few;
    return orders[orderIndex].many;
}

function processGroup(digits, orderIndex, isThousands = false) {
    let [ones, tens, hundreds] = digits;
    let words = '';

    // сотни
    if (hundreds) words += numbers['***'][hundreds];

    // десятки и единицы
    if (tens === '1') {
        words += numbers['1*'][tens + (ones || '0')];
    } else {
        if (tens) words += numbers['**'][tens];
        if (ones) {
            if (isThousands) {
                words += ones === '1' ? 'одна ' : ones === '2' ? 'две ' : numbers['*'][ones];
            } else {
                words += numbers['*'][ones];
            }
        }
    }

    words += getOrderWord(ones, tens, orderIndex);
    return words;
}

function getFractionSuffix(length, lastDigit) {
    const forms = [
        'десятая', 'сотая', 'тысячная', 'десятитысячная', 'стотысячная',
        'миллионная', 'десятимиллионная', 'стомиллионная', 'миллиардная'
    ];
    const pluralForms = [
        'десятых', 'сотых', 'тысячных', 'десятитысячных', 'стотысячных',
        'миллионных', 'десятимиллионных', 'стомиллионных', 'миллиардных'
    ];
    const idx = length - 1;
    if (lastDigit === '1') return forms[idx] || 'дробная';
    return pluralForms[idx] || 'дробных';
}

export function numberToWords(number, type = 'all') {
    let intWords = '', floatWords = '';

    const parts = number.toString().split('.');
    const intPart = parts[0].split('').reverse();

    // целая часть
    for (let i = 0, order = 0; i < intPart.length; i += 3, order++) {
        const group = intPart.slice(i, i + 3).concat(['0', '0', '0']).slice(0, 3);
        intWords = processGroup(group, order, order === 1) + intWords;
    }

    // дробная часть
    if (parts[1]) {
        const floatPart = parts[1].split('').reverse();
        const lastDigit = floatPart[0];

        for (let i = 0; i < floatPart.length; i += 3) {
            const group = floatPart.slice(i, i + 3).concat(['0', '0', '0']).slice(0, 3);
            floatWords = processGroup(group, 0, false) + floatWords;
        }

        floatWords += getFractionSuffix(floatPart.length, lastDigit);
    }

    if (type === 'float') return floatWords.trim();
    if (type === 'all') return (intWords + (floatWords ? 'целых ' + floatWords : '')).trim();
    return intWords.trim();
}
