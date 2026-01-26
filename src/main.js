// /**
//  * Функция для расчета выручки
//  * @param purchase запись о покупке
//  * @param _product карточка товара
//  * @returns {number}
//  */
// function calculateSimpleRevenue(purchase, _product) {
//     // @TODO: Расчет выручки от операции
//     const { discount, sale_price, quantity } = purchase;
//     const totalPrice = sale_price * quantity;
//     const discountFactor = 1 - (discount / 100);
//     // const revenue = totalPrice * discountFactor;
//     return sale_price * quantity * discountFactor;
// }

// /**
//  * Функция для расчета бонусов
//  * @param index порядковый номер в отсортированном массиве
//  * @param total общее число продавцов
//  * @param seller карточка продавца
//  * @returns {number}
//  */
// function calculateBonusByProfit(index, total, seller) {
//     // @TODO: Расчет бонуса от позиции в рейтинге
//     // 1 место
//     if (index === 0) {
//         return profit * 0.15;
//     }

//     // 2 и 3 место
//     if (index === 1 || index === 2) {
//         return profit * 0.10;
//     }

//     // Последнее место
//     if (index === total - 1) {
//         return 0;
//     }

//     // Все остальные, кроме последнего
//     return profit * 0.05;
// }

// /**
//  * Функция для анализа данных продаж
//  * @param data
//  * @param options
//  * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
//  */
// function analyzeSalesData(data, options) {
//     // @TODO: Проверка входных данных
//     if (!data || !Array.isArray(data.sellers) || !Array.isArray(data.products) || !Array.isArray(data.purchase_records)) {
//         throw new Error('Некорректные входные данные');
//     }
//     // @TODO: Проверка наличия опций
//     if (!options || !options.calculateRevenue || !options.calculateBonus) {
//         throw new Error('Не переданы функции расчета');
//     }
//     const { calculateRevenue, calculateBonus } = options;
//     // @TODO: Подготовка промежуточных данных для сбора статистики
//     const sellerStats = data.sellers.map(seller => ({
//     id: seller.id,
//     name: `${seller.first_name} ${seller.last_name}`,
//     revenue: 0,
//     profit: 0,
//     sales_count: 0,
//     products_sold: {}
//     }));
    
//     const sellerIndex = Object.fromEntries(
//     sellerStats.map(seller => [seller.id, seller])
//     );
//     const productIndex = Object.fromEntries(
//     data.products.map(product => [product.sku, product])
//     );

//     // @TODO: Индексация продавцов и товаров для быстрого доступа
//     data.products.forEach(product => {
//         productIndex[product.id] = product;
//     });

//     data.sellers.forEach(seller => {
//         sellerStats[seller.id] = {
//             seller_id: seller.id,
//             name: seller.name,
//             revenue: 0,
//             profit: 0,
//             sales_count: 0,
//             top_products: {}
//         };
//     });
//     // @TODO: Расчет выручки и прибыли для каждого продавца

//     // @TODO: Сортировка продавцов по прибыли
//     data.purchase_records.forEach(record => {
//     // Чек
//     const seller = sellerIndex[record.seller_id]; // Продавец
//     if (!seller) return;
//     seller.sales_count += 1;

//     // Перебор товаров в чеке
//     record.items.forEach(item => {
//         const product = productIndex[item.sku]; // Товар
//         if (!product) return;

//         // Себестоимость товара
//         const cost = product.purchase_price * item.quantity;

//         // Выручка с учетом скидки
//         const revenue = calculateRevenue(item, product);

//         // Прибыль
//         const profit = revenue - cost;

//         // Накопление статистики
//         seller.revenue += revenue;
//         seller.profit += profit;

//         // Учёт количества проданных товаров
//         if (!seller.products_sold[item.sku]) {
//             seller.products_sold[item.sku] = 0;
//         }
//         seller.products_sold[item.sku] += item.quantity;
//     });
// });
//     // @TODO: Назначение премий на основе ранжирования

//     // @TODO: Подготовка итоговой коллекции с нужными полями
// }

/**
 * Функция расчета выручки для одной покупки
 * @param {Object} purchase запись о покупке
 * @param {Object} _product карточка товара
 * @returns {number} выручка с учётом скидки
 */
function calculateSimpleRevenue(purchase, _product) {
    const { discount, sale_price, quantity } = purchase;
    const discountFactor = 1 - (discount / 100);
    return sale_price * quantity * discountFactor;
}

/**
 * Функция расчета бонуса по прибыли
 * @param {number} index позиция в рейтинге (0 — лучший)
 * @param {number} total общее число продавцов
 * @param {Object} seller объект статистики продавца
 * @returns {number} бонус
 */
function calculateBonusByProfit(index, total, seller) {
    const { profit } = seller;

    if (index === 0) return profit * 0.15;         // 1 место
    if (index === 1 || index === 2) return profit * 0.10; // 2 и 3 место
    if (index === total - 1) return 0;             // последнее место
    return profit * 0.05;                          // остальные
}

/**
 * Главная функция анализа данных продаж
 * @param {Object} data
 * @param {Object} options объект с функциями { calculateRevenue, calculateBonus }
 * @returns {Array} итоговый отчёт по продавцам
 */
function analyzeSalesData(data, options) {
    // 1. Проверка входных данных
    if (
        !data ||
        !Array.isArray(data.sellers) ||
        !Array.isArray(data.products) ||
        !Array.isArray(data.purchase_records)
    ) {
        throw new Error('Некорректные входные данные');
    }

    // 2. Проверка опций
    if (!options || !options.calculateRevenue || !options.calculateBonus) {
        throw new Error('Не переданы функции расчета');
    }

    const { calculateRevenue, calculateBonus } = options;

    // 3. Подготовка промежуточных данных (статистика по продавцам)
    const sellerStats = data.sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    }));

    // 4. Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = Object.fromEntries(
        sellerStats.map(seller => [seller.id, seller])
    );

    const productIndex = Object.fromEntries(
        data.products.map(product => [product.sku, product])
    );

    // 5. Двойной цикл: перебор чеков и товаров в них
    data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];
        if (!seller) return;

        // Увеличиваем количество чеков
        seller.sales_count += 1;

        record.items.forEach(item => {
            const product = productIndex[item.sku];
            if (!product) return;

            // Себестоимость
            const cost = product.purchase_price * item.quantity;

            // Выручка
            const revenue = calculateRevenue(item, product);

            // Прибыль
            const profit = revenue - cost;

            // Накопление статистики
            seller.revenue += revenue;
            seller.profit += profit;

            // Учёт количества проданных товаров
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity;
        });
    });

    // 6. Сортировка продавцов по прибыли
    const sortedSellers = sellerStats.sort((a, b) => b.profit - a.profit);

    // 7. Назначение бонусов и топ-10 товаров
    const total = sortedSellers.length;
    sortedSellers.forEach((seller, index) => {
        // Расчёт бонуса
        seller.bonus = calculateBonus(index, total, seller);

        // Топ-10 товаров
        seller.top_products = Object.entries(seller.products_sold)
            .map(([sku, quantity]) => ({ sku, quantity }))
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10);
    });

    // 8. Формирование итогового отчёта
    return sortedSellers.map(seller => ({
        seller_id: seller.id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2)
    }));
}