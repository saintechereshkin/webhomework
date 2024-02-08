import pg from 'pg';

export default class DB {
    #dbClient = null;
    #dbHost = '';
    #dbPort = '';
    #dbName = '';
    #dbLogin = '';
    #dbPassword = '';



    constructor() {
        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName = process.env.DB_NAME;
        this.#dbLogin = process.env.DB_LOGIN;
        this.#dbPassword = process.env.DB_PASSWORD;

        this.#dbClient = new pg.Client({
            user: this.#dbLogin,
            password: this.#dbPassword,
            host: this.#dbHost,
            port: this.#dbPort,
            database: this.#dbName
        });
    }



    async connect() {
        try {
            await this.#dbClient.connect();
            console.log(':3  OK!  Connected to DB');
        } catch(error) {
            console.error(':(  ERROR!  Unable to connect to DB | ERROR = ', error);
            return Promise.reject(error);
        }
    }



    async disconnect() {
        await this.#dbClient.end();
        console.log(':3  OK!  Disconnected from DB');
    }



    async getStock() {
        try {
            const stock = await this.#dbClient.query(
                'SELECT * FROM stock ORDER BY name;'
            );
            return stock.rows;
        } catch(error) {
            console.error(':( ERROR! Unable to get stock | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }



    async getOrders() {
        try {
            const orders = await this.#dbClient.query(
                'SELECT * FROM orders ORDER BY date_until;'
            );
            return orders.rows;
        } catch(error) {
            console.error(':( ERROR! Unable to get stock | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }



    async getLists() {
        try {
            const lists = await this.#dbClient.query(
                'SELECT * FROM lists ORDER BY order_id, med;'
            );
            return lists.rows;
        } catch(error) {
            console.error(':( ERROR! Unable to get stock | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }



    async getOrderList({order_id} = {order_id: null}) {
        if (!order_id) {
            const errMsg = ':(  ERROR!  Unable to get list | ERROR = no ID';
            console.error(errMsg);
            return Promise.reject({
                type: 'internal',
                error: new Error(errMsg)
            });
        }
        try {
            const list = await this.#dbClient.query(
                'SELECT * FROM lists WHERE order_id = $1 ORDER BY med;',
                [order_id]
            );
            return list.rows;
        } catch(error) {
            console.error(':( ERROR! Unable to get list | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }



    async addStock({
        name, 
        count = -1, 
        recipe_required = -1
    } = {
        name: null, 
        count: -1, 
        recipe_required: -1
    }) {
        if (!name || recipe_required < 0 || recipe_required > 2 || count < 0) {
            const errMsg = ':(  ERROR!  Unable to add stock | ERROR = no medicine name OR count (or requirement flag) is invalid';
            console.error(errMsg);
            return Promise.reject({
                type: 'internal',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'INSERT INTO stock (name, count, recipe_required) VALUES ($1, $2, $3);',
                [name, count, recipe_required]
            );
        } catch(error) {
            console.error(':( ERROR! Unable to add stock | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }



    async deleteStock({name} = {name: null}) {
        if (!name) {
            const errMsg = ':(  ERROR!  Unable to delete stock | ERROR = no medicine name';
            console.error(errMsg);
            return Promise.reject({
                type: 'internal',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'DELETE FROM stock WHERE name = $1;',
                [name]
            );
        } catch(error) {
            console.error(':( ERROR! Unable to delete stock | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
    


    async updateStockCount({
        name, 
        delta
    } = {
        name: null, 
        delta: null
    }) {
        if (!name || delta === null) {
            const errMsg = ':(  ERROR!  Unable to update stock count | ERROR = some arguments are missing';
            console.error(errMsg);
            return Promise.reject({
                type: 'internal',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'UPDATE stock SET count = count + $2 WHERE name = $1;',
                [name, delta]
            );
        } catch(error) {
            console.error(':( ERROR! Unable to update stock count | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }



    async addOrder({
        id, 
        fio, 
        date_until
    } = {
        id: null, 
        fio: null, 
        date_until: null
    }) {
        if (!id || !fio || !date_until) {
            const errMsg = ':(  ERROR!  Unable to add order | ERROR = some arguments are missing';
            console.error(errMsg);
            return Promise.reject({
                type: 'internal',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'INSERT INTO orders (id, fio, date_until) VALUES ($1, $2, $3);',
                [id, fio, date_until]
            );
        } catch(error) {
            console.error(':( ERROR! Unable to add order | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }



    async updateOrder({
        id, 
        fio, 
        date_until
    } = {
        id: null, 
        fio: null,
        date_until: null
    }) {
        if (!id || !fio || !date_until) {
            const errMsg = ':(  ERROR!  Unable to update order | ERROR = some arguments are missing';
            console.error(errMsg);
            return Promise.reject({
                type: 'internal',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'UPDATE orders SET fio = $2, date_until = $3 WHERE id = $1;',
                [id, fio, date_until]
            );
        } catch(error) {
            console.error(':( ERROR! Unable to update order | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }



    async addList({
        id, 
        med_name, 
        count = -1, 
        order_id
    } = {
        id: null, 
        med_name: null, 
        count: -1, 
        order_id: null
    }) {
        if (!id || !med_name || !order_id || count < 0) {
            const errMsg = ':(  ERROR!  Unable to add list | ERROR = some arguments are missing OR invalid count';
            console.error(errMsg);
            return Promise.reject({
                type: 'internal',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'INSERT INTO lists (id, med, count, order_id) VALUES ($1, $2, $3, $4);',
                [id, med_name, count, order_id]
            );
        } catch(error) {
            console.error(':( ERROR! Unable to add list | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }



    async updateList({
        id, 
        med_name, 
        count = -1
    } = {
        id: null, 
        med_name: null, 
        count: -1
    }) {
        if (!id || !med_name || count < 0) {
            const errMsg = ':(  ERROR!  Unable to update list | ERROR = some arguments are missing OR invalid count';
            console.error(errMsg);
            return Promise.reject({
                type: 'internal',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'UPDATE lists SET med = $2, count = $3 WHERE id = $1;',
                [id, med_name, count]
            );
        } catch(error) {
            console.error(':( ERROR! Unable to update list | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }



    async deleteList({id} = {id: null}) {
        if (!id) {
            const errMsg = ':(  ERROR!  Unable to delete list string | ERROR = no ID';
            console.error(errMsg);
            return Promise.reject({
                type: 'internal',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'DELETE FROM lists WHERE id = $1;',
                [id]
            );
        } catch(error) {
            console.error(':( ERROR! Unable to delete list string | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }



    async deleteOrder({order_id} = {order_id: null}) {
        if (!order_id) {
            const errMsg = ':(  ERROR!  Unable to delete order | ERROR = no ID';
            console.error(errMsg);
            return Promise.reject({
                type: 'internal',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'DELETE FROM lists WHERE order_id = $1;',
                [order_id]
            );
            await this.#dbClient.query(
                'DELETE FROM orders WHERE id = $1;',
                [order_id]
            );
        } catch(error) {
            console.error(':( ERROR! Unable to delete order | ERROR = ', error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
};