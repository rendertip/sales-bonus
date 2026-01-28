
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
    if (!data || !Array.isArray(data.sellers) || data.sellers.length === 0 ||
    !Array.isArray(data.products) || data.products.length === 0 ||
    !Array.isArray(data.purchase_records) || data.purchase_records.length === 0
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
        record.items.forEach(item => {
            const product = productIndex[item.sku];
            if (!product) return;
            seller.sales_count += 1;
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