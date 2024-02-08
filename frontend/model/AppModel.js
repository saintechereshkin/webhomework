export default class AppModel {
    static async getStock() {
        try {
            const stockResponse = await fetch('http://localhost:4321/stock');
            const stockBody = await stockResponse.json();

            if (stockResponse.status !== 200) {
                return Promise.reject(stockBody);
            }

            return stockBody.stock;
        } catch(error) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: error.message
            });
        }
    }



    static async updateStock(updateArr = []) {
        try {
            const updateStockResponse = await fetch(
                'http://localhost:4321/stock',
                {
                    method: 'PATCH',
                    body: JSON.stringify(updateArr),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (updateStockResponse.status !== 200) {
                const updateStockBody = await updateStockResponse.json();
                return Promise.reject(updateStockBody);
            }

            return {
                timestamp: new Date().toISOString(),
                message: 'Состав товаров на складе обновлён!'
            };
        } catch(error) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: error.message
            });
        }
    }



    static async getOrders() {
        try {
            const ordersResponse = await fetch('http://localhost:4321/orders');
            const ordersBody = await ordersResponse.json();

            if (ordersResponse.status !== 200) {
                return Promise.reject(ordersBody);
            }

            return ordersBody.orders;
        } catch(error) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: error.message
            });
        }
    }



    static async addOrder({order_id, fio, date_until, lists}) {
        try {
            const addOrderResponse = await fetch(
                'http://localhost:4321/orders',
                {
                    method: 'POST',
                    body: JSON.stringify({order_id, fio, date_until, lists}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (addOrderResponse.status !== 200) {
                const addOrderBody = await addOrderResponse.json();
                return Promise.reject(addOrderBody);
            }
            
            return {
                timestamp: new Date().toISOString(),
                message: `Заказ на имя '${fio}' добавлен!`
            };
        } catch(error) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: error.message
            });
        }
    }



    static async updateOrder({order_id, fio, date_until, lists}) {
        try {
            const updateOrderResponse = await fetch(
                'http://localhost:4321/orders',
                {
                    method: 'PATCH',
                    body: JSON.stringify({order_id, fio, date_until, lists}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (updateOrderResponse.status !== 200) {
                const updateOrderBody = await updateOrderResponse.json();
                return Promise.reject(updateOrderBody);
            }
            
            return {
                timestamp: new Date().toISOString(),
                message: `Заказ на имя '${fio}' изменён!`
            };
        } catch(error) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: error.message
            });
        }
    }



    static async addList({id, med_name, count, order_id}) {
        try {
            const addOrderResponse = await fetch(
                'http://localhost:4321/list',
                {
                    method: 'POST',
                    body: JSON.stringify({id, med_name, count, order_id}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (addOrderResponse.status !== 200) {
                const addOrderBody = await addOrderResponse.json();
                return Promise.reject(addOrderBody);
            }
            
            return {
                timestamp: new Date().toISOString(),
                message: 'Добавлена строка заказа!'
            };
        } catch(error) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: error.message
            });
        }
    }



    static async deleteList({id}) {
        try {
            const deleteListResponse = await fetch(
                `http://localhost:4321/list/${id}`,
                {
                    method: 'DELETE'
                }
            );

            if (deleteListResponse.status !== 200) {
                const deleteListBody = await deleteListResponse.json();
                return Promise.reject(deleteListBody);
            }
            
            return {
                timestamp: new Date().toISOString(),
                message: `Строка заказа удалена!`
            };
        } catch(error) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: error.message
            });
        }
    }



    static async deleteOrder({order_id}) {
        try {
            const deleteOrderResponse = await fetch(
                `http://localhost:4321/orders/${order_id}`,
                {
                    method: 'DELETE'
                }
            );

            if (deleteOrderResponse.status !== 200) {
                const deleteOrderBody = await deleteOrderResponse.json();
                return Promise.reject(deleteOrderBody);
            }
            
            return {
                timestamp: new Date().toISOString(),
                message: `Заказ удалён!`
            };
        } catch(error) {
            return Promise.reject({
                timestamp: new Date().toISOString(),
                statusCode: 0,
                message: error.message
            });
        }
    }
};