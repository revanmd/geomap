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