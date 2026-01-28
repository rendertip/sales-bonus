
function calculateBonusByProfit(index, total, seller) {
    const { profit } = seller;

    if (index === 0) {
        return profit * 0.15;
    }

    if (index === 1 || index === 2) {
        return profit * 0.10;
    }

    if (index === total - 1) {
        return 0;
    }

    return profit * 0.05;
}

function calculateSimpleRevenue(purchase, _product) {
    const { discount, sale_price, quantity } = purchase;
    const discountFactor = 1 - discount / 100;

    return sale_price * quantity * discountFactor;
}

function analyzeSalesData(data, options) {
    // Проверка входных данных
    if (
        !data
        || !Array.isArray(data.sellers)
        || data.sellers.length === 0
        || !Array.isArray(data.products)
        || data.products.length === 0
        || !Array.isArray(data.purchase_records)
        || data.purchase_records.length === 0
    ) {
        throw new Error('Некорректные входные данные');
    }

    // Проверка опций
    if (!options || !options.calculateRevenue || !options.calculateBonus) {
        throw new Error('Не переданы функции расчета');
    }

    const { calculateRevenue, calculateBonus } = options;

    // Подготовка статистики по продавцам
    const sellerStats = data.sellers.map(seller => ({
        id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
        revenue: 0,
        profit: 0,
        sales_count: 0,
        products_sold: {}
    }));

    // Индексация продавцов
    const sellerIndex = Object.fromEntries(
        sellerStats.map(seller => [seller.id, seller])
    );

    // Индексация товаров
    const productIndex = Object.fromEntries(
        data.products.map(product => [product.sku, product])
    );

    // Обработка чеков
    data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];
        if (!seller) return;

        record.items.forEach(item => {
            const product = productIndex[item.sku];
            if (!product) return;

            const revenue = calculateRevenue(item, product);
            const cost = product.purchase_price * item.quantity;
            const profit = revenue - cost;

            seller.revenue += revenue;
            seller.profit += profit;
            seller.sales_count += item.quantity;

            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += item.quantity;
        });
    });

    sellerStats.sort((a, b) => {
    if (b.profit !== a.profit) {
        return b.profit - a.profit;
    }
    return a.id.localeCompare(b.id);
});

    // Назначение бонусов и формирование топ-10 товаров
    const total = sellerStats.length;

    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonus(index, total, seller);
    seller.top_products = Object.entries(seller.products_sold)
        .map(([sku, quantity]) => ({ sku, quantity }))
    .sort((a, b) => {
        if (b.quantity !== a.quantity) {
            return b.quantity - a.quantity;
        }
        return a.sku.localeCompare(b.sku);
    })
    .slice(0, 10);
});

    // Формирование итогового отчёта
    return sellerStats.map(seller => ({
        seller_id: seller.id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2)
    }));}