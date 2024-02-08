import express, { response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import DB from './db/client.js';
import { request } from 'http';
import cors from "cors";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



dotenv.config({
    path: './backend/.env'
});



const appHost = process.env.APP_HOST;
const appPort = process.env.APP_PORT;

const app = express();
const db = new DB();

app.use(cors())


// middleware для входа
app.use('*', (request, response, next) => {
    console.log(
        request.method,
        request.baseUrl || request.url,
        new Date().toISOString()
    );

    next();
});



// middleware для статических файлов приложения
app.use('/', express.static(path.resolve(__dirname, '../dist')));



// получить stock
app.get('/stock', async (request, response) => {
    try {
        const dbStock = await db.getStock();
    	
		const stock = dbStock.map(({name, count, recipe_required}) => ({
			medName: name, 
			medCount: count,
			medRecipeFlag: recipe_required
		}));

		response.statusCode = 200;
		response.statusMessage = 'OK';
		response.json({ stock });
    } catch(err) {
		response.statusCode = 500;
		response.statusMessage = 'Internal server error';
		response.json({
			timestamp: new Date().toISOString(),
			statusCode: 500,
			message: `Getting stock error: ${err.error.message || err.error || err}`
		});
    }
});



// middleware обработка параметров
app.use('/stock', express.json());

// обновить stock
app.patch('/stock', async (request, response) => {
    try {
		await Promise.all(request.body.map(({name, delta}) => db.updateStockCount({name, delta})));

		response.statusCode = 200;
		response.statusMessage = 'OK';
		response.send();
    } catch(err) {
		response.statusCode = 500;
		response.statusMessage = 'Internal server error';
		response.json({
			timestamp: new Date().toISOString(),
			statusCode: 500,
			message: `Updating stock error: ${err.error.message || err.error || err}`
		});
    }
});



// получить все заказы
app.get('/orders', async (request, response) => {
	try {
		const [dbOrders, dbLists] = await Promise.all([db.getOrders(), db.getLists()]);

		const orders = dbOrders.map(order => ({
			orderID: order.id,
			orderFIO: order.fio,
			orderDate: order.date_until,
			orderList: dbLists.filter(list => list.order_id == order.id)
				.map(item => ({
					listID: item.id,
					listMedName: item.med,
					listCount: item.count
				}))
		}));

		response.statusCode = 200;
		response.statusMessage = 'OK';
		response.json({ orders });
	} catch(err) {
		response.statusCode = 500;
		response.statusMessage = 'Internal server error';
		response.json({
			timestamp: new Date().toISOString(),
			statusCode: 500,
			message: `Getting orders and lists error: ${err.error.message || err.error || err}`
		});
	}
});



// middleware обработка параметров
app.use('/orders', express.json());

// добавить заказ и строки списка лекарств к нему
app.post('/orders', async (request, response) => {
	try {
		const {
			order_id, 
			fio, 
			date_until,
			lists
		} = request.body;
		await db.addOrder({ id: order_id, fio, date_until });

		await Promise.all(lists.map(({id, med_name, count}) => db.addList({id, med_name, count, order_id})));

		response.statusCode = 200;
		response.statusMessage = 'OK';
		response.send();
	} catch (err) {
		switch(err.type) {
			case 'client':
				response.statusCode = 400;
				response.statusMessage = 'Bad request';
				break;
			default:
				response.statusCode = 500;
				response.statusMessage = 'Internal server error';
		}
		response.json({
			timestamp: new Date().toISOString(),
			statusCode: response.statusCode,
			message: `Adding order error: ${err.error.message || err.error || err}`
		});
	}
});



// middleware обработка параметров
app.use('/orders', express.json());

// изменить задачу
app.patch('/orders', async (request, response) => {
	try {
		const {
			order_id,
			fio, 
			date_until,
			lists
		} = request.body;
		await db.updateOrder({ id: order_id, fio, date_until });

		await Promise.all(lists.map(({id, med_name, count}) => db.updateList({id, med_name, count, order_id})));

		response.statusCode = 200;
		response.statusMessage = 'OK';
		response.send();
	} catch (err) {
		switch(err.type) {
			case 'client':
				response.statusCode = 400;
				response.statusMessage = 'Bad request';
				break;
			default:
				response.statusCode = 500;
				response.statusMessage = 'Internal server error';
		}
		response.json({
			timestamp: new Date().toISOString(),
			statusCode: response.statusCode,
			message: `Changing order error: ${err.error.message || err.error || err}`
		});
	}
});



// middleware обработка параметров
app.use('/list', express.json());

// добавить 1 строчку заказа
app.post('/list', async (request, response) => {
	try {
		const {
			id,
			med_name,
			count,
			order_id
		} = request.body;
		await db.addList({id, med_name, count, order_id});

		response.statusCode = 200;
		response.statusMessage = 'OK';
		response.send();
	} catch (err) {
		switch(err.type) {
			case 'client':
				response.statusCode = 400;
				response.statusMessage = 'Bad request';
				break;
			default:
				response.statusCode = 500;
				response.statusMessage = 'Internal server error';
		}
		response.json({
			timestamp: new Date().toISOString(),
			statusCode: response.statusCode,
			message: `Adding list string error: ${err.error.message || err.error || err}`
		});
	}
});



// удалить элемент списка лекарств
app.delete('/list/:listID', async (request, response) => {
	try {
		const {listID} = request.params;
		await db.deleteList({id: listID});

		response.statusCode = 200;
		response.statusMessage = 'OK';
		response.send();
	} catch (err) {
		switch(err.type) {
			case 'client':
				response.statusCode = 400;
				response.statusMessage = 'Bad request';
				break;
			default:
				response.statusCode = 500;
				response.statusMessage = 'Internal server error';
		}
		response.json({
			timestamp: new Date().toISOString(),
			statusCode: response.statusCode,
			message: `Removing order error: ${err.error.message || err.error || err}`
		});
	}
});



// удалить задачу
app.delete('/orders/:orderID', async (request, response) => {
	try {
		const {orderID} = request.params;
		await db.deleteOrder({order_id: orderID});

		response.statusCode = 200;
		response.statusMessage = 'OK';
		response.send();
	} catch (err) {
		switch(err.type) {
			case 'client':
				response.statusCode = 400;
				response.statusMessage = 'Bad request';
				break;
			default:
				response.statusCode = 500;
				response.statusMessage = 'Internal server error';
		}
		response.json({
			timestamp: new Date().toISOString(),
			statusCode: response.statusCode,
			message: `Removing order error: ${err.error.message || err.error || err}`
		});
	}
});



const server = app.listen(Number(appPort), appHost, async () => {
    try {
        await db.connect();
    } catch (error) {
        console.log('MedOrderManager app shut down');
		console.log(error)
        process.exit(100);
    }

    /*
    добавить в каталог:
    await db.addStock({name: 'Глазные капли', count: 6, recipe_required: 1});

    удалить из каталога:
    await db.deleteStock({name: 'Нурофен'});
    */
    console.log(`:3  OK!  BACKEND START SUCCESSFUL ( at http://${appHost}:${appPort} )`);
});



process.on('SIGTERM', () => {
    console.log('SIGTERM received: closing server...');
    server.close(async () => {
        await db.disconnect();
        console.log('Server closed.')
    });
});
