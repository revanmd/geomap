export function CapitalizeFirstLetter(string) {
    if (string) {
        return string[0].toUpperCase() + string.slice(1);
    }
}
export function ConvertIsoToIndonesianDate(isoDate) {
    if (isoDate) {
        const dateObj = new Date(isoDate);

        const monthTranslation = {
            "January": "Januari", "February": "Februari", "March": "Maret", "April": "April",
            "May": "Mei", "June": "Juni", "July": "Juli", "August": "Agustus",
            "September": "September", "October": "Oktober", "November": "November", "December": "Desember"
        };

        const day = dateObj.getDate();
        const month = monthTranslation[dateObj.toLocaleString('en-US', { month: 'long' })];
        const year = dateObj.getFullYear();

        return `${day} ${month} ${year}`;
    }
}
export function ConvertDateMonthToIndonesianMonth(dateString) {
    if (dateString == "undefined" || dateString == null) {
        return ""
    }

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const [year, month] = dateString.split('-');
    return months[parseInt(month, 10) - 1];
}

export function ConvertCommodityTypeToIndonesianCommodity(commodityType) {
    switch (commodityType) {
        case "padi":
            return "Padi"
        case "jagung":
            return "Jagung"
        case "tebu":
            return "Tebu"
        case "other":
            return "Lainnya"
        default:
            return ""
    }
}