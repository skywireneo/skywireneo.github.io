// Seasonal Date Utilities
// Утилиты для работы с плавающими датами (Пасха, Чёрная пятница)

(function () {
    'use strict';

    window.SeasonalDateUtils = {
        /**
         * Вычисляет дату Пасхи по алгоритму Гаусса (для православной Пасхи)
         * @param {number} year - год
         * @returns {Date} - дата Пасхи
         */
        getEasterDate: function (year) {
            // Алгоритм для православной Пасхи (юлианский календарь)
            const a = year % 19;
            const b = year % 4;
            const c = year % 7;
            const d = (19 * a + 15) % 30;
            const e = (2 * b + 4 * c + 6 * d + 6) % 7;
            const f = d + e;

            let day, month;
            if (f <= 9) {
                day = f + 22;
                month = 3; // апрель (0-indexed)
            } else {
                day = f - 9;
                month = 4; // май (0-indexed)
            }

            // Корректировка на разницу между юлианским и григорианским календарями (13 дней в 21 веке)
            const easterDate = new Date(year, month, day);
            easterDate.setDate(easterDate.getDate() + 13);

            return easterDate;
        },

        /**
         * Вычисляет дату Чёрной пятницы (последняя пятница ноября)
         * @param {number} year - год
         * @returns {Date} - дата Чёрной пятницы
         */
        getBlackFridayDate: function (year) {
            // Последний день ноября
            const lastDayOfNov = new Date(year, 11, 0); // 0 день декабря = последний день ноября
            const dayOfWeek = lastDayOfNov.getDay(); // 0 = воскресенье, 5 = пятница

            // Находим последнюю пятницу
            const daysToSubtract = (dayOfWeek + 2) % 7; // +2 чтобы получить пятницу
            lastDayOfNov.setDate(lastDayOfNov.getDate() - daysToSubtract);

            return lastDayOfNov;
        },

        /**
         * Вычисляет дату Дня программиста (256-й день года)
         * @param {number} year - год
         * @returns {Date} - дата Дня программиста
         */
        getProgrammerDayDate: function (year) {
            // В високосном году 256-й день - 12 сентября, в обычном - 13 сентября
            const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
            const day = isLeapYear ? 12 : 13;
            return new Date(year, 8, day); // сентябрь = 8 (0-indexed)
        },

        /**
         * Проверяет, находится ли дата в диапазоне
         * @param {Date} date - проверяемая дата
         * @param {string} start - начало диапазона (MM-DD)
         * @param {string} end - конец диапазона (MM-DD)
         * @returns {boolean}
         */
        isDateInRange: function (date, start, end) {
            const year = date.getFullYear();
            const [startMonth, startDay] = start.split('-').map(Number);
            const [endMonth, endDay] = end.split('-').map(Number);

            const startDate = new Date(year, startMonth - 1, startDay);
            let endDate = new Date(year, endMonth - 1, endDay);

            // Если диапазон переходит через Новый год (например, 12-20 до 01-15)
            if (endDate < startDate) {
                endDate.setFullYear(year + 1);
            }

            const checkDate = new Date(year, date.getMonth(), date.getDate());
            if (checkDate < startDate && startMonth > endMonth) {
                checkDate.setFullYear(year + 1);
            }

            return checkDate >= startDate && checkDate <= endDate;
        },

        /**
         * Проверяет, является ли дата конкретным днём
         * @param {Date} date - проверяемая дата
         * @param {string} target - целевая дата (MM-DD)
         * @returns {boolean}
         */
        isSpecificDate: function (date, target) {
            const [targetMonth, targetDay] = target.split('-').map(Number);
            return date.getMonth() === targetMonth - 1 && date.getDate() === targetDay;
        },

        /**
         * Форматирует дату в строку MM-DD
         * @param {Date} date - дата
         * @returns {string} - MM-DD
         */
        formatDate: function (date) {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${month}-${day}`;
        },

        /**
         * Получает текущую дату без времени
         * @returns {Date}
         */
        getToday: function () {
            const now = new Date();
            return new Date(now.getFullYear(), now.getMonth(), now.getDate());
        }
    };
})();
