// function to get Hebrew date
const HebrewDateManager = {
    hebrewDates: {},

    async getHebrewDate(year, month, day) {
        let key = `${year}-${month}-${day}`;

        if (!this.hebrewDates[key]) {
            try {
                let response = await fetch(`https://www.hebcal.com/converter?cfg=json&gy=${year}&gm=${month}&gd=${day}&g2h=1`);
                let data = await response.json();
                this.hebrewDates[key] = data.hebrew || "-";
            } catch (error) {
                console.error("Error fetching Hebrew date:", error);
                this.hebrewDates[key] = "-";
            }
        }
        return this.hebrewDates[key];
    }
};