export const formatNumber = (value: number | string): string => {
    let num: number;
    if (typeof value === 'string') {
        const normalizedValue = value.replace(/\./g, '').replace(',', '.');
        num = parseFloat(normalizedValue);
    } else {
        num = value;
    }
    if (isNaN(num)) return '0.00';

    return num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

export const formatCurrency = (value: number | string): string => {
    return `L${formatNumber(value)}`;
};

export const parseFormattedNumber = (value: string | number | null | undefined): number => {
    if (value == null) return 0;
    if (typeof value === 'number') return value;
    return parseFloat(value.replace(/,/g, ''));
};

export const isValidAmountFormat = (value: string): boolean => {
    const regex = /^[0-9]{1,3}(,[0-9]{3})*(\.[0-9]{0,2})?$/;
    const simpleRegex = /^[0-9]+(\.[0-9]{0,2})?$/;
    return regex.test(value) || simpleRegex.test(value);
};

export const formatAmountInput = (value: string): string => {
    const endsWithDecimal = value.endsWith('.');
    let numericValue = value.replace(/[^0-9.]/g, '');
    const decimalPoints = numericValue.match(/\./g);
    if (decimalPoints && decimalPoints.length > 1) {
        const parts = numericValue.split('.');
        numericValue = parts[0] + '.' + parts.slice(1).join('');
    }

    let integerPart = numericValue;
    let decimalPart = '';

    if (numericValue.includes('.')) {
        const parts = numericValue.split('.');
        integerPart = parts[0];
        decimalPart = parts[1]?.slice(0, 2) || '';
    }

    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (decimalPart) {
        return `${integerPart}.${decimalPart}`;
    } else if (endsWithDecimal) {

        return `${integerPart}.`;
    } else {
        return integerPart;
    }
}